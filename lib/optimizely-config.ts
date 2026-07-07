export function getOptimizelySdkKey(): string {
  return process.env.NEXT_PUBLIC_SDK_KEY || ''
}

export function getOptimizelyCmsUrl(): string {
  return (process.env.NEXT_PUBLIC_OPTIMIZELY_CMS_URL || '').replace(/\/$/, '')
}

export function getOptimizelyCmsRootNodeId(): string {
  return process.env.NEXT_PUBLIC_OPTIMIZELY_CMS_ROOT_NODE_ID || '7'
}

export function getOptimizelyHomepageUrl(): string {
  return process.env.OPTIMIZELY_HOMEPAGE_URL || '/en/'
}
