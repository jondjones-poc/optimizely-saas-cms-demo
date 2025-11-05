'use client'

import { useEffect, useState, useRef } from 'react'
import CMSContent from '@/components/CMSContent'
import LandingPageDisplay from '@/components/LandingPageDisplay'
import OptimizelyDataPopup from '@/components/OptimizelyDataPopup'
import CustomHeader from '@/components/CustomHeader'
import CustomFooter from '@/components/CustomFooter'
import Navigation from '@/components/Navigation'

interface PreviewClientProps {
  initialData: any
  ctx: string
  previewToken: string | null
  contentKey: string | null  // Renamed from 'key' because 'key' is reserved in React
  ver: string | null
  loc: string | null
  cmsDemo?: string | null  // cms_demo header value from server
}

export default function PreviewClient({ 
  initialData, 
  ctx, 
  previewToken, 
  contentKey,  // Renamed from 'key'
  ver, 
  loc,
  cmsDemo 
}: PreviewClientProps) {
  const [optimizelyData, setOptimizelyData] = useState<any>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPreviewToken, setCurrentPreviewToken] = useState<string | null>(previewToken)
  const scriptLoadAttempted = useRef(false)

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

  // Listen for contentSaved events
  useEffect(() => {
    const handleContentSaved = () => {
      console.log('🔄 Content saved - refetching...')
      // Refetch content
      fetch('/api/optimizely/preview-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentPreviewToken && { 'Authorization': `Bearer ${currentPreviewToken}` })
        },
        body: JSON.stringify({ key: contentKey, ver, loc }),
        cache: 'no-store'
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOptimizelyData(data.data)
        }
      })
      .catch(err => {
        console.error('Failed to refetch content:', err)
      })
    }

    window.addEventListener('optimizely:cms:contentSaved', handleContentSaved)
    return () => window.removeEventListener('optimizely:cms:contentSaved', handleContentSaved)
  }, [contentKey, ver, loc, currentPreviewToken])

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
  const contextMode = ctx || 'edit'

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
      <CustomHeader />
      <Navigation />
      
      {pageType === 'LandingPage' ? (
        <LandingPageDisplay 
          page={pageData} 
          isPreview={isPreview} 
          contextMode={contextMode}
        />
      ) : (
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
      )}
      
      <CustomFooter />
    </>
  )
}

