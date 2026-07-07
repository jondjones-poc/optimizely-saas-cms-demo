'use client'

import { useState, useEffect } from 'react'

interface DividerProps {
  DividerSize?: 1 | 2 | 3 | string | number  // Support both number and string (GraphQL may return string)
  _metadata?: {
    key?: string
    displayName?: string
  }
  _gridDisplayName?: string
  _componentKey?: string
  isPreview?: boolean
  contextMode?: string | null
}

const Divider = ({ 
  DividerSize = 2,
  _metadata, 
  _gridDisplayName,
  _componentKey,
  isPreview = false, 
  contextMode = null 
}: DividerProps) => {
  // Normalize DividerSize to number (handle both string and number from GraphQL)
  const normalizeSize = (size: typeof DividerSize): 1 | 2 | 3 => {
    if (size === undefined || size === null) return 2
    const numSize = typeof size === 'string' ? parseInt(size, 10) : size
    if (numSize === 1) return 1
    if (numSize === 3) return 3
    return 2  // default
  }

  const [dividerSize, setDividerSize] = useState<1 | 2 | 3>(normalizeSize(DividerSize))

  // Update state when props change (for live preview updates)
  useEffect(() => {
    const normalized = normalizeSize(DividerSize)
    setDividerSize(normalized)
  }, [DividerSize])

  // Debug: Log DividerSize value
  useEffect(() => {
    if (isPreview && contextMode === 'edit') {
      console.log('🎯 Divider Component - Data received:', {
        'DividerSize (prop)': DividerSize,
        'DividerSize (normalized)': normalizeSize(DividerSize),
        'DividerSize (state)': dividerSize,
        'DividerSize type': typeof DividerSize,
        'Block Key': _metadata?.key
      })
    }
  }, [isPreview, contextMode, DividerSize, dividerSize, _metadata?.key])

  // Map DividerSize to height (1 = 1rem, 2 = 2rem, 3 = 3rem)
  // Using min-height and height to ensure the divider has actual height
  const getHeight = () => {
    switch (dividerSize) {
      case 1:
        return { minHeight: '1rem', height: '1rem' }  // 1rem = 16px
      case 3:
        return { minHeight: '3rem', height: '3rem' }  // 3rem = 48px
      case 2:
      default:
        return { minHeight: '2rem', height: '2rem' }  // 2rem = 32px (default)
    }
  }

  // Divider just adds horizontal white space
  return (
    <div 
      className="w-full"
      style={{ 
        position: 'relative',
        ...getHeight()
      }}
      {...(contextMode === 'edit' && { 'data-epi-edit': 'DividerSize' })}
      // NOTE: data-epi-block-id is on wrapper div in CMSContent.tsx (matching ContentBlock structure)
    >
      {/* Horizontal white space divider */}
    </div>
  )
}

export default Divider

