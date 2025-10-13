import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'SDK Key not configured'
      },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { key, ver, loc } = body
    
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Content key is required' },
        { status: 400 }
      )
    }

    // Get authorization header for preview token
    const authorization = request.headers.get('authorization')
    
    // Build GraphQL query for content by key
    const query = `
      query GetContentByKey($key: String!) {
        _Content(
          where: {
            _metadata: {
              contentKey: {
                eq: $key
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
                                # Include content fields for inline components
                                ... on Hero {
                                  Heading
                                  Subheading
                                  Image {
                                    url
                                  }
                                }
                                ... on Text {
                                  MainBody {
                                    html
                                  }
                                }
                                ... on DemoBlock {
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

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Add authorization header if preview token is provided
    if (authorization) {
      headers['Authorization'] = authorization
    }

    const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        query,
        variables: { key }
      }),
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
    })
  } catch (error: any) {
    console.error('Error fetching preview content:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}
