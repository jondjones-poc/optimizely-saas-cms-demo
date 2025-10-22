import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Key parameter is required'
      },
      { status: 400 }
    )
  }

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

  const query = `
    query GetBlock($key: String!) {
      Card(
        where: {
          _metadata: {
            key: {
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
              hierarchical
              internal
              graph
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

    const blockData = data.data?.Card?.items?.[0]

    if (!blockData) {
      return NextResponse.json({ success: false, error: 'Block not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: blockData,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching block data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}