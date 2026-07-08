'use client'

interface ArticlePagePreviewProps {
  data: {
    Heading?: string
    SubHeading?: string
    Author?: string
    Body?: { html?: string }
    _metadata?: { displayName?: string }
  }
}

export default function ArticlePagePreview({ data }: ArticlePagePreviewProps) {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="mb-12">
        <h1 className="mb-6 text-4xl font-bold text-phamily-darkGray md:text-5xl">
          {data.Heading || data._metadata?.displayName}
        </h1>
        {data.SubHeading && (
          <p className="text-xl text-phamily-darkGray/80">{data.SubHeading}</p>
        )}
        {data.Author && (
          <p className="mt-4 text-sm text-phamily-darkGray/60">By {data.Author}</p>
        )}
        {data.Body?.html && (
          <div
            className="prose prose-lg mt-8 max-w-none text-phamily-darkGray/80"
            dangerouslySetInnerHTML={{ __html: data.Body.html }}
          />
        )}
      </header>
    </article>
  )
}
