'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import FeatureCard from './FeatureCard'

interface CardData {
  key: string
  Heading: string
  SubHeading: string
  Body: string
  Image?: {
    base: string
    default: string
    graph: string
    hierarchical: string
  }
  Links?: Array<{
    target: string
    text: string
    title: string
    url: {
      base: string
    }
  }>
}

interface FeatureGridProps {
  Heading?: string
  SubHeading?: string
  Body?: {
    html: string
  }
  Asset?: {
    url: {
      base: string
      default: string
      hierarchical: string
      type: string
      internal: string
    }
  }
  Cards?: Array<{
    key: string
    url?: {
      base: string
      default: string
      graph: string
    }
    Heading?: string
    Body?: string
    Image?: {
      base: string
      default: string
    }
    _metadata?: {
      key?: string
      types?: string[]
      displayName?: string
    }
  }>
  _metadata?: {
    key?: string
    displayName?: string
  }
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const FeatureGrid = ({ 
  Heading, 
  SubHeading, 
  Body, 
  Asset, 
  Cards, 
  _metadata, 
  _gridDisplayName, 
  isPreview = false, 
  contextMode = null 
}: FeatureGridProps) => {
  const { theme } = useTheme()
  const [cardData, setCardData] = useState<CardData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Process card data - use inlined content if available, otherwise fetch via API
  useEffect(() => {
    const processCardData = async () => {
      if (!Cards || Cards.length === 0) {
        setCardData([])
        return
      }

      // Check if cards already have content inlined (from preview API)
      const hasInlinedContent = Cards.some(card => card.Heading !== undefined || card.Body !== undefined)
      
      if (hasInlinedContent) {
        // Cards are already inlined from the preview API - use them directly
        const processedCards = Cards.map((card) => ({
          key: card._metadata?.key || card.key,
          Heading: card.Heading || '',
          Body: card.Body || '',
          Image: card.Image ? {
            base: card.Image.base,
            default: card.Image.default
          } : undefined
        })).filter(card => card.Heading || card.Body) // Filter out empty cards
        
        setCardData(processedCards)
        return
      }

      // Cards are not inlined - fetch them via API (production mode or fallback)
      setIsLoading(true)
      try {
        // Check if we're in preview mode (check URL for preview_token)
        const urlParams = new URLSearchParams(window.location.search)
        const previewToken = urlParams.get('preview_token')
        
        // Build headers with preview token if available
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (previewToken) {
          const bearerToken = previewToken.startsWith('Bearer ') ? previewToken : `Bearer ${previewToken}`
          headers['Authorization'] = bearerToken
          // Add cache-busting headers for preview mode
          headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
          headers['Pragma'] = 'no-cache'
        }
        
        // Fetch card data via API with cache-busting timestamp for preview
        // Use graph URL from card reference if available (contains version info)
        const cardPromises = Cards.map(async (card) => {
          try {
            // Build query params - prefer graph URL if available (contains version info)
            const params = new URLSearchParams()
            if (card.url?.graph) {
              params.append('graph', card.url.graph)
              console.log('✅ FeatureGrid: Using graph URL for card', { key: card.key, graph: card.url.graph })
            } else {
              params.append('key', card.key || '')
            }
            // Add cache-busting timestamp for preview
            if (previewToken) {
              params.append('t', Date.now().toString())
            }
            
            const apiUrl = `/api/optimizely/feature-card?${params.toString()}`
            console.log('📦 FeatureGrid: Fetching card', {
              key: card.key,
              hasGraphUrl: !!card.url?.graph,
              graphUrl: card.url?.graph,
              apiUrl,
              hasPreviewToken: !!previewToken,
              previewTokenLength: previewToken?.length || 0
            })
            
            const response = await fetch(apiUrl, {
              headers,
              cache: 'no-store'
            })
            const result = await response.json()
            
            console.log('📦 FeatureGrid: Card fetch result', {
              success: result.success,
              hasData: !!result.data,
              hasErrors: !!result.error,
              error: result.error,
              key: card.key
            })
            
            if (result.success && result.data) {
              const cardData = result.data
              // Log card data to verify draft content
              if (previewToken && cardData._metadata) {
                console.log('✅ FeatureGrid: Card fetched with preview token', {
                  key: cardData._metadata.key,
                  version: cardData._metadata.version,
                  status: cardData._metadata.status,
                  heading: cardData.Heading?.substring(0, 30) + '...',
                  hasHeading: !!cardData.Heading,
                  hasBody: !!cardData.Body,
                  hasImage: !!cardData.Image
                })
              }
              return {
                key: cardData._metadata?.key || card.key,
                Heading: cardData.Heading,
                Body: cardData.Body,
                Image: cardData.Image ? {
                  base: cardData.Image.base,
                  default: cardData.Image.default
                } : undefined
              }
            } else {
              console.error('❌ FeatureGrid: Card fetch failed', {
                key: card.key,
                error: result.error,
                details: result.details
              })
            }
            return null
          } catch (error) {
            console.error('Error fetching card:', error)
            return null
          }
        })

        const cards = await Promise.all(cardPromises)
        const validCards = cards.filter(card => card)
        setCardData(validCards)
      } catch (error) {
        console.error('Error processing card data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    processCardData()
  }, [Cards])

  return (
    <section ref={ref} className={`py-20 ${
      theme === 'dark' ? 'bg-dark-secondary' : 'bg-phamily-lightGray'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
          }`}>
            {Heading || 'Our mission'}
          </h2>
          <h3 className={`text-3xl md:text-4xl font-bold mb-8 ${
            theme === 'dark' ? 'text-dark-text' : 'text-phamily-blue'
          }`}>
            {SubHeading || 'Your business peace of mind'}
          </h3>
          {Body?.html && (
            <div 
              className={`text-lg leading-relaxed max-w-3xl mx-auto ${
                theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/80'
              }`}
              dangerouslySetInnerHTML={{ __html: Body.html }}
            />
          )}
        </motion.div>

        {/* Feature Cards */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phamily-blue mx-auto"></div>
            <p className="mt-4 text-phamily-gray dark:text-dark-text-secondary">Loading cards...</p>
          </div>
        ) : (
          <div className={`grid gap-8 ${
            cardData.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
            cardData.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
            'grid-cols-1 md:grid-cols-3'
          }`}>
            {cardData.map((card, index) => {
              const { key, ...cardProps } = card
              return (
                <motion.div
                  key={key || index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <FeatureCard
                    {...cardProps}
                    isPreview={isPreview}
                    contextMode={contextMode}
                  />
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeatureGrid
