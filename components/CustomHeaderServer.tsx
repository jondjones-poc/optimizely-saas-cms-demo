import { getBrandingConfig } from '@/lib/branding'
import CustomHeaderClient from './CustomHeaderClient'

/**
 * Server-side CustomHeader component
 * Reads branding from HTTP headers and passes to client component
 */
export default async function CustomHeaderServer() {
  const branding = await getBrandingConfig()

  if (!branding.hasCustomBranding || !branding.headerImage) {
    return null
  }

  return <CustomHeaderClient branding={branding} />
}

