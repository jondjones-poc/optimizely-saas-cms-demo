'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface TextBlockProps {
  MainBody?: {
    html: string
  }
  _metadata?: {
    key?: string
    displayName?: string
  }
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const TextBlock = ({ MainBody, _metadata, _gridDisplayName, isPreview = false, contextMode = null }: TextBlockProps) => {
  const { theme } = useTheme()

  // For inline components (key: null), we don't fetch additional content
  // They should only display the grid displayName as the heading
  
  return (
    <section className="py-16 bg-white dark:bg-dark-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {_gridDisplayName && (
            <h2 
              className="text-3xl md:text-4xl font-bold text-phamily-darkGray dark:text-dark-text mb-6"
              {...(contextMode === 'edit' && { 'data-epi-edit': 'displayName' })}
            >
              {_gridDisplayName}
            </h2>
          )}
          {MainBody?.html && (
            <div 
              className="text-lg text-phamily-gray dark:text-dark-text-secondary leading-relaxed prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: MainBody.html }}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'MainBody' })}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default TextBlock

