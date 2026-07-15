/**
 * BEGINNER POC — read this file first.
 *
 *   Box 1 — CMS Title (poc_page_type at /poc/)
 *   Box 2 — Heading content area via BlockRenderer
 *   Box 3 — StockTicker
 */

import Link from 'next/link'
import BlockRenderer from './components/BlockRenderer'
import PocBoxLabel from './components/PocBoxLabel'
import StockTicker from './components/StockTicker'
import Calculator from './components/Calculator'
import { fetchPocCmsPage } from './lib/fetchPocCmsPage'

export default async function PocPage() {
  const cms = await fetchPocCmsPage()

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-optimizely-sage bg-white p-6 shadow-sm text-gray-800">
        
        <Calculator />
        
        <PocBoxLabel category="CMS property" name="Title" />
        {cms.ok ? (
          <>
            <p className="text-3xl font-bold text-optimizely-forest">{cms.title}</p>
            <ul className="mt-3 space-y-1 text-sm text-optimizely-muted">
              <li>
                CMS page: <code className="rounded bg-optimizely-sage px-1">{cms.displayName}</code>
              </li>
              <li>
                URL in CMS: <code className="rounded bg-optimizely-sage px-1">{cms.pageUrl}</code>
              </li>
              <li>
                Status: <code className="rounded bg-optimizely-sage px-1">{cms.status}</code>
              </li>
            </ul>
          </>
        ) : (
          <div className="text-red-700">
            <p>Could not load CMS page: {cms.error}</p>
            {cms.hint && <p className="mt-2 text-sm text-optimizely-muted">{cms.hint}</p>}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-optimizely-sage bg-white p-6 shadow-sm text-gray-800">
        <PocBoxLabel category="CMS content area" name="Heading" />
        {cms.ok ? (
          cms.blocks.length > 0 ? (
            <div className="space-y-3">
              {cms.blocks.map((block, index) => (
                <BlockRenderer key={block._metadata?.key ?? index} block={block} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-optimizely-muted">
              No Heading blocks in the CMS content area yet.
            </p>
          )
        ) : (
          <p className="text-sm text-optimizely-muted">Content area unavailable.</p>
        )}
      </section>

      <section className="rounded-lg border border-optimizely-sage bg-white p-6 shadow-sm text-gray-800">
        <PocBoxLabel category="Next.js" name="Live API" />
        <StockTicker />
      </section>

      <section className="rounded-lg border border-optimizely-sage bg-white p-6 shadow-sm text-gray-800">
        <h2 className="text-lg font-semibold text-optimizely-forest">Learn how to build a page</h2>
        <p className="mt-2 text-sm text-optimizely-muted">
          See how CMS content flows through Next.js — pages, blocks, and live preview.
        </p>
        <Link
          href="/learn"
          className="mt-3 inline-block text-sm font-medium text-optimizely-forest hover:underline"
        >
          Demo Site Overview →
        </Link>
      </section>
    </div>
  )
}
