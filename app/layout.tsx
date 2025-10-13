import type { Metadata } from 'next'
import { headers } from 'next/headers'
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
  const headersList = headers()
  const cmsDemo = headersList.get('cms_demo') || headersList.get('cms-demo')

  return (
    <html lang="en">
      <body className="antialiased">
        <BrandingProvider initialCmsDemo={cmsDemo}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </BrandingProvider>
      </body>
    </html>
  )
}
