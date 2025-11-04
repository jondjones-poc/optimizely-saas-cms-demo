'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface PromoBlockProps {
  BackgroundStyle?: 'grey' | 'light' | 'dark'
  CTA?: {
    base?: string
    default?: string
  }
  CTAColour?: 'blue' | 'red' | 'black'
  Description?: {
    html?: string
  }
  Image?: {
    base?: string
    default?: string
  }
  Title?: string
  _metadata?: {
    key?: string
    displayName?: string
  }
  _componentKey?: string // Passed from BlockRenderer for data-epi-block-id
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const PromoBlock = ({
  BackgroundStyle = 'light',
  CTA,
  CTAColour = 'blue',
  Description,
  Image,
  Title,
  _metadata,
  _gridDisplayName,
  _componentKey,
  isPreview = false,
  contextMode = null
}: PromoBlockProps) => {
  const { theme } = useTheme()

  // Map background styles to glass/frosted CSS colors
  const getBackgroundColor = () => {
    switch (BackgroundStyle) {
      case 'grey':
        return theme === 'dark' ? 'bg-gray-900/70 backdrop-blur-md' : 'bg-gray-200/70 backdrop-blur-md'
      case 'dark':
        return theme === 'dark' ? 'bg-gray-950/80 backdrop-blur-md' : 'bg-gray-900/70 backdrop-blur-md'
      case 'light':
      default:
        return theme === 'dark' ? 'bg-white/10 backdrop-blur-md' : 'bg-white/80 backdrop-blur-md'
    }
  }

  // Map CTA colors to CSS classes
  const getCTAColor = () => {
    switch (CTAColour) {
      case 'red':
        return 'bg-red-600 hover:bg-red-700'
      case 'black':
        return 'bg-black hover:bg-gray-900'
      case 'blue':
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const getTextColor = () => {
    switch (BackgroundStyle) {
      case 'dark':
        return theme === 'dark' ? 'text-white' : 'text-white'
      case 'grey':
      case 'light':
      default:
        return theme === 'dark' ? 'text-dark-text' : 'text-gray-900'
    }
  }

  const getDescriptionColor = () => {
    switch (BackgroundStyle) {
      case 'dark':
        return theme === 'dark' ? 'text-gray-300' : 'text-gray-300'
      case 'grey':
      case 'light':
      default:
        return theme === 'dark' ? 'text-dark-textSecondary' : 'text-gray-600'
    }
  }

  // Use _componentKey if provided (from BlockRenderer), otherwise fall back to _metadata.key
  const componentKey = _componentKey || _metadata?.key || ''
  
  return (
    <>
      {/* PromoBlock */}
      <section 
        className={`py-16 ${getBackgroundColor()}`}
        {...(contextMode === 'edit' && componentKey && { 'data-epi-block-id': componentKey })}
        {...(contextMode === 'edit' && { 'data-epi-edit': 'BackgroundStyle' })}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left side: Title, Description, and CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {Title && (
              <h2 
                className={`text-3xl md:text-4xl font-bold ${getTextColor()}`}
                {...(contextMode === 'edit' && { 'data-epi-edit': 'Title' })}
              >
                {Title}
              </h2>
            )}
            
            {Description?.html && (
              <div 
                className={`text-lg leading-relaxed ${getDescriptionColor()}`}
                dangerouslySetInnerHTML={{ __html: Description.html }}
                {...(contextMode === 'edit' && { 'data-epi-edit': 'Description' })}
              />
            )}
            
            {CTA?.default && (
              <a
                href={CTA.default}
                className={`inline-block px-8 py-3 text-white rounded-lg font-medium transition-all duration-200 ${getCTAColor()}`}
                {...(contextMode === 'edit' && { 'data-epi-edit': 'CTA' })}
              >
                {CTA.default.split('/').pop() || 'Learn More'}
              </a>
            )}
          </motion.div>

          {/* Right side: Image */}
          {Image?.default && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
              {...(contextMode === 'edit' && { 'data-epi-edit': 'Image' })}
            >
              <img
                src={Image.default}
                alt={Title || 'Promo block image'}
                className="max-w-full max-h-[300px] h-auto w-auto rounded-lg shadow-lg object-contain"
              />
            </motion.div>
          )}
          </div>
        </div>
      </section>
    </>
  )
}

export default PromoBlock

