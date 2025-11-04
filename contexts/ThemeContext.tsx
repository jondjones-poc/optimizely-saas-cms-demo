'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'default' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default')

  useEffect(() => {
    // Check for clientId in headers or localStorage
    const checkClientId = async () => {
      try {
        // Try to get clientId from server-side headers
        const response = await fetch('/api/check-client-id', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.clientId === 'test') {
            setTheme('dark')
          }
        } else {
          // Response not ok, but not an error - just no clientId header
          // This is expected behavior
        }
      } catch (error) {
        // Network error or fetch failed - silently ignore
        // This is expected during development or if API is unavailable
      }
    }

    checkClientId()
  }, [])

  useEffect(() => {
    // Apply theme class to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
