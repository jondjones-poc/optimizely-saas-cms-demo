'use client'

import { motion } from 'framer-motion'

interface ImageProps {
  Image?: {
    url?: {
      base?: string
      default?: string
    }
  }
  _metadata?: {
    key?: string
    displayName?: string
  }
  _componentKey?: string // Passed from BlockRenderer for data-epi-block-id
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const Image = ({
  Image: ImageData,
  _metadata,
  _gridDisplayName,
  _componentKey,
  isPreview = false,
  contextMode = null
}: ImageProps) => {
  if (!ImageData?.url?.default) {
    return null
  }

  // Use _componentKey if provided (from BlockRenderer), otherwise fall back to _metadata.key
  const componentKey = _componentKey || _metadata?.key || ''
  
  return (
    <>
      {/* ImageBlock */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full"
        {...(contextMode === 'edit' && componentKey && { 'data-epi-block-id': componentKey })}
        {...(contextMode === 'edit' && { 'data-epi-edit': 'Image' })}
      >
      <img
        src={ImageData.url.default}
        alt={_metadata?.displayName || 'Image'}
        className="w-full h-auto rounded-lg"
      />
    </motion.div>
    </>
  )
}

export default Image

