'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type BrandingConfig = {
  customer: string | null
  favicon: string | null
  headerImage: string | null
  footerImage: string | null
  hasCustomBranding: boolean
  cms_demo: string | null
}

interface BrandingContextType {
  branding: BrandingConfig
  setBranding: (branding: BrandingConfig) => void
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children, initialCmsDemo }: { children: ReactNode, initialCmsDemo?: string | null }) {
  const [branding, setBranding] = useState<BrandingConfig>({
    customer: null,
    favicon: null,
    headerImage: null,
    footerImage: null,
    hasCustomBranding: false,
    cms_demo: initialCmsDemo || null
  })

  useEffect(() => {
    // Use the initialCmsDemo value passed from server-side
    if (initialCmsDemo) {
      const customer = initialCmsDemo.toLowerCase()
      
      // Check if assets exist for this customer
      const checkAssets = async () => {
        const faviconExists = await checkAssetExists(`/${customer}/favicon.ico`)
        const headerExists = await checkAssetExists(`/${customer}/header.png`)
        const footerExists = await checkAssetExists(`/${customer}/footer.png`)
        
        setBranding({
          customer,
          favicon: faviconExists ? `/${customer}/favicon.ico` : null,
          headerImage: headerExists ? `/${customer}/header.png` : null,
          footerImage: footerExists ? `/${customer}/footer.png` : null,
          hasCustomBranding: faviconExists || headerExists || footerExists,
          cms_demo: initialCmsDemo
        })

        // Update favicon if available
        if (faviconExists) {
          updateFavicon(`/${customer}/favicon.ico`)
        }
      }

      checkAssets()
    }
  }, [initialCmsDemo])

  const checkAssetExists = async (path: string): Promise<boolean> => {
    try {
      const response = await fetch(path, { method: 'HEAD' })
      return response.ok
    } catch {
      return false
    }
  }

  const updateFavicon = (href: string) => {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = href
  }

  return (
    <BrandingContext.Provider value={{ branding, setBranding }}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}
