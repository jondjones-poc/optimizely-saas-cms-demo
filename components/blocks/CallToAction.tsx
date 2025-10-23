'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

interface LinkData {
  target: string | null
  text: string
  title: string | null
  url: {
    base: string | null
    default: string | null
  }
}

interface CallToActionProps {
  Header?: string
  Links?: LinkData[]
  _metadata?: {
    key?: string
    displayName?: string
  }
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const CallToAction = ({ 
  Header, 
  Links, 
  _metadata, 
  _gridDisplayName, 
  isPreview = false, 
  contextMode = null 
}: CallToActionProps) => {
  console.log('CallToAction component called with props:', { Header, Links, _metadata, _gridDisplayName })
  const { theme } = useTheme()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Check if there's no content data
  const hasContent = Header || (Links && Links.length > 0)

  if (!hasContent) {
    console.log('CallToAction: No content available, showing empty state')
    return (
      <section ref={ref} className="py-20 border-4 border-red-500 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">No Call To Action Content</h3>
          <p className="text-gray-600 dark:text-gray-400">Header and Links data not available</p>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className={`py-20 ${
      theme === 'dark' ? 'bg-dark-secondary' : 'bg-phamily-lightGray'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className={`text-center rounded-2xl p-12 ${
            theme === 'dark' ? 'bg-dark-primary' : 'bg-phamily-lightGray'
          }`}
        >
          {Header && (
            <h4 
              className={`text-3xl font-bold mb-6 ${
                theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
              }`}
              {...(contextMode === 'edit' && { 'data-epi-edit': 'Header' })}
            >
              {Header}
            </h4>
          )}
          {Links && Links.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {Links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url.default || '#'}
                  target={link.target || '_self'}
                  className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 btn-hover flex items-center justify-center gap-2 ${
                    index === 0
                      ? `${
                          theme === 'dark'
                            ? 'bg-phamily-blue text-white hover:bg-phamily-lightBlue'
                            : 'bg-phamily-blue text-white hover:bg-phamily-lightBlue'
                        }`
                      : `border-2 border-phamily-blue text-phamily-blue hover:bg-phamily-blue hover:text-white ${
                          theme === 'dark' ? 'text-phamily-blue' : 'text-phamily-blue'
                        }`
                  }`}
                  {...(contextMode === 'edit' && { 'data-epi-edit': `Links[${index}].Text` })}
                >
                  {link.text}
                  <ArrowRight size={20} />
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default CallToAction
