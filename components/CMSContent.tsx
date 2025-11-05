'use client'

import BlockRenderer from './blocks/BlockRenderer'

interface CMSContentProps {
  data: any
  isLoading: boolean
  error: string | null
  isPreview?: boolean
  contextMode?: string | null
  cmsDemo?: string | null  // cms_demo header value for DemoBlock
}

export default function CMSContent({ data, isLoading, error, isPreview = false, contextMode = null, cmsDemo = null }: CMSContentProps) {
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

  // Fix: Use the correct data path - there's an extra .data level
  if (!data || !data.data || !data.data.data || !data.data.data.BlankExperience || !data.data.data.BlankExperience.items || data.data.data.BlankExperience.items.length === 0) {
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
              <p>Has BlankExperience: {!!(data && data.data && data.data.data && data.data.data.BlankExperience) ? 'Yes' : 'No'}</p>
              <p>Has items: {!!(data && data.data && data.data.data && data.data.data.BlankExperience && data.data.data.BlankExperience.items) ? 'Yes' : 'No'}</p>
              {data && data.data && data.data.data && data.data.data.BlankExperience && data.data.data.BlankExperience.items && (
                <p>Items length: {data.data.data.BlankExperience.items.length}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const homepage = data.data.data.BlankExperience.items[0]
  const composition = homepage.composition

  // Render the full composition hierarchy (grid > row > column > component)
  // This matches the GraphQL structure and is required for inline editing
  // According to Optimizely docs: "The structure of your GraphQL query must match the structure of your DOM"
  // GraphQL uses aliases: grids: nodes, rows: nodes, columns: nodes
  // So we need to handle both direct arrays and .nodes structure
  if (!composition) {
    return null
  }

  // Handle GraphQL alias structure: grids: nodes means grids is an array directly
  const grids = Array.isArray(composition.grids) 
    ? composition.grids 
    : composition.grids?.nodes || []

  if (!grids || grids.length === 0) {
    return null
  }

  return (
    <>
      {grids.map((grid: any) => {
        if (!grid) return null

        // Handle rows: nodes alias structure
        const rows = Array.isArray(grid.rows) ? grid.rows : grid.rows?.nodes || []
        if (!rows || rows.length === 0) return null

        return (
          <section 
            key={grid.key} 
            {...(contextMode === 'edit' && grid.key && { 'data-epi-block-id': grid.key })}
            data-epi-role="grid"
            data-epi-display-name={grid.displayName || 'Grid'}
            className="w-full"
          >
            {rows.map((row: any) => {
              if (!row) return null

              // Handle columns: nodes alias structure
              const columns = Array.isArray(row.columns) ? row.columns : row.columns?.nodes || []
              if (!columns || columns.length === 0) return null

              // Special handling for Content Section with multiple columns - display side by side
              const isContentSection = grid.displayName === 'Content Section'
              const hasMultipleColumns = columns.length > 1
              const rowClassName = isContentSection && hasMultipleColumns 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'
                : undefined

              return (
                <div 
                  key={row.key}
                  // NOTE: Row does NOT have data-epi-block-id in working example - only Grid and Component do
                  // {...(contextMode === 'edit' && row.key && { 'data-epi-block-id': row.key })}
                  data-epi-role="row"
                  data-epi-display-name={row.displayName || 'Row'}
                  {...(rowClassName && { className: rowClassName })}
                >
                  {columns.map((column: any) => {
                    if (!column) return null

                    // Handle elements: nodes alias structure
                    const elements = Array.isArray(column.elements) ? column.elements : column.elements?.nodes || []
                    if (!elements || elements.length === 0) return null

                    return (
                      <div 
                        key={column.key}
                        // NOTE: Column does NOT have data-epi-block-id in working example - only Grid and Component do
                        // {...(contextMode === 'edit' && column.key && { 'data-epi-block-id': column.key })}
                        data-epi-role="column"
                        data-epi-display-name={column.displayName || 'Column'}
                      >
                        {elements.map((element: any) => {
                          // Handle both inline blocks (component) and shared blocks (element with contentLink)
                          // According to Optimizely docs: "The id field from each content item must be rendered as data-epi-block-id"
                          // In Optimizely Graph, the "id field" is actually the "key" field
                          // For inline components in composition, if component._metadata.key is null, use element.key as fallback
                          if (element.component) {
                            // Ensure component has the element key for fallback when _metadata.key is null
                            const componentWithElementKey = {
                              ...element.component,
                              _elementKey: element.key,
                              // If _metadata.key is missing, temporarily set it to element.key for inline editing
                              _metadata: {
                                ...element.component._metadata,
                                key: element.component._metadata?.key || element.key
                              },
                              _elementDisplayName: element.displayName,
                              _gridDisplayName: grid.displayName,
                              _columnData: {
                                gridKey: grid.key,
                                rowKey: row.key,
                                columnKey: column.key
                              }
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
                          } else if (element.element) {
                            // Shared block reference
                            const sharedComponentWithElementKey = {
                              ...element.element,
                              _isShared: true,
                              _elementKey: element.key,
                              _metadata: {
                                ...element.element._metadata,
                                key: element.element._metadata?.key || element.key
                              },
                              _elementDisplayName: element.displayName
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
    </>
  )
}
