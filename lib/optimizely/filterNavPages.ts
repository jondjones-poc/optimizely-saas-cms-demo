/** Shape returned by /api/optimizely/pages */
export interface CmsPageForNav {
  _metadata: {
    key: string
    displayName: string
    url?: {
      default?: string
    }
  }
}

export interface NavMenuItem {
  key: string
  name: string
  href: string
}

/**
 * CMS pages suitable for top navigation — direct children of the site root,
 * excluding the homepage URL and the current page.
 */
export function filterCmsPagesForNav(
  pages: CmsPageForNav[],
  options?: { currentPath?: string; homepageUrl?: string }
): NavMenuItem[] {
  const homepageUrl = options?.homepageUrl || '/'
  const currentPath = options?.currentPath || '/'

  return pages
    .filter((page) => {
      const pageUrl = page._metadata.url?.default
      if (!pageUrl || pageUrl === homepageUrl || pageUrl === '/' || pageUrl === currentPath) {
        return false
      }
      const path = pageUrl.replace(/^\/+|\/+$/g, '')
      const segments = path ? path.split('/') : []
      return segments.length === 1
    })
    .filter(
      (page, index, self) =>
        index === self.findIndex((p) => p._metadata.url?.default === page._metadata.url?.default)
    )
    .sort((a, b) => (a._metadata.displayName || '').localeCompare(b._metadata.displayName || ''))
    .map((page) => ({
      key: page._metadata.key,
      name: page._metadata.displayName,
      href: page._metadata.url!.default!,
    }))
}
