'use client'

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
  isPreview?: boolean
  contextMode?: string | null
}

const DemoBlock = ({ ImageNumber, MarginTopAndBottom, _metadata, isPreview = false, contextMode = null }: DemoBlockProps) => {
  const { theme } = useTheme()
  const { branding } = useBranding()
  
  // Debug: Log the branding context values
  console.log('DemoBlock branding context:', branding)
  console.log('DemoBlock cms_demo value:', branding.cms_demo)
  console.log('DemoBlock MarginTopAndBottom:', MarginTopAndBottom)
  
  // Default to image 1 if no ImageNumber is provided
  const imageNumber = ImageNumber || 1
  
  // Use cms_demo header value as folder name, default to 'default' if not present
  const folderName = branding.cms_demo || 'default'
  const imagePath = `/${folderName}/${imageNumber}.png`
  
  console.log('DemoBlock imagePath:', imagePath)

  // Parse MarginTopAndBottom value and convert to pixels
  const marginValue = MarginTopAndBottom ? parseInt(MarginTopAndBottom) : 0
  const marginStyle = marginValue > 0 ? { marginTop: `${marginValue}px`, marginBottom: `${marginValue}px` } : {}
  
  console.log('DemoBlock marginValue:', marginValue)
  console.log('DemoBlock marginStyle:', marginStyle)

  return (
    <section className="w-full" style={marginStyle}>
      {/* Full-width banner image */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
        <img
          src={imagePath}
          alt={`Demo Image ${imageNumber}`}
          className="w-full h-auto"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onError={(e) => {
            // Fallback to a placeholder if the specified image doesn't exist
            console.warn(`Image ${imagePath} not found, using placeholder`)
            const target = e.target as HTMLImageElement
            target.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="800" height="400" fill="#4F46E5"/>
                <text x="400" y="180" text-anchor="middle" fill="white" font-size="32" font-family="Arial">Demo Image ${imageNumber}</text>
                <text x="400" y="220" text-anchor="middle" fill="white" font-size="16" font-family="Arial">Placeholder - Add ${imageNumber}.png to public/${folderName}/</text>
              </svg>
            `)}`
          }}
          {...(contextMode === 'edit' && { 'data-epi-edit': 'ImageNumber' })}
        />
        
        {/* Only show overlay content in edit mode */}
        {isPreview && contextMode === 'edit' && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-sm text-gray-300 mt-2">
                Edit 'ImageNumber' property in CMS to change image.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default DemoBlock