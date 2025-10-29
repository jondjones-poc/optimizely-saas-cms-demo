'use client'

import Hero from './Hero'
import TextBlock from './TextBlock'
import DemoBlock from './DemoBlock'
import FeatureGrid from './FeatureGrid'
import CallToAction from './CallToAction'
import Carousel from './Carousel'
import PromoBlock from './PromoBlock'
import ImageBlock from './Image'
import Menu from './Menu'

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
          <Hero {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'Text':
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'text-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <TextBlock {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'demo_block':
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'demo-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <DemoBlock {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'FeatureGrid':
      console.log('BlockRenderer FeatureGrid component:', component)
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'feature-grid-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <FeatureGrid {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'CallToAction':
    case 'CallToActionOutput':
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'call-to-action-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <CallToAction {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'Carousel':
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'carousel-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <Carousel {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'PromoBlock':
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'promo-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <PromoBlock {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'Image':
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'image-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <ImageBlock {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'Menu':
      console.log('🎯 MENU BLOCK RENDERER - Individual Menu Block Loading')
      console.log('Menu component data:', component)
      console.log('Menu _metadata:', component._metadata)
      console.log('Menu MenuItem:', component.MenuItem)
      console.log('Menu MenuItem type:', typeof component.MenuItem)
      console.log('Menu MenuItem is array:', Array.isArray(component.MenuItem))
      console.log('Menu MenuItem length:', component.MenuItem?.length)
      console.log('Menu full props being passed:', {
        ...component,
        _metadata: component._metadata,
        _gridDisplayName: component._gridDisplayName,
        isPreview,
        contextMode
      })
      console.log('🎯 END MENU BLOCK RENDERER')
      
      return (
        <div 
          data-epi-block-id={component._metadata.key || 'menu-block'}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <Menu {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    default:
      // Return null for unhandled block types
      console.warn('Unhandled block type:', blockType, component)
      return null
  }
}

export default BlockRenderer

