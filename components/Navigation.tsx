'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { name: 'Buy', href: '#buy' },
    { name: 'Sell', href: '#sell' },
    { name: 'Resources', href: '#resources' },
    { name: 'About', href: '#about' },
    { name: 'Concept', href: '#concept' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? theme === 'dark' 
          ? 'bg-dark-primary shadow-lg' 
          : 'bg-white shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-dark-text' : 'text-phamily-blue'
            }`}>
              SaaSCMS
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    scrolled 
                      ? theme === 'dark'
                        ? 'text-dark-text hover:text-dark-textSecondary'
                        : 'text-phamily-darkGray hover:text-phamily-blue'
                      : 'text-white hover:text-phamily-lightBlue'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200 ${
                scrolled 
                  ? theme === 'dark'
                    ? 'text-dark-text hover:text-dark-textSecondary'
                    : 'text-phamily-darkGray hover:text-phamily-blue'
                  : 'text-white hover:text-phamily-lightBlue'
              }`}
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
            theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
          }`}>
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'text-dark-text hover:text-dark-textSecondary hover:bg-dark-secondary'
                    : 'text-phamily-darkGray hover:text-phamily-blue hover:bg-phamily-lightGray'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation
