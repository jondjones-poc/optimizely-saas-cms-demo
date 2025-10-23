'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Card from './Card'

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

interface FeatureCardProps {
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
    url: {
      base: string
      default: string
      graph: string
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

const FeatureCard = ({ 
  Heading, 
  SubHeading, 
  Body, 
  Asset, 
  Cards, 
  _metadata, 
  _gridDisplayName, 
  isPreview = false, 
  contextMode = null 
}: FeatureCardProps) => {
  const { theme } = useTheme()
  const [cardData, setCardData] = useState<CardData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Debug: Log the props to see what data is being passed
  console.log('FeatureCard props:', { Heading, SubHeading, Body, Asset, Cards, _metadata, _gridDisplayName })

  // Fetch card data using the graph URL directly with Optimizely GraphQL endpoint
  useEffect(() => {
    const fetchCardData = async () => {
      console.log('FeatureCard Cards prop:', Cards)
      if (!Cards || Cards.length === 0) {
        console.log('No Cards data, setting empty array')
        setCardData([])
        return
      }

      console.log('Fetching card data for', Cards.length, 'cards')
      setIsLoading(true)
      try {
        // Use the graph URL directly with the Optimizely GraphQL endpoint
        const cardPromises = Cards.map(async (card) => {
          console.log('Fetching card with graph URL:', card.url.graph)
          try {
            // Convert graph URL to GraphQL query
            // graph://cms/Card/8152ba50a8924c418817ad7f01e4e43a -> Card query with key
            const query = `
              query GetCard {
                Card(
                  where: {
                    _metadata: {
                      key: {
                        eq: "${card.key}"
                      }
                    }
                  }
                  limit: 1
                ) {
                  items {
                    _metadata {
                      key
                      displayName
                      types
                    }
                    Heading
                    Body
                    Image {
                      base
                      default
                      graph
                      hierarchical
                    }
                  }
                }
              }
            `

            const response = await fetch('https://cg.optimizely.com/content/v2?auth=' + process.env.NEXT_PUBLIC_SDK_KEY, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ query })
            })

            const result = await response.json()
            console.log('Card fetch result:', result)
            
            if (result.data?.Card?.items?.[0]) {
              return result.data.Card.items[0]
            }
            return null
          } catch (error) {
            console.error('Error fetching card:', error)
            return null
          }
        })

        const cards = await Promise.all(cardPromises)
        console.log('All cards fetched:', cards)
        setCardData(cards.filter(card => card)) // Filter out any failed requests
      } catch (error) {
        console.error('Error fetching card data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCardData()
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
            {SubHeading || 'Your business'}
            <span className={`block ${
              theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-orange'
            }`}>peace of mind</span>
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
            {cardData.map((card, index) => (
              <motion.div
                key={card.key || index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card
                  {...card}
                  isPreview={isPreview}
                  contextMode={contextMode}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FeatureCard
