'use client'

interface NewsLandingPagePreviewProps {
  data: {
    Title?: string
    _metadata?: {
      displayName?: string
      url?: { default?: string }
    }
  }
  isPreview?: boolean
  contextMode?: string | null
}

/** Simple news landing preview — title only; articles load on the live site */
export default function NewsLandingPagePreview({
  data,
  isPreview = false,
  contextMode = null,
}: NewsLandingPagePreviewProps) {
  const title = data.Title || data._metadata?.displayName || 'News'

  return (
    <div className="min-h-[50vh] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
      <div className="container mx-auto px-6 py-20 text-center">
        <h1
          className="text-5xl font-bold"
          {...(isPreview && contextMode === 'edit' && { 'data-epi-edit': 'Title' })}
        >
          {title}
        </h1>
        {isPreview && (
          <p className="mt-6 text-sm text-white/80">
            Article list appears on the published site. Edit the title here in preview.
          </p>
        )}
      </div>
    </div>
  )
}
