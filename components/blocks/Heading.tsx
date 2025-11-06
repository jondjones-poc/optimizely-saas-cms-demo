'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface HeadingProps {
  Heading?: string
  HeadingSize?: 'h1' | 'h2' | 'h3'
  Alignment?: 'left' | 'center' | 'right' | 'middle'  // Support both 'center' and 'middle'
  _metadata?: {
    key?: string
    displayName?: string
  }
  _gridDisplayName?: string
  _componentKey?: string
  isPreview?: boolean
  contextMode?: string | null
}

const Heading = ({ 
  Heading: initialHeading, 
  HeadingSize = 'h2',
  Alignment = 'left',
  _metadata, 
  _gridDisplayName,
  _componentKey,
  isPreview = false, 
  contextMode = null 
}: HeadingProps) => {
  const { theme } = useTheme()
  const [Heading, setHeading] = useState(initialHeading || '')
  const [headingSize, setHeadingSize] = useState(HeadingSize)
  const [alignment, setAlignment] = useState(Alignment)

  // Update state when props change (for live preview updates)
  useEffect(() => {
    if (initialHeading !== undefined) setHeading(initialHeading)
    if (HeadingSize !== undefined) setHeadingSize(HeadingSize)
    if (Alignment !== undefined) setAlignment(Alignment)
  }, [initialHeading, HeadingSize, Alignment])

  // Debug: Log block info in preview mode
  useEffect(() => {
    if (isPreview && contextMode === 'edit') {
      console.log('🎯 Heading Component - Data received from API (client-side):', {
        'Block Key': _metadata?.key || 'NULL (inline editing will not work)',
        'Context Mode': contextMode,
        'Heading': Heading,
        'HeadingSize': headingSize,
        'Alignment': alignment,
        'Grid Display Name': _gridDisplayName,
        'Full Metadata': _metadata
      })
    }
  }, [isPreview, contextMode, _metadata?.key, Heading, headingSize, alignment, _gridDisplayName, _metadata])

  // Map alignment to text alignment classes
  // Handle both 'center' and 'middle' (CMS may use either)
  const getTextAlignment = () => {
    switch (alignment) {
      case 'right':
        return 'text-right'
      case 'center':
      case 'middle':
        return 'text-center'
      case 'left':
      default:
        return 'text-left'
    }
  }

  if (!Heading) {
    return null
  }

  // Determine which HTML tag to use based on HeadingSize
  const Tag = headingSize === 'h1' ? 'h1' : headingSize === 'h3' ? 'h3' : 'h2'

  return (
    <div 
      className="py-8"
      style={{ position: 'relative' }}
      {...(contextMode === 'edit' && { 'data-epi-edit': 'HeadingSize' })}
      // NOTE: data-epi-block-id is on wrapper div in CMSContent.tsx (matching ContentBlock structure)
    >
      <div className="container mx-auto px-4">
        <Tag
          className={`font-bold text-phamily-gray dark:text-dark-text-secondary ${getTextAlignment()} ${
            headingSize === 'h1' 
              ? 'text-5xl md:text-6xl' 
              : headingSize === 'h3'
              ? 'text-2xl md:text-3xl'
              : 'text-3xl md:text-4xl'
          }`}
          {...(contextMode === 'edit' && { 'data-epi-edit': 'Heading' })}
        >
          {Heading}
        </Tag>
        {contextMode === 'edit' && (
          <div style={{ display: 'none' }} data-epi-edit="Alignment">
            {alignment}
          </div>
        )}
      </div>
    </div>
  )
}

export default Heading

