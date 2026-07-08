'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useBranding } from '@/contexts/BrandingContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { filterCmsPagesForNav, type NavMenuItem } from '@/lib/optimizely/filterNavPages'

interface NavigationProps {
  optimizelyData?: any
  isLoading?: boolean
  error?: string | null
}

const Navigation = ({ optimizelyData: _optimizelyData, isLoading: _isLoading, error: _error }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cmsPages, setCmsPages] = useState<NavMenuItem[]>([])
  const { theme } = useTheme()
  const { branding } = useBranding()
  const pathname = usePathname()

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('/api/optimizely/pages')
        const result = await response.json()
        if (result.success && result.data) {
          setCmsPages(filterCmsPagesForNav(result.data, { currentPath: pathname }))
        }
      } catch {
        // Nav still works with static app links if CMS fetch fails
      }
    }

    fetchPages()
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Don't render navigation if custom branding is active
  if (branding.hasCustomBranding) {
    return null
  }

  const leadingAppLinks: NavMenuItem[] = [{ key: 'home', name: 'Home', href: '/' }]

  const trailingAppLinks: NavMenuItem[] = [
    { key: 'import', name: 'Content Import', href: '/import' },
    { key: 'graphql', name: 'GraphQL Viewer', href: '/graphql-viewer' },
  ]

  const menuItems = [...leadingAppLinks, ...cmsPages, ...trailingAppLinks]

  // White nav links only on homepage hero (dark image behind). All other pages use forest green.
  const usesHeroNav = pathname === '/' && !scrolled
  const usesSolidNav = scrolled || !usesHeroNav

  const navBarClass = usesSolidNav
    ? theme === 'dark'
      ? 'bg-dark-primary shadow-lg'
      : 'bg-white shadow-lg'
    : 'bg-transparent'

  const logoClass =
    theme === 'dark'
      ? 'text-dark-text'
      : usesSolidNav
        ? 'text-optimizely-forest'
        : 'text-white'

  const navLinkClass = (isActive: boolean) => {
    if (theme === 'dark') {
      return isActive
        ? 'text-dark-text font-semibold'
        : 'text-dark-text hover:text-dark-textSecondary'
    }
    if (usesSolidNav) {
      return isActive
        ? 'text-optimizely-forest font-semibold border-b-2 border-optimizely-lime'
        : 'text-optimizely-forest hover:text-optimizely-muted'
    }
    return isActive
      ? 'text-optimizely-lime font-semibold'
      : 'text-white hover:text-optimizely-lime'
  }

  const navButtonClass =
    theme === 'dark'
      ? 'text-dark-text hover:text-dark-textSecondary'
      : usesSolidNav
        ? 'text-optimizely-forest hover:text-optimizely-muted'
        : 'text-white hover:text-optimizely-lime'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBarClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className={`text-2xl font-bold ${logoClass}`}>
              SaaSCMS
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))

                return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${navLinkClass(isActive)}`}
                >
                  {item.name}
                </Link>
                )
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${navButtonClass}`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 shadow-lg ${
            theme === 'dark' ? 'bg-dark-primary' : 'bg-optimizely-sage'
          }`}>
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
              <Link
                key={item.key}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  theme === 'dark'
                    ? isActive
                      ? 'text-dark-text font-semibold bg-dark-secondary'
                      : 'text-dark-text hover:text-dark-textSecondary hover:bg-dark-secondary'
                    : isActive
                      ? 'text-optimizely-forest font-semibold bg-white'
                      : 'text-optimizely-forest hover:text-optimizely-muted hover:bg-white/60'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation
