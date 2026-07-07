'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import CMSMenu from './CMSMenu'
import type { BrandingConfig } from '@/lib/branding'

interface CustomHeaderClientProps {
  branding: BrandingConfig
}

/**
 * Client-side interactive parts of CustomHeader
 */
export default function CustomHeaderClient({ branding }: CustomHeaderClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div 
      className="relative w-full"
      style={{ 
        position: 'relative',
        zIndex: 9999, // High z-index to ensure it's above CMS content
        isolation: 'isolate', // Create separate stacking context to prevent overlay inclusion
        // Ensure this is explicitly NOT part of CMS content structure
        contain: 'layout style paint' // CSS containment to isolate from CMS content
      }}
      data-epi-exclude="true" // Marker to exclude from Optimizely overlay calculations
      data-not-cms-content="true" // Additional marker
    >
      <img
        src={branding.headerImage!}
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

