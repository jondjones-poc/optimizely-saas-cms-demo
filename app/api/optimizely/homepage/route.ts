import { NextResponse } from 'next/server'
import { getOptimizelyHomepageUrl, getOptimizelySdkKey } from '@/lib/optimizely-config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sdkKey = getOptimizelySdkKey()

  if (!sdkKey) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'SDK Key not configured',
        debug: {
          hasNextPublicKey: !!process.env.NEXT_PUBLIC_SDK_KEY
        }
      },
      { status: 500 }
    )
  }

  const homepageUrl = getOptimizelyHomepageUrl()

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
                              ... on demo_block {
                                ImageNumber
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
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      return NextResponse.json({
        success: false,
        error: 'GraphQL errors',
        details: data.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data,
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
