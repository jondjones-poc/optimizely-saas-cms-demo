'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, X, Database, Code, Eye } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface DataExplorerProps {
  data: any
  isLoading: boolean
  error: string | null
  isVisible: boolean
  onClose: () => void
}

const DataExplorer = ({ data, isLoading, error, isVisible, onClose }: DataExplorerProps) => {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'raw' | 'formatted'>('raw')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const formatData = (data: any) => {
    if (!data) return 'No data available'
    
    // Create a simplified, readable version
    const formatted = {
      success: data.success,
      timestamp: data.timestamp,
      content: {
        type: data.data?.data?.BlankExperience?.items?.[0]?._metadata?.types?.[0] || 'Unknown',
        displayName: data.data?.data?.BlankExperience?.items?.[0]?._metadata?.displayName || 'No title',
        blocks: data.data?.data?.BlankExperience?.items?.[0]?.composition?.grids?.map((grid: any) => ({
          name: grid.displayName,
          rows: grid.rows?.map((row: any) => ({
            name: row.displayName,
            columns: row.columns?.map((column: any) => ({
              name: column.displayName,
              elements: column.elements?.map((element: any) => ({
                name: element.displayName,
                type: element.component?._metadata?.types?.[0] || element.element?._metadata?.types?.[0] || 'Unknown'
              }))
            }))
          }))
        })) || []
      }
    }
    
    return JSON.stringify(formatted, null, 2)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`relative w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl ${
            theme === 'dark' 
              ? 'bg-dark-primary border-dark-border' 
              : 'bg-white border-gray-200'
          } border overflow-hidden`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-dark-secondary' : 'bg-gray-100'
              }`}>
                <Database className="w-6 h-6 text-phamily-blue" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-dark-text' : 'text-gray-900'
                }`}>
                  Data Explorer
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-dark-textSecondary' : 'text-gray-600'
                }`}>
                  Optimizely CMS Data Analysis
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-dark-secondary text-dark-text'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-phamily-blue"></div>
                <span className={`ml-3 ${
                  theme === 'dark' ? 'text-dark-textSecondary' : 'text-gray-600'
                }`}>
                  Loading data...
                </span>
              </div>
            ) : error ? (
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
              }`}>
                <p className="font-medium">Error loading data</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'raw'
                        ? theme === 'dark'
                          ? 'bg-phamily-blue text-white'
                          : 'bg-phamily-blue text-white'
                        : theme === 'dark'
                          ? 'bg-dark-secondary text-dark-text hover:bg-dark-border'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    Raw JSON
                  </button>
                  <button
                    onClick={() => setActiveTab('formatted')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'formatted'
                        ? theme === 'dark'
                          ? 'bg-phamily-blue text-white'
                          : 'bg-phamily-blue text-white'
                        : theme === 'dark'
                          ? 'bg-dark-secondary text-dark-text hover:bg-dark-border'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Formatted
                  </button>
                </div>

                {/* Data Display */}
                <div className={`rounded-lg border ${
                  theme === 'dark' ? 'border-dark-border' : 'border-gray-200'
                } overflow-hidden`}>
                  <div className={`flex items-center justify-between p-4 border-b ${
                    theme === 'dark' ? 'border-dark-border bg-dark-secondary' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-dark-text' : 'text-gray-700'
                    }`}>
                      {activeTab === 'raw' ? 'Raw JSON Data' : 'Formatted Data Structure'}
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-dark-primary text-dark-text hover:bg-dark-border'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      } border`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy JSON
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 max-h-96 overflow-auto">
                    <pre className={`text-sm ${
                      theme === 'dark' ? 'text-dark-text' : 'text-gray-800'
                    } whitespace-pre-wrap`}>
                      {activeTab === 'raw' 
                        ? JSON.stringify(data, null, 2)
                        : formatData(data)
                      }
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DataExplorer
