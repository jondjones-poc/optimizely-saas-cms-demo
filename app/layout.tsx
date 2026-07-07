/**
 * ROOT LAYOUT — Wraps every page in the app (homepage, preview, etc.).
 *
 * In Next.js App Router, layout.tsx is the outer shell. Anything you put here
 * appears on ALL routes unless a nested layout overrides it.
 *
 * This file:
 *   1. Sets default HTML metadata (title, description)
 *   2. Loads global CSS (Tailwind, fonts, etc.)
 *   3. Reads optional HTTP headers (e.g. cms_demo for custom branding)
 *   4. Wraps children in ThemeProvider + BrandingProvider so every page
 *      can use theme/branding without setting them up again
 *
 * The homepage lives at app/page.tsx; live preview lives at app/preview/page.tsx.
 * Both render inside {children} below.
 */

import type { Metadata } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { BrandingProvider } from '@/contexts/BrandingContext'

// Default browser tab title and meta description (homepage may override these client-side)
export const metadata: Metadata = {
  title: 'SaaSCMS - Your Business Solution',
  description: 'Transform your business with our comprehensive SaaS platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read incoming request headers from the server (not available in client components)
  const headersList = headers()

  // Optional demo header — when set, BrandingProvider can swap header/footer images
  // Used for customer POC demos; not required for normal CMS rendering
  const cmsDemo = headersList.get('cms_demo') || headersList.get('cms-demo')

  return (
    <html lang="en">
      <body className="antialiased">
        {/* BrandingProvider must wrap ThemeProvider so both contexts are available everywhere */}
        <BrandingProvider initialCmsDemo={cmsDemo}>
          <ThemeProvider>
            {/* Each route's page component renders here (/, /preview, /[...slug], etc.) */}
            {children}
          </ThemeProvider>
        </BrandingProvider>
      </body>
    </html>
  )
}
