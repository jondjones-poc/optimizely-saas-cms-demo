/**
 * Shared function to fetch preview content from Optimizely Graph
 * Can be used by both API routes and server components
 */

interface FetchPreviewContentParams {
  key: string
  ver?: string | null
  loc?: string | null
  previewToken?: string | null
}

export async function fetchPreviewContentFromGraph({
  key,
  ver,
  loc,
  previewToken
}: FetchPreviewContentParams) {
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    throw new Error('SDK Key not configured')
  }

  if (!key) {
    throw new Error('Content key is required')
  }

  // Get authorization header for preview token
  let authorization: string | null = null
  if (previewToken) {
    // Normalize the token - ensure it has Bearer prefix
    let token = previewToken.replace(/^Bearer\s+/i, '').trim()
    if (token && token.length > 0) {
      authorization = `Bearer ${token}`
    }
  }

  // Build query with version if provided (required per docs)
  // NOTE: Version must be String type in Optimizely Graph, not Int
  let queryVariables = '$key: String!'
  let whereClause = '_metadata: { key: { eq: $key } }'
  let variables: any = { key }

  if (ver && authorization) {
    // Include version in query when we have both preview token and version (per Optimizely docs)
    queryVariables = '$key: String!, $version: String!'
    whereClause = '_metadata: { key: { eq: $key }, version: { eq: $version } }'
    variables = { key, version: ver }
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
                                ... on demo_block {
                                  _metadata {
                                    key
                                  }
                                  ImageNumber
                                  MarginTopAndBottom
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

  // Build fetch URL and headers
  // IMPORTANT: When using preview token, DO NOT include SDK key in URL (per Optimizely docs)
  let graphUrl: string
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }

  if (authorization) {
    // Preview token: use Authorization header ONLY - Optimizely Graph automatically returns draft/unpublished content
    // DO NOT include SDK key in query parameter when using preview token (per documentation)
    headers['Authorization'] = authorization
    // Add timestamp to URL to help with cache-busting for draft content
    const timestamp = Date.now()
    graphUrl = `https://cg.optimizely.com/content/v2?t=${timestamp}`
    
    console.log('✅ Using PREVIEW TOKEN for draft content (per Optimizely docs)', {
      tokenPrefix: authorization.substring(0, 30) + '...',
      tokenLength: authorization.length,
      hasBearer: authorization.includes('Bearer '),
      apiUrl: graphUrl,
      usingSDKKey: false,
      cacheBusting: `timestamp=${timestamp}`,
      note: 'Optimizely Graph returns draft/unpublished content automatically with preview token in Authorization header.'
    })
  } else {
    // No preview token: use SDK key in query parameter - this returns published content only
    graphUrl = `https://cg.optimizely.com/content/v2?auth=${sdkKey}`
    console.log('⚠️ Using PRODUCTION SDK KEY - will return PUBLISHED content only (no draft)', {
      apiUrl: graphUrl.substring(0, 60) + '...',
      usingSDKKey: true,
      note: 'This will NOT show draft content. Preview token must be provided for draft content.'
    })
  }

  const response = await fetch(graphUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    cache: 'no-store'
  })

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
      throw new Error(`Preview token authentication failed (401 Unauthorized). Preview tokens expire after 5 minutes. Refresh the preview page in CMS to get a new token.`)
    }
    
    throw new Error(`HTTP error! status: ${response.status} - ${errorJson ? JSON.stringify(errorJson) : errorText.substring(0, 500)}`)
  }

  let data: any
  try {
    data = await response.json()
  } catch (e) {
    console.error('Failed to parse JSON response:', e)
    throw new Error('Failed to parse response from Optimizely Graph')
  }
  
  if (data.errors) {
    console.error('GraphQL errors in fetchPreviewContentFromGraph:', data.errors)
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  // Validate response structure
  if (!data.data || !data.data._Content) {
    console.error('Unexpected response structure:', JSON.stringify(data).substring(0, 500))
    throw new Error('Unexpected response structure from Optimizely Graph')
  }

  return {
    success: true,
    data: data.data
  }
}

