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
}

const TextBlock = ({ MainBody, _metadata }: TextBlockProps) => {
  const { theme } = useTheme()
  
  return (
    <section className="py-16 bg-white dark:bg-dark-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {_metadata?.displayName && (
            <h2 className="text-3xl md:text-4xl font-bold text-phamily-darkGray dark:text-dark-text mb-6">
              {_metadata.displayName}
            </h2>
          )}
          {MainBody?.html && (
            <div 
              className="text-lg text-phamily-gray dark:text-dark-text-secondary leading-relaxed prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: MainBody.html }}
            />
          )}
          {!MainBody?.html && (
            <p className="text-phamily-gray dark:text-dark-text-secondary">
              No content available
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default TextBlock

