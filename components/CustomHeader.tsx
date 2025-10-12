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
      <Image
        src={branding.headerImage}
        alt={`${branding.customer} Header`}
        width={1920}
        height={200}
        className="w-full h-auto object-cover max-h-64"
        priority
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}

export default CustomHeader
