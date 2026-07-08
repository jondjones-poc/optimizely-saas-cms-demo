'use client'

import PocBlockRenderer from '@/app/poc/components/BlockRenderer'
import type { PocBlock } from '@/app/poc/lib/fetchPocCmsPage'

interface PocPagePreviewProps {
  data: {
    Title?: string
    HeadingBlocks?: PocBlock[]
    _metadata?: {
      displayName?: string
      url?: { default?: string }
      status?: string
    }
  }
  isPreview?: boolean
  contextMode?: string | null
}

/** Minimal poc_page_type preview for CMS live preview */
export default function PocPagePreview({
  data,
  isPreview = false,
  contextMode = null,
}: PocPagePreviewProps) {
  const title = data.Title || data._metadata?.displayName || 'Untitled'
  const blocks = Array.isArray(data.HeadingBlocks) ? data.HeadingBlocks : []

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      <h1
        className="text-3xl font-bold text-gray-900"
        {...(isPreview && contextMode === 'edit' && { 'data-epi-edit': 'Title' })}
      >
        {title}
      </h1>

      {blocks.length > 0 ? (
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div
              key={block._metadata?.key ?? index}
              {...(isPreview &&
                contextMode === 'edit' &&
                block._metadata?.key && { 'data-epi-block-id': block._metadata.key })}
            >
              <PocBlockRenderer block={block} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No Heading blocks yet.</p>
      )}
    </div>
  )
}
