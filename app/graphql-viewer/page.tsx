'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useBranding } from '@/contexts/BrandingContext'
import CustomHeader from '@/components/CustomHeader'
import Navigation from '@/components/Navigation'
import CustomFooter from '@/components/CustomFooter'
import Footer from '@/components/Footer'
import ThemeTest from '@/components/ThemeTest'
import PageTypesList from '@/components/PageTypesList'
import GraphQLQueryViewer from '@/components/GraphQLQueryViewer'
import { fetchHomepageData } from '@/services/homepage'

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

export default function GraphQLViewer() {
  const { theme } = useTheme()
  const { branding } = useBranding()
  const [viewMode, setViewMode] = useState<'types' | 'pages' | 'instances' | 'blocks'>('instances')
  const [pageTypes, setPageTypes] = useState<PageType[]>([])
  const [pages, setPages] = useState<Page[]>([])
  const [pageInstances, setPageInstances] = useState<PageInstance[]>([])
  const [blocks, setBlocks] = useState<PageType[]>([])
  const [selectedPageType, setSelectedPageType] = useState<PageType | null>(null)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [selectedPageInstance, setSelectedPageInstance] = useState<PageInstance | null>(null)
  const [selectedBlock, setSelectedBlock] = useState<PageType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to fetch homepage data specifically
  const fetchHomepageDataInstance = async () => {
    try {
      const result = await fetchHomepageData()

      if (result.success && result.data?.data?.BlankExperience?.items?.length > 0) {
        const homepageItem = result.data.data.BlankExperience.items[0]
        const homepageInstance = {
          key: homepageItem._metadata.key,
          displayName: homepageItem._metadata.displayName || 'Homepage',
          url: homepageItem._metadata.url?.default || '/',
          types: homepageItem._metadata.types || [],
          status: homepageItem._metadata.status,
          composition: homepageItem.composition,
          fullData: homepageItem
        }
        
        // Update the selected instance with fresh homepage data
        setSelectedPageInstance(homepageInstance)
        return homepageInstance
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error)
    }
    return null
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        if (viewMode === 'types') {
          const response = await fetch('/api/optimizely/page-types')
          const result = await response.json()

          if (result.success) {
            setPageTypes(result.data)
            if (result.data.length > 0) {
              setSelectedPageType(result.data[0])
            }
            setError(null)
          } else {
            setError(result.error || 'Failed to fetch page types')
          }
        } else if (viewMode === 'pages') {
          const response = await fetch('/api/optimizely/pages')
          const result = await response.json()

          if (result.success) {
            setPages(result.data)
            if (result.data.length > 0) {
              setSelectedPage(result.data[0])
            }
            setError(null)
          } else {
            setError(result.error || 'Failed to fetch pages')
          }
        } else if (viewMode === 'instances') {
          const response = await fetch('/api/optimizely/page-instances')
          const result = await response.json()

          if (result.success) {
            setPageInstances(result.data)
            if (result.data.length > 0) {
              setSelectedPageInstance(result.data[0])
            }
            setError(null)
          } else {
            setError(result.error || 'Failed to fetch page instances')
          }
        } else if (viewMode === 'blocks') {
          const response = await fetch('/api/optimizely/blocks')
          const result = await response.json()

          if (result.success) {
            setBlocks(result.data)
            if (result.data.length > 0) {
              setSelectedBlock(result.data[0])
            }
            setError(null)
          } else {
            setError(result.error || 'Failed to fetch blocks')
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [viewMode])


  const generateGraphQLQuery = (pageType: PageType) => {
    // Generate fields list from the page type fields
    const customFields = pageType.fields
      .filter(field => field.name !== '_metadata') // Skip _metadata as it's already included
      .map(field => `        ${field.name}`)
      .join('\n')

    const fragmentContent = customFields ? `\n${customFields}` : '\n        # No additional fields available'

    return `query Get${pageType.name.replace(/[^a-zA-Z0-9]/g, '')} {
  _Content(
    where: {
      _metadata: {
        types: {
          in: ["${pageType.name}"]
        }
      }
    }
    limit: 10
  ) {
    total
    items {
      _metadata {
        key
        version
        types
        displayName
        url {
          default
        }
        published
        status
      }
      _type: __typename
      ... on ${pageType.name} {${fragmentContent}
      }
    }
  }
}`
  }

  // Handle page instance selection
  const handleSelectPageInstance = async (pageInstance: PageInstance) => {
    setSelectedPageInstance(pageInstance)
    
    // If this is the homepage, fetch fresh data
    if (pageInstance.url === '/' || pageInstance.displayName.toLowerCase().includes('home')) {
      await fetchHomepageDataInstance()
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <CustomHeader />
      <Navigation />
      <ThemeTest />
      
      <div className="container mx-auto px-4 py-8 flex-1 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-phamily-darkGray dark:text-dark-text mb-4">
            GraphQL Viewer
          </h1>
          <p className="text-lg text-phamily-gray dark:text-dark-text-secondary">
            Explore Optimizely CMS page types and their corresponding GraphQL queries
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12" style={{ minHeight: '600px' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phamily-blue"></div>
            <span className="ml-4 text-phamily-darkGray dark:text-dark-text">
              Loading {viewMode === 'types' ? 'page types' : viewMode === 'pages' ? 'page definitions' : viewMode === 'instances' ? 'page instances' : 'block types'}...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8" style={{ minHeight: '600px' }}>
            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error</h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1" style={{ minHeight: '500px' }}>
            {/* Left Side - Page Types/Pages List */}
            <div className="bg-white dark:bg-dark-primary rounded-lg border dark:border-dark-border shadow-sm flex flex-col h-full">
              <div className="p-6 border-b dark:border-dark-border flex-shrink-0">
                <div className="flex gap-4">
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as 'types' | 'pages' | 'instances' | 'blocks')}
                    className="flex-1 px-4 py-2 text-base rounded border dark:border-dark-border bg-white dark:bg-dark-secondary text-phamily-darkGray dark:text-dark-text font-semibold"
                  >
                    <option value="types">Page Types</option>
                    <option value="pages">Page Type Definitions</option>
                    <option value="instances">Pages</option>
                    <option value="blocks">Blocks</option>
                  </select>
                  {viewMode === 'instances' && selectedPageInstance && (
                    <button
                      onClick={fetchHomepageDataInstance}
                      className="px-4 py-2 bg-phamily-blue text-white rounded-lg hover:bg-phamily-lightBlue transition-colors duration-200 text-sm whitespace-nowrap"
                      title="Refresh homepage data"
                    >
                      🔄 Refresh
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <PageTypesList
                  pageTypes={viewMode === 'types' ? pageTypes : []}
                  pages={viewMode === 'pages' ? pages : []}
                  pageInstances={viewMode === 'instances' ? pageInstances : []}
                  blocks={viewMode === 'blocks' ? blocks : []}
                  selectedPageType={selectedPageType}
                  selectedPage={selectedPage}
                  selectedPageInstance={selectedPageInstance}
                  selectedBlock={selectedBlock}
                  onSelectPageType={setSelectedPageType}
                  onSelectPage={setSelectedPage}
                  onSelectPageInstance={handleSelectPageInstance}
                  onSelectBlock={setSelectedBlock}
                  viewMode={viewMode}
                />
              </div>
            </div>

            {/* Right Side - GraphQL Query Viewer */}
            <div className="bg-white dark:bg-dark-primary rounded-lg border dark:border-dark-border shadow-sm h-full flex flex-col">
              <div className="p-6 border-b dark:border-dark-border flex-shrink-0">
                <h2 className="text-xl font-semibold text-phamily-darkGray dark:text-dark-text">
                  GraphQL Query
                </h2>
                <p className="text-sm text-phamily-gray dark:text-dark-text-secondary mt-1">
                  {viewMode === 'types'
                    ? 'Generated query for the selected page type'
                    : viewMode === 'pages'
                    ? 'Generated query for the selected page type definition'
                    : viewMode === 'instances'
                    ? 'Page content and blocks in JSON format'
                    : 'Generated query for the selected block type'
                  }
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <GraphQLQueryViewer
                query={
                  viewMode === 'types' 
                    ? (selectedPageType ? generateGraphQLQuery(selectedPageType) : '')
                    : viewMode === 'pages'
                    ? (selectedPage ? generateGraphQLQuery(selectedPage as any) : '')
                    : viewMode === 'instances'
                    ? (selectedPageInstance ? JSON.stringify(selectedPageInstance.fullData, null, 2) : '')
                    : (selectedBlock ? generateGraphQLQuery(selectedBlock) : '')
                }
                pageTypeName={
                  viewMode === 'types' 
                    ? selectedPageType?.name 
                    : viewMode === 'pages'
                    ? selectedPage?.displayName
                    : viewMode === 'instances'
                    ? selectedPageInstance?.displayName
                    : selectedBlock?.name
                }
                isLoading={false}
                isJsonView={viewMode === 'instances'}
              />
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <CustomFooter />
    </main>
  )
}
