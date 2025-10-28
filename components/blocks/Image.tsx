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
  _gridDisplayName?: string
  isPreview?: boolean
  contextMode?: string | null
}

const Image = ({
  Image: ImageData,
  _metadata,
  _gridDisplayName,
  isPreview = false,
  contextMode = null
}: ImageProps) => {
  if (!ImageData?.url?.default) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <img
        src={ImageData.url.default}
        alt={_metadata?.displayName || 'Image'}
        className="w-full h-auto rounded-lg"
      />
    </motion.div>
  )
}

export default Image

