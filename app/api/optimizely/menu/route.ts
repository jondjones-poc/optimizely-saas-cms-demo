import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    return NextResponse.json({ success: false, error: 'SDK Key not configured' }, { status: 500 })
  }

  const query = `
    query GetMenu {
      _Content(
        where: {
          _metadata: {
            key: {
              eq: "ea3d09592691453c92d0f21b353a83e3"
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
          }
          ... on SettingsPage {
            Menu {
              _metadata {
                key
                displayName
                types
              }
              ... on MenuItem {
                Link {
                  target
                  text
                  title
                  url {
                    base
                    default
                  }
                }
                SubMenuItems {
                  _metadata {
                    key
                    displayName
                    types
                  }
                  ... on MenuItem {
                    Link {
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
  `

  try {
    console.log('Menu API - Query:', query)
    
    const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    })

    const data = await response.json()
    console.log('Menu API - Raw response:', data)

    if (!response.ok) {
      console.log('Menu API - HTTP error:', response.status, data)
      return NextResponse.json({ 
        success: false, 
        error: `HTTP error! status: ${response.status}`,
        details: data
      }, { status: 400 })
    }

    if (data.errors) {
      console.log('Menu API - GraphQL errors:', data.errors)
      return NextResponse.json({ success: false, error: 'GraphQL errors', details: data.errors }, { status: 400 })
    }

    const settingsPage = data.data?._Content?.items?.[0]
    const menuData = settingsPage?.Menu
    
    console.log('Menu API - Settings page full structure:', JSON.stringify(settingsPage, null, 2))
    console.log('Menu API - Settings page properties:', Object.keys(settingsPage || {}))
    console.log('Menu API - Menu data:', JSON.stringify(menuData, null, 2))
    console.log('Menu API - Menu data type:', typeof menuData)
    console.log('Menu API - Menu data is array:', Array.isArray(menuData))
    console.log('Menu API - Menu data length:', menuData?.length)
    
    if (Array.isArray(menuData) && menuData.length > 0) {
      console.log('Menu API - First item full structure:', JSON.stringify(menuData[0], null, 2))
      console.log('Menu API - First item keys:', Object.keys(menuData[0]))
      console.log('Menu API - Checking for Link field:', menuData[0].Link)
      console.log('Menu API - Checking for link field:', menuData[0].link)
      console.log('Menu API - All properties on first item:', Object.entries(menuData[0]).map(([k, v]) => `${k}: ${typeof v}`))
    }
    
    if (menuData?.MenuItem) {
      console.log('Menu API - MenuItem data:', menuData.MenuItem)
    }

    return NextResponse.json({
      success: true,
      data: menuData,
      settingsPage: settingsPage?._metadata
    })
  } catch (error) {
    console.log('Menu API - Catch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
