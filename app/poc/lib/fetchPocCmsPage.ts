import { getOptimizelySdkKey } from '@/lib/optimizely/env'

/** CMS URL for the beginner POC page — must match the page URL in Optimizely exactly */
export const POC_PAGE_URL = '/poc'

export type PocBlock = {
  _metadata?: {
    key?: string
    displayName?: string
    types?: string[]
  }
  Heading?: string
  HeadingSize?: 'h1' | 'h2' | 'h3'
  Alignment?: 'left' | 'center' | 'right' | 'middle'
}

export type PocCmsResult =
  | {
      ok: true
      title: string
      displayName: string
      pageUrl: string
      status: string
      blocks: PocBlock[]
    }
  | { ok: false; error: string; hint?: string }

export async function fetchPocCmsPage(): Promise<PocCmsResult> {
  const sdkKey = getOptimizelySdkKey()

  if (!sdkKey) {
    return {
      ok: false,
      error: 'SDK key not configured',
      hint: 'Add NEXT_PUBLIC_SDK_KEY to .env.local and run npm run setup',
    }
  }

  const query = `
    query PocCmsPage {
      _Content(
        where: {
          _metadata: {
            url: { default: { eq: "${POC_PAGE_URL}" } }
          }
        }
        limit: 1
      ) {
        items {
          _metadata {
            displayName
            url { default }
            status
          }
          ... on poc_page_type {
            Title
            HeadingBlocks: Heading {
              _metadata {
                key
                displayName
                types
              }
              ... on Heading {
                Heading
                HeadingSize
                Alignment
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok || data.errors) {
      const message = data.errors?.[0]?.message || `HTTP ${response.status}`
      return { ok: false, error: message }
    }

    const item = data.data?._Content?.items?.[0]

    if (!item) {
      return {
        ok: false,
        error: `No page found at ${POC_PAGE_URL}`,
        hint: 'Create and publish a POC page in CMS with URL /poc (exact match, including trailing slash)',
      }
    }

    const title = item.Title || item._metadata?.displayName || 'Untitled'
    const blocks = Array.isArray(item.HeadingBlocks) ? item.HeadingBlocks : []

    return {
      ok: true,
      title,
      displayName: item._metadata?.displayName || 'Untitled',
      pageUrl: item._metadata?.url?.default || POC_PAGE_URL,
      status: item._metadata?.status || 'Unknown',
      blocks,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to fetch CMS page',
    }
  }
}
