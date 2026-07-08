import { getOptimizelyCmsUrl } from '@/lib/optimizely/env'

/** Server-only CMS Management API settings (never NEXT_PUBLIC_) */

export function getOptimizelyCmsClientId(): string {
  return process.env.OPTIMIZELY_CMS_CLIENT_ID || ''
}

export function getOptimizelyCmsClientSecret(): string {
  return process.env.OPTIMIZELY_CMS_CLIENT_SECRET || ''
}

/** Content key (GUID, no hyphens) for the /poc parent page */
export function getOptimizelyPocParentContentKey(): string {
  return process.env.OPTIMIZELY_POC_PARENT_CONTENT_KEY || ''
}

/** Page content type key to create, e.g. poc_page_type */
export function getOptimizelyPocPageTypeKey(): string {
  return process.env.OPTIMIZELY_POC_PAGE_TYPE_KEY || 'poc_page_type'
}

export function getOptimizelyCmsLocale(): string {
  return process.env.OPTIMIZELY_CMS_LOCALE || 'en'
}

export function isCmsManagementConfigured(): boolean {
  return Boolean(
    getOptimizelyCmsClientId() &&
      getOptimizelyCmsClientSecret() &&
      getOptimizelyPocParentContentKey() &&
      getOptimizelyCmsUrl()
  )
}
