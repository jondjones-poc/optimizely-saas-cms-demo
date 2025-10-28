'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CustomHeader from '@/components/CustomHeader'
import CustomFooter from '@/components/CustomFooter'
import RightFloatingMenuComponent from '@/components/RightFloatingMenuComponent'
import SEOButton from '@/components/SEOButton'
import LandingPageDisplay from '@/components/LandingPageDisplay'
import { transformPageData, transformLandingPageData } from '@/utils/seoDataTransformers'

interface PageData {
  _metadata: {
    key: string
    displayName: string
    types: string[]
    url: {
      default: string
    }
  }
  Heading?: string
  Body?: {
    html: string
    json: any
  }
  [key: string]: any
}

export default function DynamicPage() {
  const params = useParams()
  const [pageData, setPageData] = useState<PageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get the slug from the URL
  const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || ''
  const fullPath = slug ? `/${slug}/` : '/'

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try to fetch page data based on the slug
        const response = await fetch(`/api/optimizely/page?path=${encodeURIComponent(fullPath)}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setPageData(result.data)
          
          // Update document title
          if (result.data._metadata?.displayName) {
            document.title = `${result.data._metadata.displayName} - SaaSCMS`
          }
        } else {
          setError(result.error || 'Page not found')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch page data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPageData()
  }, [fullPath])

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <CustomHeader />
        <Navigation 
          optimizelyData={null} 
          isLoading={true} 
          error={null}
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phamily-blue mx-auto mb-4"></div>
            <p className="text-phamily-darkGray">Loading page...</p>
          </div>
        </div>
        <CustomFooter 
          optimizelyData={pageData} 
          isLoading={isLoading} 
          error={error}
        />
        <RightFloatingMenuComponent />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <CustomHeader />
        <Navigation 
          optimizelyData={null} 
          isLoading={false} 
          error={error}
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Page Not Found</h1>
            <p className="text-phamily-darkGray mb-4">{error}</p>
            <p className="text-sm text-phamily-darkGray/60">Path: {fullPath}</p>
          </div>
        </div>
        <CustomFooter 
          optimizelyData={pageData} 
          isLoading={isLoading} 
          error={error}
        />
        <RightFloatingMenuComponent />
      </main>
    )
  }

  if (!pageData) {
    return (
      <main className="min-h-screen">
        <CustomHeader />
        <Navigation 
          optimizelyData={null} 
          isLoading={false} 
          error="No page data"
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-phamily-darkGray mb-4">No Content</h1>
            <p className="text-phamily-darkGray">No page data available</p>
          </div>
        </div>
        <CustomFooter 
          optimizelyData={pageData} 
          isLoading={isLoading} 
          error={error}
        />
        <RightFloatingMenuComponent />
      </main>
    )
  }

  // Determine page type and render appropriate component
  const pageType = pageData._metadata.types?.[0]

  return (
    <main className="min-h-screen">
      <CustomHeader />
      <Navigation 
        optimizelyData={null} 
        isLoading={false} 
        error={null}
      />
      
      {/* Render based on page type */}
      {pageType === 'ArticlePage' ? (
        <ArticlePage data={pageData} />
      ) : pageType === 'LandingPage' ? (
        <LandingPageDisplay data={pageData} />
      ) : (
        <GenericPage data={pageData} />
      )}
      
      <CustomFooter 
        optimizelyData={pageData} 
        isLoading={false} 
        error={null} 
      />
      <RightFloatingMenuComponent pageData={pageData} />
      {/* Only show SEOButton for non-LandingPage types, LandingPage has its own */}
      {pageType !== 'LandingPage' && (
        <SEOButton {...transformPageData(pageData)} />
      )}
    </main>
  )
}

// Article Page Component
function ArticlePage({ data }: { data: PageData }) {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-phamily-darkGray mb-6">
          {data.Heading || data._metadata.displayName}
        </h1>
        {data.Body?.html && (
          <div 
            className="text-lg text-phamily-darkGray/80 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: data.Body.html }}
          />
        )}
      </header>
      
      {/* Add more article-specific content here */}
      <div className="prose prose-lg max-w-none">
        <p className="text-phamily-darkGray/60">
          This is an Article page. More content can be added here based on the CMS data.
        </p>
      </div>
    </article>
  )
}

// Landing Page Component - Wireframe Style
function LandingPage({ data }: { data: PageData }) {
  // Use the working transformLandingPageData function
  const transformedData = transformLandingPageData(data)
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* TopContentArea - Render all blocks */}
        {data.TopContentArea && data.TopContentArea.length > 0 && (
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 bg-blue-50/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-700">
                TopContentArea
              </h2>
              <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                {data.TopContentArea.length} blocks
              </span>
            </div>
            
            {/* Render each block in TopContentArea */}
            <div className="space-y-6">
              {data.TopContentArea.map((component: any, index: number) => {
                const componentType = component._metadata?.types?.[0]
                
                if (componentType === 'Hero') {
                  return (
                    <div key={index} className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-white/50">
                      <div className="flex gap-6">
                        {/* Left area - Mock example (75%) */}
                        <div className="w-3/4">
                          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/50 min-h-[200px]">
                            <div className="space-y-4">
                              {/* Display the BlockName property */}
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-700"><span className="font-bold">BlockName:</span> "{component._metadata?.displayName}"</p>
                              </div>
                              
                              {/* Mock hero content - wider layout with image, chart, and CTA */}
                              <div className="w-full">
                                <div className="flex gap-4 items-start">
                                  {/* Left side - Hero Image */}
                                  <div className="w-48 h-32 bg-gray-200 flex items-center justify-center">
                                    <div className="text-gray-500 text-xs">Hero Image</div>
                                  </div>
                                  
                                  {/* Right side - Text lines */}
                                  <div className="flex-1">
                                    <div className="h-20 p-2">
                                      <div className="space-y-2">
                                        {/* Text lines */}
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                      </div>
                                    </div>
                                    
                                    {/* CTA Button underneath */}
                                    <div className="mt-3 flex justify-center">
                                      <div className="h-8 bg-gray-200 rounded w-32 flex items-center justify-center">
                                        <div className="text-gray-500 text-xs">CTA Button</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right sidebar - Attributes (25%) */}
                        <div className="w-1/4">
                          <h4 className="text-sm font-semibold text-blue-700 mb-3">Hero Block Properties</h4>
                          <div className="space-y-2">
                            <div className="text-xs">
                              <span className="font-bold text-gray-700">BlockName:</span>
                              <p className="text-gray-600 mt-1">"{component._metadata?.displayName}"</p>
                            </div>
                            {component.Heading && (
                              <div className="text-xs">
                                <span className="font-bold text-gray-700">Heading:</span>
                                <p className="text-gray-600 mt-1">"{component.Heading}"</p>
                              </div>
                            )}
                            {component.SubHeading && (
                              <div className="text-xs">
                                <span className="font-bold text-gray-700">SubHeading:</span>
                                <p className="text-gray-600 mt-1">"{component.SubHeading}"</p>
                              </div>
                            )}
                            {component.Body?.html && (
                              <div className="text-xs">
                                <span className="font-bold text-gray-700">Body:</span>
                                <p className="text-gray-600 mt-1">"{component.Body.html.substring(0, 50)}..."</p>
                              </div>
                            )}
                            {component.Image?.url?.default && (
                              <div className="text-xs">
                                <span className="font-bold text-gray-700">Image:</span>
                                <p className="text-gray-600 mt-1">"{component.Image.url.default}"</p>
                              </div>
                            )}
                            {component.Links && component.Links.length > 0 && (
                              <div className="text-xs">
                                <span className="font-bold text-gray-700">Links:</span>
                                <p className="text-gray-600 mt-1">{component.Links.length} items</p>
                              </div>
                            )}
                            {component.Video?.url?.default && (
                              <div className="text-xs">
                                <span className="font-bold text-gray-700">Video:</span>
                                <p className="text-gray-600 mt-1">"{component.Video.url.default.substring(0, 30)}..."</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
                
                if (componentType === 'Carousel') {
                  return (
                    <div key={index} className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-white/50">
                      <div className="flex gap-6">
                        {/* Left area - Mock example (75%) */}
                        <div className="w-3/4">
                          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/50 min-h-[400px]">
                            <div className="space-y-4">
                              {/* Display the BlockName property */}
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-700"><span className="font-bold">BlockName:</span> "{component._metadata?.displayName}"</p>
                              </div>
                              
                              {/* Mock carousel content */}
                              <div className="w-full h-full">
                                <div className="bg-gray-200 rounded h-64 flex items-center justify-center">
                                  <div className="text-gray-500 text-xs">Carousel Slides</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right sidebar - Attributes (25%) */}
                        <div className="w-1/4">
                          <h4 className="text-sm font-semibold text-blue-700 mb-3">Carousel Block Properties</h4>
                          <div className="space-y-2">
                            <div className="text-xs">
                              <span className="font-bold text-gray-700">BlockName:</span>
                              <p className="text-gray-600 mt-1">"{component._metadata?.displayName}"</p>
                            </div>
                            {component.Cards && component.Cards.length > 0 && (
                              <div className="text-xs">
                                <span className="font-bold text-gray-700">Cards:</span>
                                <p className="text-gray-600 mt-1">{component.Cards.length} items</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
                
                return null
              })}
            </div>
          </div>
        )}

        {/* MainContentArea - Multiple Components */}
        {data.MainContentArea && data.MainContentArea.length > 0 && (
          <div className="border-2 border-dashed border-green-400 rounded-lg p-6 bg-green-50/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-green-700">
                MainContentArea
              </h2>
              <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                {data.MainContentArea.length} components
              </span>
            </div>
            
            {/* Render each component in MainContentArea */}
            <div className="space-y-6">
              {data.MainContentArea.map((component: any, index: number) => {
                const componentType = component._metadata?.types?.[0]
                
                if (componentType === 'Text') {
                  return (
                    <div key={index} className="border-2 border-dashed border-green-300 rounded-lg p-8 bg-white/50">
                      <div className="flex gap-6">
                        {/* Left area - Mock example (75%) */}
                        <div className="w-3/4">
                          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/50 min-h-[200px]">
                            <div className="space-y-3">
                              {/* Display the BlockName property */}
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-700"><span className="font-bold">BlockName:</span> "{component._metadata?.displayName}"</p>
                              </div>
                              
                              {/* Mock text content */}
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right sidebar - Attributes (25%) */}
                        <div className="w-1/4">
                          <h4 className="text-sm font-semibold text-green-700 mb-3">Text Block Properties</h4>
                          <div className="space-y-2">
                            <div className="text-xs">
                              <span className="font-bold text-gray-700">BlockName:</span>
                              <p className="text-gray-600 mt-1">"{component._metadata?.displayName}"</p>
                            </div>
                            {component.Content && (
                              <div className="text-xs">
                                <span className="font-bold text-gray-700">Content:</span>
                                <p className="text-gray-600 mt-1">"{component.Content}"</p>
                              </div>
                            )}
                            {component.Position && (
                              <div className="text-xs">
                                <span className="font-bold text-gray-700">Position:</span>
                                <p className="text-gray-600 mt-1">"{component.Position}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
                
                if (componentType === 'Image') {
                  return (
                    <div key={index} className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-white/50">
                      <div className="flex gap-6">
                        {/* Left area - Mock example (75%) */}
                        <div className="w-3/4">
                          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/50 min-h-[200px]">
                            <div className="space-y-3">
                              {/* Display the BlockName property */}
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-700"><span className="font-bold">BlockName:</span> "{component._metadata?.displayName}"</p>
                              </div>
                              
                              {/* Mock image content - single wide image */}
                              <div className="flex justify-center">
                                <div className="h-24 w-4/5 bg-gray-200 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                                  <div className="text-gray-400 text-sm">Image Placeholder</div>
                                </div>
                              </div>
                              
                              {/* Mock caption */}
                              <div className="text-center">
                                <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right sidebar - Attributes (25%) */}
                        <div className="w-1/4">
                          <h4 className="text-sm font-semibold text-purple-700 mb-3">Image Block Properties</h4>
                          <div className="space-y-2">
                            <div className="text-xs">
                              <span className="font-bold text-gray-700">BlockName:</span>
                              <p className="text-gray-600 mt-1">"{component._metadata?.displayName}"</p>
                            </div>
                            <div className="text-xs">
                              <span className="font-bold text-gray-700">Image:</span>
                              <p className="text-gray-600 mt-1">(not loaded)</p>
                            </div>
                            <div className="text-xs">
                              <span className="font-bold text-gray-700">Caption:</span>
                              <p className="text-gray-600 mt-1">(not loaded)</p>
                            </div>
                            <div className="text-xs">
                              <span className="font-bold text-gray-700">Alignment:</span>
                              <p className="text-gray-600 mt-1">(not loaded)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
                
                return null
              })}
            </div>
          </div>
        )}

        {/* SEO Settings Display */}
        {data.SeoSettings && (
          <div className="border-2 border-dashed border-purple-400 rounded-lg p-6 bg-purple-50/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-purple-700">
                SeoSettings
              </h2>
              <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                SEO Configuration
              </span>
            </div>
            
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-white/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Meta Title:</p>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Meta Description:</p>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Graph Type:</p>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Indexing:</p>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Metadata Display */}
        <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Page Metadata
            </h2>
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              System Info
            </span>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Page Types:</p>
                <p className="text-gray-600">{data._metadata.types?.join(', ')}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">URL:</p>
                <p className="text-gray-600">{data._metadata.url?.default}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Status:</p>
                <p className="text-gray-600">{(data._metadata as any).status || 'Unknown'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Published:</p>
                <p className="text-gray-600">{new Date((data._metadata as any).published).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* SEO Button for Landing Page - use same data as DataExplorer */}
      <SEOButton 
        seoData={transformedData.seoData}
        pageMetadata={transformedData.pageMetadata}
        cmsBlocks={transformedData.cmsBlocks}
      />
    </div>
  )
}

// Generic Page Component (fallback)
function GenericPage({ data }: { data: PageData }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-phamily-darkGray mb-6">
        {data.Heading || data._metadata.displayName}
      </h1>
      {data.Body?.html && (
        <div 
          className="text-lg text-phamily-darkGray/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: data.Body.html }}
        />
      )}
      <div className="mt-8 p-4 bg-phamily-lightGray rounded-lg">
        <p className="text-sm text-phamily-darkGray/60">
          Page Type: {data._metadata.types?.[0] || 'Unknown'}
        </p>
        <p className="text-sm text-phamily-darkGray/60">
          URL: {data._metadata.url?.default}
        </p>
      </div>
    </div>
  )
}
