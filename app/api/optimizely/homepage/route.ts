/**
 * HOMEPAGE API — Server-side bridge to Optimizely Graph.
 *
 * The browser cannot call Optimizely Graph directly with the secret key safely,
 * so this Next.js "API route" runs on the server and:
 *   1. Reads NEXT_PUBLIC_SDK_KEY or OPTIMIZELY_GRAPH_SINGLE_KEY from .env.local
 *   2. Sends a GraphQL query to https://cg.optimizely.com/content/v2
 *   3. Returns JSON to app/page.tsx
 *
 * When you add a NEW block type in Optimizely, add its fields here inside
 * the `component { ... }` section (see ... on Hero, ... on Heading, etc.).
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'SDK Key not configured',
        debug: {
          hasNextPublicKey: !!process.env.NEXT_PUBLIC_SDK_KEY,
          hasOptimizelyKey: !!process.env.OPTIMIZELY_GRAPH_SINGLE_KEY,
        },
      },
      { status: 500 }
    )
  }

  /**
   * GraphQL query — asks Optimizely for:
   *   - One BlankExperience page where URL is "/"
   *   - Its composition tree: grids → rows → columns → component blocks
   *   - Each block type's fields (Heading text, Hero image, etc.)
   *
   * The type name after "... on" MUST match the Optimizely content type API name.
   */
  const query = `
    query GetHomepage {
      BlankExperience(
        where: {
          _metadata: {
            url: {
              default: {
                eq: "/"
              }
            }
          }
        }
        limit: 1
      ) {
        total
        items {
          _metadata {
            key
            version
            types
            displayName
            url {
              default
            }
            published
            status
          }
          composition {
            grids: nodes {
              ... on ICompositionStructureNode {
                key
                displayName
                rows: nodes {
                  ... on ICompositionStructureNode {
                    key
                    displayName
                    columns: nodes {
                      ... on ICompositionStructureNode {
                        key
                        displayName
                        elements: nodes {
                          ... on ICompositionComponentNode {
                            key
                            displayName
                            component {
                              _metadata {
                                key
                                types
                                displayName
                              }
                              ... on demo_block {
                                ImageNumber
                                MarginTopAndBottom
                              }
                              ... on Hero {
                                Heading
                                SubHeading
                                Body {
                                  html
                                  json
                                }
                                Image {
                                  key
                                  url {
                                    base
                                    default
                                  }
                                }
                                Links {
                                  target
                                  text
                                  title
                                  url {
                                    type
                                    default
                                    hierarchical
                                    internal
                                    graph
                                    base
                                  }
                                }
                              }
                              ... on FeatureGrid {
                                Heading
                                SubHeading
                                Cards {
                                  key
                                  url {
                                    base
                                    default
                                    graph
                                    hierarchical
                                    internal
                                    type
                                  }
                                }
                              }
                              ... on CallToActionOutput {
                                Header
                                Links {
                                  target
                                  text
                                  title
                                  url {
                                    base
                                    default
                                  }
                                }
                              }
                              ... on PromoBlock {
                                BackgroundStyle
                                CTA {
                                  base
                                  default
                                }
                                CTAColour
                                Description {
                                  html
                                }
                                Image {
                                  base
                                  default
                                }
                                Title
                              }
                              ... on Image {
                                Image {
                                  url {
                                    base
                                    default
                                  }
                                }
                              }
                              ... on ContentBlock {
                                Content {
                                  html
                                }
                                Position
                              }
                              ... on Heading {
                                Heading
                                HeadingSize
                                Alignment
                              }
                              ... on Divider {
                                _metadata {
                                  key
                                }
                                DividerSize
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Optimizely API error:', data)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'GraphQL errors',
          details: data.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        // Response shape: { success, data: { data: { BlankExperience: ... } } }
        // The inner .data is the GraphQL envelope. CMSContent reads data.data.data.BlankExperience.
        // See docs/DATA_SHAPES.md
        data,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching Optimizely data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
