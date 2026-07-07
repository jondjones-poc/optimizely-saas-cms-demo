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

export interface SEOData {
  seoData: SEOSettings | null
  pageMetadata: PageMetadata | null
  cmsBlocks: string[]
}

// Extract SEO data from page data
export const extractSEOData = (data: any): SEOSettings | null => {
  if (!data) return null

  // Handle API response structure: { success: true, data: { data: { BlankExperience: { items: [...] } } } }
  const page = data?.data?.data?.BlankExperience?.items?.[0]
  
  if (!page) return null

  // Check for direct SeoSettings
  if (page.SeoSettings) {
    return page.SeoSettings
  }

  // For homepage (BlankExperience)
  if (page?._metadata?.types?.includes('BlankExperience')) {
    return {
      MetaTitle: page._metadata?.displayName || 'Home',
      MetaDescription: 'Transform your business with our comprehensive SaaS platform',
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
export const extractPageMetadata = (data: any): PageMetadata | null => {
  if (!data) return null

  // Handle API response structure: { success: true, data: { data: { BlankExperience: { items: [...] } } } }
  const page = data?.data?.data?.BlankExperience?.items?.[0]
  
  if (!page) return null

  return {
    pageType: page._metadata?.types?.[0] || 'Unknown',
    displayName: page._metadata?.displayName || 'Page',
    status: page._metadata?.status || 'Unknown',
    url: page._metadata?.url?.default
  }
}

// Extract CMS blocks
export const extractBlocks = (data: any): string[] => {
  const blocks: string[] = []
  
  // Handle API response structure: { success: true, data: { data: { BlankExperience: { items: [...] } } } }
  const page = data?.data?.data?.BlankExperience?.items?.[0]
  
  if (!page) return blocks
  
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

// Main function to extract all SEO data
export const extractAllSEOData = (data: any): SEOData => {
  return {
    seoData: extractSEOData(data),
    pageMetadata: extractPageMetadata(data),
    cmsBlocks: extractBlocks(data)
  }
}
