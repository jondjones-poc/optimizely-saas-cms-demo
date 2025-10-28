'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SEOButton from '@/components/SEOButton'
import { transformLandingPageData } from '@/utils/seoDataTransformers'
import { useTheme } from '@/contexts/ThemeContext'

interface PageData {
  _metadata: {
    key: string
    displayName: string
    types: string[]
    url: {
      default: string
    }
  }
  Heading?: string
  Body?: {
    html: string
    json: any
  }
  TopContentArea?: any[]
  MainContentArea?: any[]
  SeoSettings?: any
  [key: string]: any
}

interface LandingPageDisplayProps {
  data: PageData
}

export default function LandingPageDisplay({ data }: LandingPageDisplayProps) {
  const transformedData = transformLandingPageData(data)
  const [displayMode, setDisplayMode] = useState<'wireframe' | 'html'>('wireframe')
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toggle for Display Mode */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-4">
              <div className="relative inline-flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setDisplayMode('wireframe')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    displayMode === 'wireframe'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Wireframe
                </button>
                <button
                  onClick={() => setDisplayMode('html')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    displayMode === 'html'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  HTML View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
          {/* TopContentArea - Hero Component */}
          {data.TopContentArea && data.TopContentArea.length > 0 && (
            displayMode === 'wireframe' ? renderWireframeHero(data) : renderHTMLHero(data)
          )}

          {/* MainContentArea - Multiple Components */}
          {data.MainContentArea && data.MainContentArea.length > 0 && (
            displayMode === 'wireframe' ? renderWireframeMain(data) : renderHTMLMain(data)
          )}

          {/* SEO Settings Display - Only show in wireframe mode */}
          {displayMode === 'wireframe' && data.SeoSettings && renderSeoSettings(data)}

          {/* Page Metadata Display - Only show in wireframe mode */}
          {displayMode === 'wireframe' && renderPageMetadata(data)}
      </div>
      
      {/* SEO Button for Landing Page */}
      <SEOButton 
        seoData={transformedData.seoData}
        pageMetadata={transformedData.pageMetadata}
        cmsBlocks={transformedData.cmsBlocks}
      />
    </div>
  )
}

