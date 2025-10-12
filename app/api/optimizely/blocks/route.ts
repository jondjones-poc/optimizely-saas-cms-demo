import { NextResponse } from 'next/server'

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

  // Query the GraphQL schema to get all available types
  const query = `
    query IntrospectTypes {
      __schema {
        types {
          name
          kind
          fields {
            name
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

    // Filter for block/component types
    // Exclude system types (starting with _), scalars, and interfaces
    const allTypes = data.data?.__schema?.types || []
    const blockTypes = allTypes
      .filter((type: any) => {
        // Include types that are likely blocks/components
        // Exclude: system types (_), Output types, Input types, scalars, enums
        return (
          type.kind === 'OBJECT' &&
          !type.name.startsWith('_') &&
          !type.name.startsWith('__') &&
          !type.name.endsWith('Output') &&
          !type.name.endsWith('Input') &&
          !type.name.includes('Facet') &&
          !type.name.includes('OrderBy') &&
          !type.name.includes('Where') &&
          type.fields &&
          type.fields.length > 0
        )
      })
      .map((type: any) => ({
        name: type.name,
        fields: type.fields.map((field: any) => ({
          name: field.name,
          type: 'String',
          isRequired: false
        }))
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name))

    return NextResponse.json({ 
      success: true, 
      data: blockTypes,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch blocks from Optimizely' 
    }, { status: 500 })
  }
}

