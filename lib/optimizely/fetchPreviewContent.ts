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
                                ... on ContentBlock {
                                  _metadata {
                                    key
                                  }
                                  Content {
                                    html
                                  }
                                  Position
                                }
                                ... on Heading {
                                  _metadata {
                                    key
                                  }
                                  Heading
                                  HeadingSize
                                  Alignment
                                }
                                ... on Divider {
                                  _metadata {
                                    key
                                  }
                                  DividerSize
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
              ... on ContentBlock {
                Content {
                  html
                }
                Position
              }
              ... on Heading {
                Heading
                HeadingSize
                Alignment
              }
              ... on Divider {
                _metadata {
                  key
                }
                DividerSize
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
    console.error('❌ GraphQL errors in fetchPreviewContentFromGraph:', {
      errors: data.errors,
      errorCount: data.errors.length,
      firstError: data.errors[0],
      fullErrors: JSON.stringify(data.errors, null, 2)
    })
    // Log each error separately for clarity
    data.errors.forEach((error: any, index: number) => {
      console.error(`❌ GraphQL Error ${index + 1}:`, {
        message: error.message,
        locations: error.locations,
        path: error.path,
        extensions: error.extensions
      })
    })
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

/**
 * Fetch FeatureCard content server-side and inline it into FeatureGrid Cards
 */
async function fetchFeatureCardServerSide(
  cardKey: string,
  graphUrl: string | undefined,
  previewToken: string | null
): Promise<any> {
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY
  if (!sdkKey) {
    throw new Error('SDK Key not configured')
  }

  // Build authorization header
  let authorization: string | null = null
  if (previewToken) {
    let token = previewToken.replace(/^Bearer\s+/i, '').trim()
    if (token && token.length > 0) {
      authorization = `Bearer ${token}`
    }
  }

  // Extract key from graph URL if provided
  let queryKey = cardKey
  if (graphUrl && graphUrl.startsWith('graph://')) {
    const parts = graphUrl.split('/')
    queryKey = parts[parts.length - 1] || cardKey
  }

  // Query for FeatureCard
  const query = `
    query GetFeatureCard {
      _Content(
        where: {
          _metadata: {
            key: {
              eq: "${queryKey}"
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

  // Build fetch URL and headers
  let graphApiUrl: string
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }

  if (authorization) {
    headers['Authorization'] = authorization
    graphApiUrl = `https://cg.optimizely.com/content/v2?t=${Date.now()}`
  } else {
    graphApiUrl = `https://cg.optimizely.com/content/v2?auth=${sdkKey}`
  }

  const response = await fetch(graphApiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query }),
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()
  
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
  }

  const allVersions = result.data?._Content?.items || []
  
  // Find the latest draft version (Current or Draft status, or highest version)
  let card = allVersions.find((item: any) => 
    item._metadata?.status === 'Current' || item._metadata?.status === 'Draft'
  )
  
  if (!card && allVersions.length > 0) {
    const sorted = [...allVersions].sort((a: any, b: any) => {
      const verA = parseInt(a._metadata?.version || '0', 10)
      const verB = parseInt(b._metadata?.version || '0', 10)
      return verB - verA
    })
    card = sorted[0]
  }

  return card || null
}

/**
 * Process FeatureGrid data to inline FeatureCard content server-side
 */
export async function processFeatureGridCardsServerSide(
  featureGrid: any,
  previewToken: string | null
): Promise<any> {
  console.log('🔄 processFeatureGridCardsServerSide called:', {
    hasFeatureGrid: !!featureGrid,
    hasCards: !!featureGrid?.Cards,
    cardCount: featureGrid?.Cards?.length || 0,
    firstCard: featureGrid?.Cards?.[0] ? {
      key: featureGrid.Cards[0].key,
      hasHeading: featureGrid.Cards[0].Heading !== undefined,
      hasBody: featureGrid.Cards[0].Body !== undefined,
      keys: Object.keys(featureGrid.Cards[0])
    } : null
  })

  if (!featureGrid || !featureGrid.Cards || featureGrid.Cards.length === 0) {
    console.log('⚠️ processFeatureGridCardsServerSide: No cards to process')
    return featureGrid
  }

  // Check if cards are already inlined (have Heading/Body)
  const hasInlinedContent = featureGrid.Cards.some((card: any) => card.Heading !== undefined || card.Body !== undefined)
  if (hasInlinedContent) {
    console.log('✅ processFeatureGridCardsServerSide: Cards already inlined, skipping')
    return featureGrid // Already inlined, return as-is
  }

  console.log('📦 processFeatureGridCardsServerSide: Fetching cards server-side...')
  
  // Fetch all cards server-side
  const cardPromises = featureGrid.Cards.map(async (card: any) => {
    try {
      console.log('📥 Fetching card server-side:', {
        key: card.key,
        graphUrl: card.url?.graph,
        hasPreviewToken: !!previewToken
      })
      
      const cardData = await fetchFeatureCardServerSide(
        card.key,
        card.url?.graph,
        previewToken
      )

      if (cardData) {
        console.log('✅ Card fetched successfully:', {
          key: cardData._metadata?.key,
          hasHeading: !!cardData.Heading,
          hasBody: !!cardData.Body,
          heading: cardData.Heading?.substring(0, 30)
        })
        return {
          ...card,
          Heading: cardData.Heading,
          Body: cardData.Body,
          Image: cardData.Image,
          _metadata: cardData._metadata
        }
      }
      console.warn('⚠️ Card fetch returned null:', card.key)
      return card
    } catch (error) {
      console.error(`❌ Error fetching FeatureCard ${card.key}:`, error)
      return card // Return original card if fetch fails
    }
  })

  const processedCards = await Promise.all(cardPromises)
  
  console.log('✅ processFeatureGridCardsServerSide: All cards processed:', {
    originalCount: featureGrid.Cards.length,
    processedCount: processedCards.length,
    cardsWithContent: processedCards.filter(c => c.Heading || c.Body).length
  })

  return {
    ...featureGrid,
    Cards: processedCards
  }
}

