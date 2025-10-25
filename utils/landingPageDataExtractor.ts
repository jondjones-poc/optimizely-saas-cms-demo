interface SEOSettings {
  DisplayInMenu: string | null
  GraphType: string | null
  Indexing: string | null
  MetaDescription: string | null
  MetaTitle: string | null
}

interface PageMetadata {
  pageType: string
  displayName: string
  status: string
  url?: string
}

export interface LandingPageSEOData {
  seoData: SEOSettings | null
  pageMetadata: PageMetadata | null
  cmsBlocks: string[]
}

// Extract SEO data from landing page data
export const extractLandingPageSEOData = (data: any): SEOSettings | null => {
  if (!data) return null

  // Handle API response structure: { success: true, data: { data: { LandingPage: { items: [...] } } } }
  const page = data?.data?.data?.LandingPage?.items?.[0]
  
  if (!page) return null

  // Check for direct SeoSettings
  if (page.SeoSettings) {
    return page.SeoSettings
  }

  // For landing page
  if (page?._metadata?.types?.includes('LandingPage')) {
    return {
      MetaTitle: page._metadata?.displayName || 'Landing Page',
      MetaDescription: 'Landing page for SaaSCMS',
      GraphType: 'website',
      DisplayInMenu: 'true',
      Indexing: 'index'
    }
  }

  // For other pages
  if (page._metadata) {
    return {
      MetaTitle: page._metadata?.displayName || 'Page',
      MetaDescription: page._metadata?.displayName ? `${page._metadata.displayName} - SaaSCMS` : 'SaaSCMS Page',
      GraphType: 'website',
      DisplayInMenu: 'true',
      Indexing: 'index'
    }
  }

  return null
}

// Extract page metadata
export const extractLandingPageMetadata = (data: any): PageMetadata | null => {
  if (!data) return null

  // Handle API response structure: { success: true, data: { data: { LandingPage: { items: [...] } } } }
  const page = data?.data?.data?.LandingPage?.items?.[0]
  
  if (!page) return null

  return {
    pageType: page._metadata?.types?.[0] || 'Unknown',
    displayName: page._metadata?.displayName || 'Page',
    status: page._metadata?.status || 'Unknown',
    url: page._metadata?.url?.default
  }
}

// Extract CMS blocks from landing page
export const extractLandingPageBlocks = (data: any): string[] => {
  const blocks: string[] = []
  
  // Handle API response structure: { success: true, data: { data: { LandingPage: { items: [...] } } } }
  const page = data?.data?.data?.LandingPage?.items?.[0]
  
  if (!page) return blocks
  
  // Extract from TopContentArea
  if (page.TopContentArea && Array.isArray(page.TopContentArea)) {
    page.TopContentArea.forEach((item: any) => {
      if (item._metadata?.displayName) {
        blocks.push(item._metadata.displayName)
      }
      // Add component type if available
      if (item._metadata?.types?.[0]) {
        blocks.push(`${item._metadata.types[0]} (${item._metadata.displayName})`)
      }
    })
  }
  
  // Extract from MainContentArea
  if (page.MainContentArea && Array.isArray(page.MainContentArea)) {
    page.MainContentArea.forEach((item: any) => {
      if (item._metadata?.displayName) {
        blocks.push(item._metadata.displayName)
      }
      // Add component type if available
      if (item._metadata?.types?.[0]) {
        blocks.push(`${item._metadata.types[0]} (${item._metadata.displayName})`)
      }
    })
  }
  
  // Extract from composition if available
  if (page?.composition?.grids) {
    page.composition.grids.forEach((grid: any) => {
      if (grid.displayName) {
        blocks.push(grid.displayName)
      }
      if (grid.rows) {
        grid.rows.forEach((row: any) => {
          if (row.displayName) {
            blocks.push(row.displayName)
          }
          if (row.columns) {
            row.columns.forEach((column: any) => {
              if (column.displayName) {
                blocks.push(column.displayName)
              }
              if (column.elements) {
                column.elements.forEach((element: any) => {
                  if (element.component && element.component._metadata) {
                    const types = element.component._metadata.types || []
                    const blockType = types[0] || 'Unknown'
                    blocks.push(`${blockType} (${element.displayName})`)
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  return Array.from(new Set(blocks))
}

// Main function to extract all SEO data for landing page
export const extractAllLandingPageSEOData = (data: any): LandingPageSEOData => {
  return {
    seoData: extractLandingPageSEOData(data),
    pageMetadata: extractLandingPageMetadata(data),
    cmsBlocks: extractLandingPageBlocks(data)
  }
}
