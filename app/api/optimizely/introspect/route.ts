import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
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

  const { typeName, contentKey } = await request.json()

  if (!contentKey) {
    return NextResponse.json(
      { success: false, error: 'Content key is required' },
      { status: 400 }
    )
  }

  // Query to fetch actual content and extract field names from the response
  // We'll use a fragment with common fields that might exist
  const query = `
    query GetContentFields {
      _Content(
        where: {
          _metadata: {
            key: {
              eq: "${contentKey}"
            }
          }
        }
      ) {
        total
        items {
          _metadata {
            key
            types
          }
          _type: __typename
          
          # Try to fetch as much as possible to discover fields
          ... on _IContent {
            _link {
              default
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

    // For now, return common fields that typically exist in Optimizely content
    // These are the most common fields across content types
    const commonFields = [
      'Name',
      'Heading',
      'MainBody',
      'MainContentArea',
      'MetaTitle',
      'MetaDescription',
      'PageImage',
      'TeaserText',
      'ContentLink',
      'Category',
      'StartPublish',
      'StopPublish'
    ]

    return NextResponse.json({ 
      success: true, 
      data: {
        typeName: typeName || 'Unknown',
        fields: commonFields.map(name => ({ name, type: 'String' }))
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to introspect type' 
    }, { status: 500 })
  }
}

