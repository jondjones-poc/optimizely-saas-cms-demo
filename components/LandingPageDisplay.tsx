'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SEOButton from '@/components/SEOButton'
import { transformLandingPageData } from '@/utils/seoDataTransformers'
import { useTheme } from '@/contexts/ThemeContext'
import Menu from './blocks/Menu'
import Hero from './blocks/Hero'

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
  isPreview?: boolean
  contextMode?: string | null
}

export default function LandingPageDisplay({ data, isPreview = false, contextMode = null }: LandingPageDisplayProps) {
  const transformedData = transformLandingPageData(data)
  // In preview mode, always show HTML view and hide the toggle
  const [displayMode, setDisplayMode] = useState<'wireframe' | 'html'>(isPreview ? 'html' : 'wireframe')
  
  return (
      <div className="min-h-screen bg-gray-50">
      {/* Toggle for Display Mode - Hide in preview mode */}
      {!isPreview && (
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
      )}
      
      <div className="space-y-8">
          {/* TopContentArea - Hero Component */}
          {data.TopContentArea && data.TopContentArea.length > 0 && (
            displayMode === 'wireframe' ? renderWireframeHero(data) : renderHTMLHero(data, isPreview, contextMode)
          )}

          {/* MainContentArea - Multiple Components */}
          {data.MainContentArea && data.MainContentArea.length > 0 && (
            displayMode === 'wireframe' ? renderWireframeMain(data) : renderHTMLMain(data, isPreview, contextMode)
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
          try {
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
            
            return (
              <div key={index} className="border border-red-200 bg-red-50 text-red-700 rounded p-4">
                <p className="text-sm">Unsupported block type in TopContentArea</p>
              </div>
            )
          } catch (err) {
            console.error('Error rendering TopContentArea block', err)
            return (
              <div key={index} className="border border-red-200 bg-red-50 text-red-700 rounded p-4">
                <p className="text-sm">Error rendering block</p>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

function renderHTMLHero(data: any, isPreview: boolean = false, contextMode: string | null = null) {
  const { theme } = useTheme()
  
  return (
    <div className="space-y-6">
      {data.TopContentArea.map((component: any, index: number) => {
        try {
          const componentType = component._metadata?.types?.[0]
          
          if (componentType === 'Carousel') {
            // Only render if component has Cards data
            if (component?.Cards && component.Cards.length > 0) {
              return (
                <div 
                  key={index} 
                  {...(contextMode === 'edit' && component._metadata?.key && { 'data-epi-block-id': component._metadata.key })}
                >
                  <HTMLCarousel component={component} theme={theme} />
                </div>
              )
            }
            // Return null if no cards data
            return null
          }
          
          if (componentType === 'Hero') {
          // Debug: Log the component data structure
          if (isPreview && contextMode === 'edit') {
            console.log('Hero block in renderHTMLHero:', {
              component,
              metadata: component._metadata,
              blockKey: component._metadata?.key,
              hasKey: !!component._metadata?.key
            })
          }
          
          // In preview/edit mode, use the actual Hero component for proper live preview support
          if (isPreview && contextMode === 'edit') {
            const blockKey = component._metadata?.key
            if (!blockKey) {
              console.warn('Hero block missing _metadata.key - cannot enable inline editing', {
                component,
                metadata: component._metadata,
                allKeys: Object.keys(component)
              })
            }
            
            return (
              <div 
                key={blockKey || `hero-${index}`}
                {...(contextMode === 'edit' && blockKey && { 'data-epi-block-id': blockKey })}
              >
                <Hero 
                  {...component} 
                  _metadata={component._metadata} 
                  _gridDisplayName={component._gridDisplayName} 
                  isPreview={isPreview} 
                  contextMode={contextMode} 
                />
              </div>
            )
          }
          
          // Fallback to custom HTML rendering for non-preview mode
          // Ensure we have a valid block key for live preview
          const blockKey = component._metadata?.key
          if (!blockKey && isPreview) {
            console.warn('Hero block missing _metadata.key for live preview:', component._metadata)
          }
          
          return (
            <section 
              key={blockKey || `hero-${index}`}
              {...(contextMode === 'edit' && blockKey && { 'data-epi-block-id': blockKey })}
              className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 rounded-lg overflow-hidden"
            >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                  {component.SubHeading && (
                    <p 
                      className="text-lg mb-4 text-blue-100 font-medium"
                      {...(contextMode === 'edit' && { 'data-epi-edit': 'SubHeading' })}
                    >
                      {component.SubHeading}
                    </p>
                  )}
                  {component.Heading && (
                    <h1 
                      className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
                      {...(contextMode === 'edit' && { 'data-epi-edit': 'Heading' })}
                    >
                      {component.Heading}
                    </h1>
                  )}
                  {component.Body?.html && (
                    <div 
                      className="text-lg mb-8 text-blue-50 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: component.Body.html }}
                      {...(contextMode === 'edit' && { 'data-epi-edit': 'Body' })}
                    />
                  )}
                  {component.Links && component.Links.length > 0 && (
                    <div 
                      className="flex flex-wrap justify-center gap-4"
                      {...(contextMode === 'edit' && { 'data-epi-edit': 'Links' })}
                    >
                      {component.Links.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url?.default || link.url || '#'}
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
        } catch (err) {
          console.error('Error rendering TopContentArea HTML block', err)
          return (
            <div key={index} className="border border-red-200 bg-red-50 text-red-700 rounded p-4">
              <p className="text-sm">Error rendering block</p>
            </div>
          )
        }
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
          try {
            const componentType = component._metadata?.types?.[0]
            
            if (componentType === 'ContentBlock') {
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
                        <span className="font-bold text-gray-700">Image URL:</span>
                        <p className="text-gray-600 mt-1">"{component.Image?.url?.default || 'Not set'}"</p>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-gray-700">Alt Text:</span>
                        <p className="text-gray-600 mt-1">"{component.AltText || 'Not set'}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
            }
            
            if (componentType === 'Menu') {
              console.log('🎯 LANDING PAGE MENU BLOCK - Wireframe Mode')
              console.log('Menu component data:', component)
              console.log('Menu _metadata:', component._metadata)
              console.log('Menu MenuItem:', component.MenuItem)
              console.log('Menu MenuItem type:', typeof component.MenuItem)
              console.log('Menu MenuItem is array:', Array.isArray(component.MenuItem))
              console.log('Menu MenuItem length:', component.MenuItem?.length)
              console.log('Menu all properties:', Object.keys(component))
              console.log('🎯 END LANDING PAGE MENU BLOCK')
              
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
                            <div className="h-8 bg-gray-200 rounded w-full"></div>
                            <div className="flex space-x-2">
                              <div className="h-6 bg-gray-200 rounded w-20"></div>
                              <div className="h-6 bg-gray-200 rounded w-24"></div>
                              <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                            {Array.isArray(component.MenuItem) && component.MenuItem.some((item: any) => Array.isArray(item.SubMenuItems) && item.SubMenuItems.length > 0) && (
                              <div className="ml-4 space-y-1">
                                <div className="h-4 bg-gray-300 rounded w-16"></div>
                                <div className="h-4 bg-gray-300 rounded w-20"></div>
                                <div className="h-4 bg-gray-300 rounded w-14"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-1/4">
                      <h4 className="text-sm font-semibold text-green-700 mb-3">Menu Block Properties</h4>
                      <div className="space-y-2">
                        <div className="text-xs">
                          <span className="font-bold text-gray-700">BlockName:</span>
                          <p className="text-gray-600 mt-1">"{component._metadata?.displayName}"</p>
                        </div>
                        {Array.isArray(component.MenuItem) && component.MenuItem.length > 0 ? (
                          <div className="text-xs">
                            <span className="font-bold text-gray-700">Menu Items ({component.MenuItem.length}):</span>
                            <ul className="mt-2 space-y-1">
                              {component.MenuItem.map((item: any, itemIndex: number) => (
                                <li key={itemIndex} className="space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-gray-700 truncate">{item?.Link?.text || 'Untitled'}</span>
                                    <span className="text-gray-400 text-[11px] truncate">{item?.Link?.url?.default || '#'}</span>
                                  </div>
                                  {Array.isArray(item.SubMenuItems) && item.SubMenuItems.length > 0 && (
                                    <ul className="ml-4 space-y-1">
                                      {item.SubMenuItems.map((subItem: any, subIndex: number) => (
                                        <li key={subIndex} className="flex items-center justify-between gap-2">
                                          <span className="text-gray-600 truncate">- {subItem?.Link?.text || 'Untitled'}</span>
                                          <span className="text-gray-400 text-[10px] truncate">{subItem?.Link?.url?.default || '#'}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-xs">
                            <span className="font-bold text-gray-700">Menu Items:</span>
                            <p className="text-gray-600 mt-1">No items configured</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
            
            return (
              <div key={index} className="border border-red-200 bg-red-50 text-red-700 rounded p-4">
                <p className="text-sm">Unsupported block type in MainContentArea</p>
              </div>
            )
          } catch (err) {
            console.error('Error rendering MainContentArea block', err)
            return (
              <div key={index} className="border border-red-200 bg-red-50 text-red-700 rounded p-4">
                <p className="text-sm">Error rendering block</p>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

function renderHTMLMain(data: any, isPreview: boolean = false, contextMode: string | null = null) {
  return (
    <div className="space-y-8">
      {data.MainContentArea.map((component: any, index: number) => {
        try {
          const componentType = component._metadata?.types?.[0]
          
        if (componentType === 'ContentBlock') {
          return (
            <section 
              key={index} 
              {...(contextMode === 'edit' && component._metadata?.key && { 'data-epi-block-id': component._metadata.key })}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'Content' })}
              className="py-12 px-4"
            >
              <div className="max-w-4xl mx-auto">
                <div className={`prose prose-lg max-w-none ${
                  component.Position === 'center' ? 'text-center' : ''
                }`}>
                  {component.Content && (
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      {component.Content}
                    </h1>
                  )}
                </div>
              </div>
            </section>
          )
        }
          
          if (componentType === 'Image') {
          // Check if image data exists using API structure
          const imageUrl = component.Image?.url?.default
          const altText = component.AltText
          
          if (!imageUrl) {
            // Display a placeholder if no image
            return (
              <section 
                key={index} 
                {...(contextMode === 'edit' && component._metadata?.key && { 'data-epi-block-id': component._metadata.key })}
                className="py-8 px-4"
              >
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
            <section 
              key={index} 
              {...(contextMode === 'edit' && component._metadata?.key && { 'data-epi-block-id': component._metadata.key })}
              className="py-8 px-4"
            >
              <div className="w-full">
                <div className="flex justify-center">
                  <img 
                    src={imageUrl} 
                    alt={altText || ''} 
                    className="w-full h-auto max-w-none"
                  />
                </div>
              </div>
            </section>
          )
          }
          
          if (componentType === 'Menu') {
            // Use the actual Menu component with preview support
            return (
              <div 
                key={index}
                {...(contextMode === 'edit' && component._metadata?.key && { 'data-epi-block-id': component._metadata.key })}
              >
                <Menu 
                  {...component} 
                  _metadata={component._metadata} 
                  _gridDisplayName={component._gridDisplayName} 
                  isPreview={isPreview} 
                  contextMode={contextMode} 
                />
              </div>
            )
          }
          
          // Fallback
          return null
        } catch (err) {
          console.error('Error rendering MainContentArea HTML block', err)
          return (
            <div key={index} className="border border-red-200 bg-red-50 text-red-700 rounded p-4">
              <p className="text-sm">Error rendering block</p>
            </div>
          )
        }
      })}
    </div>
  )
}

// HTML Carousel Component - uses actual CMS data
function HTMLCarousel({ component, theme }: { component: any, theme: string }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Check if component has Cards data from CMS
  const cards = component?.Cards || []
  
  // If no cards, don't render carousel
  if (!cards || cards.length === 0) {
    return null
  }
  
  // Use actual CMS Cards data
  const slides = cards.map((card: any, index: number) => ({
    id: index + 1,
    title: card.title || card.displayName || '',
    subtitle: card.subtitle || '',
    description: card.description || '',
    image: card.image?.url?.default || card.url?.default || '',
    cta: card.cta || 'Learn More',
    url: card.url?.default || '#'
  }))

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
        {slides.map((_: any, index: number) => (
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
    <div className="border-2 border-dashed border-purple-400 rounded-lg p-8 bg-white/50 mx-8">
      <div className="flex gap-6">
        {/* Left area - Wireframe UI (75%) */}
        <div className="w-3/4">
          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 bg-gray-50/50 min-h-[200px]">
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700"><span className="font-bold">BlockName:</span> "SeoSettings"</p>
              </div>

              {/* Existing wireframe form layout */}
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
          </div>
        </div>

        {/* Right area - Properties (25%) */}
        <div className="w-1/4">
          <h4 className="text-sm font-semibold text-purple-700 mb-3">SEO Settings Properties</h4>
          <div className="space-y-2">
            <div className="text-xs">
              <span className="font-bold text-gray-700">BlockName:</span>
              <p className="text-gray-600 mt-1">"SeoSettings"</p>
            </div>
            {data.SeoSettings && Object.entries(data.SeoSettings).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="font-bold text-gray-700">{key}:</span>
                <p className="text-gray-600 mt-1">"{typeof value === 'string' ? value : JSON.stringify(value) || 'Not set'}"</p>
              </div>
            ))}
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

