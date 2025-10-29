import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Function to fetch Menu data from SettingsPage using the existing Menu API
async function fetchMenuDataFromSettingsPage(sdkKey: string) {
  try {
    // Use the existing Menu API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/optimizely/menu`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    const data = await response.json()
    
    if (!data.success) {
      console.error('Menu API error:', data.error)
      return null
    }

    console.log('Page API - Fetched Menu data from Menu API:', data.data)
    
    return {
      MenuItem: data.data || []
    }
  } catch (error) {
    console.error('Error fetching Menu data from Menu API:', error)
    return null
  }
}

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

    // Log Menu block data for debugging
    if (data.data?._Content?.items?.[0]?.MainContentArea) {
      const menuBlocks = data.data._Content.items[0].MainContentArea.filter((block: any) => 
        block._metadata?.types?.[0] === 'Menu'
      )
      if (menuBlocks.length > 0) {
        console.log('Page API - Menu blocks found:', menuBlocks)
        menuBlocks.forEach((block: any, index: number) => {
          console.log(`Page API - Menu block ${index} full structure:`, JSON.stringify(block, null, 2))
          console.log(`Page API - Menu block ${index} all properties:`, Object.keys(block))
          console.log(`Page API - Menu block ${index} property values:`, Object.entries(block).map(([key, value]) => `${key}: ${typeof value} = ${JSON.stringify(value)}`))
        })
      }
    }

    const items = data.data?._Content?.items || []
    const pageData = items[0]
    
    // Fetch Menu data from SettingsPage and merge into Menu blocks
    if (pageData?.MainContentArea) {
      const menuData = await fetchMenuDataFromSettingsPage(sdkKey)
      if (menuData) {
        pageData.MainContentArea = pageData.MainContentArea.map((block: any) => {
          if (block._metadata?.types?.[0] === 'Menu') {
            console.log('Page API - Merging Menu data into Menu block:', menuData)
            return {
              ...block,
              MenuItem: menuData.MenuItem || []
            }
          }
          return block
        })
      }
    }
    
    // Return data in the format expected by the page component
    return NextResponse.json({
      success: true,
      data: pageData || null,
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