function renderWireframeHero(data: any) {
  return (
    <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 bg-blue-50/30 mx-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-blue-700">TopContentArea</h2>
        <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
          {data.TopContentArea.length} blocks
        </span>
      </div>
      
      {/* Render all blocks in TopContentArea */}
      <div className="space-y-6">
        {data.TopContentArea.map((component: any, index: number) => {
          const componentType = component._metadata?.types?.[0]
          
          if (componentType === 'Hero') {
            return (
              <div key={index} className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-white/50">
                <div className="flex gap-6">
                  <div className="w-3/4">
                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/50 min-h-[200px]">
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            <span className="font-bold">BlockName:</span> "{component._metadata?.displayName}"
                          </p>
                        </div>
                        <div className="w-full">
                          <div className="flex gap-4 items-start">
                            <div className="w-48 h-32 bg-gray-200 flex items-center justify-center">
                              <div className="text-gray-500 text-xs">Hero Image</div>
                            </div>
                            <div className="flex-1">
                              <div className="h-20 p-2">
                                <div className="space-y-2">
                                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                                </div>
                              </div>
                              <div className="mt-3 flex justify-center">
                                <div className="h-8 bg-gray-200 rounded w-32 flex items-center justify-center">
                                  <div className="text-gray-500 text-xs">CTA Button</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-1/4">
                    <h4 className="text-sm font-semibold text-blue-700 mb-3">Hero Block Properties</h4>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-bold text-gray-700">BlockName:</span>
                        <p className="text-gray-600 mt-1">"{component._metadata?.displayName}"</p>
                      </div>
                      {component.Heading && (
                        <div className="text-xs">
                          <span className="font-bold text-gray-700">Heading:</span>
                          <p className="text-gray-600 mt-1">"{component.Heading}"</p>
                        </div>
                      )}
                      {component.SubHeading && (
                        <div className="text-xs">
                          <span className="font-bold text-gray-700">SubHeading:</span>
                          <p className="text-gray-600 mt-1">"{component.SubHeading}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          
          if (componentType === 'Carousel') {
            return (
              <div key={index} className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-white/50">
                <div className="flex gap-6">
                  <div className="w-3/4">
                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/50 min-h-[400px]">
                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            <span className="font-bold">BlockName:</span> "{component._metadata?.displayName}"
                          </p>
                        </div>
                        <div className="w-full h-full">
                          <div className="bg-gray-200 rounded h-64 flex items-center justify-center">
                            <div className="text-gray-500 text-xs">Carousel Slides</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-1/4">
                    <h4 className="text-sm font-semibold text-blue-700 mb-3">Carousel Block Properties</h4>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-bold text-gray-700">BlockName:</span>
                        <p className="text-gray-600 mt-1">"{component._metadata?.displayName}"</p>
                      </div>
                      {component.Cards && component.Cards.length > 0 && (
                        <div className="text-xs">
                          <span className="font-bold text-gray-700">Cards:</span>
                          <p className="text-gray-600 mt-1">{component.Cards.length} items</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          
          return null
        })}
      </div>
    </div>
  )
}

function renderHTMLHero(data: any) {
  const { theme } = useTheme()
  
  return (
    <div className="space-y-6">
      {data.TopContentArea.map((component: any, index: number) => {
        const componentType = component._metadata?.types?.[0]
        
        if (componentType === 'Carousel') {
          return <HTMLCarousel key={index} component={component} theme={theme} />
        }
        
        if (componentType === 'Hero') {
          return (
            <section key={index} className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 rounded-lg overflow-hidden">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                  {component.SubHeading && (
                    <p className="text-lg mb-4 text-blue-100 font-medium">
                      {component.SubHeading}
                    </p>
                  )}
                  {component.Heading && (
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                      {component.Heading}
                    </h1>
                  )}
                  {component.Body?.html && (
                    <div 
                      className="text-lg mb-8 text-blue-50 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: component.Body.html }}
                    />
                  )}
                  {component.Links && component.Links.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-4">
                      {component.Links.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url || '#'}
                          className="px-8 py-3 bg-white text-blue-700 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg"
                        >
                          {link.text || link.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {component.Image?.url?.default && (
                <div className="absolute inset-0 opacity-20">
                  <img 
                    src={component.Image.url.default} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </section>
          )
        }
        
        return null
      })}
    </div>
  )
}

function renderWireframeMain(data: any) {
  return (
    <div className="border-2 border-dashed border-green-400 rounded-lg p-6 bg-green-50/30 mx-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-green-700">
          MainContentArea
        </h2>
        <span className="text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
          {data.MainContentArea.length} components
        </span>
      </div>
      
      <div className="space-y-6">
        {data.MainContentArea.map((component: any, index: number) => {
          const componentType = component._metadata?.types?.[0]
          
          if (componentType === 'Text') {
            return (
              <div key={index} className="border-2 border-dashed border-green-300 rounded-lg p-8 bg-white/50">
                <div className="flex gap-6">
                  <div className="w-3/4">
                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/50 min-h-[200px]">
                      <div className="space-y-3">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700"><span className="font-bold">BlockName:</span> "{component._metadata?.displayName}"</p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-1/4">
                    <h4 className="text-sm font-semibold text-green-700 mb-3">Text Block Properties</h4>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-bold text-gray-700">BlockName:</span>
                        <p className="text-gray-600 mt-1">"{component._metadata?.displayName}"</p>
                      </div>
                      {component.Content && (
                        <div className="text-xs">
                          <span className="font-bold text-gray-700">Content:</span>
                          <p className="text-gray-600 mt-1">"{component.Content}"</p>
                        </div>
                      )}
                      {component.Position && (
                        <div className="text-xs">
                          <span className="font-bold text-gray-700">Position:</span>
                          <p className="text-gray-600 mt-1">"{component.Position}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          
          if (componentType === 'Image') {
            return (
              <div key={index} className="border-2 border-dashed border-purple-300 rounded-lg p-8 bg-white/50">
                <div className="flex gap-6">
                  <div className="w-3/4">
                    <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/50 min-h-[200px]">
                      <div className="space-y-3">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700"><span className="font-bold">BlockName:</span> "{component._metadata?.displayName}"</p>
                        </div>
                        <div className="flex justify-center">
                          <div className="h-24 w-4/5 bg-gray-200 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <div className="text-gray-400 text-sm">Image Placeholder</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-1/4">
                    <h4 className="text-sm font-semibold text-purple-700 mb-3">Image Block Properties</h4>
                    <div className="space-y-2">
                      <div className="text-xs">
                        <span className="font-bold text-gray-700">BlockName:</span>
                        <p className="text-gray-600 mt-1">"{component._metadata?.displayName}"</p>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-gray-700">Image:</span>
                        <p className="text-gray-600 mt-1">(not loaded)</p>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-gray-700">Caption:</span>
                        <p className="text-gray-600 mt-1">(not loaded)</p>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-gray-700">Alignment:</span>
                        <p className="text-gray-600 mt-1">(not loaded)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
          
          return null
        })}
      </div>
    </div>
  )
}

function renderHTMLMain(data: any) {
  return (
    <div className="space-y-8">
      {data.MainContentArea.map((component: any, index: number) => {
        const componentType = component._metadata?.types?.[0]
        
        if (componentType === 'Text') {
          return (
            <section key={index} className="py-12 px-4">
              <div className="max-w-4xl mx-auto">
                <div className={`prose prose-lg max-w-none ${
                  component.Position === 'center' ? 'text-center' : ''
                }`}>
                  {component.Content && (
                    <div className="text-lg text-gray-700 leading-relaxed">
                      {component.Content}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        }
        
        if (componentType === 'Image') {
          // Check if image data exists
          const hasImageUrl = component.Image?.url?.default
          
          if (!hasImageUrl) {
            // Display a placeholder if no image
            return (
              <section key={index} className="py-8 px-4">
                <div className="max-w-6xl mx-auto">
                  <div className="flex justify-center">
                    <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-gray-400 text-sm">Image placeholder for: {component._metadata?.displayName}</p>
                    </div>
                  </div>
                </div>
              </section>
            )
          }
          
          return (
            <section key={index} className="py-8 px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-center">
                  <img 
                    src={component.Image.url.default} 
                    alt={component.Image.alt || 'Image'} 
                    className="rounded-lg shadow-lg max-w-full h-auto"
                  />
                </div>
                {component.Image.alt && (
                  <p className="text-center text-gray-600 text-sm mt-4">
                    {component.Image.alt}
                  </p>
                )}
              </div>
            </section>
          )
        }
        
        // Fallback
        return null
      })}
    </div>
  )
}

// HTML Carousel Component - copied from homepage Carousel
function HTMLCarousel({ component, theme }: { component: any, theme: string }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Using hardcoded slides like the homepage carousel
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

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
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className={`absolute inset-0 ${
              theme === 'dark' ? 'bg-black/60' : 'bg-black/40'
            }`}></div>
          </div>

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

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? theme === 'dark' ? 'bg-dark-text' : 'bg-white'
                : theme === 'dark' ? 'bg-dark-text/40' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
        <motion.div
          className={`h-full ${theme === 'dark' ? 'bg-dark-text' : 'bg-white'}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          key={currentSlide}
        />
      </div>
    </section>
  )
}

function renderSeoSettings(data: any) {
  return (
    <div className="border-2 border-dashed border-purple-400 rounded-lg p-6 bg-purple-50/30 mx-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-purple-700">
          SeoSettings
        </h2>
        <span className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
          SEO Configuration
        </span>
      </div>
      
      <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 bg-white/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Meta Title:</p>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Meta Description:</p>
            <div className="h-6 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Graph Type:</p>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Indexing:</p>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderPageMetadata(data: any) {
  return (
    <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/30 mx-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Page Metadata
        </h2>
        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
          System Info
        </span>
      </div>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Page Types:</p>
            <p className="text-gray-600">{data._metadata.types?.join(', ')}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">URL:</p>
            <p className="text-gray-600">{data._metadata.url?.default}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Status:</p>
            <p className="text-gray-600">{(data._metadata as any).status || 'Unknown'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Published:</p>
            <p className="text-gray-600">{new Date((data._metadata as any).published).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

