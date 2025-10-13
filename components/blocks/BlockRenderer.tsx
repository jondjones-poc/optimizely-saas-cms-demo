'use client'

import Hero from './Hero'
import TextBlock from './TextBlock'
import DemoBlock from './DemoBlock'

interface BlockRendererProps {
  component: any
  isPreview?: boolean
  contextMode?: string | null
}

const BlockRenderer = ({ component, isPreview = false, contextMode = null }: BlockRendererProps) => {
  if (!component || !component._metadata) {
    return null
  }

  const blockType = component._metadata.types?.[0]
  console.log('BlockRenderer: Rendering block type:', blockType, component)

  switch (blockType) {
    case 'Hero':
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'hero-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <Hero {...component} _metadata={component._metadata} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'Text':
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'text-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <TextBlock {...component} _metadata={component._metadata} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'demo_block':
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'demo-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <DemoBlock {...component} _metadata={component._metadata} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    default:
      // Return null for unhandled block types
      console.warn('Unhandled block type:', blockType, component)
      return null
  }
}

export default BlockRenderer

