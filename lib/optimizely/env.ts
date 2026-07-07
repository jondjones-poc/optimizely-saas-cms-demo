/**
 * Optimizely CMS instance config from environment variables.
 *
 * Use NEXT_PUBLIC_* in .env.local — these values are read by client components
 * (live preview script, dev floating menu CMS links).
 */

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

/** CMS instance UUID, e.g. epsajjcmson91rm1p001 */
export function getOptimizelyCmsInstanceId(): string {
  return (
    process.env.NEXT_PUBLIC_OPTIMIZELY_CMS_INSTANCE_ID ||
    process.env.OPTIMIZELY_CMS_INSTANCE_ID ||
    ''
  )
}

/** CMS base URL, e.g. https://app-epsajjcmson91rm1p001.cms.optimizely.com */
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

/** CMS edit UI base, e.g. .../ui/cms */
export function getOptimizelyCmsUiBase(): string {
  const base = getOptimizelyCmsUrl()
  return base ? `${base}/ui/cms` : ''
}

/** Live preview communication injector script URL */
export function getOptimizelyPreviewScriptUrl(): string {
  const base = getOptimizelyCmsUrl()
  return base
    ? `${base}/util/javascript/communicationinjector.js`
    : ''
}
