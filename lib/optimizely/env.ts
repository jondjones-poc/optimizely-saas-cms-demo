/**
 * Optimizely CMS instance config from environment variables.
 *
 * Use NEXT_PUBLIC_* in .env.local — these values are read by client components
 * (live preview script, dev floating menu CMS links).
 */

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/** Graph Single Key — Settings → Optimizely Graph → Render Content → Single Key */
export function getOptimizelySdkKey(): string {
  return process.env.NEXT_PUBLIC_SDK_KEY || ''
}

/** CMS instance UUID, e.g. joma01saas0yi0ct001 */
export function getOptimizelyCmsInstanceId(): string {
  return (
    process.env.NEXT_PUBLIC_OPTIMIZELY_CMS_INSTANCE_ID ||
    process.env.OPTIMIZELY_CMS_INSTANCE_ID ||
    ''
  )
}

/** CMS base URL, e.g. https://app-joma01saas0yi0ct001.cms.optimizely.com */
export function getOptimizelyCmsUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_OPTIMIZELY_CMS_URL ||
    process.env.OPTIMIZELY_CMS_URL

  if (explicit) {
    return trimTrailingSlash(explicit)
  }

  const instanceId = getOptimizelyCmsInstanceId()
  if (instanceId) {
    return `https://app-${instanceId}.cms.optimizely.com`
  }

  return ''
}

/** Content tree root node ID, e.g. 7 in contentdata:///7 */
export function getOptimizelyCmsRootNodeId(): string {
  return process.env.NEXT_PUBLIC_OPTIMIZELY_CMS_ROOT_NODE_ID || '7'
}

/** Main Website URL path for Graph homepage query, e.g. /en/ */
export function getOptimizelyHomepageUrl(): string {
  return process.env.OPTIMIZELY_HOMEPAGE_URL || '/en/'
}

/** CMS edit UI base, e.g. .../ui/cms */
export function getOptimizelyCmsUiBase(): string {
  const base = getOptimizelyCmsUrl()
  return base ? `${base}/ui/cms` : ''
}

/** CMS content link for dev menu, e.g. .../ui/cms#context=epi.cms.contentdata:///7 */
export function getOptimizelyCmsContentUrl(contentId?: string): string {
  const base = getOptimizelyCmsUiBase()
  const rootId = contentId || getOptimizelyCmsRootNodeId()
  return base ? `${base}#context=epi.cms.contentdata:///${rootId}` : ''
}

/** Live preview communication injector script URL */
export function getOptimizelyPreviewScriptUrl(): string {
  const base = getOptimizelyCmsUrl()
  return base
    ? `${base}/util/javascript/communicationinjector.js`
    : ''
}

