'use client'

import { useRef } from 'react'

interface PageType {
  name: string
  fields: Array<{
    name: string
    type: string
    isRequired: boolean
  }>
}

interface Page {
  key: string
  displayName: string
  url: string
  types: string[]
  status: string
}

interface PageInstance {
  key: string
  displayName: string
  url: string
  types: string[]
  status: string
  composition?: any
  fullData: any
}

interface PageTypesListProps {
  pageTypes: PageType[]
  pages: Page[]
  pageInstances: PageInstance[]
  blocks: PageType[]
  selectedPageType: PageType | null
  selectedPage: PageType | null
  selectedPageInstance: PageInstance | null
  selectedBlock: PageType | null
  onSelectPageType: (pageType: PageType) => void
  onSelectPage: (page: PageType) => void
  onSelectPageInstance: (pageInstance: PageInstance) => void
  onSelectBlock: (block: PageType) => void
  viewMode: 'types' | 'pages' | 'instances' | 'blocks'
}

const PageTypesList = ({
  pageTypes,
  pages,
  pageInstances,
  blocks,
  selectedPageType,
  selectedPage,
  selectedPageInstance,
  selectedBlock,
  onSelectPageType,
  onSelectPage,
  onSelectPageInstance,
  onSelectBlock,
  viewMode
}: PageTypesListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Render page types
  if (viewMode === 'types') {
    if (pageTypes.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-phamily-gray dark:text-dark-text-secondary">
            No page types found
          </p>
        </div>
      )
    }

    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {pageTypes.map((pageType, index) => (
          <div
            key={index}
            onClick={() => {
              onSelectPageType(pageType)
              scrollToTop()
            }}
            className={`p-4 border-b dark:border-dark-border cursor-pointer transition-colors duration-200 ${
              selectedPageType?.name === pageType.name
                ? 'bg-phamily-lightBlue/10 dark:bg-phamily-blue/20 border-l-4 border-l-phamily-blue'
                : 'hover:bg-phamily-lightGray/10 dark:hover:bg-dark-secondary/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-phamily-darkGray dark:text-dark-text mb-1">
                  {pageType.name}
                </h3>
                <p className="text-sm text-phamily-gray dark:text-dark-text-secondary">
                  {pageType.fields.length} field{pageType.fields.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="ml-4">
                {selectedPageType?.name === pageType.name && (
                  <div className="w-2 h-2 bg-phamily-blue rounded-full"></div>
                )}
              </div>
            </div>
            
            {/* Show first few fields as preview */}
            {pageType.fields.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {pageType.fields.slice(0, 3).map((field, fieldIndex) => (
                    <span
                      key={fieldIndex}
                      className="text-xs px-2 py-1 rounded bg-phamily-lightGray dark:bg-dark-secondary text-phamily-darkGray dark:text-dark-text"
                    >
                      {field.name}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  ))}
                  {pageType.fields.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded bg-phamily-lightGray dark:bg-dark-secondary text-phamily-gray dark:text-dark-text-secondary">
                      +{pageType.fields.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Render pages
  if (viewMode === 'pages') {
    if (pages.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-phamily-gray dark:text-dark-text-secondary">
            No pages found
          </p>
        </div>
      )
    }

    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {pages.map((page, index) => (
          <div
            key={index}
            onClick={() => {
              onSelectPage(page)
              scrollToTop()
            }}
            className={`p-4 border-b dark:border-dark-border cursor-pointer transition-colors duration-200 ${
              selectedPage?.displayName === page.displayName
                ? 'bg-phamily-lightBlue/10 dark:bg-phamily-blue/20 border-l-4 border-l-phamily-blue'
                : 'hover:bg-phamily-lightGray/10 dark:hover:bg-dark-secondary/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-phamily-darkGray dark:text-dark-text mb-1">
                  {page.displayName}
                </h3>
                <p className="text-sm text-phamily-gray dark:text-dark-text-secondary">
                  {page.types.length} type{page.types.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="ml-4">
                {selectedPage?.displayName === page.displayName && (
                  <div className="w-2 h-2 bg-phamily-blue rounded-full"></div>
                )}
              </div>
            </div>
            
            {/* Show types as preview */}
            {page.types.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {page.types.slice(0, 3).map((type, typeIndex) => (
                    <span
                      key={typeIndex}
                      className="text-xs px-2 py-1 rounded bg-phamily-lightGray dark:bg-dark-secondary text-phamily-darkGray dark:text-dark-text"
                    >
                      {type}
                    </span>
                  ))}
                  {page.types.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded bg-phamily-lightGray dark:bg-dark-secondary text-phamily-gray dark:text-dark-text-secondary">
                      +{page.types.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Render page instances
  if (viewMode === 'instances') {
    if (pageInstances.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-phamily-gray dark:text-dark-text-secondary">
            No pages found
          </p>
        </div>
      )
    }

    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {pageInstances.map((instance, index) => {
          // Count blocks in composition
          let blockCount = 0
          if (instance.composition?.grids) {
            instance.composition.grids.forEach((grid: any) => {
              if (grid.rows) {
                grid.rows.forEach((row: any) => {
                  if (row.columns) {
                    row.columns.forEach((column: any) => {
                      if (column.elements) {
                        blockCount += column.elements.length
                      }
                    })
                  }
                })
              }
            })
          }

          return (
            <div
              key={instance.key}
              onClick={() => {
                onSelectPageInstance(instance)
                scrollToTop()
              }}
              className={`p-4 border-b dark:border-dark-border cursor-pointer transition-colors duration-200 ${
                selectedPageInstance?.key === instance.key
                  ? 'bg-phamily-lightBlue/10 dark:bg-phamily-blue/20 border-l-4 border-l-phamily-blue'
                  : 'hover:bg-phamily-lightGray/10 dark:hover:bg-dark-secondary/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-phamily-darkGray dark:text-dark-text mb-1">
                    {instance.displayName}
                  </h3>
                  <p className="text-xs text-phamily-gray dark:text-dark-text-secondary mb-1">
                    URL: {instance.url}
                  </p>
                  <p className="text-xs text-phamily-gray dark:text-dark-text-secondary">
                    {blockCount} block{blockCount !== 1 ? 's' : ''} • {instance.status}
                  </p>
                </div>
                <div className="ml-4">
                  {selectedPageInstance?.key === instance.key && (
                    <div className="w-2 h-2 bg-phamily-blue rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render blocks
  if (viewMode === 'blocks') {
    if (blocks.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-phamily-gray dark:text-dark-text-secondary">
            No block types found
          </p>
        </div>
      )
    }

    return (
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {blocks.map((block, index) => (
          <div
            key={index}
            onClick={() => {
              onSelectBlock(block)
              scrollToTop()
            }}
            className={`p-4 border-b dark:border-dark-border cursor-pointer transition-colors duration-200 ${
              selectedBlock?.name === block.name
                ? 'bg-phamily-lightBlue/10 dark:bg-phamily-blue/20 border-l-4 border-l-phamily-blue'
                : 'hover:bg-phamily-lightGray/10 dark:hover:bg-dark-secondary/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-phamily-darkGray dark:text-dark-text mb-1">
                  {block.name}
                </h3>
                <p className="text-sm text-phamily-gray dark:text-dark-text-secondary">
                  {block.fields.length} field{block.fields.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="ml-4">
                {selectedBlock?.name === block.name && (
                  <div className="w-2 h-2 bg-phamily-blue rounded-full"></div>
                )}
              </div>
            </div>
            
            {/* Show first few fields as preview */}
            {block.fields.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {block.fields.slice(0, 3).map((field, fieldIndex) => (
                    <span
                      key={fieldIndex}
                      className="text-xs px-2 py-1 rounded bg-phamily-lightGray dark:bg-dark-secondary text-phamily-darkGray dark:text-dark-text"
                    >
                      {field.name}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  ))}
                  {block.fields.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded bg-phamily-lightGray dark:bg-dark-secondary text-phamily-gray dark:text-dark-text-secondary">
                      +{block.fields.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return null // Should not happen
}

export default PageTypesList