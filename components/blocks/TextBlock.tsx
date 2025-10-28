'use client'

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

const TextBlock = ({ Content, Position = 'left', _metadata, _gridDisplayName, isPreview = false, contextMode = null }: TextBlockProps) => {
  const { theme } = useTheme()

  // Map position to text alignment
  const getTextAlignment = () => {
    switch (Position) {
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
    <section className="py-16 bg-white dark:bg-dark-primary">
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

