import Heading from './Heading'
import type { PocBlock } from '../lib/fetchPocCmsPage'

interface BlockRendererProps {
  block: PocBlock
}

/** Simple POC block renderer — maps CMS block types to local components */
export default function BlockRenderer({ block }: BlockRendererProps) {
  const blockType = block._metadata?.types?.[0]

  switch (blockType) {
    case 'Heading':
      return <Heading {...block} />
    default:
      return null
  }
}
