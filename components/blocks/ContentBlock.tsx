'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface ContentBlockProps {
  Content?: {
    html?: string
  } | string  // Support both XHTML object and legacy string format
  Position?: 'left' | 'center' | 'right'
  _metadata?: {
    key?: string
    displayName?: string
  }
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

// Extract HTML from Content (handle both XHTML object and legacy string format)
const getContentHtml = (content: ContentBlockProps['Content']): string => {
  if (!content) return ''
  if (typeof content === 'string') return content  // Legacy string format
  if (typeof content === 'object' && content.html) return content.html  // XHTML object format
  return ''
}

const ContentBlock = ({ Content: initialContent, Position = 'left', _metadata, _gridDisplayName, isPreview = false, contextMode = null }: ContentBlockProps) => {
  const { theme } = useTheme()
  
  const [Content, setContent] = useState(getContentHtml(initialContent))
  const [position, setPosition] = useState(Position)

  // Update state when props change (for live preview updates)
  useEffect(() => {
    const htmlContent = getContentHtml(initialContent)
    if (htmlContent !== undefined) setContent(htmlContent)
    if (Position !== undefined) setPosition(Position)
  }, [initialContent, Position])

  // Debug: Log block info in preview mode - show all data received from API
  useEffect(() => {
    if (isPreview && contextMode === 'edit') {
      const initialHtml = getContentHtml(initialContent)
      console.log('🎯 ContentBlock Component - Data received from API (client-side):', {
        'Block Key': _metadata?.key || 'NULL (inline editing will not work)',
        'Context Mode': contextMode,
        'Current Content (state)': Content,
        'Content Length': Content?.length || 0,
        'Initial Content (props)': initialContent,
        'Initial Content Type': typeof initialContent,
        'Initial Content HTML': initialHtml,
        'Initial Content HTML Length': initialHtml?.length || 0,
        'Content Matches': Content === initialHtml,
        'Has Preview Text': Content?.includes('Preview') || initialHtml?.includes('Preview'),
        'Position': Position,
        'Grid Display Name': _gridDisplayName,
        'Full Metadata': _metadata,
        'Note': 'Content is now XHTML object with html property. If Content shows published value instead of draft, check server logs for version mismatch'
      })
    }
  }, [isPreview, contextMode, _metadata?.key, Content, initialContent, Position, _gridDisplayName, _metadata])

  // Map position to text alignment
  const getTextAlignment = () => {
    switch (position) {
      case 'right':
        return 'text-right'
      case 'center':
        return 'text-center'
      case 'left':
      default:
        return 'text-left'
    }
  }
  
  return (
    <section 
      className="py-16 bg-white dark:bg-dark-primary"
      // NOTE: data-epi-block-id is now on wrapper div in CMSContent.tsx (matching example structure)
      // {...(contextMode === 'edit' && _metadata?.key && { 'data-epi-block-id': _metadata.key })}
      {...(contextMode === 'edit' && { 'data-epi-edit': 'Position' })}
    >
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto ${getTextAlignment()}`}>
          {Content && (
            <div 
              className="text-base md:text-lg text-phamily-gray dark:text-dark-text-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: Content }}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'Content' })}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default ContentBlock

