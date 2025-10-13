import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    return NextResponse.json(
      { success: false, error: 'SDK Key not configured' },
      { status: 500 }
    )
  }

  const query = `
    query GetAllPages {
      _Content(
        where: {
          _metadata: {
            types: {
              in: ["_Page"]
            }
          }
        }
        limit: 100
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
          ... on BlankExperience {
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

    // Format the response to return page instances
    const pageInstances = data.data?._Content?.items?.map((item: any) => ({
      key: item._metadata.key,
      displayName: item._metadata.displayName,
      url: item._metadata.url?.default || '/',
      types: item._metadata.types || [],
      status: item._metadata.status,
      composition: item.composition,
      fullData: item
    })) || []

    return NextResponse.json({
      success: true,
      data: pageInstances,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching page instances:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

