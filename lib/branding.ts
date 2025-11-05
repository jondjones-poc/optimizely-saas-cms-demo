import { headers } from 'next/headers'
import { existsSync } from 'fs'
import { join } from 'path'

export type BrandingConfig = {
  customer: string | null
  favicon: string | null
  headerImage: string | null
  footerImage: string | null
  hasCustomBranding: boolean
  cms_demo: string | null
}

/**
 * Server-side function to get branding configuration from HTTP headers
 * and check if assets exist
 */
export async function getBrandingConfig(): Promise<BrandingConfig> {
  const headersList = headers()
  const cmsDemo = headersList.get('cms_demo') || headersList.get('cms-demo')

  if (!cmsDemo) {
    return {
      customer: null,
      favicon: null,
      headerImage: null,
      footerImage: null,
      hasCustomBranding: false,
      cms_demo: null
    }
  }

  const customer = cmsDemo.toLowerCase()
  const publicDir = join(process.cwd(), 'public', customer)

  // Check if assets exist server-side
  const faviconExists = existsSync(join(publicDir, 'favicon.ico'))
  const headerExists = existsSync(join(publicDir, 'header.png'))
  const footerExists = existsSync(join(publicDir, 'footer.png'))

  return {
    customer,
    favicon: faviconExists ? `/${customer}/favicon.ico` : null,
    headerImage: headerExists ? `/${customer}/header.png` : null,
    footerImage: footerExists ? `/${customer}/footer.png` : null,
    hasCustomBranding: faviconExists || headerExists || footerExists,
    cms_demo: cmsDemo
  }
}

