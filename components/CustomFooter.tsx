'use client'

import { useState } from 'react'
import { useBranding } from '@/contexts/BrandingContext'
import { useTheme } from '@/contexts/ThemeContext'
import DataExplorer from './DataExplorer'

const CustomFooter = ({ optimizelyData, isLoading, error }: { 
  optimizelyData: any, 
  isLoading: boolean, 
  error: string | null 
}) => {
  const { branding } = useBranding()
  const { theme } = useTheme()
  const [isDataExplorerVisible, setIsDataExplorerVisible] = useState(false)

  const handleDoubleClick = () => {
    setIsDataExplorerVisible(true)
  }

  if (!branding.hasCustomBranding || !branding.footerImage) {
    return null
  }

  return (
    <>
      <div className="relative w-full">
        <img
          src={branding.footerImage}
          alt={`${branding.customer} Footer`}
          className="w-full h-auto cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          onDoubleClick={handleDoubleClick}
          title="Double-click to open Data Explorer"
        />
        
        {/* Subtle hint overlay */}
        <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-black/50 text-white' 
              : 'bg-white/80 text-gray-700'
          }`}>
            Double-click for data
          </div>
        </div>
      </div>

      {/* Data Explorer Modal */}
      <DataExplorer
        data={optimizelyData}
        isLoading={isLoading}
        error={error}
        isVisible={isDataExplorerVisible}
        onClose={() => setIsDataExplorerVisible(false)}
      />
    </>
  )
}

export default CustomFooter
