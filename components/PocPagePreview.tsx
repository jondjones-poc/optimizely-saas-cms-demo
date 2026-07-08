'use client'

import PocBlockRenderer from '@/app/poc/components/BlockRenderer'
import type { PocBlock } from '@/app/poc/lib/fetchPocCmsPage'

interface PocPagePreviewProps {
  data: {
    Title?: string
    Heading?: PocBlock[]
    _metadata?: {
      displayName?: string
      url?: { default?: string }
      status?: string
    }
  }
  isPreview?: boolean
  contextMode?: string | null
}

/** Renders poc_page_type content in CMS live preview */
export default function PocPagePreview({
  data,
  isPreview = false,
  contextMode = null,
}: PocPagePreviewProps) {
  const title = data.Title || data._metadata?.displayName || 'Untitled'
  const blocks = Array.isArray(data.Heading) ? data.Heading : []

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
      <section
        className="rounded-lg border border-optimizely-sage bg-white p-6 shadow-sm"
        {...(isPreview && contextMode === 'edit' && { 'data-epi-edit': 'Title' })}
      >
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-optimizely-muted">
          <span className="rounded-full bg-optimizely-sage px-2.5 py-0.5">CMS property</span>
          <span className="mx-2 text-optimizely-forest/70">·</span>
          <span className="normal-case tracking-normal text-optimizely-forest">Title</span>
        </p>
        <p className="text-3xl font-bold text-optimizely-forest">{title}</p>
        {data._metadata?.url?.default && (
          <p className="mt-2 text-sm text-optimizely-muted">
            URL: <code className="rounded bg-optimizely-sage px-1">{data._metadata.url.default}</code>
          </p>
        )}
      </section>

      <section className="rounded-lg border border-optimizely-sage bg-white p-6 shadow-sm">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-wide text-optimizely-muted">
          <span className="rounded-full bg-optimizely-sage px-2.5 py-0.5">CMS content area</span>
          <span className="mx-2 text-optimizely-forest/70">·</span>
          <span className="normal-case tracking-normal text-optimizely-forest">Heading</span>
        </p>
        {blocks.length > 0 ? (
          <div className="space-y-3">
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
          <p className="text-sm text-optimizely-muted">No Heading blocks in the content area yet.</p>
        )}
      </section>
    </div>
  )
}
