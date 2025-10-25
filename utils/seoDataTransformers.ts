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

interface SEOButtonData {
  seoData: SEOSettings | null
  pageMetadata: PageMetadata | null
  cmsBlocks: string[]
}

// Transform homepage data (BlankExperience)
export function transformHomepageData(homepageData: any): SEOButtonData {
  if (!homepageData) {
    return {
      seoData: null,
      pageMetadata: null,
      cmsBlocks: []
    }
  }

  // Extract SEO data
  const seoData: SEOSettings = {
    MetaTitle: homepageData._metadata?.displayName || 'Home',
    MetaDescription: 'Transform your business with our comprehensive SaaS platform',
    GraphType: 'website',
    DisplayInMenu: 'true',
    Indexing: 'index'
  }

  // Extract page metadata
  const pageMetadata: PageMetadata = {
    pageType: homepageData._metadata?.types?.[0] || 'Unknown',
    displayName: homepageData._metadata?.displayName || 'Home',
    status: homepageData._metadata?.status || 'Unknown',
    url: homepageData._metadata?.url?.default
  }

  // Extract CMS blocks
  const cmsBlocks: string[] = []
  if (homepageData.composition?.grids) {
    homepageData.composition.grids.forEach((grid: any) => {
      if (grid.displayName) {
        cmsBlocks.push(grid.displayName)
      }
      if (grid.rows) {
        grid.rows.forEach((row: any) => {
          if (row.displayName) {
            cmsBlocks.push(row.displayName)
          }
          if (row.columns) {
            row.columns.forEach((column: any) => {
              if (column.displayName) {
                cmsBlocks.push(column.displayName)
              }
              if (column.elements) {
                column.elements.forEach((element: any) => {
                  if (element.component && element.component._metadata) {
                    const types = element.component._metadata.types || []
                    const blockType = types[0] || 'Unknown'
                    cmsBlocks.push(`${blockType} (${element.displayName})`)
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  return {
    seoData,
    pageMetadata,
    cmsBlocks: Array.from(new Set(cmsBlocks)) // Remove duplicates
  }
}

// Transform other page data (Article, LandingPage, etc.)
export function transformPageData(pageData: any): SEOButtonData {
  if (!pageData) {
    return {
      seoData: null,
      pageMetadata: null,
      cmsBlocks: []
    }
  }

  // Extract SEO data
  const seoData: SEOSettings = {
    MetaTitle: pageData._metadata?.displayName || 'Page',
    MetaDescription: pageData._metadata?.displayName ? `${pageData._metadata.displayName} - SaaSCMS` : 'SaaSCMS Page',
    GraphType: 'website',
    DisplayInMenu: 'true',
    Indexing: 'index'
  }

  // Extract page metadata
  const pageMetadata: PageMetadata = {
    pageType: pageData._metadata?.types?.[0] || 'Unknown',
    displayName: pageData._metadata?.displayName || 'Page',
    status: pageData._metadata?.status || 'Unknown',
    url: pageData._metadata?.url?.default
  }

  // Extract CMS blocks
  const cmsBlocks: string[] = []
  if (pageData.composition?.grids) {
    pageData.composition.grids.forEach((grid: any) => {
      if (grid.displayName) {
        cmsBlocks.push(grid.displayName)
      }
      if (grid.rows) {
        grid.rows.forEach((row: any) => {
          if (row.displayName) {
            cmsBlocks.push(row.displayName)
          }
          if (row.columns) {
            row.columns.forEach((column: any) => {
              if (column.displayName) {
                cmsBlocks.push(column.displayName)
              }
              if (column.elements) {
                column.elements.forEach((element: any) => {
                  if (element.component && element.component._metadata) {
                    const types = element.component._metadata.types || []
                    const blockType = types[0] || 'Unknown'
                    cmsBlocks.push(`${blockType} (${element.displayName})`)
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  return {
    seoData,
    pageMetadata,
    cmsBlocks: Array.from(new Set(cmsBlocks)) // Remove duplicates
  }
}
