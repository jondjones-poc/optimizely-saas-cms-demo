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

const Hero = (props: HeroProps) => {
  // Log immediately when component renders (synchronous, before any hooks)
  console.log('🎬 Hero Component - RENDERING NOW', {
    hasProps: !!props,
    contextMode: props.contextMode,
    blockKey: props._metadata?.key || 'MISSING',
    hasHeading: props.Heading !== undefined,
    hasSubHeading: props.SubHeading !== undefined,
    hasBody: props.Body !== undefined,
    hasImage: props.Image !== undefined,
    hasLinks: props.Links !== undefined
  })
  
  const { 
    Heading: initialHeading, 
    SubHeading: initialSubHeading, 
    Body: initialBody, 
    Image: initialImageData, 
    Links: initialLinks, 
    _metadata, 
    _gridDisplayName, 
    isPreview = false, 
    contextMode = null 
  } = props
  
  const { theme } = useTheme()
  
  // Use props directly for immediate rendering - no state initialization delay
  // State is only updated via useEffect for live preview updates
  const Heading = initialHeading || _gridDisplayName || 'Welcome to Our Platform'
  const Subheading = initialSubHeading || 'Building the future together'
  const Body = initialBody
  const imageData = initialImageData
  const links = initialLinks
  
  // Keep state for live preview updates only
  const [, setHeadingState] = useState(Heading)
  const [, setSubheadingState] = useState(Subheading)
  const [, setBodyState] = useState(Body)
  const [, setImageDataState] = useState(imageData)
  const [, setLinksState] = useState(links)
  const [isLoading, setIsLoading] = useState(false)
  
  // Property names come directly from GraphQL - these are the exact field names
  // Since Hero is a client component, these must be computed synchronously during render
  // to ensure data-epi-edit attributes are present when Optimizely scans the DOM
  // Use prop existence check to determine property names (not .find() which can return null)
  const propertyNames = {
    heading: props.Heading !== undefined ? 'Heading' : null,
    subheading: props.SubHeading !== undefined ? 'SubHeading' : null,
    body: props.Body !== undefined ? 'Body' : null,
    image: props.Image !== undefined ? 'Image' : null,
    links: props.Links !== undefined ? 'Links' : null
  }
  
  // Client-side logging to verify data-epi-edit attributes
  // Always log first to see if component is rendering
  useEffect(() => {
    console.log('🔍 Hero Component - Rendered:', {
      contextMode,
      blockKey: _metadata?.key || 'MISSING',
      hasContextMode: contextMode !== null,
      contextModeValue: contextMode,
      isEditMode: contextMode === 'edit',
      propertyNames,
      propsAvailable: {
        Heading: props.Heading !== undefined,
        SubHeading: props.SubHeading !== undefined,
        Body: props.Body !== undefined,
        Image: props.Image !== undefined,
        Links: props.Links !== undefined
      }
    })
    
    if (contextMode === 'edit') {
      console.log('🔍 Hero Component - Client-side attribute check:', {
        contextMode,
        blockKey: _metadata?.key || 'MISSING',
        propertyNames,
        propsAvailable: {
          Heading: props.Heading !== undefined,
          SubHeading: props.SubHeading !== undefined,
          Body: props.Body !== undefined,
          Image: props.Image !== undefined,
          Links: props.Links !== undefined
        },
        willHaveAttributes: {
          heading: propertyNames.heading !== null && contextMode === 'edit',
          subheading: propertyNames.subheading !== null && contextMode === 'edit',
          body: propertyNames.body !== null && contextMode === 'edit',
          image: propertyNames.image !== null && contextMode === 'edit',
          links: propertyNames.links !== null && contextMode === 'edit'
        }
      })
      
      // Check if attributes are actually in the DOM after render
      // Check immediately and then again after a delay
      const checkDOM = () => {
        const blockElement = document.querySelector(`[data-epi-block-id="${_metadata?.key}"]`)
        if (blockElement) {
          const subheadingEl = blockElement.querySelector('[data-epi-edit="SubHeading"]')
          const headingEl = blockElement.querySelector('[data-epi-edit="Heading"]')
          const bodyEl = blockElement.querySelector('[data-epi-edit="Body"]')
          const imageEl = blockElement.querySelector('[data-epi-edit="Image"]')
          const linksEl = blockElement.querySelector('[data-epi-edit="Links"]')
          
          // Log what we found
          const foundAttributes = {
            subheading: subheadingEl ? { element: subheadingEl.tagName, text: subheadingEl.textContent?.substring(0, 30) } : null,
            heading: headingEl ? { element: headingEl.tagName, text: headingEl.textContent?.substring(0, 30) } : null,
            body: bodyEl ? { element: bodyEl.tagName, hasHtml: !!bodyEl.innerHTML } : null,
            image: imageEl ? { element: imageEl.tagName } : null,
            links: linksEl ? { element: linksEl.tagName } : null
          }
          
          // Get actual attribute values from DOM to verify they match what we expect
          const actualAttributes = {
            subheading: subheadingEl ? subheadingEl.getAttribute('data-epi-edit') : null,
            heading: headingEl ? headingEl.getAttribute('data-epi-edit') : null,
            body: bodyEl ? bodyEl.getAttribute('data-epi-edit') : null,
            image: imageEl ? imageEl.getAttribute('data-epi-edit') : null,
            links: linksEl ? linksEl.getAttribute('data-epi-edit') : null
          }
          
          // Check block element attributes
          const blockElementId = blockElement.id || 'no-id'
          const blockElementDataEpiBlockId = blockElement.getAttribute('data-epi-block-id') || 'MISSING'
          
          // Check if Optimizely has already scanned and found this element
          const epi = (window as any).epi
          const optimizelyInfo = epi ? {
            epiAvailable: true,
            isEditable: typeof epi.isEditable === 'function' ? epi.isEditable() : 'not a function',
            hasReady: typeof epi.ready === 'function' || typeof (epi.ready as any)?.then === 'function'
          } : {
            epiAvailable: false,
            isEditable: 'N/A',
            hasReady: false
          }
          
          console.log('✅ Hero DOM Check - data-epi-edit attributes in DOM:', {
            blockElement: !!blockElement,
            blockElementId: blockElementId, // HTML id attribute (optional - not required for Optimizely)
            blockElementDataEpiBlockId: blockElementDataEpiBlockId, // data-epi-block-id (required for Optimizely)
            blockElementHasId: !!blockElement.id, // Whether HTML id is set (not required)
            blockElementClasses: blockElement.className || 'no-classes',
            subheadingAttr: !!subheadingEl,
            headingAttr: !!headingEl,
            bodyAttr: !!bodyEl,
            imageAttr: !!imageEl,
            linksAttr: !!linksEl,
            allPresent: !!(subheadingEl && headingEl && bodyEl && imageEl && linksEl),
            foundAttributes,
            actualAttributeValues: actualAttributes,
            expectedValues: {
              subheading: 'SubHeading',
              heading: 'Heading',
              body: 'Body',
              image: 'Image',
              links: 'Links'
            },
            matches: {
              subheading: actualAttributes.subheading === 'SubHeading',
              heading: actualAttributes.heading === 'Heading',
              body: actualAttributes.body === 'Body',
              image: actualAttributes.image === 'Image',
              links: actualAttributes.links === 'Links'
            },
            optimizelyInfo
          })
          
          // Note: blockElementId is "no-id" because we don't set an HTML id attribute
          // This is fine - Optimizely uses data-epi-block-id, not HTML id
          
          // Check if Optimizely can see the editable properties
          if (epi && typeof epi.isEditable === 'function' && epi.isEditable()) {
            // Try to find if Optimizely has registered this block
            const allEditableElements = Array.from(document.querySelectorAll('[data-epi-edit]'))
            const heroEditableElements = allEditableElements.filter(el => {
              const blockParent = el.closest('[data-epi-block-id]')
              return blockParent?.getAttribute('data-epi-block-id') === _metadata?.key
            })
            
            console.log('🔍 Hero - Optimizely editable elements check:', {
              totalEditableElements: allEditableElements.length,
              heroEditableElements: heroEditableElements.length,
              heroEditableAttributes: heroEditableElements.map(el => ({
                attribute: el.getAttribute('data-epi-edit'),
                tagName: el.tagName,
                textPreview: el.textContent?.substring(0, 30)
              }))
            })
          }
          
          if (!subheadingEl || !headingEl || !bodyEl) {
            console.warn('⚠️ Hero - Missing data-epi-edit attributes in DOM!', {
              subheadingEl: subheadingEl ? 'present' : 'MISSING',
              headingEl: headingEl ? 'present' : 'MISSING',
              bodyEl: bodyEl ? 'present' : 'MISSING',
              imageEl: imageEl ? 'present' : 'MISSING',
              linksEl: linksEl ? 'present' : 'MISSING',
              blockElementHTML: blockElement.outerHTML.substring(0, 500) // First 500 chars of HTML
            })
          }
        } else {
          console.warn('⚠️ Hero - Block element not found in DOM!', {
            blockKey: _metadata?.key,
            searchedSelector: `[data-epi-block-id="${_metadata?.key}"]`,
            allBlockElements: Array.from(document.querySelectorAll('[data-epi-block-id]')).map(el => ({
              key: el.getAttribute('data-epi-block-id'),
              tagName: el.tagName
            }))
          })
        }
      }
      
      // Check immediately (might not be ready yet)
      checkDOM()
      
      // Check again after a short delay
      setTimeout(checkDOM, 100)
      
      // Check again after a longer delay (in case React hasn't finished rendering)
      setTimeout(checkDOM, 500)
    }
  }, [contextMode, _metadata?.key, propertyNames, props])
  
  // Update state when props change (for live preview updates)
  // Note: We use props directly for rendering, state is only for tracking updates
  useEffect(() => {
    if (initialHeading !== undefined) setHeadingState(initialHeading)
    if (initialSubHeading !== undefined) setSubheadingState(initialSubHeading)
    if (initialBody) setBodyState(initialBody)
    if (initialImageData) setImageDataState(initialImageData)
    if (initialLinks) setLinksState(initialLinks)
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
        {...(contextMode === 'edit' && propertyNames.image && { 'data-epi-edit': propertyNames.image })}
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
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0 }}
          className="space-y-8"
        >
          {/* Subtitle */}
          {Subheading && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0 }}
            >
              <p
                className={`text-lg md:text-xl font-medium ${
                  theme === 'dark' ? 'text-dark-text/90' : 'text-white/90'
                }`}
                {...(contextMode === 'edit' && propertyNames.subheading && { 'data-epi-edit': propertyNames.subheading })}
              >
                {Subheading}
              </p>
            </motion.div>
          )}

          {/* Main Title */}
          {Heading && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0 }}
            >
              <h1
                className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${
                  theme === 'dark' ? 'text-dark-text' : 'text-white'
                }`}
                {...(contextMode === 'edit' && propertyNames.heading && { 'data-epi-edit': propertyNames.heading })}
              >
                {Heading}
              </h1>
            </motion.div>
          )}

          {/* Body Content */}
          {Body?.html && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0 }}
            >
              <div
                className={`text-lg md:text-xl leading-relaxed max-w-4xl mx-auto ${
                  theme === 'dark' ? 'text-dark-text/90' : 'text-white/90'
                }`}
                dangerouslySetInnerHTML={{ __html: Body.html }}
                {...(contextMode === 'edit' && propertyNames.body && { 'data-epi-edit': propertyNames.body })}
              />
            </motion.div>
          )}

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
            {...(contextMode === 'edit' && propertyNames.links && { 'data-epi-edit': propertyNames.links })}
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
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0 }}
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

