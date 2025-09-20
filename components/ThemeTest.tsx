'use client'

import { useTheme } from '@/contexts/ThemeContext'

const ThemeTest = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-dark-primary p-4 rounded-lg shadow-lg border dark:border-dark-border">
      <h3 className="text-sm font-bold mb-2 text-phamily-darkGray dark:text-dark-text">
        Theme Test
      </h3>
      <p className="text-xs text-phamily-darkGray/80 dark:text-dark-textSecondary mb-2">
        Current: {theme}
      </p>
      <div className="space-y-2">
        <button
          onClick={() => setTheme('default')}
          className={`w-full px-3 py-1 text-xs rounded ${
            theme === 'default'
              ? 'bg-phamily-blue text-white'
              : 'bg-phamily-lightGray dark:bg-dark-secondary text-phamily-darkGray dark:text-dark-text'
          }`}
        >
          Default Theme
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`w-full px-3 py-1 text-xs rounded ${
            theme === 'dark'
              ? 'bg-phamily-blue text-white'
              : 'bg-phamily-lightGray dark:bg-dark-secondary text-phamily-darkGray dark:text-dark-text'
          }`}
        >
          Dark Theme
        </button>
      </div>
      <p className="text-xs text-phamily-darkGray/60 dark:text-dark-textSecondary mt-2">
        Add clientId=test header to auto-switch
      </p>
    </div>
  )
}

export default ThemeTest
