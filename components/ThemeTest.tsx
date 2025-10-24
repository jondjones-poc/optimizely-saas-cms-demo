'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, X, CheckCircle, XCircle, Code, Layers, Copy, Check } from 'lucide-react'
import { fetchHomepageData } from '@/services/homepage'
import { usePathname } from 'next/navigation'

const ThemeTest = () => {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [showCmsData, setShowCmsData] = useState(false)
  const [activeTab, setActiveTab] = useState<'pretty' | 'raw' | 'blocks'>('pretty')
  const [optimizelyData, setOptimizelyData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Fetch CMS data
  const fetchCmsData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      let result
      
      if (pathname === '/') {
        // Homepage - use homepage API
        result = await fetchHomepageData()
      } else {
        // Other pages - use page API
        const response = await fetch(`/api/optimizely/page?path=${encodeURIComponent(pathname)}`)
        result = await response.json()
      }
      
      if (result.success) {
        // For non-homepage pages, wrap the data in the expected format
        if (pathname !== '/') {
          // result.data is the page data directly, wrap it properly
          setOptimizelyData({
            success: true,
            data: {
              data: {
                _Content: {
                  items: result.data ? [result.data] : []
                }
              }
            }
          })
        } else {
          setOptimizelyData(result)
        }
      } else {
        setError(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  // Extract blocks from the data
  const extractBlocks = () => {
    const blocks: string[] = []
    
    // Handle homepage data (BlankExperience with composition)
    if (optimizelyData?.data?.data?.BlankExperience?.items?.[0]?.composition) {
      const composition = optimizelyData.data.data.BlankExperience.items[0].composition
      
      if (composition.grids) {
        composition.grids.forEach((grid: any) => {
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
    }
    // Handle other page data (_Content)
    else if (optimizelyData?.data?.data?._Content?.items) {
      const items = optimizelyData.data.data._Content.items
      
      items.forEach((item: any) => {
        if (item) {
          // Add page type
          blocks.push(item._metadata?.displayName || 'Page')
          
          // Add specific fields based on content type
          if (item.Heading) blocks.push('Heading')
          if (item.SubHeading) blocks.push('SubHeading')
          if (item.Author) blocks.push('Author')
          if (item.AuthorEmail) blocks.push('AuthorEmail')
          if (item.TopContentArea) blocks.push('TopContentArea')
          if (item.MainContentArea) blocks.push('MainContentArea')
          if (item.SeoSettings) blocks.push('SeoSettings')
        }
      })
    }

    return Array.from(new Set(blocks)) // Remove duplicates
  }

  const blocks = extractBlocks()

  // Copy JSON to clipboard
  const copyToClipboard = async () => {
    if (!optimizelyData) return
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(optimizelyData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const cmsLinks = [
    {
      label: 'Homepage',
      url: '/',
      external: false
    },
    {
      label: 'CMS',
      url: 'https://app-epsajjcmson91rm1p001.cms.optimizely.com/ui/cms#context=epi.cms.contentdata:///6',
      external: true
    },
    {
      label: 'Content Types',
      url: 'https://app-epsajjcmson91rm1p001.cms.optimizely.com/ui/EPiServer.Cms.UI.Admin/default#/ContentTypes',
      external: true
    },
    {
      label: 'Graph Explorer',
      url: '/graphql-viewer',
      external: false
    }
  ]

  return (
    <>
      <div className="fixed bottom-32 right-4 z-40 bg-white dark:bg-dark-primary p-4 rounded-lg shadow-lg border dark:border-dark-border">
        <div className="space-y-2">
          {cmsLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target={link.external ? "_blank" : "_self"}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="w-full px-3 py-1 text-xs rounded bg-phamily-blue text-white hover:bg-phamily-lightBlue transition-colors duration-200 block text-center"
            >
              {link.label}
            </a>
          ))}
          
        </div>
      </div>

      {/* CMS Data Modal */}
      <AnimatePresence>
        {showCmsData && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCmsData(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-md z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className={`w-[80vw] h-[70vh] max-w-4xl rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg bg-white/90 dark:bg-dark-primary/90 border border-white/20 dark:border-dark-border/50 ${
                theme === 'dark' ? 'shadow-2xl' : 'shadow-2xl'
              }`}>
                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${
                theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <Database className={theme === 'dark' ? 'text-dark-text' : 'text-phamily-blue'} size={24} />
                  <div>
                    <h3 className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                    }`}>
                      Optimizely CMS Data
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowCmsData(false)}
                  className={`p-2 rounded-full transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-dark-secondary text-dark-text'
                      : 'hover:bg-phamily-lightGray text-phamily-darkGray'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status */}
              <div className={`px-6 py-3 border-b ${
                theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
              }`}>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-phamily-blue">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-phamily-blue"></div>
                    <span className="text-sm font-medium">Loading data...</span>
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-red-500">
                    <XCircle size={16} />
                    <span className="text-sm font-medium">Error: {error}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle size={16} />
                    <span className="text-sm font-medium">Data loaded successfully</span>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className={`px-6 py-2 border-b flex gap-4 ${
                theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
              }`}>
                <button
                  onClick={() => setActiveTab('pretty')}
                  className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
                    activeTab === 'pretty'
                      ? theme === 'dark'
                        ? 'bg-dark-secondary text-dark-text'
                        : 'bg-phamily-lightGray text-phamily-blue'
                      : theme === 'dark'
                        ? 'text-dark-textSecondary hover:text-dark-text'
                        : 'text-phamily-darkGray/60 hover:text-phamily-darkGray'
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === 'raw'
                      ? theme === 'dark'
                        ? 'bg-dark-secondary text-dark-text'
                        : 'bg-phamily-lightGray text-phamily-blue'
                      : theme === 'dark'
                        ? 'text-dark-textSecondary hover:text-dark-text'
                        : 'text-phamily-darkGray/60 hover:text-phamily-darkGray'
                  }`}
                >
                  <Code size={16} />
                  Raw JSON
                </button>
                <button
                  onClick={() => setActiveTab('blocks')}
                  className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === 'blocks'
                      ? theme === 'dark'
                        ? 'bg-dark-secondary text-dark-text'
                        : 'bg-phamily-lightGray text-phamily-blue'
                      : theme === 'dark'
                        ? 'text-dark-textSecondary hover:text-dark-text'
                        : 'text-phamily-darkGray/60 hover:text-phamily-darkGray'
                  }`}
                >
                  <Layers size={16} />
                  CMS Blocks ({blocks.length})
                </button>
              </div>

              {/* Content */}
              <div className={`p-6 overflow-y-auto h-[calc(70vh-120px)] ${
                theme === 'dark' ? 'bg-dark-secondary' : 'bg-gray-50'
              }`}>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-phamily-blue mx-auto"></div>
                  </div>
                ) : error ? (
                  <div className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
                  }`}>
                    <p className="font-medium mb-2">Failed to load data</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : activeTab === 'pretty' && optimizelyData ? (
                  <div className="space-y-4">
                    {/* Pretty formatted view */}
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${
                        theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                      }`}>
                        Content Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                            Total Items:
                          </span>
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                          }`}>
                            {optimizelyData?.data?.data?.BlankExperience?.total || 
                             optimizelyData?.data?.data?._Content?.items?.length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Homepage data */}
                    {optimizelyData?.data?.data?.BlankExperience?.items?.map((item: any, index: number) => (
                      <div key={index} className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
                      }`}>
                        <h4 className={`font-semibold mb-3 ${
                          theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                        }`}>
                          {item._metadata?.displayName || 'Page Content'}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                              Key:
                            </span>
                            <span className={`ml-2 font-mono ${
                              theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                            }`}>
                              {item._metadata?.key}
                            </span>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                              Type:
                            </span>
                            <span className={`ml-2 ${
                              theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                            }`}>
                              {item._metadata?.types?.[0] || 'Unknown'}
                            </span>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                              Status:
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              item._metadata?.status === 'Published'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {item._metadata?.status}
                            </span>
                          </div>
                          {item._metadata?.url?.default && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                URL:
                              </span>
                              <span className={`ml-2 font-mono ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {item._metadata.url.default}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* _Content data (for non-homepage pages) */}
                    {optimizelyData?.data?.data?._Content?.items?.map((item: any, index: number) => {
                      if (!item) return null
                      
                      return (
                        <div key={index} className={`p-4 rounded-lg ${
                          theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
                        }`}>
                          <h4 className={`font-semibold mb-3 ${
                            theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                          }`}>
                            {item._metadata?.displayName || 'Page Content'}
                          </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                              Key:
                            </span>
                            <span className={`ml-2 font-mono ${
                              theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                            }`}>
                              {item._metadata?.key}
                            </span>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                              Type:
                            </span>
                            <span className={`ml-2 ${
                              theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                            }`}>
                              {item._metadata?.types?.[0] || 'Unknown'}
                            </span>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                              Status:
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              item._metadata?.status === 'Published'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {item._metadata?.status}
                            </span>
                          </div>
                          {item._metadata?.url?.default && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                URL:
                              </span>
                              <span className={`ml-2 font-mono ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {item._metadata.url.default}
                              </span>
                            </div>
                          )}
                          
                          {/* ArticlePage specific fields */}
                          {item.Heading && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                Heading:
                              </span>
                              <span className={`ml-2 ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {item.Heading}
                              </span>
                            </div>
                          )}
                          
                          {item.SubHeading && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                SubHeading:
                              </span>
                              <span className={`ml-2 ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {item.SubHeading}
                              </span>
                            </div>
                          )}
                          
                          {item.Author && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                Author:
                              </span>
                              <span className={`ml-2 ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {item.Author}
                              </span>
                            </div>
                          )}
                          
                          {item.AuthorEmail && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                Author Email:
                              </span>
                              <span className={`ml-2 ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {item.AuthorEmail}
                              </span>
                            </div>
                          )}
                          
                          {/* LandingPage specific fields */}
                          {item.TopContentArea && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                Top Content Area:
                              </span>
                              <span className={`ml-2 ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {Array.isArray(item.TopContentArea) ? `${item.TopContentArea.length} items` : 'Present'}
                              </span>
                            </div>
                          )}
                          
                          {item.MainContentArea && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                Main Content Area:
                              </span>
                              <span className={`ml-2 ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {Array.isArray(item.MainContentArea) ? `${item.MainContentArea.length} items` : 'Present'}
                              </span>
                            </div>
                          )}
                          
                          {item.SeoSettings && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                SEO Settings:
                              </span>
                              <span className={`ml-2 ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {item.SeoSettings.MetaTitle || 'Configured'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      )
                    })}
                    
                    {/* Page data (for non-homepage pages) */}
                    {optimizelyData?.data?._metadata && (
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
                      }`}>
                        <h4 className={`font-semibold mb-3 ${
                          theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                        }`}>
                          {optimizelyData.data._metadata.displayName || 'Page Content'}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                              Key:
                            </span>
                            <span className={`ml-2 font-mono ${
                              theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                            }`}>
                              {optimizelyData.data._metadata.key}
                            </span>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                              Type:
                            </span>
                            <span className={`ml-2 ${
                              theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                            }`}>
                              {optimizelyData.data._metadata.types?.[0] || 'Unknown'}
                            </span>
                          </div>
                          <div>
                            <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                              Status:
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              optimizelyData.data._metadata.status === 'Published'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {optimizelyData.data._metadata.status}
                            </span>
                          </div>
                          {optimizelyData.data._metadata.url?.default && (
                            <div>
                              <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'}>
                                URL:
                              </span>
                              <span className={`ml-2 font-mono ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {optimizelyData.data._metadata.url.default}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Composition Data */}
                    {optimizelyData?.data?.data?.BlankExperience?.items?.[0]?.composition && (
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
                      }`}>
                        <h4 className={`font-semibold mb-3 ${
                          theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                        }`}>
                          Page Composition
                        </h4>
                        <div className="space-y-4">
                          {optimizelyData.data.data.BlankExperience.items[0].composition.grids?.map((grid: any, gridIndex: number) => (
                            <div key={gridIndex} className={`p-3 rounded border ${
                              theme === 'dark' ? 'bg-dark-secondary border-dark-border' : 'bg-gray-50 border-gray-200'
                            }`}>
                              <h5 className={`font-medium mb-2 ${
                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                              }`}>
                                {grid.displayName}
                              </h5>
                              {grid.rows?.map((row: any, rowIndex: number) => (
                                <div key={rowIndex} className="ml-4">
                                  {row.columns?.map((column: any, colIndex: number) => (
                                    <div key={colIndex} className="ml-4">
                                      {column.elements?.map((element: any, elemIndex: number) => (
                                        <div key={elemIndex} className={`p-2 rounded mb-2 ${
                                          theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
                                        }`}>
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <span className={`font-medium ${
                                                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                                              }`}>
                                                {element.displayName}
                                              </span>
                                              {element.component?._metadata?.types?.[0] && (
                                                <span className={`ml-2 text-xs px-2 py-1 rounded ${
                                                  theme === 'dark' ? 'bg-dark-border text-dark-textSecondary' : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                  {element.component._metadata.types[0]}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {/* Component Data */}
                                          {element.component && (
                                            <div className="mt-2 space-y-1">
                                              {Object.entries(element.component).map(([key, value]) => {
                                                if (key === '_metadata') return null
                                                return (
                                                  <div key={key} className="flex justify-between text-xs">
                                                    <span className={theme === 'dark' ? 'text-dark-textSecondary' : 'text-gray-600'}>
                                                      {key}:
                                                    </span>
                                                    <span className={`font-mono ${
                                                      theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                                                    }`}>
                                                      {String(value)}
                                                    </span>
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          )}
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
                    )}
                  </div>
                ) : activeTab === 'raw' && optimizelyData ? (
                  <div className="space-y-4">
                    {/* Copy Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={copyToClipboard}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          copied
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : theme === 'dark'
                              ? 'bg-dark-secondary text-dark-text hover:bg-dark-border'
                              : 'bg-phamily-lightGray text-phamily-darkGray hover:bg-gray-200'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check size={16} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy JSON
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* JSON Content */}
                    <div className={`rounded-lg border overflow-hidden ${
                      theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
                    }`}>
                      <pre className={`p-6 overflow-auto text-sm font-mono leading-relaxed ${
                        theme === 'dark'
                          ? 'bg-dark-primary text-dark-text'
                          : 'bg-white text-phamily-darkGray'
                      }`}>
                        {JSON.stringify(optimizelyData, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : activeTab === 'blocks' && optimizelyData ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${
                        theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                      }`}>
                        CMS Blocks Used on This Page
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {blocks.map((block, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              theme === 'dark' 
                                ? 'bg-dark-secondary border-dark-border' 
                                : 'bg-phamily-lightGray border-gray-200'
                            }`}
                          >
                            <p className={`text-sm font-medium ${
                              theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                            }`}>
                              {block}
                            </p>
                          </div>
                        ))}
                      </div>
                      {blocks.length === 0 && (
                        <p className={`text-center py-4 ${
                          theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'
                        }`}>
                          No blocks found
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`text-center py-8 ${
                    theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/60'
                  }`}>
                    No data available
                  </div>
                )}
              </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default ThemeTest
