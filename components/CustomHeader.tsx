'use client'

import { useState } from 'react'
import { useBranding } from '@/contexts/BrandingContext'
import { usePathname } from 'next/navigation'
import CMSMenu from './CMSMenu'

const CustomHeader = () => {
  const { branding } = useBranding()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  if (!branding.hasCustomBranding || !branding.headerImage) {
    return null
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="relative w-full">
      <img
        src={branding.headerImage}
        alt={`${branding.customer} Header`}
        className="w-full h-auto cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onClick={toggleMenu}
      />
      <CMSMenu 
        currentPath={pathname}
        isVisible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </div>
  )
}

export default CustomHeader
