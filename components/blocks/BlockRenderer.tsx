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
      // Hero component applies data-epi-block-id to its root element, so no wrapper needed
      return (
        <Hero {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
      )
    case 'Text':
      // TextBlock component applies data-epi-block-id to its root element, so no wrapper needed
      return (
        <TextBlock {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
      )
    case 'demo_block':
      // DemoBlock component applies data-epi-block-id to its root element, so no wrapper needed
      return (
        <DemoBlock 
          {...component} 
          _metadata={component._metadata} 
          _gridDisplayName={component._gridDisplayName} 
          isPreview={isPreview} 
          contextMode={contextMode}
          _componentKey={component._metadata?.key}
        />
      )
    case 'FeatureGrid':
      // FeatureGrid component applies data-epi-block-id to its root element, so no wrapper needed
      return (
        <FeatureGrid 
          {...component} 
          _metadata={component._metadata} 
          _gridDisplayName={component._gridDisplayName} 
          isPreview={isPreview} 
          contextMode={contextMode}
          _componentKey={component._metadata?.key}
        />
      )
    case 'CallToAction':
    case 'CallToActionOutput':
      // CallToAction component applies data-epi-block-id to its root element, so no wrapper needed
      return (
        <CallToAction 
          {...component} 
          _metadata={component._metadata} 
          _gridDisplayName={component._gridDisplayName} 
          isPreview={isPreview} 
          contextMode={contextMode}
          _componentKey={component._metadata?.key}
        />
      )
    case 'Carousel':
      return (
        <div 
          {...(contextMode === 'edit' && component._metadata?.key && { 'data-epi-block-id': component._metadata.key })}
          className={contextMode === 'edit' ? 'relative' : ''}
        >
          <Carousel {...component} _metadata={component._metadata} _gridDisplayName={component._gridDisplayName} isPreview={isPreview} contextMode={contextMode} />
        </div>
      )
    case 'PromoBlock':
      // PromoBlock component applies data-epi-block-id to its root element, so no wrapper needed
      return (
        <PromoBlock 
          {...component} 
          _metadata={component._metadata} 
          _gridDisplayName={component._gridDisplayName} 
          isPreview={isPreview} 
          contextMode={contextMode}
          _componentKey={component._metadata?.key}
        />
      )
    case 'Image':
      // ImageBlock component applies data-epi-block-id to its root element, so no wrapper needed
      return (
        <ImageBlock 
          {...component} 
          _metadata={component._metadata} 
          _gridDisplayName={component._gridDisplayName} 
          isPreview={isPreview} 
          contextMode={contextMode}
          _componentKey={component._metadata?.key}
        />
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
          {...(contextMode === 'edit' && component._metadata?.key && { 'data-epi-block-id': component._metadata.key })}
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

