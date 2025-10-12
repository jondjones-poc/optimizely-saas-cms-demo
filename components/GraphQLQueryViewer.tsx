'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface GraphQLQueryViewerProps {
  query: string
  pageTypeName?: string
  isLoading?: boolean
  isJsonView?: boolean
}

export default function GraphQLQueryViewer({ query, pageTypeName, isLoading = false, isJsonView = false }: GraphQLQueryViewerProps) {
  const { theme } = useTheme()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(query)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy query:', err)
    }
  }


  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-phamily-blue"></div>
          <span className="ml-3 text-phamily-gray dark:text-dark-text-secondary">
            Loading field information...
          </span>
        </div>
      </div>
    )
  }

  if (!query) {
    return (
      <div className="p-6 text-center">
        <p className="text-phamily-gray dark:text-dark-text-secondary">
          Select a page type to view its GraphQL query
        </p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h3 className="font-semibold text-phamily-darkGray dark:text-dark-text">
            {isJsonView ? `Content for ${pageTypeName}` : `Query for ${pageTypeName}`}
          </h3>
          <p className="text-sm text-phamily-gray dark:text-dark-text-secondary">
            {isJsonView ? 'Page data with blocks and composition' : 'Read-only GraphQL query'}
          </p>
        </div>
        <button
          onClick={copyToClipboard}
          className={`px-3 py-1 text-sm rounded transition-colors duration-200 ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-phamily-blue text-white hover:bg-phamily-lightBlue'
          }`}
        >
          {copied ? 'Copied!' : isJsonView ? 'Copy JSON' : 'Copy Query'}
        </button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <pre className="bg-gray-50 dark:bg-dark-secondary rounded-lg p-4 overflow-auto text-sm font-mono border dark:border-dark-border whitespace-pre h-full">
          <code className="text-gray-800 dark:text-dark-text">
            {query}
          </code>
        </pre>
      </div>
      
      {!isJsonView && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex-shrink-0">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
            Query Details:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Fetches all content of type "{pageTypeName}"</li>
            <li>• Returns total count and paginated items</li>
            <li>• Includes standard Optimizely fields (_content_key, _content_type, etc.)</li>
            <li>• Includes all custom fields for the page type</li>
          </ul>
        </div>
      )}
    </div>
  )
}
