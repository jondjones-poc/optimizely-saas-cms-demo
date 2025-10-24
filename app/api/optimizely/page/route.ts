import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path') || '/'

  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    return NextResponse.json({ success: false, error: 'SDK Key not configured' }, { status: 500 })
  }

  // For now, let's use a simple approach and just get basic page data
  const query = `
    query {
      _Content(
        where: {
          _metadata: {
            url: {
              default: {
                eq: "${path}"
              }
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
            AuthorEmail
            Body {
              html
            }
          }
          ... on LandingPage {
            TopContentArea {
              _metadata {
                key
                displayName
                types
              }
            }
            MainContentArea {
              _metadata {
                key
                displayName
                types
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.errors) {
      return NextResponse.json({ success: false, error: 'GraphQL errors', details: data.errors }, { status: 400 })
    }

    const items = data.data?._Content?.items || []
    
    // Return data in the format expected by the page component
    return NextResponse.json({
      success: true,
      data: items[0] || null,
      path: path,
      count: items.length
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}