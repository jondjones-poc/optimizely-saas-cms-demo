import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const ver = searchParams.get('ver')
  const graphUrl = searchParams.get('graph') // Graph URL from card reference

  if (!key && !graphUrl) {
    return NextResponse.json(
      { success: false, error: 'Card key or graph URL is required' },
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

  // If we have a graph URL, use it to query the specific version
  // Otherwise, query by key (will get latest draft with preview token)
  let query: string
  
  if (graphUrl) {
    // Graph URL format: graph://cms/FeatureCard/{key} or similar graph URI scheme
    // Extract the key from the graph URI
    let graphKey = key
    let graphVer = ver
    
    // Handle graph:// URI scheme - extract key from path
    if (graphUrl.startsWith('graph://')) {
      // Format: graph://cms/FeatureCard/{key}
      const parts = graphUrl.split('/')
      graphKey = parts[parts.length - 1] || key // Last part is the key
      console.log('✅ FeatureCard API: Extracted key from graph URI', { 
        original: graphUrl, 
        extractedKey: graphKey,
        parts: parts
      })
    } else {
      // Try parsing as regular URL with query params
      try {
        let urlToParse = graphUrl
        if (!graphUrl.startsWith('http')) {
          urlToParse = `https://cg.optimizely.com${graphUrl.startsWith('/') ? graphUrl : '/' + graphUrl}`
        }
        const graphUrlObj = new URL(urlToParse)
        graphKey = graphUrlObj.searchParams.get('key') || graphKey
        graphVer = graphUrlObj.searchParams.get('ver') || graphVer
      } catch (error) {
        console.warn('⚠️ FeatureCard API: Failed to parse graph URL', { graphUrl, error: error instanceof Error ? error.message : 'Unknown error' })
        graphKey = key
      }
    }
    
    console.log('✅ FeatureCard API: Using graph URL', { 
      original: graphUrl, 
      key: graphKey, 
      version: graphVer || 'not provided',
      hasPreviewToken: !!authorization,
      note: 'Graph URI format does not include version - will query by key only with preview token to get latest draft'
    })
    
    // Graph URI doesn't include version, so we need to query for the latest draft
    // Query all versions and select the one with highest version number and status 'Draft' or 'Current'
    // When using preview token, Optimizely Graph should return draft versions
    query = `
      query GetFeatureCard {
        _Content(
          where: {
            _metadata: {
              key: {
                eq: "${graphKey || key}"
              }
            }
          }
          limit: 100
        ) {
          items {
            _metadata {
              key
              displayName
              types
              version
              status
            }
            ... on FeatureCard {
              Heading
              Body
              Image {
                base
                default
              }
            }
          }
        }
      }
    `
    console.log('✅ FeatureCard API: Querying all versions to find latest draft', { 
      key: graphKey || key,
      hasPreviewToken: !!authorization,
      note: 'Will filter results to find latest draft version'
    })
  } else {
    // Query all versions and select the latest draft
    // When using preview token, Optimizely Graph should return draft versions
    query = `
      query GetFeatureCard {
        _Content(
          where: {
            _metadata: {
              key: {
                eq: "${key}"
              }
            }
          }
          limit: 100
        ) {
          items {
            _metadata {
              key
              displayName
              types
              version
              status
            }
            ... on FeatureCard {
              Heading
              Body
              Image {
                base
                default
              }
            }
          }
        }
      }
    `
    console.log('✅ FeatureCard API: Querying all versions by key to find latest draft', { 
      key,
      hasPreviewToken: !!authorization,
      note: 'Will filter results to find latest draft version'
    })
  }

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

    // Get all versions returned
    const allVersions = result.data?._Content?.items || []
    
    console.log('📊 FeatureCard API: Query result - all versions', {
      hasData: !!result.data,
      itemsCount: allVersions.length,
      versions: allVersions.map((item: any) => ({
        version: item._metadata?.version,
        status: item._metadata?.status,
        key: item._metadata?.key
      })),
      hasPreviewToken: !!authorization,
      usedGraphUrl: !!graphUrl
    })
    
    // Find the latest draft version
    // Priority: 1) Status 'Current' or 'Draft', 2) Highest version number
    let card = allVersions.find((item: any) => 
      item._metadata?.status === 'Current' || item._metadata?.status === 'Draft'
    )
    
    // If no Current/Draft, find the one with highest version number
    if (!card && allVersions.length > 0) {
      // Sort by version number (as string, but we'll compare numerically)
      const sorted = [...allVersions].sort((a: any, b: any) => {
        const verA = parseInt(a._metadata?.version || '0', 10)
        const verB = parseInt(b._metadata?.version || '0', 10)
        return verB - verA // Descending order
      })
      card = sorted[0]
      console.log('⚠️ FeatureCard API: No Current/Draft found, using highest version', {
        version: card._metadata?.version,
        status: card._metadata?.status
      })
    }
    
    console.log('📊 FeatureCard API: Selected card', {
      hasCard: !!card,
      cardKey: card?._metadata?.key,
      cardVersion: card?._metadata?.version,
      cardStatus: card?._metadata?.status,
      hasHeading: !!card?.Heading,
      hasBody: !!card?.Body,
      hasImage: !!card?.Image,
      isLatestDraft: card?._metadata?.status === 'Current' || card?._metadata?.status === 'Draft'
    })
    
    if (!card) {
      console.error('❌ FeatureCard API: No card returned from query', {
        key: graphKey || key,
        graphUrl,
        hasPreviewToken: !!authorization,
        allVersionsCount: allVersions.length,
        resultData: result.data,
        resultErrors: result.errors
      })
      return NextResponse.json({
        success: false,
        error: 'Card not found',
        details: {
          key: graphKey || key,
          graphUrl,
          message: 'No FeatureCard found with the specified key'
        }
      }, { status: 404 })
    }
    
    // Log version info when using preview token
    if (authorization && card?._metadata) {
      const cardStatus = card._metadata.status
      const cardVersion = card._metadata.version
      console.log('📊 FeatureCard API: Card fetched with preview token', {
        key: card._metadata.key,
        version: cardVersion,
        status: cardStatus,
        hasPreviewToken: true,
        isDraft: cardStatus === 'Draft' || cardStatus === 'Current',
        isPublished: cardStatus === 'Published',
        isPrevious: cardStatus === 'Previous',
        note: cardStatus === 'Previous' 
          ? '⚠️ WARNING: Status is Previous - an older draft version. May need to query for latest version explicitly.' 
          : cardStatus === 'Published'
          ? '⚠️ INFO: Status is Published - no draft version available or preview token not accessing draft'
          : '✅ Status looks correct for draft content'
      })
      
      // If status is Previous, warn that we might need a different query approach
      if (cardStatus === 'Previous') {
        console.warn('⚠️ FeatureCard API: Card returned Previous status. This may indicate:', {
          reason1: 'Card has a newer draft version that we\'re not querying',
          reason2: 'Preview token may not have access to latest draft',
          reason3: 'Card may need version parameter to query specific draft',
          suggestion: 'Consider querying all versions and selecting latest, or using graph URL from card reference'
        })
      }
    }

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

