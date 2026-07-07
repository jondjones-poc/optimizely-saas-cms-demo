'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { useBranding } from '@/contexts/BrandingContext'

interface DemoBlockProps {
  ImageNumber?: number
  MarginTopAndBottom?: string
  _metadata?: {
    key?: string
    displayName?: string
  }
  _componentKey?: string // Passed from BlockRenderer for data-epi-block-id
  isPreview?: boolean
  contextMode?: string | null
  cmsDemo?: string | null  // cms_demo header value from server (takes precedence over context)
}

const DemoBlock = ({ ImageNumber, MarginTopAndBottom, _metadata, _componentKey, isPreview = false, contextMode = null, cmsDemo = null }: DemoBlockProps) => {
  const { theme } = useTheme()
  
  // Priority: 1) cmsDemo prop (from server-side header), 2) branding context, 3) default
  let folderName = 'default'
  
  // First try the prop (from server-side header) - this works in SSR
  if (cmsDemo) {
    folderName = cmsDemo.toLowerCase() // Normalize to lowercase
    console.log('✅ DemoBlock: Using cmsDemo from server-side header:', cmsDemo, '→ folder:', folderName)
  } else {
    // Fallback to branding context (client-side only)
    try {
      const { branding } = useBranding()
      folderName = branding.cms_demo || 'default'
      console.log('⚠️ DemoBlock: Using branding context (cmsDemo prop not provided):', folderName)
    } catch (e) {
      console.warn('⚠️ DemoBlock: BrandingContext not available, using default folder:', e)
      folderName = 'default'
    }
  }
  
  // Default to image 1 if no ImageNumber is provided
  const imageNumber = ImageNumber || 1
  const imagePath = `/${folderName}/${imageNumber}.png`
  
  // Debug logging - always log to help diagnose production issues
  useEffect(() => {
    console.log('🎨 DemoBlock render:', {
      ImageNumber: imageNumber,
      folderName,
      imagePath,
      fullPath: imagePath,
      ImageNumberProp: ImageNumber,
      cmsDemoProp: cmsDemo,
      folderNameSource: cmsDemo ? 'server-side header' : 'branding context',
      imageExists: false // Will be checked by onError handler
    })
  }, [imageNumber, folderName, imagePath, ImageNumber, cmsDemo])

  // Parse MarginTopAndBottom value and convert to pixels
  const marginValue = MarginTopAndBottom ? parseInt(MarginTopAndBottom) : 0
  const marginStyle = marginValue > 0 ? { marginTop: `${marginValue}px`, marginBottom: `${marginValue}px` } : {}

  // Use _componentKey if provided (from BlockRenderer), otherwise fall back to _metadata.key
  const componentKey = _componentKey || _metadata?.key || ''
  
  return (
    <>
      {/* DemoBlock */}
      <section 
        className="w-full" 
        style={marginStyle}
        // NOTE: data-epi-block-id is now on wrapper div in CMSContent.tsx (matching example structure)
        // {...(contextMode === 'edit' && componentKey && { 'data-epi-block-id': componentKey })}
        {...(contextMode === 'edit' && { 'data-epi-edit': 'MarginTopAndBottom' })}
      >
      {/* Full-width banner image */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <img
          src={imagePath}
          alt={`Demo Image ${imageNumber}`}
          className="w-full h-auto"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onError={(e) => {
            // Fallback to a placeholder if the specified image doesn't exist
            console.error(`❌ DemoBlock: Image not found at ${imagePath}`, {
              folderName,
              imageNumber,
              imagePath,
              cmsDemoProp: cmsDemo,
              folderNameSource: cmsDemo ? 'server-side header' : 'branding context',
              availableFolders: ['metrobank', 'easyjet', 'default'],
              suggestion: `Check if ${imageNumber}.png exists in public/${folderName}/`
            })
            const target = e.target as HTMLImageElement
            // Only show placeholder in development/preview, not in production
            if (isPreview || process.env.NODE_ENV === 'development') {
              target.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
                  <rect width="800" height="400" fill="#4F46E5"/>
                  <text x="400" y="180" text-anchor="middle" fill="white" font-size="32" font-family="Arial">Demo Image ${imageNumber}</text>
                  <text x="400" y="220" text-anchor="middle" fill="white" font-size="16" font-family="Arial">Placeholder - Add ${imageNumber}.png to public/${folderName}/</text>
                </svg>
              `)}`
            } else {
              // In production, hide the broken image instead of showing placeholder
              target.style.display = 'none'
            }
          }}
          {...(contextMode === 'edit' && { 'data-epi-edit': 'ImageNumber' })}
        />
      </div>
    </section>
    </>
  )
}

export default DemoBlock