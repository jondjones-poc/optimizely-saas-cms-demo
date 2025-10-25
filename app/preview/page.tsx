'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CustomHeader from '@/components/CustomHeader'
import CMSContent from '@/components/CMSContent'
import Carousel from '@/components/Carousel'
import MissionSection from '@/components/MissionSection'
import SolutionSection from '@/components/SolutionSection'
import CommunitySection from '@/components/CommunitySection'
import TeamSection from '@/components/TeamSection'
import Footer from '@/components/Footer'
import CustomFooter from '@/components/CustomFooter'
import RightFloatingMenuComponent from '@/components/RightFloatingMenuComponent'
import OptimizelyDataPopup from '@/components/OptimizelyDataPopup'

export default function PreviewPage() {
  const searchParams = useSearchParams()
  const [optimizelyData, setOptimizelyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Extract preview parameters
  const key = searchParams.get('key')
  const ver = searchParams.get('ver')
  const loc = searchParams.get('loc')
  const ctx = searchParams.get('ctx')
  const previewToken = searchParams.get('preview_token')

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

    // Fetch content with preview token
    const fetchPreviewContent = async () => {
      if (!key) {
        setError('No content key provided')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Use preview token for authorization
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        
        if (previewToken) {
          headers['Authorization'] = `Bearer ${previewToken}`
        }

        // Fetch content by key with preview token
        const response = await fetch('/api/optimizely/preview-content', {
          method: 'POST',
          headers,
          body: JSON.stringify({ key, ver, loc })
        })
        
        const result = await response.json()
        
        if (result.success) {
          setOptimizelyData(result.data)
          setError(null)
          
          // Update page metadata from API
          const contentData = result.data?.data?._Content?.items?.[0]
          if (contentData) {
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

    // Load communication script for live preview
    loadCommunicationScript()
    
    // Fetch preview content
    fetchPreviewContent()

    // Listen for content saved events
    const handleContentSaved = (event: CustomEvent) => {
      console.log('Content saved:', event.detail)
      
      // Extract new preview token from the event
      const message = event.detail
      if (message && message.previewUrl) {
        const urlParams = new URLSearchParams(message.previewUrl)
        const newPreviewToken = urlParams.get('preview_token')
        
        if (newPreviewToken) {
          // Update the preview token and refetch content
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.set('preview_token', newPreviewToken)
          window.history.replaceState({}, '', newUrl.toString())
          
          // Refetch content with new token
          fetchPreviewContent()
        }
      } else {
        // Fallback: just refetch content
        fetchPreviewContent()
      }
    }

    window.addEventListener('optimizely:cms:contentSaved', handleContentSaved as EventListener)

    return () => {
      window.removeEventListener('optimizely:cms:contentSaved', handleContentSaved as EventListener)
    }
  }, [key, ver, loc, previewToken])

  return (
    <main className="min-h-screen">
      <CustomHeader />
      <Navigation />
      <RightFloatingMenuComponent />
      
      {/* Preview Mode Indicator */}
      {ctx === 'edit' && (
        <div className="bg-blue-600 text-white p-2 text-center text-sm font-medium">
          🔧 Live Preview Mode - Content editing enabled
        </div>
      )}
      
      <OptimizelyDataPopup 
        data={optimizelyData} 
        isLoading={isLoading} 
        error={error}
      />
      
      {/* CMS Content with preview support */}
      <CMSContent 
        data={optimizelyData} 
        isLoading={isLoading} 
        error={error}
        isPreview={true}
        contextMode={ctx}
      />
      
      <Carousel />
      <MissionSection />
      <SolutionSection />
      <CommunitySection />
      <TeamSection />
      <div className="mb-16"></div>
      <Footer />
      <CustomFooter 
        optimizelyData={optimizelyData} 
        isLoading={isLoading} 
        error={error}
      />
    </main>
  )
}
