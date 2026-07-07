/**
 * HOMEPAGE API — Server-side bridge to Optimizely Graph.
 *
 * The browser cannot call Optimizely Graph directly with the secret key safely,
 * so this Next.js "API route" runs on the server and:
 *   1. Reads NEXT_PUBLIC_SDK_KEY from .env.local
 *   2. Sends a GraphQL query to https://cg.optimizely.com/content/v2
 *   3. Returns JSON to app/page.tsx
 *
 * When you add a NEW block type in Optimizely, add its GraphQL fields in
 * lib/optimizely/graphql/blockFragments.ts (compositionBlockFields).
 */

import { NextResponse } from 'next/server'
import { getOptimizelyHomepageUrl, getOptimizelySdkKey } from '@/lib/optimizely/env'
import { compositionBlockFields } from '@/lib/optimizely/graphql/blockFragments'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sdkKey = getOptimizelySdkKey()

  if (!sdkKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'SDK Key not configured',
        debug: {
          hasNextPublicKey: !!process.env.NEXT_PUBLIC_SDK_KEY,
        },
      },
      { status: 500 }
    )
  }

  const homepageUrl = getOptimizelyHomepageUrl()

  /**
   * GraphQL query — asks Optimizely for:
   *   - One BlankExperience page where URL matches OPTIMIZELY_HOMEPAGE_URL
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
                eq: "${homepageUrl}"
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
                              ${compositionBlockFields}
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
