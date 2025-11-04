'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface SlideData {
  key: string
  title: string
  subtitle: string
  description: string
  image: string
  cta: string
  ctaUrl?: string
}

interface CarouselProps {
  Slides?: Array<{
    key: string
    url: {
      base: string | null
      default: string | null
      graph: string | null
      hierarchical: string | null
      internal: string | null
      type: string | null
    }
  }>
  Cards?: Array<{
    key: string
    url: {
      base: string | null
      default: string | null
      hierarchical: string | null
      internal: string | null
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

const Carousel = ({ Slides, Cards, _metadata, _gridDisplayName, isPreview = false, contextMode = null }: CarouselProps) => {
  console.log('Carousel component called with props:', { Slides, _metadata, _gridDisplayName })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<SlideData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { theme } = useTheme()

  // Fetch slide data from CMS
  useEffect(() => {
    const fetchSlideData = async () => {
      console.log('Fetching slide data for Carousel')
      setIsLoading(true)
      try {
        // Query SlideItems using _Content with type filter (correct Optimizely Graph syntax)
        const query = `
          query GetSlideItems {
            _Content(
              where: {
                _metadata: {
                  types: {
                    in: ["SlideItem"]
                  }
                }
              }
              limit: 10
            ) {
              items {
                _metadata {
                  key
                  displayName
                  types
                }
                ... on SlideItem {
                  Title
                  BackgroundImage {
                    Image {
                      url {
                        base
                        default
                        graph
                        hierarchical
                      }
                    }
                  }
                  Link {
                    base
                    default
                    graph
                    hierarchical
                  }
                  CTAText
                }
              }
            }
          }
        `

        // In preview mode, use preview token instead of SDK key
        let headers: HeadersInit = { 'Content-Type': 'application/json' }
        let apiUrl = 'https://cg.optimizely.com/content/v2'
        
        // Check if we're in preview mode (check URL for preview_token)
        const urlParams = new URLSearchParams(window.location.search)
        const previewToken = urlParams.get('preview_token')
        
        if (previewToken) {
          // Use preview token for draft content
          headers['Authorization'] = `Bearer ${previewToken}`
          apiUrl = `${apiUrl}?t=${Date.now()}` // Add cache-busting
        } else {
          // Use SDK key for published content
          apiUrl = `${apiUrl}?auth=${process.env.NEXT_PUBLIC_SDK_KEY}`
        }
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ query })
        })

        const result = await response.json()
        console.log('SlideItems fetch result:', result)
        
        // Check for GraphQL errors
        if (result.errors) {
          console.error('Carousel GraphQL errors:', JSON.stringify(result.errors, null, 2))
          console.error('Carousel GraphQL error details:', {
            errorCount: result.errors.length,
            firstError: result.errors[0],
            message: result.errors[0]?.message,
            locations: result.errors[0]?.locations,
            path: result.errors[0]?.path
          })
        }
        
        // Updated path: _Content.items instead of SlideItem.items
        if (result.data?._Content?.items && result.data._Content.items.length > 0) {
          const slides = result.data._Content.items.map((slideData: any) => ({
            key: slideData._metadata?.key,
            title: slideData.Title || 'Default Title',
            subtitle: 'Default Subtitle', // SlideItem doesn't have subtitle
            description: 'Default description', // SlideItem doesn't have description
            image: slideData.BackgroundImage?.Image?.url?.default || 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop',
            cta: slideData.CTAText || 'Learn More',
            ctaUrl: slideData.Link?.default || '#'
          }))
          console.log('Carousel: Found slides:', slides.length, slides)
          setSlides(slides)
        } else {
          console.log('Carousel: No slide data found in CMS', {
            hasData: !!result.data,
            hasContent: !!result.data?._Content,
            itemsLength: result.data?._Content?.items?.length || 0
          })
          setSlides([])
        }
      } catch (error) {
        console.error('Error fetching slide data:', error)
        setSlides([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlideData()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  if (isLoading) {
    return (
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phamily-blue mx-auto"></div>
            <p className="mt-4 text-phamily-gray dark:text-dark-text-secondary">Loading carousel...</p>
          </div>
        </div>
      </section>
    )
  }

  if (slides.length === 0) {
    console.log('Carousel: No slides available, showing empty state')
    return (
      <section className="relative h-[600px] overflow-hidden border-4 border-red-500 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Empty Carousel</h3>
          <p className="text-gray-600 dark:text-gray-400">No slide data available</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex justify-end">
                <div className="max-w-lg p-8 rounded-2xl backdrop-blur-sm bg-white/90">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-sm font-medium mb-2 text-phamily-blue">{slides[currentSlide].subtitle}</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-phamily-darkGray">
                      {slides[currentSlide].title}
                    </h2>
                    <p className="text-lg mb-6 leading-relaxed text-phamily-darkGray/80">
                      {slides[currentSlide].description}
                    </p>
                    <button className="px-6 py-3 rounded-full font-semibold transition-all duration-300 btn-hover bg-phamily-blue text-white hover:bg-phamily-lightBlue">
                      {slides[currentSlide].cta}
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 bg-white/80 text-phamily-darkGray hover:bg-white"
        {...(contextMode === 'edit' && { 'data-epi-edit': 'Slides' })}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 bg-white/80 text-phamily-darkGray hover:bg-white"
        {...(contextMode === 'edit' && { 'data-epi-edit': 'Slides' })}
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
        <motion.div
          className="h-full bg-white"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          key={currentSlide}
        />
      </div>
    </section>
  )
}

export default Carousel
