'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import CMSContent from '@/components/CMSContent'
import LandingPageDisplay from '@/components/LandingPageDisplay'
import OptimizelyDataPopup from '@/components/OptimizelyDataPopup'
import CustomHeader from '@/components/CustomHeader'
import CustomFooter from '@/components/CustomFooter'
import Navigation from '@/components/Navigation'

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const [optimizelyData, setOptimizelyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPreviewToken, setCurrentPreviewToken] = useState<string | null>(null)
  
  // Extract preview parameters - log each separately as per documentation
  const key = searchParams.get('key')
  const ver = searchParams.get('ver')
  const loc = searchParams.get('loc')
  // Default to 'edit' mode if ctx is not provided - inline editing should always be enabled in preview
  const ctx = searchParams.get('ctx') || 'edit'
  const previewToken = searchParams.get('preview_token')
  const host = typeof window !== 'undefined' ? window.location.host : 'server'
  
  // Log each parameter separately
  useEffect(() => {
    console.log('📋 Preview URL Parameters (from CMS iframe):', {
      '{key}': key || 'MISSING',
      '{version}': ver || 'MISSING',
      '{locale}': loc || 'MISSING',
      '{context}': ctx || 'MISSING',
      '{host}': host || 'MISSING',
      'preview_token': previewToken ? previewToken.substring(0, 50) + '...' : 'MISSING',
      'preview_token_length': previewToken?.length || 0,
      'full_url': typeof window !== 'undefined' ? window.location.href : 'server-side'
    })
  }, [key, ver, loc, ctx, previewToken, host])

  useEffect(() => {
    // Load communication script for live preview
    const loadCommunicationScript = () => {
      // Get the Optimizely instance ID from environment or use a placeholder
      const instanceId = 'epsajjcmson91rm1p001'
      const scriptUrl = `https://app-${instanceId}.cms.optimizely.com/util/javascript/communicationinjector.js`
      
      // Check if script is already loaded
      if (document.querySelector(`script[src="${scriptUrl}"]`)) {
        return
      }
      
      const script = document.createElement('script')
      script.src = scriptUrl
      script.async = true
      script.onload = () => {
        console.log('Optimizely communication script loaded successfully')
      }
      script.onerror = () => {
        console.error('Failed to load Optimizely communication script')
      }
      document.head.appendChild(script)
    }

    // Function to fetch menu data and merge into Menu blocks
    const fetchAndMergeMenuData = async (pageData: any, token?: string | null) => {
      try {
        // Pass preview token to menu API if available
        const tokenToUse = token || currentPreviewToken || previewToken
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        
        if (tokenToUse) {
          const bearerToken = tokenToUse.startsWith('Bearer ') ? tokenToUse : `Bearer ${tokenToUse}`
          headers['Authorization'] = bearerToken
        }
        
        const menuResponse = await fetch('/api/optimizely/menu', {
          method: 'GET',
          headers,
          cache: 'no-store'
        })
        const menuData = await menuResponse.json()
        
        if (menuData.success && menuData.data && pageData) {
          // Merge menu data into Menu blocks in MainContentArea
          if (pageData.MainContentArea) {
            pageData.MainContentArea = pageData.MainContentArea.map((block: any) => {
              if (block._metadata?.types?.[0] === 'Menu') {
                return {
                  ...block,
                  MenuItem: menuData.data || []
                }
              }
              return block
            })
          }
          
          // Also merge in TopContentArea if it exists
          if (pageData.TopContentArea) {
            pageData.TopContentArea = pageData.TopContentArea.map((block: any) => {
              if (block._metadata?.types?.[0] === 'Menu') {
                return {
                  ...block,
                  MenuItem: menuData.data || []
                }
              }
              return block
            })
          }
        }
      } catch (error) {
        console.error('Error fetching menu data for preview:', error)
        // Don't fail the preview if menu fetch fails
      }
    }

    // Fetch content with preview token
    const fetchPreviewContent = async (token?: string | null) => {
      if (!key) {
        setError('No content key provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Extract preview token from URL (per Optimizely docs: https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/enable-live-preview-saas)
        // The preview token is automatically appended to the preview URL by Optimizely CMS as query parameter 'preview_token'
        // Priority: token from function param (if refetching) > currentPreviewToken (from contentSaved event) > previewToken (from URL)
        const tokenToUse = token || currentPreviewToken || previewToken
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        
        if (tokenToUse) {
          // Ensure token is properly formatted as Bearer token
          const bearerToken = tokenToUse.startsWith('Bearer ') ? tokenToUse : `Bearer ${tokenToUse}`
          // Only set Authorization (capital A) - Next.js will handle case-insensitive matching
          headers['Authorization'] = bearerToken
        }

        // Fetch content by key with preview token
        const response = await fetch('/api/optimizely/preview-content', {
          method: 'POST',
          headers,
          body: JSON.stringify({ key, ver, loc })
        })
        
        // Check if response is ok first
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Preview API error:', response.status, errorText)
          setError(`Server error: ${response.status} ${response.statusText}`)
          setIsLoading(false)
          return
        }
        
        let result: any
        try {
          const text = await response.text()
          if (!text || text.trim() === '') {
            throw new Error('Empty response from server')
          }
          result = JSON.parse(text)
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError)
          setError(`Failed to parse server response: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`)
          setIsLoading(false)
          return
        }
        
        if (result.success) {
          // Extract the actual page data
          const contentData = result.data?.data?._Content?.items?.[0]
          
          if (contentData) {
            // Determine page type
            const pageTypes = contentData._metadata?.types || []
            const isLandingPage = pageTypes.includes('LandingPage')
            const isBlankExperience = pageTypes.includes('BlankExperience')
            
            // Log Hero SubHeading from API response (for debugging draft content)
            if (isBlankExperience && contentData.composition) {
              // Match server-side structure: composition.grids[].rows[].columns[].elements[].component
              const grids = Array.isArray(contentData.composition?.grids) 
                ? contentData.composition.grids 
                : (contentData.composition?.grids?.nodes || [])
              
              if (Array.isArray(grids)) {
                // Traverse composition structure to find Hero and Text blocks (matching server-side logic)
                for (const grid of grids) {
                  const rows = Array.isArray(grid.rows) ? grid.rows : (grid.rows?.nodes || [])
                  for (const row of rows) {
                    const columns = Array.isArray(row.columns) ? row.columns : (row.columns?.nodes || [])
                    for (const column of columns) {
                      const elements = Array.isArray(column.elements) ? column.elements : (column.elements?.nodes || [])
                      for (const element of elements) {
                        const component = element.component
                        if (component?._metadata?.types?.includes('Hero')) {
                          console.log('📝 Hero data received:', {
                            'SubHeading': component.SubHeading,
                            'Block Key': component._metadata?.key
                          })
                        }
                        if (component?._metadata?.types?.includes('Text')) {
                          console.log('📝 TextBlock data received:', {
                            'Content': component.Content?.substring(0, 100) + (component.Content?.length > 100 ? '...' : ''),
                            'Block Key': component._metadata?.key
                          })
                        }
                      }
                    }
                  }
                }
              } else {
                console.warn('⚠️ composition.grids is not accessible:', {
                  hasComposition: !!contentData.composition,
                  hasGrids: !!contentData.composition?.grids,
                  gridsType: typeof contentData.composition?.grids,
                  composition: contentData.composition
                })
              }
            } else if (isLandingPage && contentData.TopContentArea && Array.isArray(contentData.TopContentArea)) {
              contentData.TopContentArea.forEach((block: any) => {
                if (block._metadata?.types?.includes('Hero')) {
                  console.log('📝 Hero data received (LandingPage):', {
                    'SubHeading': block.SubHeading,
                    'Block Key': block._metadata?.key
                  })
                }
              })
            }
            
            
            // Merge menu data if it's a LandingPage
            if (isLandingPage) {
              await fetchAndMergeMenuData(contentData, tokenToUse)
            }
            
            // Transform data structure for different page types
            if (isLandingPage) {
              // For LandingPage, use the data directly
              setOptimizelyData({
                pageType: 'LandingPage',
                pageData: contentData
              })
            } else if (isBlankExperience) {
              // For BlankExperience, wrap in the expected structure
              setOptimizelyData({
                pageType: 'BlankExperience',
                data: {
                  data: {
                    data: {
                      BlankExperience: {
                        items: [contentData]
                      }
                    }
                  }
                }
              })
            } else {
              // For other page types, use as-is
              setOptimizelyData({
                pageType: 'Other',
                pageData: contentData
              })
            }
            
            setError(null)
            
            // Update document title
            if (contentData._metadata?.displayName) {
              document.title = `Preview: ${contentData._metadata.displayName}`
            }
            
            // Update meta description
            const description = contentData._metadata?.displayName || 'Preview Mode'
            let metaDescription = document.querySelector('meta[name="description"]')
            if (metaDescription) {
              metaDescription.setAttribute('content', description)
            } else {
              metaDescription = document.createElement('meta')
              metaDescription.setAttribute('name', 'description')
              metaDescription.setAttribute('content', description)
              document.head.appendChild(metaDescription)
            }
          } else {
            setError('No content found for the provided key')
          }
        } else {
          setError(result.error || 'Failed to fetch preview content')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    // Initialize preview token from URL
    if (previewToken && !currentPreviewToken) {
      setCurrentPreviewToken(previewToken)
    }
    
    // Load communication script for live preview
    loadCommunicationScript()
    
    // Fetch preview content
    fetchPreviewContent()

    // Listen for content saved events
    const handleContentSaved = (event: CustomEvent) => {
      console.log('📝 Content saved event received:', {
        eventType: event.type,
        detail: event.detail,
        detailType: typeof event.detail,
        detailKeys: event.detail ? Object.keys(event.detail) : null
      })
      
      // Extract new preview token from the event
      // The event.detail can be in various formats:
      // 1. { previewUrl: "http://...?preview_token=xxx" }
      // 2. { preview_token: "xxx" }
      // 3. "http://...?preview_token=xxx" (string URL)
      // 4. "xxx" (just the token string)
      const message = event.detail
      let newPreviewToken: string | null = null
      
      if (message && message.previewUrl) {
        // If previewUrl is a full URL, extract the token
        if (message.previewUrl.includes('preview_token=')) {
          const urlParams = new URLSearchParams(message.previewUrl.split('?')[1] || message.previewUrl)
          newPreviewToken = urlParams.get('preview_token')
        } else {
          // If it's just the token
          newPreviewToken = message.previewUrl
        }
      } else if (message && message.preview_token) {
        newPreviewToken = message.preview_token
      } else if (message && typeof message === 'string') {
        // Try to parse as URL
        try {
          if (message.includes('preview_token=')) {
            const url = new URL(message)
            newPreviewToken = url.searchParams.get('preview_token')
          } else if (message.startsWith('http')) {
            // Full URL but no preview_token param - might be in hash
            const url = new URL(message)
            newPreviewToken = url.searchParams.get('preview_token')
          } else {
            // Might be the token itself
            newPreviewToken = message
          }
        } catch {
          // If not a URL, might be the token itself
          newPreviewToken = message
        }
      }
      
      console.log('🔑 Token extraction result:', {
        extractedToken: newPreviewToken ? newPreviewToken.substring(0, 50) + '...' : null,
        tokenLength: newPreviewToken?.length || 0,
        hasToken: !!newPreviewToken,
        currentToken: currentPreviewToken ? currentPreviewToken.substring(0, 50) + '...' : null,
        tokensMatch: newPreviewToken === currentPreviewToken
      })
      
      if (newPreviewToken && newPreviewToken !== currentPreviewToken) {
        console.log('✅ Updating to NEW preview token (different from current)')
        // Update state
        setCurrentPreviewToken(newPreviewToken)
        
        // Update the URL
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('preview_token', newPreviewToken)
        window.history.replaceState({}, '', newUrl.toString())
        
        // Refetch content with new token after a delay to ensure state is updated
        // IMPORTANT: Use the new token to get the latest draft version
        // Give Optimizely Graph a moment to sync the draft content (500ms)
        setTimeout(() => {
          console.log('🔄 Refetching content with NEW preview token (after 500ms delay for Graph sync)')
          fetchPreviewContent(newPreviewToken)
        }, 500)
      } else if (newPreviewToken && newPreviewToken === currentPreviewToken) {
        console.log('⚠️ New token same as current token - refetching anyway to get latest draft')
        // Token is the same, but we still need to refetch to get the latest draft content
        // Optimizely might have updated the draft content for this token
        // Give Graph time to sync the new draft content
        setTimeout(() => {
          console.log('🔄 Refetching content with same token (force refresh after 500ms)')
          fetchPreviewContent(newPreviewToken)
        }, 500)
      } else {
        // Fallback: refetch content with current token (might get updated draft)
        console.log('⚠️ No new preview token extracted, refetching with current token')
        setTimeout(() => {
          fetchPreviewContent()
        }, 100)
      }
    }

    window.addEventListener('optimizely:cms:contentSaved', handleContentSaved as EventListener)

    return () => {
      window.removeEventListener('optimizely:cms:contentSaved', handleContentSaved as EventListener)
    }
  }, [key, ver, loc, previewToken, currentPreviewToken])

  return (
    <main className="min-h-screen">
      {/* Preview Mode Indicator */}
      {ctx === 'edit' && (
        <div className="bg-blue-600 text-white p-2 text-center text-sm font-medium sticky top-0 z-50">
          🔧 Live Preview Mode - Content editing enabled
        </div>
      )}
      
      <CustomHeader />
      <Navigation 
        optimizelyData={optimizelyData?.data || null} 
        isLoading={isLoading} 
        error={error}
      />
      
      <OptimizelyDataPopup 
        data={optimizelyData} 
        isLoading={isLoading} 
        error={error}
      />
      
      {/* Render content based on page type - ONLY CMS content, no static HTML */}
      {!isLoading && !error && optimizelyData && (
        <>
          {optimizelyData.pageType === 'LandingPage' && optimizelyData.pageData && (
            <LandingPageDisplay 
              data={optimizelyData.pageData}
              isPreview={true}
              contextMode={ctx}
            />
          )}
          {optimizelyData.pageType === 'BlankExperience' && (
            <>
              <CMSContent 
                data={optimizelyData.data} 
                isLoading={isLoading} 
                error={error}
                isPreview={true}
                contextMode={ctx}
              />
            </>
          )}
          {optimizelyData.pageType === 'Other' && (
            <div className="container mx-auto px-4 py-8">
              <p className="text-gray-600">Preview for page type: {optimizelyData.pageData?._metadata?.types?.join(', ')}</p>
              <pre className="mt-4 text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(optimizelyData.pageData, null, 2)}
              </pre>
            </div>
          )}
        </>
      )}
      
      <CustomFooter 
        optimizelyData={optimizelyData?.data || null} 
        isLoading={isLoading} 
        error={error}
      />
      
      {isLoading && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading preview...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="container mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Preview Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
    </main>
  )
}
