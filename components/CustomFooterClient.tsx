'use client'

import type { BrandingConfig } from '@/lib/branding'

interface CustomFooterClientProps {
  branding: BrandingConfig
}

/**
 * Client-side CustomFooter component
 */
export default function CustomFooterClient({ branding }: CustomFooterClientProps) {
  return (
    <footer className="relative w-full">
      <img
        src={branding.footerImage!}
        alt={`${branding.customer} Footer`}
        className="w-full h-auto"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </footer>
  )
}

