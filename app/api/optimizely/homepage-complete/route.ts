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
          hasOptimizelyKey: !!process.env.OPTIMIZELY_GRAPH_SINGLE_KEY
        }
      },
      { status: 500 }
    )
  }

  // First, get the homepage structure
  const homepageQuery = `
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
    // Get homepage structure
    const homepageResponse = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: homepageQuery }),
      cache: 'no-store'
    })

    if (!homepageResponse.ok) {
      throw new Error(`HTTP error! status: ${homepageResponse.status}`)
    }

    const homepageData = await homepageResponse.json()
    
    if (homepageData.errors) {
      return NextResponse.json({
        success: false,
        error: 'GraphQL errors',
        details: homepageData.errors
      }, { status: 400 })
    }

    // Now fetch all content types that have actual content (key != null)
    const contentTypes = ['Hero', 'ContentBlock', 'FeatureCard', 'demo_block']
    const contentData: any = {}

    for (const contentType of contentTypes) {
      try {
        const contentQuery = `
          query Get${contentType} {
            ${contentType} {
              items {
                _metadata {
                  key
                  types
                  displayName
                }
                ... on ${contentType} {
                  # Include all possible fields for this content type
                  __typename
                }
              }
            }
          }
        `

        const contentResponse = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: contentQuery }),
          cache: 'no-store'
        })

        if (contentResponse.ok) {
          const contentResult = await contentResponse.json()
          if (contentResult.data && contentResult.data[contentType]) {
            contentData[contentType] = contentResult.data[contentType]
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch ${contentType}:`, error)
        // Continue with other content types
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        homepage: homepageData.data,
        content: contentData
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching Optimizely data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


