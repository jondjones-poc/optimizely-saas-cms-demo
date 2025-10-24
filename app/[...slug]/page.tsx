'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CustomHeader from '@/components/CustomHeader'
import CustomFooter from '@/components/CustomFooter'
import ThemeTest from '@/components/ThemeTest'

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
        <CustomFooter />
        <ThemeTest />
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
        <CustomFooter />
        <ThemeTest />
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
        <CustomFooter />
        <ThemeTest />
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
        <LandingPage data={pageData} />
      ) : (
        <GenericPage data={pageData} />
      )}
      
      <CustomFooter />
      <ThemeTest />
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

// Landing Page Component
function LandingPage({ data }: { data: PageData }) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-phamily-blue to-phamily-lightBlue text-white">
        <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {data._metadata.displayName}
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Transform your business with our comprehensive platform designed to streamline your operations and accelerate growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-phamily-blue rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300">
              Get Started
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-phamily-blue transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-phamily-darkGray mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-phamily-darkGray/80 max-w-3xl mx-auto">
              Experience the future of business solutions with our comprehensive platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-phamily-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold text-phamily-darkGray mb-4">
                Easy to Use
              </h3>
              <p className="text-phamily-darkGray/80">
                Intuitive interface designed for maximum productivity and ease of use.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-phamily-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold text-phamily-darkGray mb-4">
                Scalable Solutions
              </h3>
              <p className="text-phamily-darkGray/80">
                Grow with confidence knowing our platform scales with your business needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-phamily-blue rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold text-phamily-darkGray mb-4">
                24/7 Support
              </h3>
              <p className="text-phamily-darkGray/80">
                Round-the-clock support to help you succeed every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-phamily-lightGray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-phamily-darkGray mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-phamily-darkGray/80 mb-8">
            Join thousands of businesses already using our platform to grow and succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-phamily-blue text-white rounded-full font-semibold text-lg hover:bg-phamily-lightBlue transition-colors duration-300">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-phamily-blue text-phamily-blue rounded-full font-semibold text-lg hover:bg-phamily-blue hover:text-white transition-colors duration-300">
              Contact Sales
            </button>
          </div>
        </div>
      </section>
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
