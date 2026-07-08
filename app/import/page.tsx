import Image from 'next/image'
import ImportForm from './components/ImportForm'
import { getCmsContentItem } from './lib/cmsManagementApi'
import {
  getOptimizelyPocPageTypeKey,
  getOptimizelyPocParentContentKey,
  isCmsManagementConfigured,
} from './lib/env'

const OPTIMIZELY_DOCS = [
  {
    title: 'Create content and a page using the REST API',
    href: 'https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/create-content-and-a-page-using-the-api',
    description: 'Step-by-step tutorial for creating content types and pages via the CMS API.',
  },
  {
    title: 'Manage content using the REST API',
    href: 'https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/manage-content-using-the-rest-api',
    description: 'Create, update, publish, and delete content programmatically.',
  },
  {
    title: 'Create API keys',
    href: 'https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/docs/api-keys',
    description: 'How to create a Manage Content API client (Client ID and Secret).',
  },
  {
    title: 'Authentication and authorization',
    href: 'https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/reference/authentication-and-authorization',
    description: 'OAuth client credentials flow for api.cms.optimizely.com.',
  },
  {
    title: 'Introduction to the CMS (SaaS) REST API',
    href: 'https://docs.developers.optimizely.com/content-management-system/v1.0.0-CMS-SaaS/reference/introduction-to-the-cms-content-api',
    description: 'API overview, endpoints, and OpenAPI schema.',
  },
]

