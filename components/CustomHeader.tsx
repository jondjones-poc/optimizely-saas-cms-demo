'use client'

import { useState, useRef, useEffect } from 'react'
import { useBranding } from '@/contexts/BrandingContext'
import { usePathname } from 'next/navigation'
import CMSMenu from './CMSMenu'

const CustomHeader = () => {
  const { branding } = useBranding()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const headerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Calculate header height when image loads
  useEffect(() => {
    const updateHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight
        setHeaderHeight(height)
      }
    }
    
    updateHeight()
    // Also update when window resizes
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [branding.headerImage])

  if (!branding.hasCustomBranding || !branding.headerImage) {
    return null
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <div 
        ref={headerRef}
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
          src={branding.headerImage}
          alt={`${branding.customer} Header`}
          className="w-full h-auto cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onClick={toggleMenu}
          onLoad={() => {
            // Recalculate height when image loads
            if (headerRef.current) {
              const height = headerRef.current.offsetHeight
              setHeaderHeight(height)
            }
          }}
        />
      </div>
      {/* Menu rendered outside header container to avoid stacking context issues */}
      <CMSMenu 
        currentPath={pathname}
        isVisible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        headerHeight={headerHeight}
      />
    </>
  )
}

export default CustomHeader
