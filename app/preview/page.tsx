import { headers } from 'next/headers'
import PreviewClient from './PreviewClient'
import { fetchPreviewContentFromGraph } from '@/lib/optimizely/fetchPreviewContent'
import { getBrandingConfig } from '@/lib/branding'

interface PreviewPageProps {
  searchParams: Promise<{
    key?: string
    ver?: string
    loc?: string
    ctx?: string
    preview_token?: string
  }>
}

async function fetchPreviewContent(
  key: string | undefined,
  ver: string | undefined,
  loc: string | undefined,
  previewToken: string | undefined
) {
  if (!key) {
    return null
  }

  try {
    console.log('🔗 Server-side fetch (direct Graph call):', {
      key,
      ver,
      loc,
      hasPreviewToken: !!previewToken
    })
    
    // Call the shared function directly instead of making HTTP request
    const result = await fetchPreviewContentFromGraph({
      key,
      ver: ver || null,
      loc: loc || null,
      previewToken: previewToken || null
    })
    
    console.log('📥 Server-side fetch result:', {
      success: result.success,
      hasData: !!result.data,
      hasContentItems: !!result.data?._Content?.items,
      itemCount: result.data?._Content?.items?.length || 0
    })
    
    if (result.success && result.data) {
      // Extract the actual content data (matching client-side logic)
      const contentData = result.data?._Content?.items?.[0]
      
      if (contentData) {
        // Determine page type and structure data accordingly
        const pageTypes = contentData._metadata?.types || []
        const isLandingPage = pageTypes.includes('LandingPage')
        const isBlankExperience = pageTypes.includes('BlankExperience')
        
        console.log('📄 Server-side page type detected:', {
          pageTypes,
          isLandingPage,
          isBlankExperience,
          hasComposition: !!contentData.composition
        })
        
        if (isLandingPage) {
          return {
            pageType: 'LandingPage',
            pageData: contentData
          }
        } else if (isBlankExperience) {
          return {
            pageType: 'BlankExperience',
            data: contentData
          }
        } else {
          return {
            pageType: 'Other',
            pageData: contentData
          }
        }
      }
      
      console.warn('⚠️ Server-side: contentData is null or undefined')
      return result.data
    }

    console.warn('⚠️ Server-side: API response was not successful or missing data')
    return null
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    // Log to console with detailed info
    console.error('❌ Failed to fetch preview content:', {
      error: errorMessage,
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: errorStack,
      key,
      ver,
      loc,
      hasPreviewToken: !!previewToken,
      previewTokenPrefix: previewToken ? previewToken.substring(0, 20) + '...' : null
    })
    
    // Also log a simplified version that's easier to spot
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('🚨 PREVIEW FETCH ERROR:', errorMessage)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return null
  }
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  // Await searchParams in Next.js 15+
  const params = await searchParams
  
  // Get cms_demo header for server-side rendering
  const headersList = headers()
  // Try multiple header name variations (Next.js may lowercase headers)
  const cmsDemo = headersList.get('cms_demo') 
    || headersList.get('cms-demo') 
    || headersList.get('CMS_DEMO')
    || headersList.get('CMS-DEMO')
    || headersList.get('x-cms-demo')
    || headersList.get('x-cms_demo')
    || null
  
  // Log header reading for debugging
  console.log('📋 Server-side cms_demo header:', {
    cmsDemo,
    allHeaders: Object.fromEntries(headersList.entries()),
    headerKeys: Array.from(headersList.keys()),
    hasCmsDemo: !!cmsDemo
  })
  
  const key = params.key || null
  const ver = params.ver || null
  const loc = params.loc || null
  const ctx = params.ctx || 'edit'
  const previewToken = params.preview_token || null

  // Log all parameters for debugging
  console.log('📋 Server-side searchParams received:', {
    rawParams: params,
    key: key || 'MISSING',
    ver: ver || 'MISSING',
    loc: loc || 'MISSING',
    ctx: ctx || 'MISSING',
    previewToken: previewToken ? previewToken.substring(0, 50) + '...' : 'MISSING',
    allKeys: Object.keys(params)
  })
  
  // If no key, log a warning and show helpful error
  if (!key) {
    console.warn('⚠️ Preview page accessed without required "key" parameter')
    console.warn('⚠️ This page should be accessed from Optimizely CMS, not directly')
  }

  // Fetch content server-side
  const initialData = await fetchPreviewContent(key || undefined, ver || undefined, loc || undefined, previewToken || undefined)

  // Get branding config server-side
  const branding = await getBrandingConfig()

  if (!initialData && key) {
    // Log error details for debugging
    console.error('🚨 Preview page error - No initial data received:', {
      key,
      ver,
      loc,
      hasPreviewToken: !!previewToken,
      cmsDemo: cmsDemo || 'MISSING'
    })
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-4 text-red-600">Preview Error</h1>
          <p className="text-lg text-gray-700 mb-4">Failed to load preview content</p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-600 mb-2"><strong>Key:</strong> {key || 'MISSING'}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Version:</strong> {ver || 'MISSING'}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Has Preview Token:</strong> {previewToken ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-600"><strong>CMS Demo:</strong> {cmsDemo || 'Not set'}</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">Check the server console logs for detailed error information.</p>
        </div>
      </div>
    )
  }

  return (
    <PreviewClient
      initialData={initialData}
      ctx={ctx}
      previewToken={previewToken}
      contentKey={key}
      ver={ver}
      loc={loc}
      cmsDemo={cmsDemo}
      branding={branding}
    />
  )
}
