import { randomUUID } from 'node:crypto'
import { getOptimizelyCmsUrl, getOptimizelySdkKey } from '@/lib/optimizely/env'
import {
  getOptimizelyCmsClientId,
  getOptimizelyCmsClientSecret,
  getOptimizelyCmsLocale,
  getOptimizelyPocPageTypeKey,
  getOptimizelyPocParentContentKey,
} from './env'

const CMS_API_BASE = 'https://api.cms.optimizely.com'
const TOKEN_URL = `${CMS_API_BASE}/oauth/token`

export type CmsContentItem = {
  key: string
  container?: string
  contentType?: string
  primaryLocale?: string
  locales?: string[]
}

export type CmsCreatePageResult =
  | {
      ok: true
      contentKey: string
      displayName: string
      published: boolean
      cmsEditUrl: string
      siteUrl: string | null
    }
  | { ok: false; error: string; hint?: string }

async function fetchPageUrlFromGraph(contentKey: string): Promise<string | null> {
  const sdkKey = getOptimizelySdkKey()
  if (!sdkKey) {
    return null
  }

  const query = `
    query GetPageUrl {
      _Content(
        where: {
          _metadata: {
            key: { eq: "${contentKey}" }
          }
        }
        limit: 1
      ) {
        items {
          _metadata {
            url { default }
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
    const url = data.data?._Content?.items?.[0]?._metadata?.url?.default
    return typeof url === 'string' && url.length > 0 ? url : null
  } catch {
    return null
  }
}

async function getAccessToken(): Promise<string> {
  const clientId = getOptimizelyCmsClientId()
  const clientSecret = getOptimizelyCmsClientSecret()

  if (!clientId || !clientSecret) {
    throw new Error('CMS API credentials not configured')
  }

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'api:admin',
    }),
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok || !data.access_token) {
    const detail = data.error_description || data.error || `HTTP ${response.status}`
    throw new Error(`CMS token request failed: ${detail}`)
  }

  return data.access_token as string
}

function authHeaders(token: string, extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  }
}

export async function getCmsContentItem(contentKey: string): Promise<CmsContentItem | null> {
  const token = await getAccessToken()

  const response = await fetch(`${CMS_API_BASE}/v1/content/${contentKey}`, {
    headers: authHeaders(token),
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export async function createPocChildPage(displayName: string): Promise<CmsCreatePageResult> {
  const trimmedName = displayName.trim()

  if (!trimmedName) {
    return { ok: false, error: 'Page name is required' }
  }

  const parentKey = getOptimizelyPocParentContentKey()
  const pageTypeKey = getOptimizelyPocPageTypeKey()
  const locale = getOptimizelyCmsLocale()

  if (!parentKey) {
    return {
      ok: false,
      error: 'Parent content key not configured',
      hint: 'Set OPTIMIZELY_POC_PARENT_CONTENT_KEY in .env.local',
    }
  }

  try {
    const token = await getAccessToken()
    const newKey = randomUUID().replace(/-/g, '')

    const createResponse = await fetch(`${CMS_API_BASE}/v1/content`, {
      method: 'POST',
      headers: authHeaders(token, {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      }),
      body: JSON.stringify({
        key: newKey,
        contentType: pageTypeKey,
        container: parentKey,
        initialVersion: {
          displayName: trimmedName,
          locale,
          properties: {
            Title: { value: trimmedName },
            SeoSettings: {
              value: {
                properties: {
                  MetaTitle: { value: trimmedName },
                  GraphType: { value: '-' },
                },
              },
            },
          },
        },
      }),
      cache: 'no-store',
    })

    const createBody = await createResponse.json().catch(() => ({}))

    if (!createResponse.ok) {
      const detail =
        createBody.detail ||
        createBody.title ||
        createBody.message ||
        `HTTP ${createResponse.status}`

      let hint: string | undefined
      if (createResponse.status === 403) {
        hint =
          'Grant the Manage Content API key Create access on the /poc page in CMS → Settings → API Keys → Authorization.'
      }

      return { ok: false, error: detail, hint }
    }

    const contentKey = (createBody.key as string) || newKey
    const versionId = createBody.initialVersion?.version ?? createBody.versions?.[0]?.version ?? createBody.versions?.[0]?.id
    const etag = createResponse.headers.get('etag')

    let published = false
    if (versionId) {
      const publishResponse = await fetch(
        `${CMS_API_BASE}/v1/content/${contentKey}/versions/${versionId}:publish`,
        {
          method: 'POST',
          headers: authHeaders(token, etag ? { 'If-Match': etag } : {}),
          cache: 'no-store',
        }
      )

      if (publishResponse.ok) {
        published = true
      }
    }

    const cmsBase = getOptimizelyCmsUrl()
    const cmsEditUrl = cmsBase
      ? `${cmsBase}/ui/cms#context=epi.cms.contentdata:///${contentKey}`
      : ''

    const siteUrl = published ? await fetchPageUrlFromGraph(contentKey) : null

    return {
      ok: true,
      contentKey,
      displayName: trimmedName,
      published,
      cmsEditUrl,
      siteUrl,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to create CMS page',
    }
  }
}
