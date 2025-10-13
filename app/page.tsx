'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import CustomHeader from '@/components/CustomHeader'
import Carousel from '@/components/Carousel'
import CMSContent from '@/components/CMSContent'
import MissionSection from '@/components/MissionSection'
import SolutionSection from '@/components/SolutionSection'
import CommunitySection from '@/components/CommunitySection'
import TeamSection from '@/components/TeamSection'
import Footer from '@/components/Footer'
import CustomFooter from '@/components/CustomFooter'
import ThemeTest from '@/components/ThemeTest'
import OptimizelyDataPopup from '@/components/OptimizelyDataPopup'
import BrandingTest from '@/components/BrandingTest'

export default function Home() {
  const [optimizelyData, setOptimizelyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

      useEffect(() => {
        const fetchHomepageData = async () => {
          try {
            const response = await fetch('/api/optimizely/homepage')
            const result = await response.json()
            
            if (result.success) {
              setOptimizelyData(result)
              
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
      <Navigation />
      {/* CMS Content includes Hero and other blocks */}
      <CMSContent 
        data={optimizelyData} 
        isLoading={isLoading} 
        error={error}
      />
      <Carousel />
      <MissionSection />
      <SolutionSection />
      <CommunitySection />
      <TeamSection />
      <div className="mb-16"></div>
      <Footer />
      <CustomFooter />
      
      {/* Sidebar Components */}
      <BrandingTest />
      <ThemeTest />
      <OptimizelyDataPopup 
        data={optimizelyData} 
        isLoading={isLoading} 
        error={error}
      />
    </main>
  )
}
