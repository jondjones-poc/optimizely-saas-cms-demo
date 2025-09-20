'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { theme } = useTheme()

  const slides = [
    {
      id: 1,
      title: "Transform Your Business",
      subtitle: "Innovation at Scale",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop",
      cta: "Learn More"
    },
    {
      id: 2,
      title: "Advanced Analytics",
      subtitle: "Data-Driven Decisions",
      description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop",
      cta: "Get Started"
    },
    {
      id: 3,
      title: "Seamless Integration",
      subtitle: "Connect Everything",
      description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=600&fit=crop",
      cta: "Explore"
    },
    {
      id: 4,
      title: "24/7 Support",
      subtitle: "Always Here for You",
      description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop",
      cta: "Contact Us"
    }
  ]

  // Auto-swipe functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="relative h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            {/* Overlay */}
            <div className={`absolute inset-0 ${
              theme === 'dark' 
                ? 'bg-black/60' 
                : 'bg-black/40'
            }`}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex justify-end">
                <div className={`max-w-lg p-8 rounded-2xl backdrop-blur-sm ${
                  theme === 'dark' 
                    ? 'bg-dark-primary/80 border border-dark-border' 
                    : 'bg-white/90'
                }`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <p className={`text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-blue'
                    }`}>
                      {slides[currentSlide].subtitle}
                    </p>
                    <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                      theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                    }`}>
                      {slides[currentSlide].title}
                    </h2>
                    <p className={`text-lg mb-6 leading-relaxed ${
                      theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/80'
                    }`}>
                      {slides[currentSlide].description}
                    </p>
                    <button className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 btn-hover ${
                      theme === 'dark'
                        ? 'bg-dark-text text-dark-primary hover:bg-dark-textSecondary'
                        : 'bg-phamily-blue text-white hover:bg-phamily-lightBlue'
                    }`}>
                      {slides[currentSlide].cta}
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
          theme === 'dark'
            ? 'bg-dark-primary/80 border border-dark-border text-dark-text hover:bg-dark-secondary'
            : 'bg-white/80 text-phamily-darkGray hover:bg-white'
        }`}
      >
        <ChevronLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
          theme === 'dark'
            ? 'bg-dark-primary/80 border border-dark-border text-dark-text hover:bg-dark-secondary'
            : 'bg-white/80 text-phamily-darkGray hover:bg-white'
        }`}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? theme === 'dark'
                  ? 'bg-dark-text'
                  : 'bg-white'
                : theme === 'dark'
                  ? 'bg-dark-text/40'
                  : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
        <motion.div
          className={`h-full ${
            theme === 'dark' ? 'bg-dark-text' : 'bg-white'
          }`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          key={currentSlide}
        />
      </div>
    </section>
  )
}

export default Carousel
