import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let parentPath = searchParams.get('parentPath') || '/news-page'
  
  // Normalize parent path - ensure it starts with / and handle trailing slashes
  if (!parentPath.startsWith('/')) {
    parentPath = '/' + parentPath
  }
  // For root, keep as is, otherwise ensure trailing slash for consistency
  if (parentPath !== '/' && !parentPath.endsWith('/')) {
    parentPath = parentPath + '/'
  }

  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    return NextResponse.json({ success: false, error: 'SDK Key not configured' }, { status: 500 })
  }

  // Query for ArticlePage children of the NewsLandingPage
  const query = `
    query GetNewsArticles {
      _Content(
        where: {
          _metadata: {
            types: {
              in: ["ArticlePage"]
            }
            url: {
              default: {
                startsWith: "${parentPath}"
              }
            }
          }
        }
        limit: 20
        orderBy: {
          _metadata: {
            published: DESC
          }
        }
      ) {
        items {
          _metadata {
            key
            displayName
            types
            url {
              default
            }
            published
            status
          }
          ... on ArticlePage {
            Heading
            SubHeading
            Author
            Body {
              html
            }
            PromoImage {
              url {
                base
                default
                graph
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Optimizely API error:', data)
      return NextResponse.json({ success: false, error: `HTTP error! status: ${response.status}`, details: data }, { status: 500 })
    }
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return NextResponse.json({ success: false, error: 'GraphQL errors', details: data.errors }, { status: 400 })
    }

    const articles = data.data?._Content?.items || []
    
    return NextResponse.json({
      success: true,
      data: articles,
      count: articles.length
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
