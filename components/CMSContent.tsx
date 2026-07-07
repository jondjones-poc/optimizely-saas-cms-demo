'use client'

/**
 * CMS CONTENT RENDERER — Turns Optimizely JSON into HTML on the page.
 *
 * Optimizely stores a page as a "composition" — a nested layout:
 *
 *   Page (BlankExperience)
 *     └── composition.grids[]          ← full-width sections
 *           └── rows[]                 ← horizontal bands
 *                 └── columns[]        ← side-by-side areas
 *                       └── elements[] ← individual CMS blocks (Hero, Heading, …)
 *
 * This file walks that tree and calls BlockRenderer for each block.
 * BlockRenderer picks the right React component (Hero.tsx, Heading.tsx, etc.).
 *
 * LIVE PREVIEW: When contextMode === 'edit', this file adds data-epi-block-id on
 * each block wrapper so Optimizely can draw click-to-edit overlays in the CMS iframe.
 * Individual block components add data-epi-edit="FieldName" on editable fields.
 *
 * Data path note: the API wraps GraphQL once, so we read:
 *   data.data.data.BlankExperience.items[0]
 */

import BlockRenderer from './blocks/BlockRenderer'

interface CMSContentProps {
  data: any
  isLoading: boolean
  error: string | null
  isPreview?: boolean
  contextMode?: string | null
  cmsDemo?: string | null
}

