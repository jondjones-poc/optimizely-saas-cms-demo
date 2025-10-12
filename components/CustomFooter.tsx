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
      <Image
        src={branding.footerImage}
        alt={`${branding.customer} Footer`}
        width={1920}
        height={300}
        className="w-full h-auto"
        priority
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}

export default CustomFooter
