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

export default function Home() {
  const [optimizelyData, setOptimizelyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Fetch Optimizely homepage data
    const fetchOptimizelyData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/optimizely/homepage')
        const result = await response.json()
        
        if (result.success) {
          setOptimizelyData(result.data)
          setError(null)
          
          // Update page metadata from API
          const homepageData = result.data?.data?.BlankExperience?.items?.[0]
          if (homepageData) {
            // Update document title using displayName from metadata
            if (homepageData._metadata?.displayName) {
              document.title = homepageData._metadata.displayName
            }
            
            // Update meta description using displayName as fallback
            const description = homepageData._metadata?.displayName || 'SaaSCMS - Your Business Solution'
            let metaDescription = document.querySelector('meta[name="description"]')
            if (metaDescription) {
              metaDescription.setAttribute('content', description)
            } else {
              // Create meta description if it doesn't exist
              metaDescription = document.createElement('meta')
              metaDescription.setAttribute('name', 'description')
              metaDescription.setAttribute('content', description)
              document.head.appendChild(metaDescription)
            }
          }
        } else {
          setError(result.error || 'Failed to fetch data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOptimizelyData()
  }, [])

  return (
    <main className="min-h-screen">
      <CustomHeader />
      <Navigation />
      <ThemeTest />
      <OptimizelyDataPopup 
        data={optimizelyData} 
        isLoading={isLoading} 
        error={error}
      />
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
    </main>
  )
}
