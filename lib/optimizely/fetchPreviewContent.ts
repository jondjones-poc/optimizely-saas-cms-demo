/**
 * PREVIEW CONTENT FETCHER — Loads a specific content item from Optimizely Graph.
 *
 * Used by live preview (app/preview/page.tsx) instead of the homepage query.
 *
 * Differences from homepage fetch (app/api/optimizely/homepage/route.ts):
 *   - Queries by content key + version, not by URL "/"
 *   - Uses preview_token (Bearer auth) when provided so DRAFT content is returned
 *   - Without preview_token, only published content is available (SDK key alone)
 *
 * Block GraphQL fields live in lib/optimizely/graphql/blockFragments.ts.
 */

import { getOptimizelySdkKey } from '@/lib/optimizely/env'
import {
  articlePageFields,
  compositionBlockFields,
  landingPageMainContentFields,
  landingPageSeoFields,
  landingPageTopContentFields,
  newsLandingPageFields,
  pocPageTypeFields,
} from '@/lib/optimizely/graphql/blockFragments'
import { fetchSettingsMenu } from '@/lib/optimizely/fetchSettingsMenu'

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
  const sdkKey = getOptimizelySdkKey()

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
                                ${compositionBlockFields}
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
              ${landingPageTopContentFields}
            }
            MainContentArea {
              _metadata {
                key
                displayName
                types
              }
              ${landingPageMainContentFields}
            }
            ${landingPageSeoFields}
          }
          ${articlePageFields}
          ${newsLandingPageFields}
          ${pocPageTypeFields}
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
  const sdkKey = getOptimizelySdkKey()
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

/**
 * Fetch CarouselSlide content server-side and inline it into Carousel Cards
 */
async function fetchCarouselSlideServerSide(
  cardKey: string,
  graphUrl: string | undefined,
  previewToken: string | null
): Promise<any> {
  const sdkKey = getOptimizelySdkKey()
  if (!sdkKey) {
    throw new Error('SDK Key not configured')
  }

  let authorization: string | null = null
  if (previewToken) {
    const token = previewToken.replace(/^Bearer\s+/i, '').trim()
    if (token && token.length > 0) {
      authorization = `Bearer ${token}`
    }
  }

  let queryKey = cardKey
  if (graphUrl && graphUrl.startsWith('graph://')) {
    const parts = graphUrl.split('/')
    queryKey = parts[parts.length - 1] || cardKey
  }

  const query = `
    query GetCarouselSlide {
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
          ... on CarouselSlide {
            Title
            CTAText
            BackgroundImage {
              Image {
                url {
                  base
                  default
                  graph
                  hierarchical
                }
              }
            }
            Link {
              base
              default
              graph
              hierarchical
            }
          }
        }
      }
    }
  `

  let graphApiUrl: string
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
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
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()

  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`)
  }

  const allVersions = result.data?._Content?.items || []

  let slide = allVersions.find(
    (item: any) =>
      item._metadata?.status === 'Current' || item._metadata?.status === 'Draft'
  )

  if (!slide && allVersions.length > 0) {
    const sorted = [...allVersions].sort((a: any, b: any) => {
      const verA = parseInt(a._metadata?.version || '0', 10)
      const verB = parseInt(b._metadata?.version || '0', 10)
      return verB - verA
    })
    slide = sorted[0]
  }

  return slide || null
}

/**
 * Process Carousel data to inline CarouselSlide content server-side
 */
export async function processCarouselCardsServerSide(
  carousel: any,
  previewToken: string | null
): Promise<any> {
  if (!carousel?.Cards?.length) {
    return carousel
  }

  const hasInlinedContent = carousel.Cards.some(
    (card: any) => card.Title !== undefined || card.BackgroundImage !== undefined
  )
  if (hasInlinedContent) {
    return carousel
  }

  const processedCards = await Promise.all(
    carousel.Cards.map(async (card: any) => {
      try {
        const slideData = await fetchCarouselSlideServerSide(
          card.key,
          card.url?.graph,
          previewToken
        )

        if (slideData) {
          return {
            ...card,
            Title: slideData.Title,
            CTAText: slideData.CTAText,
            BackgroundImage: slideData.BackgroundImage,
            Link: slideData.Link,
            _metadata: slideData._metadata,
          }
        }
        return card
      } catch (error) {
        console.error(`Error fetching CarouselSlide ${card.key}:`, error)
        return card
      }
    })
  )

  return {
    ...carousel,
    Cards: processedCards,
  }
}

/**
 * Inline CarouselSlide content for all Carousel blocks in a TopContentArea array
 */
export async function processTopContentAreaCarousels(
  topContentArea: any[] | undefined,
  previewToken: string | null = null
): Promise<any[] | undefined> {
  if (!topContentArea?.length) {
    return topContentArea
  }

  return Promise.all(
    topContentArea.map(async (block) => {
      if (block._metadata?.types?.includes('Carousel')) {
        return processCarouselCardsServerSide(block, previewToken)
      }
      return block
    })
  )
}

export type PreviewPageType =
  | 'LandingPage'
  | 'BlankExperience'
  | 'NewsLandingPage'
  | 'ArticlePage'
  | 'poc_page_type'
  | 'Other'

/** Map CMS _metadata.types to the preview renderer key */
export function resolvePreviewPageType(types: string[] | undefined): PreviewPageType {
  if (!types?.length) return 'Other'
  if (types.includes('LandingPage')) return 'LandingPage'
  if (types.includes('BlankExperience')) return 'BlankExperience'
  if (types.includes('NewsLandingPage')) return 'NewsLandingPage'
  if (types.includes('ArticlePage')) return 'ArticlePage'
  if (types.includes('poc_page_type')) return 'poc_page_type'
  return 'Other'
}

export type StructuredPreviewData =
  | { pageType: 'LandingPage'; pageData: any }
  | { pageType: 'BlankExperience'; data: any }
  | { pageType: 'NewsLandingPage'; pageData: any }
  | { pageType: 'ArticlePage'; pageData: any }
  | { pageType: 'poc_page_type'; pageData: any }
  | { pageType: 'Other'; pageData: any }

/**
 * Process landing page blocks and structure preview payload by page type.
 */
export async function structurePreviewPageData(
  contentData: any,
  previewToken: string | null = null
): Promise<StructuredPreviewData> {
  const pageType = resolvePreviewPageType(contentData?._metadata?.types)

  if (pageType === 'LandingPage') {
    if (contentData.TopContentArea) {
      contentData.TopContentArea = await processTopContentAreaCarousels(
        contentData.TopContentArea,
        previewToken
      )
    }
    if (contentData.MainContentArea) {
      try {
        const menuItems = await fetchSettingsMenu(previewToken)
        contentData.MainContentArea = contentData.MainContentArea.map((block: any) => {
          if (block._metadata?.types?.includes('Menu')) {
            return { ...block, MenuItem: menuItems }
          }
          return block
        })
      } catch (error) {
        console.error('Preview: failed to fetch SettingsPage menu:', error)
      }
    }
    return { pageType: 'LandingPage', pageData: contentData }
  }

  if (pageType === 'BlankExperience') {
    return { pageType: 'BlankExperience', data: contentData }
  }

  if (
    pageType === 'NewsLandingPage' ||
    pageType === 'ArticlePage' ||
    pageType === 'poc_page_type'
  ) {
    return { pageType, pageData: contentData }
  }

  return { pageType: 'Other', pageData: contentData }
}

