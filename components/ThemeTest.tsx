'use client'

import { useTheme } from '@/contexts/ThemeContext'

const ThemeTest = () => {
  const { theme, setTheme } = useTheme()

  const cmsLinks = [
    {
      label: 'Website',
      url: '/',
      external: false
    },
    {
      label: 'CMS',
      url: 'https://app-epsajjcmson91rm1p001.cms.optimizely.com/ui/cms#context=epi.cms.contentdata:///6',
      external: true
    },
    {
      label: 'GraphQL',
      url: 'https://app-epsajjcmson91rm1p001.cms.optimizely.com/ui/Optimizely.Graph.Cms/EditGraphiQL',
      external: true
    },
    {
      label: 'Content Types',
      url: 'https://app-epsajjcmson91rm1p001.cms.optimizely.com/ui/EPiServer.Cms.UI.Admin/default#/ContentTypes',
      external: true
    },
    {
      label: 'GraphQL Viewer',
      url: '/graphql-viewer',
      external: false
    }
  ]

  return (
    <div className="fixed bottom-32 right-4 z-40 bg-white dark:bg-dark-primary p-4 rounded-lg shadow-lg border dark:border-dark-border">
      <h3 className="text-sm font-bold mb-2 text-phamily-darkGray dark:text-dark-text">
        Optimizely SaaS CMS Demo
      </h3>
      <div className="space-y-2">
        {cmsLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target={link.external ? "_blank" : "_self"}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="w-full px-3 py-1 text-xs rounded bg-phamily-blue text-white hover:bg-phamily-lightBlue transition-colors duration-200 block text-center"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  )
}

export default ThemeTest
