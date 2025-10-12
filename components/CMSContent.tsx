'use client'

import BlockRenderer from './blocks/BlockRenderer'

interface CMSContentProps {
  data: any
  isLoading: boolean
  error: string | null
}

export default function CMSContent({ data, isLoading, error }: CMSContentProps) {
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

  if (!data || !data.data || !data.data.BlankExperience || !data.data.BlankExperience.items || data.data.BlankExperience.items.length === 0) {
    return (
      <section className="py-16 bg-white dark:bg-dark-primary">
        <div className="container mx-auto px-4">
          <div className="text-center text-phamily-gray dark:text-dark-text-secondary">
            <p>No CMS content found</p>
          </div>
        </div>
      </section>
    )
  }

  const homepage = data.data.BlankExperience.items[0]
  const composition = homepage.composition

  // Extract all blocks from composition to render them
  const blocks: any[] = []
  if (composition && composition.grids) {
    composition.grids.forEach((grid: any) => {
      // Skip empty grids
      if (!grid || !grid.rows) return
      
      grid.rows.forEach((row: any) => {
        if (row.columns) {
          row.columns.forEach((column: any) => {
            if (column.elements) {
              column.elements.forEach((element: any) => {
                // Handle both inline blocks (component) and shared blocks (element with contentLink)
                if (element.component) {
                  blocks.push({
                    ...element.component,
                    _isShared: element.component._metadata?.key !== null,
                    _elementKey: element.key,
                    _elementDisplayName: element.displayName
                  })
                } else if (element.element) {
                  // Shared block reference
                  blocks.push({
                    ...element.element,
                    _isShared: true,
                    _elementKey: element.key,
                    _elementDisplayName: element.displayName
                  })
                }
              })
            }
          })
        }
      })
    })
  }

  return (
    <>
      {/* Render CMS Blocks */}
      {blocks.length > 0 ? (
        blocks.map((block, index) => (
          <BlockRenderer key={block._metadata?.key || index} component={block} />
        ))
      ) : (
        <div className="py-16 bg-white dark:bg-dark-primary">
          <div className="container mx-auto px-4 text-center">
            <p className="text-phamily-gray dark:text-dark-text-secondary">No blocks found in composition</p>
          </div>
        </div>
      )}

      {/* CMS Content Section - Show structure for debugging */}
      <section className="py-16 bg-phamily-lightGray dark:bg-dark-secondary">
        <div className="container mx-auto px-4" style={{ width: '90%' }}>
          <div className="mx-auto">
            {/* Display grids */}
            {composition && composition.grids && composition.grids.map((grid: any, gridIndex: number) => (
              <div key={grid.key || gridIndex} className="bg-white dark:bg-dark-primary rounded-lg p-8 mb-6 shadow-md">
                <h3 className="text-2xl font-bold text-phamily-blue dark:text-phamily-lightBlue mb-4">
                  {grid.displayName}
                </h3>
                
                {/* Display rows and columns */}
                {grid.rows && grid.rows.map((row: any, rowIndex: number) => (
                  <div key={row.key || rowIndex} className="mb-4">
                    {row.columns && row.columns.map((column: any, colIndex: number) => (
                      <div key={column.key || colIndex} className="mb-4">
                        {column.elements && column.elements.map((element: any, elemIndex: number) => (
                          <div key={element.key || elemIndex} className="p-4 bg-phamily-lightGray/30 dark:bg-dark-secondary/30 rounded">
                            <p className="text-phamily-darkGray dark:text-dark-text">
                              <span className="font-semibold">{element.displayName}</span>
                              {element.component && element.component._metadata && (
                                <span className="text-sm text-phamily-gray dark:text-dark-text-secondary ml-2">
                                  ({element.component._metadata.types?.[0] || 'Component'})
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}