export default async function ImportPage() {
  const configured = isCmsManagementConfigured()
  const pageTypeKey = getOptimizelyPocPageTypeKey()
  const parentKey = getOptimizelyPocParentContentKey()

  let parent: Awaited<ReturnType<typeof getCmsContentItem>> = null
  let parentError: string | null = null

  if (configured) {
    try {
      parent = await getCmsContentItem(parentKey)
      if (!parent) {
        parentError = `No CMS content found for parent key ${parentKey}`
      }
    } catch (error) {
      parentError = error instanceof Error ? error.message : 'Failed to load parent page'
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-gray-800">
        <h1 className="text-2xl font-bold text-gray-900">Content Import</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new <code className="rounded bg-gray-100 px-1">{pageTypeKey}</code> page under
          the <code className="rounded bg-gray-100 px-1">/poc</code> parent in Optimizely CMS.
        </p>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-gray-800">
        <h2 className="text-lg font-semibold text-gray-900">CMS configuration</h2>
        <ul className="mt-3 space-y-1 text-sm text-gray-600">
          <li>
            Content type: <code className="rounded bg-gray-100 px-1">{pageTypeKey}</code>
          </li>
          <li>
            Parent key: <code className="rounded bg-gray-100 px-1">{parentKey || '(not set)'}</code>
          </li>
          {parent && (
            <>
              <li>
                Parent type:{' '}
                <code className="rounded bg-gray-100 px-1">{parent.contentType || 'unknown'}</code>
              </li>
              <li>
                Locale:{' '}
                <code className="rounded bg-gray-100 px-1">{parent.primaryLocale || 'en'}</code>
              </li>
            </>
          )}
          <li>
            API configured:{' '}
            <code className="rounded bg-gray-100 px-1">{configured ? 'yes' : 'no'}</code>
          </li>
        </ul>

        {!configured && (
          <p className="mt-3 text-sm text-amber-700">
            Add <code className="rounded bg-amber-50 px-1">OPTIMIZELY_CMS_CLIENT_ID</code>,{' '}
            <code className="rounded bg-amber-50 px-1">OPTIMIZELY_CMS_CLIENT_SECRET</code>, and{' '}
            <code className="rounded bg-amber-50 px-1">OPTIMIZELY_POC_PARENT_CONTENT_KEY</code> to{' '}
            <code className="rounded bg-amber-50 px-1">.env.local</code>, then restart the dev
            server.
          </p>
        )}

        {parentError && (
          <p className="mt-3 text-sm text-red-700">{parentError}</p>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-gray-800">
        <h2 className="text-lg font-semibold text-gray-900">Create page</h2>
        {configured ? (
          <div className="mt-4">
            <ImportForm />
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">Configure CMS API credentials to enable the form.</p>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-gray-800">
        <h2 className="text-lg font-semibold text-gray-900">How content is created</h2>
        <p className="mt-2 text-sm text-gray-600">
          When you submit the form, Next.js calls the Optimizely CMS Management API on the server.
          Your API credentials never leave the server.
        </p>
        <figure className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Image
            src="/import/content-import-flow.png"
            alt="Content import flow: user submits page name on /import, server action requests OAuth token, creates poc_page_type under /poc parent via POST /v1/content, publishes the version, and the new page appears in Optimizely CMS."
            width={1200}
            height={420}
            className="h-auto w-full"
            unoptimized
          />
          <figcaption className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
            Form submit → server action → OAuth token → create page → publish → CMS
          </figcaption>
        </figure>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-gray-800">
        <h2 className="text-lg font-semibold text-gray-900">How the API works</h2>
        <ol className="mt-4 space-y-4 text-sm text-gray-600">
          <li className="rounded-lg border border-optimizely-sage bg-optimizely-sage/40 p-4">
            <p className="font-semibold text-optimizely-forest">1. Server action receives the page name</p>
            <p className="mt-2">
              <code className="rounded bg-white px-1">app/import/components/ImportForm.tsx</code> posts
              to <code className="rounded bg-white px-1">app/import/actions.ts</code>, which calls{' '}
              <code className="rounded bg-white px-1">createPocChildPage()</code> in{' '}
              <code className="rounded bg-white px-1">app/import/lib/cmsManagementApi.ts</code>.
            </p>
          </li>
          <li className="rounded-lg border border-optimizely-sage bg-optimizely-sage/40 p-4">
            <p className="font-semibold text-optimizely-forest">2. OAuth token (client credentials)</p>
            <p className="mt-2">
              The server exchanges <code className="rounded bg-white px-1">OPTIMIZELY_CMS_CLIENT_ID</code> and{' '}
              <code className="rounded bg-white px-1">OPTIMIZELY_CMS_CLIENT_SECRET</code> for a bearer token at{' '}
              <code className="rounded bg-white px-1">https://api.cms.optimizely.com/oauth/token</code>.
            </p>
          </li>
          <li className="rounded-lg border border-optimizely-sage bg-optimizely-sage/40 p-4">
            <p className="font-semibold text-optimizely-forest">3. Create the page</p>
            <p className="mt-2">
              <code className="rounded bg-white px-1">POST https://api.cms.optimizely.com/v1/content</code> with{' '}
              <code className="rounded bg-white px-1">contentType: poc_page_type</code>,{' '}
              <code className="rounded bg-white px-1">container</code> set to the /poc parent key, and{' '}
              <code className="rounded bg-white px-1">Title</code> plus required{' '}
              <code className="rounded bg-white px-1">SeoSettings.GraphType</code>.
            </p>
          </li>
          <li className="rounded-lg border border-optimizely-sage bg-optimizely-sage/40 p-4">
            <p className="font-semibold text-optimizely-forest">4. Publish (optional)</p>
            <p className="mt-2">
              If the API key has publish rights, the server calls{' '}
              <code className="rounded bg-white px-1">POST /v1/content/&#123;key&#125;/versions/&#123;version&#125;:publish</code>.
              Without publish permission the page is saved as a draft in CMS.
            </p>
          </li>
        </ol>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-optimizely-forest p-4 text-xs text-optimizely-lime">
{`POST /v1/content
{
  "contentType": "poc_page_type",
  "container": "<parent /poc content key>",
  "initialVersion": {
    "displayName": "My Page",
    "locale": "en",
    "properties": {
      "Title": { "value": "My Page" },
      "SeoSettings": {
        "value": {
          "properties": {
            "MetaTitle": { "value": "My Page" },
            "GraphType": { "value": "-" }
          }
        }
      }
    }
  }
}`}
        </pre>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm text-gray-800">
        <h2 className="text-lg font-semibold text-gray-900">Official Optimizely documentation</h2>
        <p className="mt-2 text-sm text-gray-600">
          SaaS CMS Management API guides from Optimizely Developer Documentation.
        </p>
        <ul className="mt-4 space-y-3">
          {OPTIMIZELY_DOCS.map((doc) => (
            <li key={doc.href}>
              <a
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-optimizely-forest hover:underline"
              >
                {doc.title}
              </a>
              <p className="mt-1 text-sm text-gray-600">{doc.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
