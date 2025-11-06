'use client'

import { useEffect, useState, useRef } from 'react'
import CMSContent from '@/components/CMSContent'
import LandingPageDisplay from '@/components/LandingPageDisplay'
import OptimizelyDataPopup from '@/components/OptimizelyDataPopup'
import CustomHeaderClient from '@/components/CustomHeaderClient'
import CustomFooterClient from '@/components/CustomFooterClient'
import Navigation from '@/components/Navigation'
import type { BrandingConfig } from '@/lib/branding'

interface PreviewClientProps {
  initialData: any
  ctx: string
  previewToken: string | null
  contentKey: string | null  // Renamed from 'key' because 'key' is reserved in React
  ver: string | null
  loc: string | null
  cmsDemo?: string | null  // cms_demo header value from server
  branding: BrandingConfig  // Branding config from server
}

export default function PreviewClient({ 
  initialData, 
  ctx, 
  previewToken, 
  contentKey,  // Renamed from 'key'
  ver, 
  loc,
  cmsDemo,
  branding
}: PreviewClientProps) {
  const [optimizelyData, setOptimizelyData] = useState<any>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPreviewToken, setCurrentPreviewToken] = useState<string | null>(previewToken)
  const scriptLoadAttempted = useRef(false)
  
  // Define contextMode early so it can be used in useEffect hooks
  const contextMode = ctx || 'edit'

  // Debug: Log initial data structure
  useEffect(() => {
    console.log('🔍 PreviewClient - Initial data received:', {
      hasInitialData: !!initialData,
      initialDataType: initialData?.pageType || 'unknown',
      hasPageData: !!initialData?.pageData,
      hasData: !!initialData?.data,
      directData: !!initialData?._metadata,
      structure: initialData ? Object.keys(initialData) : [],
      contentKey: contentKey,
      hasContentKey: !!contentKey,
      cmsDemo: cmsDemo || 'MISSING',
      hasCmsDemo: !!cmsDemo
    })
    
    // If we have a key but no initial data, the server-side fetch likely failed
    if (contentKey && !initialData) {
      console.warn('⚠️ PreviewClient: Key provided but no initial data received from server')
    }
  }, [initialData, contentKey])

  // Load Optimizely communication script
  useEffect(() => {
    // Prevent duplicate script loads (React Strict Mode runs effects twice)
    if (scriptLoadAttempted.current) {
      return
    }

    // Check if epi is already available (script already loaded and initialized)
    if ((window as any).epi) {
      console.log('✅ Optimizely epi object already available')
      scriptLoadAttempted.current = true
      return
    }

    // Check if script is already in the DOM (loading or loaded)
    const existingScript = document.querySelector('script[src*="communicationinjector"]')
    if (existingScript) {
      console.log('✅ Optimizely communication script tag found, waiting for epi...')
      scriptLoadAttempted.current = true
      
      // Wait for epi to become available
      const checkInterval = setInterval(() => {
        const epi = (window as any).epi
        if (epi) {
          clearInterval(checkInterval)
          console.log('✅ epi object available after waiting')
        }
      }, 100)
      
      // Stop checking after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!(window as any).epi) {
          console.warn('⚠️ epi object not available after 5 seconds, but script tag exists')
        }
      }, 5000)
      
      return
    }

    // Script not found, load it
    // According to Optimizely docs, the script URL should be:
    // https://app-[UUID].cms.optimizely.com/util/javascript/communicationinjector.js
    // Replace [UUID] with your instance ID
    scriptLoadAttempted.current = true
    console.log('📥 Loading Optimizely communication script...')
    const cmsInstanceId = 'epsajjcmson91rm1p001' // Your Optimizely CMS instance UUID
    const scriptUrl = `https://app-${cmsInstanceId}.cms.optimizely.com/util/javascript/communicationinjector.js`
    console.log('🔗 Script URL:', scriptUrl)
    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = true
    
    script.onload = () => {
      console.log('✅ Optimizely communication script loaded successfully')
      
      // Wait for epi to be available
      const checkInterval = setInterval(() => {
        const epi = (window as any).epi
        if (epi) {
          clearInterval(checkInterval)
          console.log('✅ epi object available')
        }
      }, 100)
      
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!(window as any).epi) {
          console.warn('⚠️ epi object not available after 5 seconds')
        }
      }, 5000)
    }
    
    script.onerror = () => {
      console.error('❌ Failed to load Optimizely communication script')
      // Don't throw - just log the error, as the script might be blocked by CSP or network issues
      // The page can still function without it (just without inline editing)
    }
    
    document.head.appendChild(script)
  }, [])

  // Suppress Optimizely CMS warnings (they're not our concern)
  useEffect(() => {
    const originalWarn = console.warn
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      // Filter out Optimizely CMS internal warnings
      if (
        message.includes('Observable store detected') ||
        message.includes('sort order specified')
      ) {
        return // Suppress these warnings
      }
      originalWarn.apply(console, args)
    }

    return () => {
      console.warn = originalWarn
    }
  }, [])

  // Signal to parent CMS window that page is ready
  const signalPageReady = (force = false, source = 'unknown', enableLogging = false) => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      try {
        const blockCount = document.querySelectorAll('[data-epi-block-id]').length
        const eventTypes = ['epi:page:ready', 'optimizely:content:loaded', 'page:ready']
        
        let targetOrigin = '*'
        try {
          if (document.referrer) {
            const referrerUrl = new URL(document.referrer)
            targetOrigin = referrerUrl.origin
          }
        } catch (e) {
          // Use wildcard
        }

        eventTypes.forEach(eventType => {
          const message = {
            type: eventType,
            source: 'preview',
            timestamp: Date.now(),
            blockCount: blockCount
          }
          window.parent.postMessage(message, targetOrigin)
        })

        const epi = (window as any).epi
        if (epi && typeof epi.publish === 'function') {
          try {
            epi.publish('page:ready')
            epi.publish('content:loaded')
          } catch (e) {
            // Ignore
          }
        }
      } catch (e) {
        console.warn('⚠️ Could not signal page readiness:', e)
      }
    }
  }

  // Log Grid positioning for debugging (without adjusting padding)
  useEffect(() => {
    if (contextMode !== 'edit') return

    const logGridPositioning = () => {
      // Get header section
      const headerSection = document.getElementById('header-section')
      const headerHeight = headerSection ? headerSection.getBoundingClientRect().height : 0
      
      // Get the CMS content wrapper
      const cmsWrapper = document.getElementById('cms-content-wrapper')
      
      // Log positioning for debugging
      const firstGrid = document.querySelector('[data-epi-role="grid"][data-epi-block-id]') as HTMLElement
      if (firstGrid) {
        const gridRect = firstGrid.getBoundingClientRect()
        const gridOffsetTop = firstGrid.offsetTop
        const offsetParent = firstGrid.offsetParent as HTMLElement
        const offsetParentId = offsetParent?.id || 'body'
        const offsetParentRect = offsetParent ? offsetParent.getBoundingClientRect() : null
        
        console.log('📊 Grid & Header Positioning Debug:', {
          headerHeight,
          headerBottom: headerSection ? headerSection.getBoundingClientRect().bottom : 0,
          gridBoundingTop: gridRect.top,
          gridBoundingBottom: gridRect.bottom,
          gridOffsetTop,
          offsetParentId,
          offsetParentBoundingTop: offsetParentRect?.top,
          offsetParentOffsetTop: offsetParent?.offsetTop,
          wrapperPaddingTop: cmsWrapper ? window.getComputedStyle(cmsWrapper).paddingTop : '0',
          overlayIncludesHeader: gridRect.top < headerHeight
        })
      }
    }

    // Run after DOM is ready
    setTimeout(() => {
      logGridPositioning()
    }, 1000)

    // Also run when window resizes
    window.addEventListener('resize', logGridPositioning)

    return () => {
      window.removeEventListener('resize', logGridPositioning)
    }
  }, [contextMode, optimizelyData])

  // Trigger Optimizely to recalculate overlay positions
  const triggerOverlayRecalculation = () => {
    console.log('🔄 Triggering overlay recalculation...')
    
    // Wait for React to finish rendering the updated DOM
    setTimeout(() => {
      try {
        const epi = (window as any).epi
        if (epi) {
          // Try various methods to trigger recalculation
          if (typeof epi.publish === 'function') {
            epi.publish('page:ready')
            epi.publish('content:loaded')
            epi.publish('content:updated')
            console.log('✅ Published Optimizely events')
          }
          
          // Try rescan/rescan methods if available
          if (typeof epi.rescan === 'function') {
            epi.rescan()
            console.log('✅ Called epi.rescan()')
          }
          if (typeof epi.scan === 'function') {
            epi.scan()
            console.log('✅ Called epi.scan()')
          }
          if (typeof epi.reinitializePageEditing === 'function') {
            epi.reinitializePageEditing()
            console.log('✅ Called epi.reinitializePageEditing()')
          }
        }
        
        // Force DOM mutation to trigger Optimizely's MutationObserver
        const cmsWrapper = document.getElementById('cms-content-wrapper')
        if (cmsWrapper) {
          // Temporarily add/remove an attribute to trigger mutation
          cmsWrapper.setAttribute('data-recalc', Date.now().toString())
          setTimeout(() => {
            cmsWrapper.removeAttribute('data-recalc')
          }, 100)
          console.log('✅ Triggered DOM mutation')
        }
        
        // Signal parent CMS window
        if (window.parent !== window) {
          const targetOrigin = '*'
          window.parent.postMessage({
            type: 'optimizely:content:updated',
            timestamp: Date.now()
          }, targetOrigin)
          console.log('✅ Sent postMessage to parent')
        }
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('optimizely:content:updated'))
        console.log('✅ Dispatched custom event')
        
      } catch (e) {
        console.warn('⚠️ Error triggering overlay recalculation:', e)
      }
    }, 300) // Wait 300ms for React to render
  }

  // Initialize Optimizely after script loads and DOM is ready
  useEffect(() => {
    const initializeOptimizely = async () => {
      // Wait for epi to be available
      const waitForEpi = () => {
        return new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            const epi = (window as any).epi
            if (epi) {
              clearInterval(checkInterval)
              resolve()
            }
          }, 100)
          setTimeout(() => {
            clearInterval(checkInterval)
            resolve()
          }, 5000)
        })
      }

      await waitForEpi()

      // Wait for DOM to be stable
      await new Promise(resolve => setTimeout(resolve, 500))

      // Signal readiness
      signalPageReady(true, 'server-side-init', false)
    }

    initializeOptimizely()
  }, [optimizelyData])

  // Trigger overlay recalculation when optimizelyData changes (after React re-renders)
  useEffect(() => {
    if (!optimizelyData || contextMode !== 'edit') return
    
    // Wait for React to finish rendering, then trigger recalculation
    const timeoutId = setTimeout(() => {
      triggerOverlayRecalculation()
    }, 500) // Slightly longer delay to ensure DOM is fully updated
    
    return () => clearTimeout(timeoutId)
  }, [optimizelyData, contextMode])

  // Listen for contentSaved events
  useEffect(() => {
    const handleContentSaved = (event: any) => {
      console.log('🔄 Content saved event received:', event)
      console.log('🔄 Event detail:', event?.detail)
      console.log('🔄 Event data:', event?.data)
      
      // Check if event contains a new preview URL (Optimizely may provide this)
      const eventDetail = event?.detail || event?.data || {}
      const newPreviewUrl = eventDetail.previewUrl || eventDetail.url
      const newVersion = eventDetail.version || eventDetail.ver
      const newKey = eventDetail.key || eventDetail.contentKey
      
      // If Optimizely provides a new preview URL, use it for full refresh
      if (newPreviewUrl) {
        console.log('🔄 Optimizely provided new preview URL, refreshing page:', newPreviewUrl)
        window.location.href = newPreviewUrl
        return
      }
      
      // Read current URL parameters (version may have changed after moving items)
      const urlParams = new URLSearchParams(window.location.search)
      const currentKey = urlParams.get('key') || contentKey
      const currentVer = urlParams.get('ver') || ver || newVersion
      const currentLoc = urlParams.get('loc') || loc
      const currentToken = urlParams.get('preview_token') || currentPreviewToken
      
      // Option 1: Full page refresh (let Optimizely handle everything)
      // This ensures overlay positions are recalculated correctly
      console.log('🔄 Triggering full page refresh to recalculate overlays...')
      const refreshUrl = new URL(window.location.href)
      if (newVersion) {
        refreshUrl.searchParams.set('ver', newVersion)
      }
      if (newKey && newKey !== currentKey) {
        refreshUrl.searchParams.set('key', newKey)
      }
      // Add cache-busting timestamp
      refreshUrl.searchParams.set('_t', Date.now().toString())
      
      window.location.href = refreshUrl.toString()
      return
      
      /* OLD REFETCH CODE - Commented out in favor of full page refresh
      // If you want to try the refetch approach instead, uncomment this and comment out the return above
      
      console.log('🔄 Refetch params:', {
        key: currentKey,
        ver: currentVer,
        loc: currentLoc,
        hasToken: !!currentToken
      })
      
      // Refetch content with current URL parameters
      fetch('/api/optimizely/preview-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
        },
        body: JSON.stringify({ key: currentKey, ver: currentVer, loc: currentLoc }),
        cache: 'no-store'
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        if (data.success && data.data) {
          const contentData = data.data?._Content?.items?.[0]
          
          if (!contentData) {
            console.error('❌ Refetch failed - no content data in items array')
            setError('No content data found in refetch response')
            return
          }
          
          const pageTypes = contentData?._metadata?.types || []
          const isLandingPage = pageTypes.includes('LandingPage')
          const isBlankExperience = pageTypes.includes('BlankExperience')
          
          let processedData
          if (isLandingPage) {
            processedData = { pageType: 'LandingPage', pageData: contentData }
          } else if (isBlankExperience) {
            processedData = { pageType: 'BlankExperience', data: contentData }
          } else {
            processedData = { pageType: 'Other', pageData: contentData }
          }
          
          setOptimizelyData(processedData)
          triggerOverlayRecalculation()
        } else {
          console.error('❌ Refetch failed - invalid response:', data)
          setError(data.error || 'Failed to refetch content')
        }
      })
      .catch(err => {
        console.error('❌ Failed to refetch content:', err)
        setError(err.message || 'Failed to refetch content')
      })
      */
    }

    window.addEventListener('optimizely:cms:contentSaved', handleContentSaved)
    return () => window.removeEventListener('optimizely:cms:contentSaved', handleContentSaved)
  }, [contentKey, ver, loc, currentPreviewToken])
  
  // Alternative: Listen for contentSaved and do immediate full page refresh
  // Uncomment this if you want the simplest approach (full refresh on any content change)
  /*
  useEffect(() => {
    const handleContentSavedSimple = (event: any) => {
      console.log('🔄 Content saved - doing full page refresh...', event)
      // Simple full refresh - let Optimizely handle everything
      window.location.reload()
    }
    
    window.addEventListener('optimizely:cms:contentSaved', handleContentSavedSimple)
    return () => window.removeEventListener('optimizely:cms:contentSaved', handleContentSavedSimple)
  }, [])
  */

  // Handle content rendering
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Preview Error</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  const isPreview = true
  // contextMode is now defined earlier in the component (line ~37)

  // Only show loading if we have a key but no data yet
  if (contentKey && !optimizelyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading preview...</p>
        </div>
      </div>
    )
  }

  // If no key provided, show helpful error message
  if (!contentKey) {
    // Log the current URL for debugging
    let currentUrl = 'N/A'
    let urlParams = 'N/A'
    if (typeof window !== 'undefined') {
      currentUrl = window.location.href
      urlParams = new URLSearchParams(window.location.search).toString()
      console.warn('⚠️ Preview page accessed without key parameter')
      console.warn('📋 Current URL:', currentUrl)
      console.warn('📋 URL parameters:', urlParams)
      console.warn('📋 Parsed params:', {
        key: new URLSearchParams(window.location.search).get('key'),
        ver: new URLSearchParams(window.location.search).get('ver'),
        loc: new URLSearchParams(window.location.search).get('loc'),
        ctx: new URLSearchParams(window.location.search).get('ctx'),
        preview_token: new URLSearchParams(window.location.search).get('preview_token') ? 'present' : 'missing'
      })
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Preview Error</h1>
          <p className="text-red-600 dark:text-red-400 mb-4 font-semibold">No content key provided</p>
          <div className="text-left bg-white dark:bg-gray-800 p-6 rounded-lg mt-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm mb-4 text-gray-700 dark:text-gray-300">
              <strong>This preview page must be accessed from Optimizely CMS.</strong> Do not access it directly.
            </p>
            <p className="text-sm mb-3 text-gray-600 dark:text-gray-400">
              To enable preview, configure your application in Optimizely CMS:
            </p>
            <ol className="text-sm list-decimal list-inside space-y-2 mb-4 text-gray-700 dark:text-gray-300">
              <li>Go to <strong>Settings → Applications</strong> in Optimizely CMS</li>
              <li>Configure your application's preview URL format</li>
              <li>Open the preview from within the CMS (not directly)</li>
            </ol>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Required URL parameters:</p>
              <ul className="text-xs list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-red-600 dark:text-red-400">key</code> - Content item key (required)</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-red-600 dark:text-red-400">ver</code> - Version number (required)</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">loc</code> - Locale</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">ctx</code> - Context mode (edit/view)</li>
                <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">preview_token</code> - Preview token for draft content</li>
              </ul>
            </div>
            {typeof window !== 'undefined' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Current URL:</p>
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all block">
                  {window.location.href}
                </code>
                {window.location.search && (
                  <>
                    <p className="text-xs font-semibold mt-2 mb-1 text-gray-600 dark:text-gray-400">URL Parameters Found:</p>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all block">
                      {window.location.search}
                    </code>
                  </>
                )}
                {!window.location.search && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">No URL parameters found - this confirms the page was accessed directly.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Determine page type and render accordingly
  // Handle both old structure (direct data) and new structure (with pageType)
  const pageType = optimizelyData?.pageType || 
                   optimizelyData?._metadata?.types?.[0] || 
                   optimizelyData?._type || 
                   'Unknown'
  
  const pageData = optimizelyData?.pageData || optimizelyData?.data || optimizelyData

  console.log('🎨 PreviewClient - Rendering:', {
    pageType,
    hasOptimizelyData: !!optimizelyData,
    hasPageData: !!pageData,
    pageDataType: pageData?._metadata?.types?.[0],
    hasComposition: !!pageData?.composition,
    optimizelyDataKeys: optimizelyData ? Object.keys(optimizelyData) : []
  })

  return (
    <>
      <OptimizelyDataPopup data={pageData} />
      {/* Header section - explicitly excluded from CMS overlay calculations */}
      {/* This wrapper ensures header is completely separate from CMS content for overlay calculations */}
      <div 
        id="header-section"
        style={{ 
          position: 'relative', 
          isolation: 'isolate', 
          zIndex: 9999, // Very high z-index to ensure it's above CMS overlays
          width: '100%',
          // CSS containment to isolate from CMS content calculations
          contain: 'layout style paint',
          // Explicit boundaries to prevent Optimizely from including this in overlay calculations
          boxSizing: 'border-box'
        }}
        data-epi-exclude="true"
        data-not-cms-content="true"
      >
        {branding.hasCustomBranding && branding.headerImage && (
          <CustomHeaderClient branding={branding} />
        )}
        <Navigation />
      </div>
      
      {pageType === 'LandingPage' ? (
        <LandingPageDisplay 
          page={pageData} 
          isPreview={isPreview} 
          contextMode={contextMode}
        />
      ) : (
        <div style={{ position: 'relative', isolation: 'isolate', zIndex: 0 }}>
          <CMSContent 
            data={{
              data: {
                data: {
                  BlankExperience: {
                    items: pageData ? [pageData] : []
                  }
                }
              }
            }}
            isLoading={false}
            error={null}
            isPreview={isPreview}
            contextMode={contextMode}
            cmsDemo={cmsDemo}
          />
        </div>
      )}
      
      {branding.hasCustomBranding && branding.footerImage && (
        <CustomFooterClient branding={branding} />
      )}
    </>
  )
}

