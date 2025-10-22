'use client'

import { useBranding } from '@/contexts/BrandingContext'
import Image from 'next/image'

const CustomFooter = () => {
  const { branding } = useBranding()

  if (!branding.hasCustomBranding || !branding.footerImage) {
    return null
  }

  return (
    <div className="relative w-full">
      <img
        src={branding.footerImage}
        alt={`${branding.customer} Footer`}
        className="w-full h-auto"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  )
}

export default CustomFooter
