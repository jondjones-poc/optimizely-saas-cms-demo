'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import CustomHeader from '@/components/CustomHeader'
import CMSContent from '@/components/CMSContent'
import CustomFooter from '@/components/CustomFooter'
import RightFloatingMenuComponent from '@/components/RightFloatingMenuComponent'
import SEOButton from '@/components/SEOButton'
import { extractAllSEOData } from '@/utils/seoDataExtractor'

export default function Home() {
  const [optimizelyData, setOptimizelyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seoData, setSeoData] = useState<any>(null)

      useEffect(() => {
        const fetchHomepageData = async () => {
          try {
            const response = await fetch('/api/optimizely/homepage')
            const result = await response.json()
            
            if (result.success) {
              setOptimizelyData(result)
              
              // Extract SEO data for SEOButton
              const extractedSeoData = extractAllSEOData(result)
              setSeoData(extractedSeoData)
              
              // Update document title and meta description
              if (result.data?.BlankExperience?.items?.[0]?._metadata?.displayName) {
                document.title = `${result.data.BlankExperience.items[0]._metadata.displayName} - SaaSCMS`
              }
              
              const metaDescription = document.querySelector('meta[name="description"]')
              if (metaDescription) {
                metaDescription.setAttribute('content', result.data?.BlankExperience?.items?.[0]?._metadata?.displayName || 'Transform your business with our comprehensive SaaS platform')
              }
            } else {
              setError(result.error)
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch homepage data')
          } finally {
            setIsLoading(false)
          }
        }

        fetchHomepageData()
      }, [])

  return (
    <main className="min-h-screen">
      <CustomHeader />
      <Navigation 
        optimizelyData={optimizelyData} 
        isLoading={isLoading} 
        error={error}
      />
      {/* CMS Content includes Hero and other blocks */}
      <CMSContent 
        data={optimizelyData} 
        isLoading={isLoading} 
        error={error}
      />
      <CustomFooter 
        optimizelyData={optimizelyData} 
        isLoading={isLoading} 
        error={error}
      />
      
      {/* Sidebar Components */}
      <RightFloatingMenuComponent />
      <SEOButton 
        seoData={seoData?.seoData}
        pageMetadata={seoData?.pageMetadata}
        cmsBlocks={seoData?.cmsBlocks}
        loading={isLoading}
      />
    </main>
  )
}
