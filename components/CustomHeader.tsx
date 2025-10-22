'use client'

import { useBranding } from '@/contexts/BrandingContext'
import Image from 'next/image'

const CustomHeader = () => {
  const { branding } = useBranding()

  if (!branding.hasCustomBranding || !branding.headerImage) {
    return null
  }

  return (
    <div className="relative w-full">
      <img
        src={branding.headerImage}
        alt={`${branding.customer} Header`}
        className="w-full h-auto"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
    </div>
  )
}

export default CustomHeader
