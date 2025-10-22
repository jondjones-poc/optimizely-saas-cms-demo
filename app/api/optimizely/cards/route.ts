import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 })
    }

    const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query: `
          query GetCards {
            Card {
              total
              items {
                _metadata {
                  key
                  displayName
                  types
                }
                Heading
                SubHeading
                Body
                Image {
                  key
                  url {
                    base
                    default
                    graph
                    hierarchical
                  }
                }
                Links {
                  target
                  text
                  title
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
            }
          }
        `
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
      data: data.data,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching Optimizely cards data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
