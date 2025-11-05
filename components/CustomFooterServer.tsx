import { getBrandingConfig } from '@/lib/branding'
import CustomFooterClient from './CustomFooterClient'

/**
 * Server-side CustomFooter component
 * Reads branding from HTTP headers and passes to client component
 */
export default async function CustomFooterServer() {
  const branding = await getBrandingConfig()

  if (!branding.hasCustomBranding || !branding.footerImage) {
    return null
  }

  return <CustomFooterClient branding={branding} />
}

