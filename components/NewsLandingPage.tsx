'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface ArticleData {
  _metadata: {
    key: string
    displayName: string
    types: string[]
    url: {
      default: string
    }
    published: string
    status: string
  }
  Heading: string
  SubHeading?: string
  Author?: string
  Body?: {
    html: string
  }
  PromoImage?: {
    url: {
      base: string
      default: string
      graph: string
    }
  }
}

interface NewsLandingPageProps {
  data: {
    Title?: string
    _metadata: {
      url: {
        default: string
      }
    }
  }
}

export default function NewsLandingPage({ data }: NewsLandingPageProps) {
  const { theme } = useTheme()
  const [articles, setArticles] = useState<ArticleData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Separate featured article (latest) from regular articles
  const featuredArticle = articles.length > 0 ? articles[0] : null
  const regularArticles = articles.slice(1)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`/api/optimizely/news-articles?parentPath=${data._metadata.url.default}`)
        const result = await response.json()
        
        if (result.success) {
          setArticles(result.data)
        } else {
          setError(result.error || 'Failed to fetch articles')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch articles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [data._metadata.url.default])

  // Helper function to create excerpt from HTML
  const createExcerpt = (html: string, maxLength: number = 150) => {
    if (!html) return ''
    
    // Remove HTML tags and get plain text
    const text = html.replace(/<[^>]*>/g, '')
    
    // Truncate and add ellipsis if needed
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-primary">
      {/* Hero Section - Featured article full-bleed image with overlay */}
      {featuredArticle && featuredArticle.PromoImage?.url?.default ? (
        <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden">
          <img
            src={featuredArticle.PromoImage.url.default}
            alt={featuredArticle.Heading}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          <div className="relative z-10 h-full">
            <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-12">
              <div className="max-w-4xl text-white">
                <p className="text-sm opacity-90 mb-3">
                  {new Date(featuredArticle._metadata.published).toLocaleDateString()}
                  {featuredArticle.Author ? ` • By ${featuredArticle.Author}` : ''}
                </p>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow">
                  {featuredArticle.Heading}
                </h1>
                {featuredArticle.SubHeading && (
                  <p className="mt-4 text-lg md:text-xl text-white/90 max-w-3xl">
                    {featuredArticle.SubHeading}
                  </p>
                )}
                {featuredArticle.Body?.html && (
                  <p className="mt-4 text-base md:text-lg text-white/80 max-w-3xl">
                    {createExcerpt(featuredArticle.Body.html, 220)}
                  </p>
                )}
                <a
                  href={featuredArticle._metadata.url.default}
                  className="inline-flex items-center mt-6 bg-white text-gray-900 hover:bg-gray-100 font-semibold px-5 py-3 rounded-md transition-colors"
                >
                  Read Story
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                {data.Title}
              </h1>
            </div>
          </div>
        </section>
      )}

      {/* Featured card section removed; hero above now displays featured article */}

      {/* The Latest Section */}
      {regularArticles.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-dark-text mb-12 text-left border-l-4 border-green-500 pl-3">
                The Latest
              </h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 dark:text-dark-textSecondary">Loading articles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400">Error: {error}</p>
              </div>
            ) : regularArticles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-dark-textSecondary">No articles found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {regularArticles.map((article, index) => (
                  <article key={article._metadata.key} className="bg-white dark:bg-dark-secondary rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col md:flex-row">
                      {/* Article Image */}
                      <div className="w-full md:w-1/3 h-64 md:h-auto bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        {article.PromoImage?.url?.default ? (
                          <img 
                            src={article.PromoImage.url.default} 
                            alt={article.Heading}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400 text-center">
                            <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm">No image available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="w-full md:w-2/3 p-8">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {new Date(article._metadata.published).toLocaleDateString()}
                          </span>
                          {article.Author && (
                            <span className="text-sm text-gray-600 dark:text-dark-textSecondary">
                              By {article.Author}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text mb-4 leading-tight">
                          {article.Heading}
                        </h3>
                        
                        {article.SubHeading && (
                          <h4 className="text-lg text-gray-700 dark:text-dark-textSecondary mb-4">
                            {article.SubHeading}
                          </h4>
                        )}
                        
                        <p className="text-gray-600 dark:text-dark-textSecondary leading-relaxed mb-6">
                          {createExcerpt(article.Body?.html || '')}
                        </p>
                        
                        <a 
                          href={article._metadata.url.default}
                          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                        >
                          Read More
                          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      )}
    </div>
  )
}
