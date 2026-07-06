'use client'

/**
 * BLOCK RENDERER — Maps Optimizely block type names to React components.
 *
 * Each block from the CMS has _metadata.types[0] set to its content type name
 * (e.g. "Hero", "Heading", "FeatureGrid"). This file is a simple switch:
 * read the type name → render the matching component file.
 *
 * TO ADD A NEW BLOCK (homepage / BlankExperience):
 *   1. Add GraphQL fields in app/api/optimizely/homepage/route.ts
 *   2. Also add to lib/optimizely/fetchPreviewContent.ts (for live preview)
 *   3. Create components/blocks/YourBlock.tsx
 *   4. Register in BlockRenderer.tsx — case 'YourBlockType':
 *
 * For LandingPage blocks, also edit app/api/optimizely/page/route.ts and
 * LandingPageDisplay.tsx — see components/blocks/README.md
 */

import Hero from './Hero'
import ContentBlock from './ContentBlock'
import DemoBlock from './DemoBlock'
import FeatureGrid from './FeatureGrid'
import CallToAction from './CallToAction'
import Carousel from './Carousel'
import PromoBlock from './PromoBlock'
import ImageBlock from './Image'
import Menu from './Menu'
import Heading from './Heading'
import Divider from './Divider'

interface BlockRendererProps {
  component: any
  isPreview?: boolean
  contextMode?: string | null
  cmsDemo?: string | null
}

const BlockRenderer = ({
  component,
  isPreview = false,
  contextMode = null,
  cmsDemo = null,
}: BlockRendererProps) => {
  if (!component || !component._metadata) {
    return null
  }

  // e.g. "Hero", "Heading" — must match Optimizely content type API name
  const blockType = component._metadata.types?.[0]

  switch (blockType) {
    case 'Hero':
      return (
        <Hero
          {...component}
          _metadata={component._metadata}
          _gridDisplayName={component._gridDisplayName}
          isPreview={isPreview}
          contextMode={contextMode}
        />
      )
    case 'ContentBlock':
      return (
        <ContentBlock
          {...component}
          _metadata={component._metadata}
          _gridDisplayName={component._gridDisplayName}
          isPreview={isPreview}
          contextMode={contextMode}
        />
      )
    case 'Heading':
      return (
        <Heading
          {...component}
          _metadata={component._metadata}
          _gridDisplayName={component._gridDisplayName}
          isPreview={isPreview}
          contextMode={contextMode}
          _componentKey={component._metadata?.key}
        />
      )
    case 'Divider':
      return (
        <Divider
          {...component}
          _metadata={component._metadata}
          _gridDisplayName={component._gridDisplayName}
          isPreview={isPreview}
          contextMode={contextMode}
          _componentKey={component._metadata?.key}
        />
      )
    case 'demo_block':
      return (
        <DemoBlock
          {...component}
          _metadata={component._metadata}
          _gridDisplayName={component._gridDisplayName}
          isPreview={isPreview}
          contextMode={contextMode}
          _componentKey={component._metadata?.key}
          cmsDemo={cmsDemo}
        />
      )
    case 'FeatureGrid':
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
        <Carousel
          {...component}
          _metadata={component._metadata}
          _gridDisplayName={component._gridDisplayName}
          isPreview={isPreview}
          contextMode={contextMode}
        />
      )
    case 'PromoBlock':
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
      return (
        <Menu
          {...component}
          _metadata={component._metadata}
          _gridDisplayName={component._gridDisplayName}
          isPreview={isPreview}
          contextMode={contextMode}
        />
      )
    default:
      // Unknown type — add a case above when you create a new block in Optimizely
      console.warn('Unhandled block type:', blockType, component)
      return null
  }
}

export default BlockRenderer
