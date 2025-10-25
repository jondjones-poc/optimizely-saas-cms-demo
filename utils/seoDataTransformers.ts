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

// Transform LandingPage data specifically
export function transformLandingPageData(landingPageData: any): SEOButtonData {
  if (!landingPageData) {
    return {
      seoData: null,
      pageMetadata: null,
      cmsBlocks: []
    }
  }


  // Extract SEO data - use SeoSettings if available, otherwise create default
  const seoData: SEOSettings = landingPageData.SeoSettings || {
    MetaTitle: landingPageData._metadata?.displayName || 'Landing Page',
    MetaDescription: landingPageData._metadata?.displayName ? `${landingPageData._metadata.displayName} - SaaSCMS` : 'SaaSCMS Landing Page',
    GraphType: 'website',
    DisplayInMenu: 'true',
    Indexing: 'index'
  }

  // Extract page metadata
  const pageMetadata: PageMetadata = {
    pageType: landingPageData._metadata?.types?.[0] || 'LandingPage',
    displayName: landingPageData._metadata?.displayName || 'Landing Page',
    status: landingPageData._metadata?.status || 'Unknown',
    url: landingPageData._metadata?.url?.default
  }

  // Extract CMS blocks from TopContentArea and MainContentArea
  const cmsBlocks: string[] = []
  
  // Debug: Check what we're actually getting
  console.log('LandingPage data structure:', {
    hasTopContentArea: !!landingPageData.TopContentArea,
    hasMainContentArea: !!landingPageData.MainContentArea,
    topLength: landingPageData.TopContentArea?.length || 0,
    mainLength: landingPageData.MainContentArea?.length || 0
  })
  
  // Extract from TopContentArea
  if (landingPageData.TopContentArea && Array.isArray(landingPageData.TopContentArea)) {
    landingPageData.TopContentArea.forEach((item: any) => {
      if (item._metadata?.displayName) {
        cmsBlocks.push(item._metadata.displayName)
      }
      // Add component type if available
      if (item._metadata?.types?.[0]) {
        cmsBlocks.push(`${item._metadata.types[0]} (${item._metadata.displayName})`)
      }
    })
  }
  
  // Extract from MainContentArea
  if (landingPageData.MainContentArea && Array.isArray(landingPageData.MainContentArea)) {
    landingPageData.MainContentArea.forEach((item: any) => {
      if (item._metadata?.displayName) {
        cmsBlocks.push(item._metadata.displayName)
      }
      // Add component type if available
      if (item._metadata?.types?.[0]) {
        cmsBlocks.push(`${item._metadata.types[0]} (${item._metadata.displayName})`)
      }
    })
  }
  
  // Also extract from composition grids if available (for nested structures)
  if (landingPageData.composition?.grids) {
    landingPageData.composition.grids.forEach((grid: any) => {
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
  
  const finalBlocks = Array.from(new Set(cmsBlocks)) // Remove duplicates
  console.log('Extracted blocks:', finalBlocks)
  
  return {
    seoData,
    pageMetadata,
    cmsBlocks: finalBlocks
  }
}

// Transform other page data (Article, etc.)
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
