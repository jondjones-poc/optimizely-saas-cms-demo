'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import FeatureCard from './FeatureCard'

interface CardData {
  key: string
  Heading: string
  SubHeading?: string  // Made optional since FeatureCard doesn't have this field
  Body: string
  Image?: {
    base: string
    default: string
    graph?: string  // Made optional
    hierarchical?: string  // Made optional
  }
  Links?: Array<{
    target: string
    text: string
    title: string
    url: {
      base: string
    }
  }>
  _metadata?: {
    key?: string
    types?: string[]
    displayName?: string
  }
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
      version?: string
      status?: string
    }
  }>
  _metadata?: {
    key?: string
    displayName?: string
  }
  _componentKey?: string // Passed from BlockRenderer for data-epi-block-id
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
  _componentKey,
  isPreview = false, 
  contextMode = null 
}: FeatureGridProps) => {
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Use inlined card content directly from props (server-side fetched)
  // Cards are now inlined server-side, so no client-side fetching needed
  console.log('🔍 FeatureGrid - Cards received:', {
    hasCards: !!Cards,
    cardCount: Cards?.length || 0,
    firstCard: Cards?.[0] ? {
      key: Cards[0].key,
      hasHeading: Cards[0].Heading !== undefined,
      hasBody: Cards[0].Body !== undefined,
      hasImage: Cards[0].Image !== undefined,
      hasMetadata: Cards[0]._metadata !== undefined,
      cardKeys: Object.keys(Cards[0]),
      fullCard: JSON.stringify(Cards[0], null, 2).substring(0, 500) // First 500 chars
    } : null
  })
  
  const cardData: CardData[] = Cards && Cards.length > 0
    ? Cards.map((card) => {
        const processedCard = {
          key: card._metadata?.key || card.key,
          Heading: card.Heading || '',
          Body: card.Body || '',
          Image: card.Image ? {
            base: card.Image.base,
            default: card.Image.default
          } : undefined,
          _metadata: card._metadata // Pass _metadata for FeatureCard data-epi-block-id
        }
        console.log('🔍 FeatureGrid - Processing card:', {
          originalKey: card.key,
          processedKey: processedCard.key,
          hasHeading: !!processedCard.Heading,
          hasBody: !!processedCard.Body,
          headingValue: processedCard.Heading,
          bodyValue: processedCard.Body?.substring(0, 50)
        })
        return processedCard
      }).filter(card => {
        const hasContent = card.Heading || card.Body
        if (!hasContent) {
          console.warn('⚠️ FeatureGrid - Filtering out empty card:', card.key)
        }
        return hasContent
      })
    : []
  
  console.log('🔍 FeatureGrid - Final cardData:', {
    count: cardData.length,
    cards: cardData.map(c => ({ key: c.key, heading: c.Heading?.substring(0, 30) }))
  })

  // Use _componentKey if provided (from BlockRenderer), otherwise fall back to _metadata.key
  const componentKey = _componentKey || _metadata?.key || ''
  
  const sectionClassName = `py-20 ${theme === 'dark' ? 'bg-dark-secondary' : 'bg-phamily-lightGray'}`
  
  return (
    <>
      {/* FeatureGrid */}
      <section 
        ref={ref} 
        className={sectionClassName}
        style={{ position: 'relative' }}
        {...(contextMode === 'edit' && componentKey && { 'data-epi-block-id': componentKey })}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
            }`}
            {...(contextMode === 'edit' && { 'data-epi-edit': 'Heading' })}
          >
            {Heading || 'Our mission'}
          </h2>
          <h3 
            className={`text-3xl md:text-4xl font-bold mb-8 ${
              theme === 'dark' ? 'text-dark-text' : 'text-phamily-blue'
            }`}
            {...(contextMode === 'edit' && { 'data-epi-edit': 'SubHeading' })}
          >
            {SubHeading || 'Your business peace of mind'}
          </h3>
          {Body?.html && (
            <div 
              className={`text-lg leading-relaxed max-w-3xl mx-auto ${
                theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/80'
              }`}
              dangerouslySetInnerHTML={{ __html: Body.html }}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'Body' })}
            />
          )}
        </motion.div>

        {/* Feature Cards */}
        <div className={`grid gap-8 ${
          cardData.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
          cardData.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
          'grid-cols-1 md:grid-cols-3'
        }`}>
          {cardData.map((card, index) => {
            const { key, _metadata, ...cardProps } = card
            return (
              <motion.div
                key={key || index}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <FeatureCard
                  {...cardProps}
                  _metadata={_metadata}
                  isPreview={isPreview}
                  contextMode={contextMode}
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
    </>
  )
}

export default FeatureGrid
