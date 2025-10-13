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

  // Query to introspect schema and get page types
  const query = `
    query IntrospectPageTypes {
      __schema {
        types {
          name
          kind
          description
          fields {
            name
            type {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
          interfaces {
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

    // Filter types that implement _IPage interface (actual pages)
    const pageTypes = data.data?.__schema?.types
      ?.filter((type: any) => {
        // Must be an OBJECT type
        if (type.kind !== 'OBJECT') return false
        
        // Must implement _IPage interface (this is what makes it a page)
        const implementsIPage = type.interfaces?.some((iface: any) => 
          iface.name === '_IPage' || iface.name === 'IPage'
        )
        
        if (!implementsIPage) return false
        
        // Exclude system types
        const systemTypes = [
          '_IContent', 'IContent', '_Content', 'ContentOutput', '_IPage', 'IPage',
          'Query', 'Mutation', '__Schema', '__Type', '__Field', 
          '__InputValue', '__EnumValue', '__Directive',
          'ContentMetadata', 'ContentLink', 'ContentUrl',
          'SysContentFolder', 'SiteSettings', 'PageSeoSettings'
        ]
        
        if (systemTypes.includes(type.name)) return false
        if (type.name.startsWith('__')) return false
        
        // Exclude types that start with underscore (system types)
        if (type.name.startsWith('_')) return false
        
        return true
      })
      .map((type: any) => ({
        name: type.name,
        fields: type.fields
          ?.filter((field: any) => 
            !field.name.startsWith('__') && 
            field.name !== '_metadata' &&
            field.name !== '_type' &&
            field.name !== '_link'
          )
          .map((field: any) => ({
            name: field.name,
            type: field.type?.name || field.type?.ofType?.name || 'Unknown',
            isRequired: field.type?.kind === 'NON_NULL'
          })) || []
      })) || []

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

