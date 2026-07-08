import { NextResponse } from 'next/server'
import { getOptimizelySdkKey } from '@/lib/optimizely/env'
import { fetchSettingsMenu } from '@/lib/optimizely/fetchSettingsMenu'
import { processTopContentAreaCarousels } from '@/lib/optimizely/fetchPreviewContent'
import {
  articlePageFields,
  landingPageMainContentFields,
  landingPageSeoFields,
  landingPageTopContentFields,
  newsLandingPageFields,
} from '@/lib/optimizely/graphql/blockFragments'

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

  const sdkKey = getOptimizelySdkKey()

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
          ${articlePageFields}
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
          ${newsLandingPageFields}
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

    if (pageData?.TopContentArea) {
      pageData.TopContentArea = await processTopContentAreaCarousels(
        pageData.TopContentArea
      )
    }
    
    // Fetch Menu data from SettingsPage and merge into Menu blocks
    if (pageData?.MainContentArea) {
      try {
        const menuItems = await fetchSettingsMenu()
        pageData.MainContentArea = pageData.MainContentArea.map((block: any) => {
          if (block._metadata?.types?.includes('Menu')) {
            return {
              ...block,
              MenuItem: menuItems,
            }
          }
          return block
        })
      } catch (error) {
        console.error('Error fetching SettingsPage menu:', error)
      }
    }
    
    // Response shape: { success, data: <flat page object> } — NOT the same as homepage API.
    // data is the page directly (_metadata, TopContentArea, etc.). See docs/DATA_SHAPES.md
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