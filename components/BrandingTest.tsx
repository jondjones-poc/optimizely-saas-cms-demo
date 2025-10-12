'use client'

import { useBranding } from '@/contexts/BrandingContext'

const BrandingTest = () => {
  const { branding } = useBranding()

  return (
    <div className="fixed top-20 left-4 z-50 bg-white dark:bg-dark-primary p-4 rounded-lg shadow-lg border dark:border-dark-border">
      <h3 className="text-sm font-bold mb-2 text-phamily-darkGray dark:text-dark-text">
        Branding Test
      </h3>
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-phamily-darkGray/60 dark:text-dark-textSecondary">Customer:</span>
          <span className="ml-2 text-phamily-darkGray dark:text-dark-text">
            {branding.customer || 'None'}
          </span>
        </div>
        <div>
          <span className="text-phamily-darkGray/60 dark:text-dark-textSecondary">Custom Branding:</span>
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            branding.hasCustomBranding
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
          }`}>
            {branding.hasCustomBranding ? 'Active' : 'Inactive'}
          </span>
        </div>
        {branding.favicon && (
          <div>
            <span className="text-phamily-darkGray/60 dark:text-dark-textSecondary">Favicon:</span>
            <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
          </div>
        )}
        {branding.headerImage && (
          <div>
            <span className="text-phamily-darkGray/60 dark:text-dark-textSecondary">Header:</span>
            <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
          </div>
        )}
        {branding.footerImage && (
          <div>
            <span className="text-phamily-darkGray/60 dark:text-dark-textSecondary">Footer:</span>
            <span className="ml-2 text-green-600 dark:text-green-400">✓</span>
          </div>
        )}
      </div>
      <div className="mt-3 pt-2 border-t dark:border-dark-border">
        <p className="text-xs text-phamily-darkGray/60 dark:text-dark-textSecondary">
          Add header: <code className="bg-gray-100 dark:bg-dark-secondary px-1 rounded">
            cms_demo: metrobank
          </code>
        </p>
      </div>
    </div>
  )
}

export default BrandingTest
