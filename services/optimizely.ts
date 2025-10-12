import { createClient } from '@remkoj/optimizely-graph-client'

// Initialize Optimizely Graph Client
const client = createClient({
  single_key: process.env.NEXT_PUBLIC_SDK_KEY || '',
})

// GraphQL query to fetch homepage content
const HOMEPAGE_QUERY = `
  query GetHomepage {
    _Content(
      where: {
        _or: [
          { _metadata: { url: { default: { eq: "/" } } } }
          { _metadata: { url: { default: { eq: "/en" } } } }
          { _metadata: { types: { in: ["HomePage", "StartPage", "LandingPage"] } } }
        ]
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
        ... on _IContent {
          _type: __typename
          _metadata {
            key
            version
            types
            displayName
          }
        }
      }
    }
  }
`

// Fetch homepage content
export async function getHomepageContent() {
  try {
    const response = await client.request({
      query: HOMEPAGE_QUERY,
    })
    
    return {
      success: true,
      data: response,
      raw: JSON.stringify(response, null, 2)
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
      raw: null
    }
  }
}

// Alternative fetch using direct API call
export async function getHomepageContentDirect() {
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY
  
  if (!sdkKey) {
    return {
      success: false,
      error: 'SDK Key not found',
      data: null,
      raw: null
    }
  }

  try {
    const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: HOMEPAGE_QUERY,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      data: data,
      raw: JSON.stringify(data, null, 2)
    }
  } catch (error) {
    console.error('Error fetching homepage content:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null,
      raw: null
    }
  }
}
