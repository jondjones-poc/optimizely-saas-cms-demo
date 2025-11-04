import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json()
    const { key, ver, loc } = body
    
    // Log each parameter separately as received from client
    console.log('📥 API Route - Received Parameters from Client:', {
      '{key}': key || 'MISSING',
      '{version}': ver || 'MISSING',
      '{locale}': loc || 'MISSING',
      'version_type': typeof ver,
      'version_parsed': ver ? parseInt(ver, 10) : null,
      'note': 'Version parameter is REQUIRED per Optimizely docs for preview URLs'
    })
    
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Content key is required' },
        { status: 400 }
      )
    }
    
    if (!ver) {
      console.warn('⚠️ WARNING: Version parameter is missing! Per Optimizely docs, {version} is REQUIRED for preview URLs.')
    }

    // Get authorization header for preview token
    // According to Optimizely docs, the preview token comes from the preview URL in CMS
    // The client extracts it from URL and sends it in Authorization header
    // Note: Next.js may lowercase headers, so check both 'authorization' and 'Authorization'
    
    // Check for authorization header (preview token)
    
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    
    // Normalize the authorization header - ensure it has Bearer prefix
    let authorization: string | null = null
    if (authHeader) {
      // Handle case where header might be duplicated (e.g., "Bearer token, Bearer token")
      // Split by comma and take the first one
      let headerValue = authHeader.split(',')[0].trim()
      
      // Remove any existing Bearer prefix (case-insensitive) and add it back consistently
      let token = headerValue.replace(/^Bearer\s+/i, '').trim()
      
      // Use the token if it exists (don't validate format - let Optimizely Graph validate it)
      if (token && token.length > 0) {
        authorization = `Bearer ${token}`
      }
    }
    
    // Log authorization status
    if (authorization) {
      console.log('✅ Using preview token for draft content:', {
        hasToken: true,
        tokenLength: authorization.length,
        version: ver || 'not provided'
      })
    } else {
      console.log('⚠️ Using SDK key for published content (no preview token)')
    }
    
    // Build GraphQL query for content by key - support multiple page types
    // According to Optimizely docs, version parameter is REQUIRED in preview URLs
    // When using preview token WITH version, we should query by both key and version to get the specific draft version
    // The preview token in Authorization header grants access to draft content, but version specifies WHICH draft
    const hasPreviewToken = !!authorization
    
    // Build query with version if provided (required per docs)
    // NOTE: Version must be String type in Optimizely Graph, not Int
    let queryVariables = '$key: String!'
    let whereClause = '_metadata: { key: { eq: $key } }'
    
    if (ver && authorization) {
      // Include version in query when we have both preview token and version (per Optimizely docs)
      // Version must be String type, not Int
      queryVariables = '$key: String!, $version: String!'
      whereClause = '_metadata: { key: { eq: $key }, version: { eq: $version } }'
      console.log('✅ Using version parameter in GraphQL query (per Optimizely docs):', {
        version: ver,
        versionType: typeof ver,
        hasPreviewToken: true,
        note: 'Querying by key AND version to get specific draft version. Version is String type in Optimizely Graph.'
      })
    } else if (authorization && !ver) {
      console.warn('⚠️ WARNING: Preview token present but version missing! Version is REQUIRED per Optimizely docs.')
    }
    
    const query = `
      query GetContentByKey(${queryVariables}) {
        _Content(
          where: {
            ${whereClause}
          }
          limit: 1
        ) {
          total
          items {
            _metadata {
              key
              version
              types
              displayName
              url {
                default
              }
              published
              status
            }
            ... on BlankExperience {
              composition {
                grids: nodes {
                  ... on ICompositionStructureNode {
                    key
                    displayName
                    rows: nodes {
                      ... on ICompositionStructureNode {
                        key
                        displayName
                        columns: nodes {
                          ... on ICompositionStructureNode {
                            key
                            displayName
                            elements: nodes {
                              ... on ICompositionComponentNode {
                                key
                                displayName
                                component {
                                  _metadata {
                                    key
                                    types
                                    displayName
                                  }
                                  ... on Hero {
                                    Heading
                                    SubHeading
                                    Body {
                                      html
                                    }
                                    Image {
                                      key
                                      url {
                                        base
                                        default
                                      }
                                    }
                                    Links {
                                      target
                                      text
                                      title
                                      url {
                                        base
                                        default
                                      }
                                    }
                                  }
                                  ... on Text {
                                    _metadata {
                                      key
                                    }
                                    Content
                                    Position
                                  }
                                  ... on Image {
                                    AltText
                                    Image {
                                      url {
                                        base
                                        default
                                      }
                                    }
                                  }
                                  ... on Menu {
                                    _metadata {
                                      key
                                      displayName
                                    }
                                  }
                                  ... on Carousel {
                                    Cards {
                                      key
                                      url {
                                        base
                                        default
                                      }
                                    }
                                  }
                                  ... on FeatureGrid {
                                    _metadata {
                                      key
                                    }
                                    Heading
                                    SubHeading
                                    Cards {
                                      key
                                      url {
                                        base
                                        default
                                        graph
                                      }
                                    }
                                  }
                                  ... on PromoBlock {
                                    _metadata {
                                      key
                                    }
                                    BackgroundStyle
                                    CTA {
                                      base
                                      default
                                    }
                                    CTAColour
                                    Description {
                                      html
                                    }
                                    Image {
                                      base
                                      default
                                    }
                                    Title
                                  }
                                  ... on CallToActionOutput {
                                    _metadata {
                                      key
                                    }
                                    Header
                                    Links {
                                      target
                                      text
                                      title
                                      url {
                                        base
                                        default
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            ... on LandingPage {
              TopContentArea {
                _metadata {
                  key
                  displayName
                  types
                }
                ... on Hero {
                  _metadata {
                    key
                    displayName
                    types
                  }
                  Heading
                  SubHeading
                  Body {
                    html
                  }
                  Image {
                    key
                    url {
                      base
                      default
                    }
                  }
                  Links {
                    target
                    text
                    title
                    url {
                      base
                      default
                    }
                  }
                }
                ... on Carousel {
                  Cards {
                    key
                    url {
                      base
                      default
                      hierarchical
                      internal
                    }
                  }
                }
              }
              MainContentArea {
                _metadata {
                  key
                  displayName
                  types
                }
                ... on Text {
                  Content
                  Position
                }
                ... on Image {
                  AltText
                  Image {
                    url {
                      base
                      default
                      graph
                    }
                  }
                }
                ... on Menu {
                  _metadata {
                    key
                    displayName
                  }
                }
              }
              SeoSettings {
                DisplayInMenu
                GraphType
                Indexing
                MetaDescription
                MetaTitle
              }
            }
            ... on ArticlePage {
              Heading
              SubHeading
              Author
              Body {
                html
              }
            }
            ... on NewsLandingPage {
              Title
            }
          }
        }
      }
    `

    // Build headers object - use plain object for maximum compatibility
    // According to Optimizely docs: https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/enable-live-preview-saas
    // "Live preview requires access to unpublished content, such as drafts. To retrieve this content from Optimizely Graph,
    // use the preview_token provided in the preview URL. Extract the token from the preview URL and use it in the Authorization
    // header of your GraphQL request: Authorization: Bearer {the preview token}"
    
    // For preview token, use Authorization header ONLY (no SDK key in URL)
    // For SDK key, use query parameter (not both)
    // IMPORTANT: Add cache-busting headers to prevent stale draft content
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
    
    let apiUrl: string
    if (authorization) {
      // Preview token: use Authorization header ONLY - Optimizely Graph automatically returns draft/unpublished content
      // DO NOT include SDK key in query parameter when using preview token (per documentation)
      headers['Authorization'] = authorization
      
      // Add timestamp to URL to help with cache-busting for draft content
      // This ensures we get the latest draft version, not a cached one
      const timestamp = Date.now()
      apiUrl = `https://cg.optimizely.com/content/v2?t=${timestamp}`
      
      // Note: NO auth query parameter when using preview token
      console.log('✅ Using PREVIEW TOKEN for draft content (per Optimizely docs)', {
        tokenPrefix: authorization.substring(0, 30) + '...',
        tokenLength: authorization.length,
        hasBearer: authorization.includes('Bearer '),
        apiUrl: apiUrl,
        usingSDKKey: false,
        cacheBusting: `timestamp=${timestamp}`,
        note: 'Optimizely Graph returns draft/unpublished content automatically with preview token in Authorization header. Cache-busting timestamp added to ensure latest draft.'
      })
    } else {
      // No preview token: use SDK key in query parameter - this returns published content only
      // DO NOT set Authorization header when using SDK key (they conflict)
      apiUrl = `https://cg.optimizely.com/content/v2?auth=${sdkKey}`
      console.log('⚠️ Using PRODUCTION SDK KEY - will return PUBLISHED content only (no draft)', {
        apiUrl: apiUrl.substring(0, 60) + '...',
        usingSDKKey: true,
        note: 'This will NOT show draft content. Preview token must be provided in Authorization header for draft content.'
      })
    }

    
    
    // Build query variables - include version if provided (required per Optimizely docs)
    // NOTE: Version must be String, not Int, in Optimizely Graph
    const variables: any = { key }
    if (ver && authorization) {
      variables.version = ver // Keep as string, don't parseInt
    }
    
    const fetchBody = JSON.stringify({ 
      query,
      variables
    })
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: fetchBody,
      cache: 'no-store'
    })
    
    // Log response status

    if (!response.ok) {
      let errorText = ''
      let errorJson: any = null
      try {
        errorText = await response.text()
        // Try to parse as JSON
        try {
          errorJson = JSON.parse(errorText)
        } catch {
          // Not JSON, keep as text
        }
      } catch (e) {
        errorText = 'Could not read error response'
      }
      
      console.error('❌ Optimizely Graph API error:', {
        status: response.status,
        statusText: response.statusText,
        hasPreviewToken: !!authorization,
        error: errorJson || errorText.substring(0, 200),
        note: response.status === 401 
          ? 'Preview token may be expired (tokens expire after 5 minutes). Refresh the preview page in CMS to get a new token.' 
          : ''
      })
      
      // For 401 errors, provide more helpful message
      if (response.status === 401) {
        return NextResponse.json({
          success: false,
          error: `Preview token authentication failed (401 Unauthorized)`,
          details: errorJson || errorText.substring(0, 500),
          hint: 'Preview tokens expire after 5 minutes. Refresh the preview page in CMS to get a new token.'
        }, { status: 401 })
      }
      
      return NextResponse.json({
        success: false,
        error: `HTTP error! status: ${response.status} - ${response.statusText}`,
        details: errorJson || errorText.substring(0, 500)
      }, { status: response.status })
    }

    let data: any
    try {
      data = await response.json()
    } catch (e) {
      console.error('Failed to parse JSON response:', e)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse response from Optimizely Graph'
      }, { status: 500 })
    }
    
    if (data.errors) {
      console.error('GraphQL errors in preview-content:', data.errors)
      return NextResponse.json({
        success: false,
        error: 'GraphQL errors',
        details: data.errors
      }, { status: 400 })
    }

    // Debug: Log Hero SubHeading to check if draft content is being returned
    const firstItem = data.data?._Content?.items?.[0]
    const isBlankExperience = firstItem?._metadata?.types?.includes('BlankExperience')
    const isLandingPage = firstItem?._metadata?.types?.includes('LandingPage')
    
    // Log version matching for debugging
    if (authorization && ver) {
      const versionMatch = firstItem?._metadata?.version === ver
      console.log('📊 Version Check:', {
        'Version Requested': ver,
        'Version Returned': firstItem?._metadata?.version,
        'Match': versionMatch ? '✅' : '❌',
        'Page Status': firstItem?._metadata?.status
      })
    }
    
    // Check for Hero in BlankExperience composition
    if (isBlankExperience && firstItem?.composition) {
      
      // The GraphQL query uses "grids: nodes" which aliases nodes to grids
      // So the response has grids as an array directly (not grids.nodes)
      const grids = Array.isArray(firstItem.composition?.grids) 
        ? firstItem.composition.grids 
        : firstItem.composition?.grids?.nodes || []
      
      if (!grids || grids.length === 0) {
        console.log('⚠️ No grids found in composition structure')
      } else {
        console.log('✅ Found grids array, length:', grids.length)
        // Find Hero in composition structure
        // Structure: grids (array) -> rows (array) -> columns (array) -> elements (array) -> component
        let heroBlock: any = null
        let textBlock: any = null
        
        for (const grid of grids) {
          const rows = Array.isArray(grid.rows) ? grid.rows : grid.rows?.nodes || []
          for (const row of rows) {
            const columns = Array.isArray(row.columns) ? row.columns : row.columns?.nodes || []
            for (const column of columns) {
              const elements = Array.isArray(column.elements) ? column.elements : column.elements?.nodes || []
              for (const element of elements) {
                if (element.component?._metadata?.types?.includes('Hero')) {
                  heroBlock = element.component
                }
                if (element.component?._metadata?.types?.includes('Text')) {
                  textBlock = element.component
                }
              }
            }
          }
        }
        
        if (heroBlock) {
          console.log('📝 Hero block data from API:', {
            'SubHeading': heroBlock.SubHeading,
            'Block Key': heroBlock._metadata?.key,
            'Page Version': firstItem?._metadata?.version
          })
        }
        
        if (textBlock) {
          console.log('📝 TextBlock data from API:', {
            'Content': textBlock.Content?.substring(0, 100) + (textBlock.Content?.length > 100 ? '...' : ''),
            'Block Key': textBlock._metadata?.key,
            'Page Version': firstItem?._metadata?.version,
            'Version Match': ver ? (firstItem?._metadata?.version === ver) : 'N/A'
          })
        }
      }
    }
    
    // Check for Hero in LandingPage TopContentArea
    if (isLandingPage && firstItem?.TopContentArea) {
      const topContentArea = firstItem.TopContentArea
      const heroBlock = topContentArea.find((block: any) => 
        block._metadata?.types?.[0] === 'Hero'
      )
      if (heroBlock) {
        console.log('📝 Hero block data from API (LandingPage):', {
          'SubHeading': heroBlock.SubHeading,
          'Block Key': heroBlock._metadata?.key
        })
      }
    }

    // Validate response structure
    if (!data.data || !data.data._Content) {
      console.error('Unexpected response structure:', JSON.stringify(data).substring(0, 500))
      return NextResponse.json({
        success: false,
        error: 'Unexpected response structure from Optimizely Graph',
        details: data
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error fetching preview content:', error)
    console.error('Error stack:', error.stack)
    console.error('Request body:', { key, ver, loc })
    console.error('Authorization header:', request.headers.get('authorization') ? 'Present' : 'Missing')
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
          key,
          hasAuth: !!request.headers.get('authorization')
        } : undefined
      },
      { status: 500 }
    )
  }
}
