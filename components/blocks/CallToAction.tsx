'use client'

import { useRef, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

interface LinkData {
  target: string | null
  text: string
  title: string | null
  url: {
    base: string | null
    default: string | null
  }
}

interface CallToActionProps {
  Header?: string
  Links?: LinkData[]
  _metadata?: {
    key?: string
    displayName?: string
  }
  _componentKey?: string // Passed from BlockRenderer for data-epi-block-id
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const CallToAction = ({ 
  Header, 
  Links, 
  _metadata, 
  _gridDisplayName,
  _componentKey,
  isPreview = false, 
  contextMode = null 
}: CallToActionProps) => {
  console.log('CallToAction component called with props:', { Header, Links, _metadata, _gridDisplayName, contextMode, _componentKey })
  const { theme } = useTheme()
  const ref = useRef(null)
  
  // Client-side logging to verify data-epi-edit attributes (similar to Hero)
  useEffect(() => {
    if (contextMode === 'edit') {
      // Check if attributes are actually in the DOM after render
      const checkDOM = () => {
        // The wrapper div in CMSContent has data-epi-block-id, so we need to find it
        const sectionElement = ref.current as HTMLElement | null
        const wrapperElement = sectionElement?.closest('[data-epi-block-id]')
        const blockId = wrapperElement?.getAttribute('data-epi-block-id')
        
        if (blockId && wrapperElement) {
          const headerEl = wrapperElement.querySelector('[data-epi-edit="Header"]')
          
          console.log('🔍 CallToAction DOM Check:', {
            hasWrapper: !!wrapperElement,
            blockId,
            hasHeaderEl: !!headerEl,
            headerElTag: headerEl?.tagName,
            headerText: headerEl?.textContent?.substring(0, 30),
            contextMode,
            componentKey: _componentKey || _metadata?.key
          })
          
          if (!headerEl) {
            console.warn('⚠️ CallToAction - Header element with data-epi-edit not found in DOM!')
          }
        } else {
          console.warn('⚠️ CallToAction - Wrapper element with data-epi-block-id not found!')
        }
      }
      
      // Check immediately and after delays
      checkDOM()
      setTimeout(checkDOM, 100)
      setTimeout(checkDOM, 500)
    }
  }, [contextMode, _componentKey, _metadata?.key])

  // Check if there's no content data
  const hasContent = Header || (Links && Links.length > 0)

  // Use _componentKey if provided (from BlockRenderer), otherwise fall back to _metadata.key
  const componentKey = _componentKey || _metadata?.key || ''

  if (!hasContent) {
    // In preview mode, return null instead of showing error to avoid confusion
    if (isPreview) {
      return null
    }
    console.log('CallToAction: No content available, showing empty state')
    return (
      <section ref={ref} className="py-20 border-4 border-red-500 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">No Call To Action Content</h3>
          <p className="text-gray-600 dark:text-gray-400">Header and Links data not available</p>
        </div>
      </section>
    )
  }

  return (
    <section 
      ref={ref} 
      className={`py-20 ${
        theme === 'dark' ? 'bg-dark-secondary' : 'bg-phamily-lightGray'
      }`}
      style={{ position: 'relative' }}
      // NOTE: data-epi-block-id is on wrapper div in CMSContent.tsx (matching ContentBlock structure)
      // {...(contextMode === 'edit' && componentKey && { 'data-epi-block-id': componentKey })}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center rounded-2xl p-12 ${
            theme === 'dark' ? 'bg-dark-primary' : 'bg-phamily-lightGray'
          }`}
        >
          {Header && (
            <div 
              className={`text-3xl font-bold mb-6 ${
                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
              }`}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'Header' })}
            >
              {Header}
            </div>
          )}
          {Links && Links.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {Links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url.default || '#'}
                  target={link.target || '_self'}
                  className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 btn-hover flex items-center justify-center gap-2 ${
                    index === 0
                      ? `${
                          theme === 'dark'
                            ? 'bg-phamily-blue text-white hover:bg-phamily-lightBlue'
                            : 'bg-phamily-blue text-white hover:bg-phamily-lightBlue'
                        }`
                      : `border-2 border-phamily-blue text-phamily-blue hover:bg-phamily-blue hover:text-white ${
                          theme === 'dark' ? 'text-phamily-blue' : 'text-phamily-blue'
                        }`
                  }`}
                  {...(contextMode === 'edit' && { 'data-epi-edit': `Links[${index}].Text` })}
                >
                  {link.text}
                  <ArrowRight size={20} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default CallToAction
