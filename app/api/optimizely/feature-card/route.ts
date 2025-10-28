import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json(
      { success: false, error: 'Card key is required' },
      { status: 400 }
    )
  }

  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    return NextResponse.json(
      { success: false, error: 'SDK Key not configured' },
      { status: 500 }
    )
  }

  const query = `
    query GetFeatureCard {
      FeatureCard(
        where: {
          _metadata: {
            key: {
              eq: "${key}"
            }
          }
        }
        limit: 1
      ) {
        items {
          _metadata {
            key
            displayName
            types
          }
          Heading
          Body
          Image {
            base
            default
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

    const result = await response.json()
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors)
      return NextResponse.json({
        success: false,
        error: 'GraphQL errors',
        details: result.errors
      }, { status: 400 })
    }

    const card = result.data?.FeatureCard?.items?.[0]

    return NextResponse.json({
      success: true,
      data: card
    })
  } catch (error) {
    console.error('Error fetching FeatureCard:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch card data'
      },
      { status: 500 }
    )
  }
}

