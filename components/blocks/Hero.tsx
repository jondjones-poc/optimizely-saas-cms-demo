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

  useEffect(() => {
    // If we have a content key, try to fetch the block data
    if (_metadata?.key) {
      const fetchBlockData = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/optimizely/block?key=${_metadata.key}`)
          const result = await response.json()
          
          if (result.success && result.data?.data?._Content?.items?.[0]) {
            const blockData = result.data.data._Content.items[0]
            if (blockData.Heading) setHeading(blockData.Heading)
            if (blockData.Subheading) setSubheading(blockData.Subheading)
            if (blockData.Image) setImageData(blockData.Image)
          }
        } catch (error) {
          console.error('Error fetching Hero block data:', error)
          // Keep fallback content on error
        } finally {
          setIsLoading(false)
        }
      }

      fetchBlockData()
    }
  }, [_metadata?.key])
  
  // Don't render if no background image (mandatory field)
  if (!imageData?.url?.default) {
    return null
  }

  return (
    <>
      {/* Hero */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        {...(contextMode === 'edit' && _metadata?.key && { 'data-epi-block-id': _metadata.key })}
      >
      {/* Background Image - mandatory */}
      <div 
        className="absolute inset-0 z-0"
        {...(contextMode === 'edit' && { 'data-epi-edit': 'Image' })}
      >
        <Image
          src={imageData.url.default}
          alt={Heading || 'Hero background'}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Subtitle */}
          {Subheading && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`text-lg md:text-xl font-medium ${
                theme === 'dark' ? 'text-dark-text/90' : 'text-white/90'
              }`}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'SubHeading' })}
            >
              {Subheading}
            </motion.p>
          )}

          {/* Main Title */}
          {Heading && (
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${
                theme === 'dark' ? 'text-dark-text' : 'text-white'
              }`}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'Heading' })}
            >
              {Heading}
            </motion.h1>
          )}

          {/* Body Content */}
          {Body?.html && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={`text-lg md:text-xl leading-relaxed max-w-4xl mx-auto ${
                theme === 'dark' ? 'text-dark-text/90' : 'text-white/90'
              }`}
              dangerouslySetInnerHTML={{ __html: Body.html }}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'Body' })}
            />
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
      </section>
    </>
  )
}

export default Hero

