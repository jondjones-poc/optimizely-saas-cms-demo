'use client'

import { useEffect } from 'react'
import { useBranding } from '@/contexts/BrandingContext'

interface DemoBlockProps {
  ImageNumber?: number
  MarginTopAndBottom?: string
  _metadata?: {
    key?: string
    displayName?: string
  }
  _componentKey?: string
  isPreview?: boolean
  contextMode?: string | null
  cmsDemo?: string | null
}

const DemoBlock = ({
  ImageNumber,
  MarginTopAndBottom,
  _metadata,
  _componentKey,
  isPreview = false,
  contextMode = null,
  cmsDemo = null,
}: DemoBlockProps) => {
  const { branding } = useBranding()

  // cms_demo request header (prop from SSR, else BrandingProvider from layout)
  const demoHeader = (cmsDemo || branding.cms_demo || '').trim().toLowerCase()
  // No header → /default/1.png. With header truepotential → /truepotential/1.png
  const folderName = demoHeader || 'default'

  const imageNumber = ImageNumber || 1
  const imagePath = `/${folderName}/${imageNumber}.png`

  useEffect(() => {
    console.log('🎨 DemoBlock render:', {
      ImageNumber: imageNumber,
      folderName,
      imagePath,
      cmsDemoProp: cmsDemo,
      brandingCmsDemo: branding.cms_demo,
    })
  }, [imageNumber, folderName, imagePath, cmsDemo, branding.cms_demo])

  const marginValue = MarginTopAndBottom ? parseInt(MarginTopAndBottom, 10) : 0
  const marginStyle = marginValue > 0 ? { marginTop: `${marginValue}px`, marginBottom: `${marginValue}px` } : {}

  return (
    <>
      <section
        className="w-full"
        style={marginStyle}
        {...(contextMode === 'edit' && { 'data-epi-edit': 'MarginTopAndBottom' })}
      >
        <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <img
            src={imagePath}
            alt={`Demo Image ${imageNumber}`}
            className="w-full h-auto"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            onError={(e) => {
              console.error(`❌ DemoBlock: Image not found at ${imagePath}`, {
                folderName,
                imageNumber,
                imagePath,
                cmsDemoProp: cmsDemo,
                brandingCmsDemo: branding.cms_demo,
                suggestion: `Add ${imageNumber}.png to public/${folderName}/`,
              })
              const target = e.target as HTMLImageElement
              if (isPreview || process.env.NODE_ENV === 'development') {
                target.src = `data:image/svg+xml;base64,${btoa(`
                <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
                  <rect width="800" height="400" fill="#4F46E5"/>
                  <text x="400" y="180" text-anchor="middle" fill="white" font-size="32" font-family="Arial">Demo Image ${imageNumber}</text>
                  <text x="400" y="220" text-anchor="middle" fill="white" font-size="16" font-family="Arial">Placeholder - Add ${imageNumber}.png to public/${folderName}/</text>
                </svg>
              `)}`
              } else {
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