export default function CMSContent({
  data,
  isLoading,
  error,
  isPreview = false,
  contextMode = null,
  cmsDemo = null,
}: CMSContentProps) {
  if (isLoading) {
    return (
      <section className="py-16 bg-white dark:bg-dark-primary">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phamily-blue mx-auto"></div>
            <p className="mt-4 text-phamily-gray dark:text-dark-text-secondary">Loading CMS content...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white dark:bg-dark-primary">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading CMS Content</h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  // Guard: make sure we actually received a homepage from Optimizely
  if (
    !data ||
    !data.data ||
    !data.data.data ||
    !data.data.data.BlankExperience ||
    !data.data.data.BlankExperience.items ||
    data.data.data.BlankExperience.items.length === 0
  ) {
    return (
      <section className="py-16 bg-white dark:bg-dark-primary">
        <div className="container mx-auto px-4">
          <div className="text-center text-phamily-gray dark:text-dark-text-secondary">
            <p>No CMS content found</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Debug info:</p>
              <p>Has data: {!!data ? 'Yes' : 'No'}</p>
              <p>Has data.data: {!!(data && data.data) ? 'Yes' : 'No'}</p>
              <p>Has data.data.data: {!!(data && data.data && data.data.data) ? 'Yes' : 'No'}</p>
              <p>
                Has BlankExperience:{' '}
                {!!(data && data.data && data.data.data && data.data.data.BlankExperience) ? 'Yes' : 'No'}
              </p>
              <p>
                Has items:{' '}
                {!!(
                  data &&
                  data.data &&
                  data.data.data &&
                  data.data.data.BlankExperience &&
                  data.data.data.BlankExperience.items
                )
                  ? 'Yes'
                  : 'No'}
              </p>
              {data &&
                data.data &&
                data.data.data &&
                data.data.data.BlankExperience &&
                data.data.data.BlankExperience.items && (
                  <p>Items length: {data.data.data.BlankExperience.items.length}</p>
                )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // First (and usually only) homepage item from Optimizely
  const homepage = data.data.data.BlankExperience.items[0]
  const composition = homepage.composition

  if (!composition) {
    return null
  }

  // GraphQL aliases "nodes" as grids/rows/columns/elements — handle both array shapes
  const grids = Array.isArray(composition.grids) ? composition.grids : composition.grids?.nodes || []

  if (!grids || grids.length === 0) {
    return null
  }

  return (
    <div
      id="cms-content-wrapper"
      className="relative w-full flex-1"
      style={{
        position: 'relative',
        isolation: 'isolate',
        zIndex: 0,
        clear: 'both',
        paddingTop: 0,
        marginTop: 0,
        top: 0,
        left: 0,
      }}
    >
      <div className="relative w-full flex-1 flex flex-col flex-nowrap justify-start">
        {/* LEVEL 1: Grids — each grid is a major section of the page */}
        {grids.map((grid: any) => {
          if (!grid) return null

          const rows = Array.isArray(grid.rows) ? grid.rows : grid.rows?.nodes || []
          if (!rows || rows.length === 0) return null

          return (
            <section
              key={grid.key}
              {...(contextMode === 'edit' && grid.key && { 'data-epi-block-id': grid.key })}
              data-epi-role="grid"
              data-epi-display-name={grid.displayName || 'Grid'}
              className="relative w-full flex flex-col flex-nowrap justify-start"
              style={{
                position: 'relative',
                margin: 0,
                padding: 0,
                transform: 'translateZ(0)',
                willChange: 'transform',
                isolation: 'isolate',
              }}
            >
              {/* LEVEL 2: Rows — horizontal layout bands inside a grid */}
              {rows.map((row: any) => {
                if (!row) return null

                const columns = Array.isArray(row.columns) ? row.columns : row.columns?.nodes || []
                if (!columns || columns.length === 0) return null

                return (
                  <div
                    key={row.key}
                    className="flex-1 flex flex-row flex-nowrap justify-start w-full"
                    data-epi-role="row"
                    data-epi-display-name={row.displayName || 'Row'}
                    style={{
                      position: 'relative',
                      width: '100%',
                    }}
                  >
                    {/* LEVEL 3: Columns — sit side-by-side within a row */}
                    {columns.map((column: any) => {
                      if (!column) return null

                      const elements = Array.isArray(column.elements)
                        ? column.elements
                        : column.elements?.nodes || []
                      if (!elements || elements.length === 0) return null

                      return (
                        <div
                          key={column.key}
                          className="flex-1 flex flex-col flex-nowrap justify-start"
                          data-epi-role="column"
                          data-epi-display-name={column.displayName || 'Column'}
                          style={{
                            position: 'relative',
                            minWidth: 0,
                          }}
                        >
                          {/* LEVEL 4: Elements — actual CMS blocks (Hero, Heading, etc.) */}
                          {elements.map((element: any) => {
                            // Inline block: content lives in element.component
                            if (element.component) {
                              const componentWithElementKey = {
                                ...element.component,
                                _elementKey: element.key,
                                _metadata: {
                                  ...element.component._metadata,
                                  key: element.component._metadata?.key || element.key,
                                },
                                _elementDisplayName: element.displayName,
                                _gridDisplayName: grid.displayName,
                                _columnData: {
                                  gridKey: grid.key,
                                  rowKey: row.key,
                                  columnKey: column.key,
                                },
                              }

                              const isHero = componentWithElementKey._metadata?.types?.[0] === 'Hero'

                              if (isHero) {
                                return (
                                  <BlockRenderer
                                    key={element.key || componentWithElementKey._metadata?.key}
                                    component={componentWithElementKey}
                                    isPreview={isPreview}
                                    contextMode={contextMode}
                                    cmsDemo={cmsDemo}
                                  />
                                )
                              }

                              return (
                                <div
                                  key={element.key || componentWithElementKey._metadata?.key}
                                  {...(contextMode === 'edit' && element.key && { 'data-epi-block-id': element.key })}
                                >
                                  <BlockRenderer
                                    component={componentWithElementKey}
                                    isPreview={isPreview}
                                    contextMode={contextMode}
                                    cmsDemo={cmsDemo}
                                  />
                                </div>
                              )
                            }

                            // Shared block: referenced by link rather than inline
                            if (element.element) {
                              const sharedComponentWithElementKey = {
                                ...element.element,
                                _isShared: true,
                                _elementKey: element.key,
                                _metadata: {
                                  ...element.element._metadata,
                                  key: element.element._metadata?.key || element.key,
                                },
                                _elementDisplayName: element.displayName,
                              }

                              return (
                                <div
                                  key={element.key || sharedComponentWithElementKey._metadata?.key}
                                  {...(contextMode === 'edit' && element.key && { 'data-epi-block-id': element.key })}
                                >
                                  <BlockRenderer
                                    component={sharedComponentWithElementKey}
                                    isPreview={isPreview}
                                    contextMode={contextMode}
                                    cmsDemo={cmsDemo}
                                  />
                                </div>
                              )
                            }

                            return null
                          })}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </section>
          )
        })}
      </div>
    </div>
  )
}
