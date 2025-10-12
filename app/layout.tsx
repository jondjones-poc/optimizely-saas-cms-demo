import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { BrandingProvider } from '@/contexts/BrandingContext'

export const metadata: Metadata = {
  title: 'SaaSCMS - Your Business Solution',
  description: 'Transform your business with our comprehensive SaaS platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <BrandingProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </BrandingProvider>
      </body>
    </html>
  )
}
