'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Layers } from 'lucide-react'

interface SEOSettings {
  DisplayInMenu: string | null
  GraphType: string | null
  Indexing: string | null
  MetaDescription: string | null
  MetaTitle: string | null
}

interface PageMetadata {
  pageType: string
  displayName: string
  status: string
  url?: string
}

interface SEOButtonProps {
  seoData: SEOSettings | null
  pageMetadata: PageMetadata | null
  cmsBlocks: string[]
}

export default function SEOButton({ seoData, pageMetadata, cmsBlocks }: SEOButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'seo' | 'formatted' | 'blocks'>('seo')

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Code className="w-5 h-5" />
        </motion.div>
      </motion.button>

      {/* Inline Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-40 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Page Data</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('seo')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'seo'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                SEO Settings
              </button>
              <button
                onClick={() => setActiveTab('formatted')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'formatted'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Formatted
              </button>
              <button
                onClick={() => setActiveTab('blocks')}
                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'blocks'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                CMS Blocks ({cmsBlocks.length})
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-64 overflow-y-auto">
              {activeTab === 'seo' ? (
                seoData ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Meta Title:</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {seoData.MetaTitle || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Meta Description:</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {seoData.MetaDescription || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Graph Type:</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {seoData.GraphType || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Display in Menu:</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {seoData.DisplayInMenu || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Indexing:</span>
                      <span className="font-medium text-gray-900 text-sm">
                        {seoData.Indexing || 'Not set'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 text-sm">No SEO data available</p>
                  </div>
                )
              ) : activeTab === 'formatted' ? (
                pageMetadata ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Page Type:</span>
                      <span className="font-medium text-gray-900">
                        {pageMetadata.pageType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Display Name:</span>
                      <span className="font-medium text-gray-900">
                        {pageMetadata.displayName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        pageMetadata.status === 'Published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {pageMetadata.status}
                      </span>
                    </div>
                    {pageMetadata.url && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">URL:</span>
                        <span className="font-mono text-gray-900 text-xs">
                          {pageMetadata.url}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 text-sm">No page data available</p>
                  </div>
                )
              ) : activeTab === 'blocks' ? (
                cmsBlocks.length > 0 ? (
                  <div className="space-y-2">
                    {cmsBlocks.map((block, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{block}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 text-sm">No CMS blocks found</p>
                  </div>
                )
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}