'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Image from 'next/image'

interface HeroProps {
  Heading?: string
  Subheading?: string
  Image?: {
    url?: string
  }
  _metadata?: {
    key?: string
  }
}

const Hero = ({ Heading: initialHeading, Subheading: initialSubheading, Image: initialImageData, _metadata }: HeroProps) => {
  const { theme } = useTheme()
  const [Heading, setHeading] = useState(initialHeading || 'Welcome to Our Platform')
  const [Subheading, setSubheading] = useState(initialSubheading || 'Building the future together')
  const [imageData, setImageData] = useState(initialImageData)
  const [isLoading, setIsLoading] = useState(false)

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
  
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-accent'
        : 'bg-gradient-to-br from-phamily-blue via-phamily-lightBlue to-phamily-orange'
    }`}>
      {/* Background Image if provided */}
      {imageData?.url && (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageData.url}
            alt={Heading || 'Hero background'}
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 z-0">
        <div className={`absolute top-20 left-20 w-32 h-32 rounded-full animate-float ${
          theme === 'dark' ? 'bg-dark-text' : 'bg-white'
        }`}></div>
        <div className={`absolute top-40 right-32 w-24 h-24 rounded-full animate-float ${
          theme === 'dark' ? 'bg-dark-text' : 'bg-white'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-32 left-40 w-20 h-20 rounded-full animate-float ${
          theme === 'dark' ? 'bg-dark-text' : 'bg-white'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-20 right-20 w-28 h-28 rounded-full animate-float ${
          theme === 'dark' ? 'bg-dark-text' : 'bg-white'
        }`} style={{ animationDelay: '0.5s' }}></div>
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
            >
              {Heading}
            </motion.h1>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
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
  )
}

export default Hero

