'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface MenuItem {
  _metadata: {
    key: string | null
    displayName: string
    types: string[]
  }
  Link?: {
    target?: string
    text?: string
    title?: string
    url?: {
      base?: string
      default?: string
    }
  }
  SubMenuItems?: MenuItem[]
}

interface MenuProps {
  MenuItem?: MenuItem[]
  _metadata?: {
    key: string
    displayName: string
  }
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const Menu = ({ MenuItem, _metadata, _gridDisplayName, isPreview = false, contextMode = null }: MenuProps) => {
  // Comprehensive logging of all props
  console.log('=== MENU COMPONENT PROPS DEBUG ===')
  console.log('All props received:', { MenuItem, _metadata, _gridDisplayName, isPreview, contextMode })
  console.log('MenuItem type:', typeof MenuItem)
  console.log('MenuItem is array:', Array.isArray(MenuItem))
  console.log('MenuItem length:', MenuItem?.length)
  console.log('MenuItem content:', JSON.stringify(MenuItem, null, 2))
  console.log('_metadata:', JSON.stringify(_metadata, null, 2))
  console.log('_gridDisplayName:', _gridDisplayName)
  console.log('isPreview:', isPreview)
  console.log('contextMode:', contextMode)
  console.log('=== END MENU PROPS DEBUG ===')

  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({})
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch menu data from SettingsPage if not provided directly
  useEffect(() => {
    const fetchMenuData = async () => {
      console.log('Menu component - MenuItem prop:', MenuItem)
      
      if (MenuItem && MenuItem.length > 0) {
        console.log('Menu component - Using direct MenuItem data:', MenuItem)
        // If items exist but lack Link fields, try to fetch enriched data from Graph (client-side) for debugging
        const firstHasLink = !!MenuItem[0]?.Link?.url?.default
        if (!firstHasLink) {
          try {
            console.log('Menu component - Direct items missing Link fields, fetching enriched items from Graph for debug...')
            const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY
            if (!sdkKey) {
              console.warn('Menu component - NEXT_PUBLIC_SDK_KEY not set, cannot fetch enriched menu data')
              setMenuItems(MenuItem)
              setIsLoading(false)
              return
            }
            const gql = `
              query GetSettingsMenu {
                _Content(
                  where: { _metadata: { key: { eq: "ea3d09592691453c92d0f21b353a83e3" } } }
                  limit: 1
                ) {
                  items {
                    ... on SettingsPage {
                      Menu {
                        items {
                          ... on MenuItem {
                            _metadata { key displayName types }
                            Link {
                              target
                              text
                              title
                              url { base default }
                            }
                            SubMenuItems {
                              _children {
                                MenuItem {
                                  item {
                                    _metadata { key displayName types }
                                    Link { target text title url { base default } }
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
            `
            // In preview mode, use preview token instead of SDK key
            let headers: HeadersInit = { 'Content-Type': 'application/json' }
            let apiUrl = `https://cg.optimizely.com/content/v2`
            
            // Check if we're in preview mode (check URL for preview_token)
            const urlParams = new URLSearchParams(window.location.search)
            const previewToken = urlParams.get('preview_token')
            
            if (previewToken) {
              // Use preview token for draft content
              headers['Authorization'] = `Bearer ${previewToken}`
              apiUrl = `${apiUrl}?t=${Date.now()}` // Add cache-busting
            } else {
              // Use SDK key for published content
              apiUrl = `${apiUrl}?auth=${sdkKey}`
            }
            
            const resp = await fetch(apiUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify({ query: gql }),
            })
            const data = await resp.json()
            console.log('Menu component - Enriched Graph response:', data)
            const items = data?.data?._Content?.items?.[0]?.Menu?.items || []
            if (Array.isArray(items) && items.length > 0) {
              // Map enriched items to our MenuItem shape
              const mapped = items.map((it: any) => ({
                _metadata: it._metadata,
                Link: it.Link,
                SubMenuItems: it.SubMenuItems,
              }))
              console.log('Menu component - Using enriched menu items:', mapped)
              setMenuItems(mapped)
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.warn('Menu component - Failed to fetch enriched menu data, falling back to provided items', e)
          }
        }
        setMenuItems(MenuItem)
        setIsLoading(false)
        return
      }

      console.log('Menu component - Fetching menu data from API...')
      try {
        const response = await fetch('/api/optimizely/menu')
        const result = await response.json()
        
        console.log('Menu component - API response:', result)
        
        if (result.success && result.data && Array.isArray(result.data)) {
          // If API data lacks Link, try enriched fetch (debug only)
          const firstHasLink = !!result.data[0]?.Link?.url?.default
          if (!firstHasLink) {
            try {
              console.log('Menu component - API items missing Link, fetching enriched items from Graph for debug...')
              const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY
              if (sdkKey) {
                const gql = `
                  query GetSettingsMenu {
                    _Content(
                      where: { _metadata: { key: { eq: "ea3d09592691453c92d0f21b353a83e3" } } }
                      limit: 1
                    ) {
                      items {
                        ... on SettingsPage {
                          Menu {
                            items {
                              ... on MenuItem {
                                _metadata { key displayName types }
                                Link { target text title url { base default } }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                `
                // In preview mode, use preview token instead of SDK key
                let headers: HeadersInit = { 'Content-Type': 'application/json' }
                let apiUrl = `https://cg.optimizely.com/content/v2`
                
                // Check if we're in preview mode (check URL for preview_token)
                const urlParams = new URLSearchParams(window.location.search)
                const previewToken = urlParams.get('preview_token')
                
                if (previewToken) {
                  // Use preview token for draft content
                  headers['Authorization'] = `Bearer ${previewToken}`
                  apiUrl = `${apiUrl}?t=${Date.now()}` // Add cache-busting
                } else {
                  // Use SDK key for published content
                  apiUrl = `${apiUrl}?auth=${sdkKey}`
                }
                
                const resp = await fetch(apiUrl, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ query: gql }),
                })
                const data = await resp.json()
                console.log('Menu component - Enriched Graph response (API fallback):', data)
                const items = data?.data?._Content?.items?.[0]?.Menu?.items || []
                if (Array.isArray(items) && items.length > 0) {
                  const mapped = items.map((it: any) => ({
                    _metadata: it._metadata,
                    Link: it.Link,
                  }))
                  setMenuItems(mapped)
                  return
                }
              } else {
                console.warn('Menu component - NEXT_PUBLIC_SDK_KEY not set, cannot fetch enriched menu data')
              }
            } catch (e) {
              console.warn('Menu component - Enriched fetch failed, using API items', e)
            }
          }
          console.log('Menu component - Setting menu items:', result.data)
          setMenuItems(result.data)
        } else {
          console.log('Menu component - No menu items found in response')
        }
      } catch (error) {
        console.error('Menu component - Error fetching menu data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuData()
  }, [MenuItem])

  const handleMouseEnter = (itemKey: string) => {
    setHoveredItem(itemKey)
    setIsOpen(prev => ({ ...prev, [itemKey]: true }))
  }

  const handleMouseLeave = (itemKey: string) => {
    setHoveredItem(null)
    // Keep menu open for a short delay to allow mouse movement
    setTimeout(() => {
      setIsOpen(prev => ({ ...prev, [itemKey]: false }))
    }, 150)
  }

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasSubMenu = Array.isArray(item.SubMenuItems) && item.SubMenuItems.length > 0
    const itemKey = item._metadata.key || item._metadata.displayName || `item-${item.Link?.text || 'unknown'}`
    const isItemOpen = isOpen[itemKey] || hoveredItem === itemKey
    const isTopLevel = level === 0
    

    return (
      <li
        key={item._metadata.key}
        className={`relative group ${isTopLevel ? 'inline-block' : 'block'}`}
        onMouseEnter={() => handleMouseEnter(itemKey)}
        onMouseLeave={() => handleMouseLeave(itemKey)}
      >
        <Link
          href={item.Link?.url?.default || '#'}
          target={item.Link?.target || '_self'}
          title={item.Link?.title || item.Link?.text}
          className={`
            ${isTopLevel 
              ? 'px-6 py-4 text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 font-semibold text-lg relative overflow-hidden group flex items-center justify-center' 
              : 'block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-md font-medium text-left'
            }
            ${hasSubMenu ? 'justify-between' : ''}
          `}
        >
          <span className="relative z-10">{item.Link?.text || 'Menu Item'}</span>
          {hasSubMenu && (
            <svg 
              className={`ml-2 w-5 h-5 transition-all duration-300 ${isItemOpen ? 'rotate-180 text-blue-600' : 'text-gray-500'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          {isTopLevel && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
          )}
        </Link>

        {/* Mega Menu */}
        {hasSubMenu && isTopLevel && (
          <div
            className={`
              absolute top-full left-0 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden
              transition-all duration-300 ease-out transform
              ${isItemOpen 
                ? 'opacity-100 visible translate-y-0 scale-100' 
                : 'opacity-0 invisible -translate-y-2 scale-95'
              }
            `}
          >
            <div className="p-6">
              <div className="space-y-1">
                {item.SubMenuItems?.map((subItem, index) => (
                  <Link
                    key={subItem._metadata.key}
                    href={subItem.Link?.url?.default || '#'}
                    target={subItem.Link?.target || '_self'}
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-left"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: isItemOpen ? 'slideInFromLeft 0.3s ease-out forwards' : 'none'
                    }}
                  >
                    <span>{subItem.Link?.text || 'Sub Menu Item'}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nested Sub Menu (for deeper levels) */}
        {hasSubMenu && !isTopLevel && (
          <div
            className={`
              mt-2 ml-4 border-l-2 border-blue-200 pl-4
              transition-all duration-200 ease-in-out
              ${isItemOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
            `}
          >
            <ul className="space-y-1">
              {item.SubMenuItems?.map((subItem) => 
                renderMenuItem(subItem, level + 1)
              )}
            </ul>
          </div>
        )}
      </li>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">Loading menu...</p>
      </div>
    )
  }

  if (!menuItems.length) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">Menu block detected but no menu items found. Menu data should be configured in the CMS.</p>
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes slideInFromLeft {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
      <nav 
        className="bg-white shadow-lg border-b border-gray-200"
        data-epi-block-id={_metadata?.key || 'menu-block'}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start items-center h-20">
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              {menuItems.map((item) => renderMenuItem(item))}
            </ul>
          </div>

            {/* Mobile menu button - you can implement mobile menu if needed */}
            <div className="md:hidden">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Menu
