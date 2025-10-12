'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, X, CheckCircle, XCircle, Code, Layers } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface OptimizelyDataPopupProps {
  data: any
  isLoading: boolean
  error?: string | null
}

const OptimizelyDataPopup = ({ data, isLoading, error }: OptimizelyDataPopupProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'pretty' | 'raw' | 'blocks'>('pretty')
  const { theme } = useTheme()

  // Extract blocks from the data
  const extractBlocks = () => {
    if (!data?.data?.BlankExperience?.items?.[0]?.composition) return []
    
    const composition = data.data.BlankExperience.items[0].composition
    const blocks: string[] = []

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

    return [...new Set(blocks)] // Remove duplicates
  }

  const blocks = extractBlocks()

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          theme === 'dark'
            ? 'bg-dark-text text-dark-primary'
            : 'bg-phamily-blue text-white'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="View Optimizely CMS Data"
      >
        <Database size={24} />
        {isLoading && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-phamily-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-phamily-orange"></span>
          </span>
        )}
      </motion.button>

      {/* Popup Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden ${
                theme === 'dark' ? 'bg-dark-primary border border-dark-border' : 'bg-white'
              }`}
            >
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
                  onClick={() => setIsOpen(false)}
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
              <div className={`p-6 overflow-y-auto max-h-[50vh] ${
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
                ) : activeTab === 'pretty' && data ? (
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
                            {data?.data?._Content?.total || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {data?.data?._Content?.items?.map((item: any, index: number) => (
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
                              {item._type}
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
                  </div>
                ) : activeTab === 'raw' && data ? (
                  <pre className={`p-4 rounded-lg overflow-x-auto text-xs font-mono ${
                    theme === 'dark'
                      ? 'bg-dark-primary text-dark-text'
                      : 'bg-white text-phamily-darkGray'
                  }`}>
                    {JSON.stringify(data, null, 2)}
                  </pre>
                ) : activeTab === 'blocks' && data ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${
                        theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                      }`}>
                        CMS Blocks Used on This Page
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default OptimizelyDataPopup
