'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Image from 'next/image'

interface HeroProps {
  Heading?: string
  SubHeading?: string
  Body?: {
    html?: string
    json?: any
  }
  Image?: {
    key?: string
    url?: {
      base?: string
      default?: string
    }
  }
  Links?: Array<{
    target?: string
    text?: string
    title?: string
    url?: {
      type?: string
      default?: string
      hierarchical?: string
      internal?: string
      graph?: string
      base?: string
    }
  }>
  _metadata?: {
    key?: string
  }
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const Hero = ({ Heading: initialHeading, SubHeading: initialSubHeading, Body: initialBody, Image: initialImageData, Links: initialLinks, _metadata, _gridDisplayName, isPreview = false, contextMode = null }: HeroProps) => {
  const { theme } = useTheme()
  const [Heading, setHeading] = useState(initialHeading || _gridDisplayName || 'Welcome to Our Platform')
  const [Subheading, setSubheading] = useState(initialSubHeading || 'Building the future together')
  const [Body, setBody] = useState(initialBody)
  const [imageData, setImageData] = useState(initialImageData)
  const [links, setLinks] = useState(initialLinks)
  const [isLoading, setIsLoading] = useState(false)
  
  // Update state when props change (for live preview updates)
  useEffect(() => {
    if (initialHeading !== undefined) setHeading(initialHeading)
    if (initialSubHeading !== undefined) setSubheading(initialSubHeading)
    if (initialBody) setBody(initialBody)
    if (initialImageData) setImageData(initialImageData)
    if (initialLinks) setLinks(initialLinks)
  }, [initialHeading, initialSubHeading, initialBody, initialImageData, initialLinks])
  
  // Debug: Log block info in preview mode
  useEffect(() => {
    if (isPreview && contextMode === 'edit') {
      console.log('🎯 Hero block preview info:', {
        blockKey: _metadata?.key,
        contextMode,
        Heading: Heading,
        Subheading: Subheading,
        hasBody: !!Body?.html,
        hasLinks: !!links?.length,
        initialHeading: initialHeading,
        initialSubHeading: initialSubHeading,
        hasPreviewText: Subheading?.includes('Preview') || initialSubHeading?.includes('Preview')
      })
    }
  }, [isPreview, contextMode, _metadata?.key, Heading, Subheading, Body, links, initialHeading, initialSubHeading])

  // Removed unnecessary block fetch - data is already passed via props
  // This was causing 500 errors and is not needed for inline editing
  
  // Don't render if no background image (mandatory field)
  if (!imageData?.url?.default) {
    return null
  }

  return (
    <div 
      className="relative" 
      style={{ height: '600px', minHeight: '600px', position: 'relative', overflow: 'hidden' }}
      {...(contextMode === 'edit' && _metadata?.key && { 'data-epi-block-id': _metadata.key })}
    >
      {/* Background Image - OUTSIDE the component wrapper, but still needs relative parent */}
      <div 
        className="absolute inset-0 z-0"
        {...(contextMode === 'edit' && { 'data-epi-edit': 'Image' })}
      >
        <Image
          src={imageData.url.default}
          alt={Heading || 'Hero background'}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>

      {/* Component wrapper - only contains editable content, NOT the background */}
      {/* NOTE: data-epi-block-id is now on the outer container to ensure overlay bounds are correct */}
      <div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center h-full flex items-center justify-center"
        style={{ 
          position: 'relative',
          zIndex: 10
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Subtitle */}
          {Subheading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p
                className={`text-lg md:text-xl font-medium ${
                  theme === 'dark' ? 'text-dark-text/90' : 'text-white/90'
                }`}
                {...(contextMode === 'edit' && { 'data-epi-edit': 'SubHeading' })}
              >
                {Subheading}
              </p>
            </motion.div>
          )}

          {/* Main Title */}
          {Heading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h1
                className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${
                  theme === 'dark' ? 'text-dark-text' : 'text-white'
                }`}
                {...(contextMode === 'edit' && { 'data-epi-edit': 'Heading' })}
              >
                {Heading}
              </h1>
            </motion.div>
          )}

          {/* Body Content */}
          {Body?.html && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div
                className={`text-lg md:text-xl leading-relaxed max-w-4xl mx-auto ${
                  theme === 'dark' ? 'text-dark-text/90' : 'text-white/90'
                }`}
                dangerouslySetInnerHTML={{ __html: Body.html }}
                {...(contextMode === 'edit' && { 'data-epi-edit': 'Body' })}
              />
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            {...(contextMode === 'edit' && { 'data-epi-edit': 'Links' })}
          >
            {links && links.length > 0 ? (
              links.map((link, index) => (
                <a
                  key={index}
                  href={link.url?.default || link.url?.hierarchical || '#'}
                  target={link.target || '_self'}
                  className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 btn-hover flex items-center gap-2 ${
                    index === 0
                      ? theme === 'dark'
                        ? 'bg-dark-text text-dark-primary hover:bg-dark-textSecondary'
                        : 'bg-white text-phamily-blue hover:bg-phamily-lightGray'
                      : theme === 'dark'
                        ? 'border-dark-text text-dark-text hover:bg-dark-text hover:text-dark-primary border-2'
                        : 'border-white text-white hover:bg-white hover:text-phamily-blue border-2'
                  }`}
                  {...(contextMode === 'edit' && { 'data-epi-edit': `Links[${index}].Text` })}
                >
                  {link.text || `Button ${index + 1}`}
                  {index === 0 ? <ArrowRight size={20} /> : <Play size={20} />}
                </a>
              ))
            ) : (
              <>
                <button className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 btn-hover flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-dark-text text-dark-primary hover:bg-dark-textSecondary'
                    : 'bg-white text-phamily-blue hover:bg-phamily-lightGray'
                }`}>
                  I am a buyer
                  <ArrowRight size={20} />
                </button>
                <button className={`border-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 btn-hover flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'border-dark-text text-dark-text hover:bg-dark-text hover:text-dark-primary'
                    : 'border-white text-white hover:bg-white hover:text-phamily-blue'
                }`}>
                  I am a seller
                  <Play size={20} />
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-6 h-10 border-2 rounded-full flex justify-center ${
            theme === 'dark' ? 'border-dark-text' : 'border-white'
          }`}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-1 h-3 rounded-full mt-2 ${
              theme === 'dark' ? 'bg-dark-text' : 'bg-white'
            }`}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Hero

