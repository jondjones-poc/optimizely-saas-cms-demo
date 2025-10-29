import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  let path = searchParams.get('path') || '/'
  
  // Normalize path - ensure it starts with / and handle trailing slashes
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  // For root, keep as is, otherwise ensure trailing slash for consistency
  if (path !== '/' && !path.endsWith('/')) {
    path = path + '/'
  }

  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    return NextResponse.json({ success: false, error: 'SDK Key not configured' }, { status: 500 })
  }

  // Query for LandingPage using composition structure like homepage
  const query = `
    query GetPage {
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
                Video {
                  key
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
            }
            SeoSettings {
              DisplayInMenu
              GraphType
              Indexing
              MetaDescription
              MetaTitle
            }
          }
          ... on NewsLandingPage {
            Title
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