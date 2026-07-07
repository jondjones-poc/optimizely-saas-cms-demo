'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface CardProps {
  Heading?: string
  SubHeading?: string
  Body?: string
  Image?: {
    base?: string
    default?: string
  }
  Links?: Array<{
    target: string
    text: string
    title: string
    url: {
      base: string
    }
  }>
  _metadata?: {
    key?: string
    displayName?: string
  }
  isPreview?: boolean
  contextMode?: string | null
}

const Card = ({ 
  Heading, 
  SubHeading, 
  Body, 
  Image, 
  Links, 
  _metadata, 
  isPreview = false, 
  contextMode = null 
}: CardProps) => {
  const { theme } = useTheme()

  // Use _metadata.key for data-epi-block-id if available
  const componentKey = _metadata?.key || ''

  return (
    <>
      {/* FeatureCard */}
      <motion.div
      className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 btn-hover ${
        theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
      }`}
      {...(contextMode === 'edit' && componentKey && { 'data-epi-block-id': componentKey })}
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {Image?.default && (
          <div 
            className="w-16 h-16 rounded-full overflow-hidden"
            {...(contextMode === 'edit' && { 'data-epi-edit': 'Image' })}
          >
            <img
              src={Image.default}
              alt={Heading || 'Card image'}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {Heading && (
          <h4 
            className={`text-xl font-bold ${
              theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
            }`}
            {...(contextMode === 'edit' && { 'data-epi-edit': 'Heading' })}
          >
            {Heading}
          </h4>
        )}
        {SubHeading && (
          <h5 
            className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-blue'
            }`}
            {...(contextMode === 'edit' && { 'data-epi-edit': 'SubHeading' })}
          >
            {SubHeading}
          </h5>
        )}
        {Body && (
          <p 
            className={`leading-relaxed ${
              theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/80'
            }`}
            {...(contextMode === 'edit' && { 'data-epi-edit': 'Body' })}
          >
            {Body}
          </p>
        )}
        {Links && Links.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {Links.map((link, linkIndex) => (
              <a
                key={linkIndex}
                href={link.url.base}
                target={link.target || '_self'}
                rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-dark-text text-dark-primary hover:bg-dark-textSecondary'
                    : 'bg-phamily-blue text-white hover:bg-phamily-lightBlue'
                }`}
              >
                {link.text}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
    </>
  )
}

export default Card


