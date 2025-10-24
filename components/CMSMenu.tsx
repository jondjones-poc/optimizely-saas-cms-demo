'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { Home, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface PageData {
  _metadata: {
    key: string
    displayName: string
    types: string[]
    url: {
      default: string
    }
  }
}

interface CMSMenuProps {
  currentPath?: string
  isVisible: boolean
  onClose: () => void
}

const CMSMenu = ({ currentPath = '/', isVisible, onClose }: CMSMenuProps) => {
  const { theme } = useTheme()
  const [pages, setPages] = useState<PageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all pages from CMS
  useEffect(() => {
    const fetchPages = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/optimizely/pages')
        const result = await response.json()
        
        if (result.success && result.data) {
          setPages(result.data)
        } else {
          setError(result.error || 'Failed to fetch pages')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pages')
      } finally {
        setIsLoading(false)
      }
    }

    if (isVisible) {
      fetchPages()
    }
  }, [isVisible])

  // Filter out the current page and homepage
  const filteredPages = pages.filter(page => {
    const pageUrl = page._metadata.url?.default
    return pageUrl && pageUrl !== currentPath && pageUrl !== '/'
  })

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      x: -20
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute top-full left-0 right-0 z-50 backdrop-blur-md bg-white/10 dark:bg-black/10 border-t border-white/20 dark:border-white/10 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
                <span className="ml-3 text-white/80">
                  Loading pages...
                </span>
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg backdrop-blur-sm bg-red-500/20 text-red-200 border border-red-400/20">
                <p className="font-medium">Error loading pages</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Homepage Link */}
                <motion.div variants={itemVariants}>
                  <Link
                    href="/"
                    className={`block p-4 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm ${
                      currentPath === '/'
                        ? 'bg-phamily-blue text-white shadow-lg'
                        : 'bg-gray-800/60 dark:bg-gray-900/60 hover:bg-gray-700/70 dark:hover:bg-gray-800/70 text-white border border-gray-600/30 dark:border-gray-700/30'
                    }`}
                    onClick={onClose}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm bg-gray-600/50 dark:bg-gray-700/50 border border-gray-500/30 dark:border-gray-600/30">
                        <Home size={16} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">Homepage</h4>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* CMS Pages */}
                {filteredPages.map((page) => (
                  <motion.div key={page._metadata.key} variants={itemVariants}>
                    <Link
                      href={page._metadata.url.default}
                      className={`block p-4 rounded-lg transition-all duration-200 hover:scale-105 backdrop-blur-sm ${
                        currentPath === page._metadata.url.default
                          ? 'bg-phamily-blue text-white shadow-lg'
                          : 'bg-gray-800/60 dark:bg-gray-900/60 hover:bg-gray-700/70 dark:hover:bg-gray-800/70 text-white border border-gray-600/30 dark:border-gray-700/30'
                      }`}
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm bg-gray-600/50 dark:bg-gray-700/50 border border-gray-500/30 dark:border-gray-600/30">
                          <span className="text-xs font-bold">
                            {page._metadata.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{page._metadata.displayName}</h4>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

              </div>
            )}

            {filteredPages.length === 0 && !isLoading && !error && (
              <div className="text-center py-8 text-white/60">
                <p>No additional pages found</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CMSMenu
