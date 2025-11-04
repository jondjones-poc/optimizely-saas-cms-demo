import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const ver = searchParams.get('ver')

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

  // Check for authorization header (preview token)
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  
  // Normalize the authorization header - ensure it has Bearer prefix
  let authorization: string | null = null
  if (authHeader) {
    // Handle case where header might be duplicated
    let headerValue = authHeader.split(',')[0].trim()
    
    // Remove any existing Bearer prefix (case-insensitive) and add it back consistently
    let token = headerValue.replace(/^Bearer\s+/i, '').trim()
    
    // Use the token if it exists
    if (token && token.length > 0) {
      authorization = `Bearer ${token}`
      console.log('✅ FeatureCard API: Preview token received', {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...',
        hasBearer: true
      })
    }
  } else {
    console.log('⚠️ FeatureCard API: No preview token in Authorization header')
  }

  // When using preview token, Optimizely Graph automatically returns draft content
  // We don't need to specify version - it will return the latest draft for each card
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
            version
            status
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
    // Build headers and URL based on whether we have a preview token
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    let apiUrl = `https://cg.optimizely.com/content/v2`
    
    if (authorization) {
      // Use preview token in Authorization header for draft content
      headers['Authorization'] = authorization
      // Add cache-busting headers and timestamp when using preview token
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
      headers['Pragma'] = 'no-cache'
      headers['Expires'] = '0'
      apiUrl += `?t=${Date.now()}`
      console.log('✅ FeatureCard API: Using preview token for draft content')
    } else {
      // Use SDK key as query parameter for published content
      apiUrl += `?auth=${sdkKey}`
      console.log('⚠️ FeatureCard API: Using SDK key for published content')
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
      cache: 'no-store'
    })

    const result = await response.json()
    
    if (!response.ok) {
      const errorDetails = result.errors || result
      console.error('HTTP error response:', {
        status: response.status,
        statusText: response.statusText,
        errors: result.errors,
        errorDetails: errorDetails,
        data: result.data,
        query: query.substring(0, 200) + '...'
      })
      return NextResponse.json({
        success: false,
        error: `HTTP error! status: ${response.status}`,
        details: errorDetails,
        message: errorDetails[0]?.message || errorDetails.message || 'Unknown error'
      }, { status: response.status })
    }
    
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

