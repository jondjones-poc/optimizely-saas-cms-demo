'use client'

import Hero from './Hero'
import TextBlock from './TextBlock'

interface BlockRendererProps {
  component: any
}

const BlockRenderer = ({ component }: BlockRendererProps) => {
  if (!component || !component._metadata) {
    return null
  }

  const blockType = component._metadata.types?.[0]

  switch (blockType) {
    case 'Hero':
      return <Hero {...component} _metadata={component._metadata} />
    case 'Text':
      return <TextBlock {...component} _metadata={component._metadata} />
    default:
      // Return null for unhandled block types
      console.warn('Unhandled block type:', blockType, component)
      return null
  }
}

export default BlockRenderer

