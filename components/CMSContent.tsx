'use client'

import BlockRenderer from './blocks/BlockRenderer'

interface CMSContentProps {
  data: any
  isLoading: boolean
  error: string | null
  isPreview?: boolean
  contextMode?: string | null
}

export default function CMSContent({ data, isLoading, error, isPreview = false, contextMode = null }: CMSContentProps) {
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
                    _elementDisplayName: element.displayName,
                    _gridDisplayName: grid.displayName,
                    _columnData: {
                      gridKey: grid.key,
                      rowKey: row.key,
                      columnKey: column.key
                    }
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

  // Group blocks by grid for special handling
  const blocksByGrid: Record<string, any[]> = {}
  blocks.forEach(block => {
    const gridName = block._gridDisplayName || 'default'
    if (!blocksByGrid[gridName]) {
      blocksByGrid[gridName] = []
    }
    blocksByGrid[gridName].push(block)
  })

  return (
    <>
      {/* Render CMS Blocks */}
      {Object.entries(blocksByGrid).map(([gridName, gridBlocks]) => {
        // Special handling for Content Section with two columns
        if (gridName === 'Content Section' && gridBlocks.length === 2) {
          return (
            <section key={gridName} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gridBlocks.map((block, index) => (
                  <BlockRenderer 
                    key={block._metadata?.key || index} 
                    component={block} 
                    isPreview={isPreview}
                    contextMode={contextMode}
                  />
                ))}
              </div>
            </section>
          )
        }
        
        // Default rendering for other grids
        return gridBlocks.map((block, index) => (
          <BlockRenderer 
            key={block._metadata?.key || index} 
            component={block} 
            isPreview={isPreview}
            contextMode={contextMode}
          />
        ))
      })}
    </>
  )
}

