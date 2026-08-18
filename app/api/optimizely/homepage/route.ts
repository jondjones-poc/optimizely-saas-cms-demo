/**
 * HOMEPAGE API — Server-side bridge to Optimizely Graph.
 *
 * The browser cannot call Optimizely Graph directly with the secret key safely,
 * so this Next.js "API route" runs on the server and:
 *   1. Reads NEXT_PUBLIC_SDK_KEY from .env.local
 *   2. Sends a GraphQL query to https://cg.optimizely.com/content/v2
 *   3. Returns JSON to app/page.tsx
 *
 * When you add a NEW block type in Optimizely, add its GraphQL fields in
 * lib/optimizely/graphql/blockFragments.ts (compositionBlockFields).
 */

import { NextResponse } from 'next/server'
import { getOptimizelyHomepageUrl, getOptimizelySdkKey } from '@/lib/optimizely/env'
import { compositionBlockFields } from '@/lib/optimizely/graphql/blockFragments'

export const dynamic = 'force-dynamic'

const noStoreHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

async function graphQuery(sdkKey: string, query: string) {
  const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  })
  const data = await response.json()
  return { ok: response.ok, status: response.status, data }
}

async function countBlankExperienceAtUrl(sdkKey: string, url: string): Promise<number | null> {
  const query = `
    query CountHomepageUrl {
      BlankExperience(
        where: { _metadata: { url: { default: { eq: "${url}" } } } }
        limit: 1
      ) {
        total
      }
    }
  `
  try {
    const result = await graphQuery(sdkKey, query)
    if (!result.ok || result.data.errors) {
      return null
    }
    const total = result.data?.data?.BlankExperience?.total
    return typeof total === 'number' ? total : 0
  } catch {
    return null
  }
}

export async function GET() {
  const sdkKey = getOptimizelySdkKey()

  if (!sdkKey) {
    return NextResponse.json(
      {
        success: false,
        error: 'SDK Key not configured',
        debug: {
          hasNextPublicKey: !!process.env.NEXT_PUBLIC_SDK_KEY,
        },
      },
      { status: 500 }
    )
  }

  const homepageUrl = getOptimizelyHomepageUrl()

  /**
   * GraphQL query — asks Optimizely for:
   *   - One BlankExperience page where URL matches OPTIMIZELY_HOMEPAGE_URL
   *   - Its composition tree: grids → rows → columns → component blocks
   *   - Each block type's fields (Heading text, Hero image, etc.)
   *
   * The type name after "... on" MUST match the Optimizely content type API name.
   */
  const query = `
    query GetHomepage {
      BlankExperience(
        where: {
          _metadata: {
            url: {
              default: {
                eq: "${homepageUrl}"
              }
            }
          }
        }
        limit: 1
      ) {
        total
        items {
          _metadata {
            key
            version
            types
            displayName
            url {
              default
            }
            published
            status
          }
          composition {
            grids: nodes {
              ... on ICompositionStructureNode {
                key
                displayName
                rows: nodes {
                  ... on ICompositionStructureNode {
                    key
                    displayName
                    columns: nodes {
                      ... on ICompositionStructureNode {
                        key
                        displayName
                        elements: nodes {
                          ... on ICompositionComponentNode {
                            key
                            displayName
                            component {
                              _metadata {
                                key
                                types
                                displayName
                              }
                              ${compositionBlockFields}
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  try {
    const result = await graphQuery(sdkKey, query)

    if (!result.ok) {
      console.error('Optimizely API error:', result.data)
      throw new Error(`HTTP error! status: ${result.status}`)
    }

    if (result.data.errors) {
      console.error('GraphQL errors:', result.data.errors)
      return NextResponse.json(
        {
          success: false,
          error: 'GraphQL errors',
          details: result.data.errors,
        },
        { status: 400, headers: noStoreHeaders }
      )
    }

    const items = result.data?.data?.BlankExperience?.items
    const isEmpty = !Array.isArray(items) || items.length === 0

    let debug:
      | {
          queriedUrl: string
          pagesAtSlash: number | null
          pagesAtEn: number | null
        }
      | undefined

    if (isEmpty) {
      const [pagesAtSlash, pagesAtEn] = await Promise.all([
        countBlankExperienceAtUrl(sdkKey, '/'),
        countBlankExperienceAtUrl(sdkKey, '/en/'),
      ])
      debug = {
        queriedUrl: homepageUrl,
        pagesAtSlash,
        pagesAtEn,
      }
    }

    return NextResponse.json(
      {
        success: true,
        // Response shape: { success, data: { data: { BlankExperience: ... } } }
        // The inner .data is the GraphQL envelope. CMSContent reads data.data.data.BlankExperience.
        // See docs/DATA_SHAPES.md
        data: result.data,
        debug,
        timestamp: new Date().toISOString(),
      },
      { headers: noStoreHeaders }
    )
  } catch (error) {
    console.error('Error fetching Optimizely data:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
