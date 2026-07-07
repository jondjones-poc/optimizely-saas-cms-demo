'use client'

/**
 * EXAMPLE BLOCK TEMPLATE — copy this when adding a new Optimizely block.
 *
 * This file is NOT wired up. It is documentation you can read and copy from.
 * Real examples in this repo: Divider.tsx (simplest), Heading.tsx (text fields).
 *
 * ADD A NEW BLOCK — checklist:
 *   1. Optimizely CMS — create Block content type; note API name (e.g. "TextBanner")
 *   2. lib/optimizely/graphql/blockFragments.ts — add ... on TextBanner { YourField }
 *   3. components/blocks/TextBanner.tsx — copy from this file
 *   4. BlockRenderer.tsx — case 'TextBanner': return <TextBanner {...component} />
 *   5. Publish block in CMS, add to page, verify /api/optimizely/homepage
 *
 * RULES:
 *   - Prop names MUST match Optimizely property API names AND GraphQL field names
 *   - case 'TextBanner' MUST match Optimizely content type API name exactly
 *   - data-epi-edit values MUST match CMS property names (live preview only)
 */

interface TextBannerProps {
  /** Matches Optimizely text property "Title" — also in blockFragments.ts GraphQL */
  Title?: string
  /** Rich text from CMS — GraphQL: Body { html } */
  Body?: { html?: string }
  _metadata?: { key?: string; displayName?: string }
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

export default function TextBannerExample({
  Title,
  Body,
  _metadata,
  isPreview = false,
  contextMode = null,
}: TextBannerProps) {
  if (!Title) return null

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* data-epi-edit="Title" lets editors click-to-edit in CMS preview iframe */}
        <h2
          className="text-2xl font-bold"
          {...(contextMode === 'edit' && { 'data-epi-edit': 'Title' })}
        >
          {Title}
        </h2>
        {Body?.html && (
          <div
            className="mt-2 prose"
            dangerouslySetInnerHTML={{ __html: Body.html }}
            {...(contextMode === 'edit' && { 'data-epi-edit': 'Body' })}
          />
        )}
      </div>
    </section>
  )
}

/**
 * BlockRenderer registration (add to components/blocks/BlockRenderer.tsx):
 *
 *   import TextBanner from './TextBanner'
 *
 *   case 'TextBanner':
 *     return (
 *       <TextBanner
 *         {...component}
 *         _metadata={component._metadata}
 *         isPreview={isPreview}
 *         contextMode={contextMode}
 *       />
 *     )
 */

/**
 * GraphQL fragment (add to lib/optimizely/graphql/blockFragments.ts → compositionBlockFields):
 *
 *   ... on TextBanner {
 *     Title
 *     Body {
 *       html
 *     }
 *   }
 */
