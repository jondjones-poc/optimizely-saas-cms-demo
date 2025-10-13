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

  // Query to get all content and extract unique types
  const query = `
    query GetContentTypes {
      _Content(
        limit: 100
      ) {
        total
        items {
          _metadata {
            types
            displayName
            key
          }
          _type: __typename
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

    // Get unique content types from the metadata.types array
    const contentTypesMap = new Map()
    
    if (data.data?._Content?.items) {
      data.data._Content.items.forEach((item: any) => {
        // Get the primary type from the types array (usually the last one)
        const types = item._metadata?.types || []
        const primaryType = types[types.length - 1] || item._type
        
        if (primaryType && !contentTypesMap.has(primaryType)) {
          contentTypesMap.set(primaryType, {
            name: primaryType,
            fields: [
              { name: '_metadata', type: 'ContentMetadata', isRequired: true },
              { name: 'key', type: 'String', isRequired: true },
              { name: 'version', type: 'String', isRequired: false },
              { name: 'types', type: '[String]', isRequired: false },
              { name: 'displayName', type: 'String', isRequired: false },
              { name: 'url', type: 'String', isRequired: false },
              { name: 'published', type: 'DateTime', isRequired: false },
              { name: 'status', type: 'String', isRequired: false },
            ]
          })
        }
      })
    }

    const pageTypes = Array.from(contentTypesMap.values())

    return NextResponse.json({ 
      success: true, 
      data: pageTypes,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch page types from Optimizely' 
    }, { status: 500 })
  }
}
