import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY
  const searchParams = request.nextUrl.searchParams
  const contentKey = searchParams.get('key')

  if (!sdkKey) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'SDK Key not configured'
      },
      { status: 500 }
    )
  }

  if (!contentKey) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Content key not provided'
      },
      { status: 400 }
    )
  }

  const query = `
    query GetBlock($key: String!) {
      _Content(
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
            types
            displayName
          }
          ... on Hero {
            Heading
            Subheading
            Image {
              url
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
        variables: { key: contentKey }
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
  } catch (error) {
    console.error('Error fetching Optimizely block data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

