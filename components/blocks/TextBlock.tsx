'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface TextBlockProps {
  Content?: string
  Position?: 'left' | 'center' | 'right'
  _metadata?: {
    key?: string
    displayName?: string
  }
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const TextBlock = ({ Content: initialContent, Position = 'left', _metadata, _gridDisplayName, isPreview = false, contextMode = null }: TextBlockProps) => {
  const { theme } = useTheme()
  const [Content, setContent] = useState(initialContent || '')
  const [position, setPosition] = useState(Position)

  // Update state when props change (for live preview updates)
  useEffect(() => {
    if (initialContent !== undefined) setContent(initialContent)
    if (Position !== undefined) setPosition(Position)
  }, [initialContent, Position])

  // Debug: Log block info in preview mode - show all data received from API
  useEffect(() => {
    if (isPreview && contextMode === 'edit') {
      console.log('🎯 TextBlock Component - Data received from API (client-side):', {
        'Block Key': _metadata?.key || 'NULL (inline editing will not work)',
        'Context Mode': contextMode,
        'Current Content (state)': Content,
        'Content Length': Content?.length || 0,
        'Initial Content (props)': initialContent,
        'Initial Content Length': initialContent?.length || 0,
        'Content Matches': Content === initialContent,
        'Has Preview Text': Content?.includes('Preview') || initialContent?.includes('Preview'),
        'Position': Position,
        'Grid Display Name': _gridDisplayName,
        'Full Metadata': _metadata,
        'Note': 'If Content shows published value instead of draft, check server logs for version mismatch'
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
      data-epi-block-id={_metadata?.key || undefined}
    >
      <div className="container mx-auto px-4">
        <div className={`max-w-4xl mx-auto ${getTextAlignment()}`}>
          {Content && (
            <div 
              className="text-4xl md:text-5xl font-bold text-phamily-gray dark:text-dark-text-secondary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: Content }}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'Content' })}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default TextBlock

