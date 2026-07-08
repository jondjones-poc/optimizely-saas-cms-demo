'use client'

/**
 * CMS CAROUSEL BLOCK — Renders Carousel blocks from Optimizely Graph.
 * Registered in BlockRenderer.tsx. NOT the same as components/Carousel.tsx (static demo).
 *
 * Cards are inlined server-side (see processCarouselCardsServerSide in fetchPreviewContent.ts).
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SlideData {
  key: string
  title: string
  image: string
  cta: string
  ctaUrl: string
}

interface CarouselCard {
  key: string
  Title?: string
  CTAText?: string
  BackgroundImage?: {
    Image?: {
      url?: {
        default?: string | null
      }
    }
  }
  Link?: {
    default?: string | null
  }
  _metadata?: {
    key?: string
    displayName?: string
  }
  url?: {
    default?: string | null
  }
}

interface CarouselProps {
  Cards?: CarouselCard[]
  _metadata?: {
    key?: string
    displayName?: string
  }
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

function mapCardToSlide(card: CarouselCard): SlideData | null {
  const image = card.BackgroundImage?.Image?.url?.default
  if (!image) {
    return null
  }

  return {
    key: card.key,
    title: card.Title || card._metadata?.displayName || '',
    image,
    cta: card.CTAText || 'Learn More',
    ctaUrl: card.Link?.default || '#',
  }
}

const Carousel = ({
  Cards,
  contextMode = null,
}: CarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = useMemo(
    () => (Cards || []).map(mapCardToSlide).filter((slide): slide is SlideData => slide !== null),
    [Cards]
  )

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  if (slides.length === 0) {
    return null
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
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-phamily-darkGray">
                      {slides[currentSlide].title}
                    </h2>
                    <a
                      href={slides[currentSlide].ctaUrl}
                      className="inline-block px-6 py-3 rounded-full font-semibold transition-all duration-300 btn-hover bg-phamily-blue text-white hover:bg-phamily-lightBlue"
                    >
                      {slides[currentSlide].cta}
                    </a>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 bg-white/80 text-phamily-darkGray hover:bg-white"
        {...(contextMode === 'edit' && { 'data-epi-edit': 'Cards' })}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 bg-white/80 text-phamily-darkGray hover:bg-white"
        {...(contextMode === 'edit' && { 'data-epi-edit': 'Cards' })}
      >
        <ChevronRight size={24} />
      </button>

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
