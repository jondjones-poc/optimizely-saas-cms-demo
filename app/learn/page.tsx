import Link from 'next/link'
import Image from 'next/image'
import {
  getOptimizelyHomepageUrl,
} from '@/lib/optimizely/env'

const FLOW_STEPS = [
  {
    step: 1,
    title: 'Browser opens homepage',
    file: 'app/page.tsx',
    url: '/',
    description: 'React page loads and fetches CMS data from our API.',
  },
  {
    step: 2,
    title: 'API queries Optimizely Graph',
    file: 'app/api/optimizely/homepage/route.ts',
    url: '/api/optimizely/homepage',
    description: 'Server sends GraphQL using your Single Key from .env.local.',
  },
  {
    step: 3,
    title: 'Graph returns page + blocks',
    file: 'lib/optimizely/graphql/blockFragments.ts',
    url: '/api/optimizely/homepage',
    description: 'JSON composition: grids → rows → columns → blocks (Hero, Heading, …).',
  },
  {
    step: 4,
    title: 'CMSContent walks the tree',
    file: 'components/CMSContent.tsx',
    url: '/',
    description: 'Loops layout nodes and calls BlockRenderer for each block.',
  },
  {
    step: 5,
    title: 'BlockRenderer picks React component',
    file: 'components/blocks/BlockRenderer.tsx',
    url: '/',
    description: 'Reads _metadata.types[0] (e.g. "Hero") and renders the matching .tsx file.',
  },
]

const ADD_BLOCK_STEPS = [
  {
    step: 1,
    title: 'Create block content type in CMS',
    file: 'Optimizely CMS → Settings → Content types',
    description:
      'Create a new Block (not a page). Add properties editors will fill in. Note the API name exactly (e.g. TextBanner).',
  },
  {
    step: 2,
    title: 'Publish content and sync to Graph',
    file: 'Main Website → Visual Builder',
    description:
      'Create a block instance, add it to the homepage composition, and publish. Confirm fields appear in /api/optimizely/homepage JSON.',
  },
  {
    step: 3,
    title: 'Add GraphQL fragment',
    file: 'lib/optimizely/graphql/blockFragments.ts',
    description:
      'Add ... on TextBanner { Title Body { html } } inside compositionBlockFields. Type name must match CMS API name.',
  },
  {
    step: 4,
    title: 'Create React component',
    file: 'components/blocks/_examples/SimpleBlock.example.tsx',
    description:
      'Copy the example template to components/blocks/TextBanner.tsx. Prop names must match GraphQL field names.',
  },
  {
    step: 5,
    title: 'Register in BlockRenderer',
    file: 'components/blocks/BlockRenderer.tsx',
    description: "Add case 'TextBanner': return <TextBanner {...component} />. Case string must match CMS type name.",
  },
  {
    step: 6,
    title: 'Verify on the site',
    file: '/api/optimizely/homepage',
    url: '/api/optimizely/homepage',
    description: 'Check API JSON includes your fields, then refresh / — the block should render where you placed it in CMS.',
  },
]

const CREATE_PAGE_STEPS = [
  {
    step: 1,
    title: 'Create a page in Optimizely CMS',
    file: 'Content → Create → LandingPage (or ArticlePage, …)',
    description:
      'Choose a page type, fill in fields, and set the URL (e.g. /about/). This becomes the public path on the site.',
  },
  {
    step: 2,
    title: 'Add content and publish',
    file: 'TopContentArea / MainContentArea in CMS',
    description:
      'Add blocks or areas in the CMS editor, then publish. Content syncs to Optimizely Graph.',
  },
  {
    step: 3,
    title: 'Graph stores page by URL',
    file: 'Optimizely Graph',
    description:
      'Graph indexes the page. The API finds it with a URL match on _metadata.url.default (e.g. /about/).',
  },
  {
    step: 4,
    title: 'Next.js catch-all route matches the URL',
    file: 'app/[...slug]/page.tsx',
    url: '/about/',
    description:
      'No new route file needed — /about/ is handled by the [...slug] dynamic segment. The slug becomes the CMS path.',
  },
  {
    step: 5,
    title: 'API fetches page from Graph',
    file: 'app/api/optimizely/page/route.ts',
    url: '/api/optimizely/page?path=/about/',
    description:
      'The page component calls /api/optimizely/page?path=… which runs GraphQL and returns the page JSON.',
  },
  {
    step: 6,
    title: 'App shell + page renderer',
    file: 'app/layout.tsx → LandingPageDisplay.tsx',
    description:
      'layout.tsx wraps every page. [...slug]/page.tsx reads _metadata.types[0] and renders LandingPageDisplay, ArticlePage, or NewsLandingPage.',
  },
  {
    step: 7,
    title: 'Verify in the browser',
    file: '/about/',
    url: '/about/',
    description: 'Visit the URL you set in CMS. The page should load with content from Graph.',
  },
]

const PREVIEW_STEPS = [
  {
    step: 1,
    title: 'Configure the preview URL in Optimizely CMS',
    file: 'Settings → Applications (frontend host)',
    description:
      'Point Optimizely at your site’s /preview route with placeholders for key, version, locale, context, and preview token (see Preview URL below).',
  },
  {
    step: 2,
    title: 'Editor opens preview from CMS',
    file: 'app/preview/page.tsx',
    description:
      'Optimizely loads your site in an iframe, e.g. /preview?key=…&ver=…&ctx=edit&preview_token=…. Do not open /preview manually without these params.',
  },
  {
    step: 3,
    title: 'Graph returns draft content',
    file: 'lib/optimizely/fetchPreviewContent.ts',
    description:
      'With preview_token, Graph returns unpublished/draft content. With SDK key only (live site), Graph returns published content only.',
  },
  {
    step: 4,
    title: 'Same renderers as the live site',
    file: 'PreviewClient.tsx → CMSContent.tsx → BlockRenderer.tsx',
    description:
      'Preview uses the same block components as / and /about/. Extra props: isPreview and contextMode="edit".',
  },
  {
    step: 5,
    title: 'Optimizely script draws edit overlays',
    file: 'communicationinjector.js',
    description:
      'PreviewClient loads the CMS script. It talks to the parent CMS window and matches DOM elements via data-epi-* attributes.',
  },
  {
    step: 6,
    title: 'Publish → live site updates',
    file: 'app/page.tsx / app/[...slug]/page.tsx',
    description:
      'After publish, content is fetched on the live site with the Single Key. Draft changes stay in preview until published.',
  },
]

export default function LearnPage() {
  const homepageUrl = getOptimizelyHomepageUrl()

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">Demo Site Overview</h1>
        <p className="mt-3 text-gray-600">
          New to Next.js or headless CMS? Start with the{' '}
          <Link href="/poc" className="font-medium text-blue-600 hover:underline">
            beginner POC at /poc
          </Link>{' '}
          — one simple page, no API routes.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">How content flows</h2>
          <figure className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <Image
              src="/learn/cms-graph-website-flow.png"
              alt="Content flow diagram: Optimizely CMS publishes content to Optimizely Graph, the Next.js API route fetches via GraphQL, and the React website renders blocks through CMSContent and BlockRenderer."
              width={1600}
              height={900}
              className="h-auto w-full"
              priority
              unoptimized
            />
            <figcaption className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
              Editors publish in Optimizely CMS → content syncs to Graph → your Next.js API
              fetches JSON → React renders blocks on the site.
            </figcaption>
          </figure>

          <h2 className="mt-8 text-xl font-semibold">Page Flow Steps</h2>
          <ol className="mt-4 space-y-4">
            {FLOW_STEPS.map((item) => (
              <li
                key={item.step}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-800">
                    Step {item.step}
                  </span>
                  <span className="font-semibold">{item.title}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <code className="rounded bg-gray-100 px-2 py-1">{item.file}</code>
                  <Link
                    href={item.url}
                    className="font-medium text-blue-600 hover:underline"
                    target={item.url.startsWith('/api') ? '_blank' : undefined}
                  >
                    Open {item.url} →
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Create a new page</h2>
          <p className="mt-2 text-gray-600">
            CMS pages like /about/ use dynamic routing — you create and publish in Optimizely, and
            Next.js maps the URL to the right renderer automatically.
          </p>
          <figure className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <Image
              src="/learn/create-page-flow.png"
              alt="Create a new page workflow: create page in Optimizely CMS with URL, sync to Graph, Next.js catch-all route app/[...slug]/page.tsx fetches via API, and LandingPageDisplay or other page components render inside app layout."
              width={1600}
              height={900}
              className="h-auto w-full"
              unoptimized
            />
            <figcaption className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
              CMS page + URL → Graph → dynamic route in Next.js → app layout and page components
              render the content.
            </figcaption>
          </figure>
          <ol className="mt-4 space-y-4">
            {CREATE_PAGE_STEPS.map((item) => (
              <li
                key={item.step}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-800">
                    Step {item.step}
                  </span>
                  <span className="font-semibold">{item.title}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <code className="rounded bg-gray-100 px-2 py-1">{item.file}</code>
                  {item.url && (
                    <Link
                      href={item.url}
                      className="font-medium text-blue-600 hover:underline"
                      target={item.url.startsWith('/api') ? '_blank' : undefined}
                    >
                      Open {item.url} →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-300">
{`BlankExperience (homepage at ${homepageUrl})
  app/page.tsx → /api/optimizely/homepage → Optimizely Graph
  → CMSContent → BlockRenderer → Hero, Heading, FeatureGrid, …

LandingPage (/about/, /news-page/, …)
  app/[...slug]/page.tsx → /api/optimizely/page → Optimizely Graph
  → LandingPageDisplay

Live preview (/preview?key=…)
  app/preview/page.tsx → fetchPreviewContentFromGraph
  → same renderers as above`}
          </pre>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Add a new block</h2>
          <p className="mt-2 text-gray-600">
            When editors need a new content type on the site, you wire it up in CMS first, then
            add the matching code in this repo.
          </p>
          <figure className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <Image
              src="/learn/add-block-flow.png"
              alt="Add a new block workflow: create block type in Optimizely CMS, publish and sync to Graph, then add GraphQL fragment, React component, and BlockRenderer case in Next.js, and verify on the site."
              width={1600}
              height={900}
              className="h-auto w-full"
              unoptimized
            />
            <figcaption className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
              CMS content type → publish to Graph → Next.js code (GraphQL, component, renderer) →
              verify on the homepage.
            </figcaption>
          </figure>
          <ol className="mt-4 space-y-4">
            {ADD_BLOCK_STEPS.map((item) => (
              <li
                key={item.step}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-800">
                    Step {item.step}
                  </span>
                  <span className="font-semibold">{item.title}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <code className="rounded bg-gray-100 px-2 py-1">{item.file}</code>
                  {item.url && (
                    <Link
                      href={item.url}
                      className="font-medium text-blue-600 hover:underline"
                      target={item.url.startsWith('/api') ? '_blank' : undefined}
                    >
                      Open {item.url} →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Live preview</h2>
          <p className="mt-2 text-gray-600">
            Preview lets editors see draft content on your Next.js site inside Optimizely CMS.
            The live site only shows published content — same blocks, different auth and URL.
          </p>
          <figure className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <Image
              src="/learn/live-preview-flow.png"
              alt="Live preview vs published site: unpublished content uses preview_token to Graph and loads in /preview iframe; published content uses SDK key and renders on the live site."
              width={1600}
              height={900}
              className="h-auto w-full"
              unoptimized
            />
            <figcaption className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
              Draft/unpublished → Graph + preview_token → /preview site. Published → Graph +
              Single Key → live site at / and /about/.
            </figcaption>
          </figure>

          <h3 className="mt-8 text-lg font-semibold">How it works</h3>
          <ol className="mt-4 space-y-4">
            {PREVIEW_STEPS.map((item) => (
              <li
                key={item.step}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-800">
                    Step {item.step}
                  </span>
                  <span className="font-semibold">{item.title}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                <code className="mt-3 block rounded bg-gray-100 px-2 py-1 text-sm">{item.file}</code>
              </li>
            ))}
          </ol>

          <h3 className="mt-8 text-lg font-semibold">Configure the preview URL</h3>
          <p className="mt-2 text-sm text-gray-600">
            In Optimizely CMS admin, set your frontend preview URL to something like:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-300">
{`http://localhost:3000/preview?key={contentKey}&ver={version}&loc={locale}&ctx=edit&preview_token={previewToken}`}
          </pre>
          <p className="mt-3 text-sm text-gray-600">
            Use your deployed URL in production (e.g. https://your-site.com/preview?…). Placeholder
            names may vary slightly by Optimizely instance — use the tokens your CMS provides.
          </p>

          <h3 className="mt-8 text-lg font-semibold">Preview URL parameters</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li>
              <code className="rounded bg-gray-100 px-1">key</code> — content item GUID (required)
            </li>
            <li>
              <code className="rounded bg-gray-100 px-1">ver</code> — version number (required for
              drafts)
            </li>
            <li>
              <code className="rounded bg-gray-100 px-1">loc</code> — locale (e.g. en)
            </li>
            <li>
              <code className="rounded bg-gray-100 px-1">ctx</code> —{' '}
              <code className="rounded bg-gray-100 px-1">edit</code> for inline overlays,{' '}
              <code className="rounded bg-gray-100 px-1">view</code> for read-only
            </li>
            <li>
              <code className="rounded bg-gray-100 px-1">preview_token</code> — short-lived token
              so Graph returns unpublished content (expires after ~5 minutes)
            </li>
          </ul>

          <h3 className="mt-8 text-lg font-semibold">Inline editing attributes</h3>
          <p className="mt-2 text-sm text-gray-600">
            Optimizely matches CMS fields to DOM elements using HTML attributes. Field names must
            match Optimizely property API names exactly.
          </p>
          <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm">
            <p>
              <code className="rounded bg-gray-100 px-1">data-epi-block-id</code> — on each block
              wrapper. Set automatically in{' '}
              <code className="rounded bg-gray-100 px-1">CMSContent.tsx</code> when{' '}
              <code className="rounded bg-gray-100 px-1">contextMode === &apos;edit&apos;</code>.
            </p>
            <p>
              <code className="rounded bg-gray-100 px-1">data-epi-edit=&quot;FieldName&quot;</code>{' '}
              — on the element for a specific CMS property (e.g.{' '}
              <code className="rounded bg-gray-100 px-1">Heading</code>,{' '}
              <code className="rounded bg-gray-100 px-1">Body</code>). Add this in your block
              component.
            </p>
          </div>

          <h3 className="mt-8 text-lg font-semibold">Make a block work with preview</h3>
          <p className="mt-2 text-sm text-gray-600">
            When you add a block, include preview support in the React component:
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
            <li>
              Add GraphQL in{' '}
              <code className="rounded bg-gray-100 px-1">blockFragments.ts</code> — preview uses
              the same fragments as the homepage.
            </li>
            <li>
              Pass <code className="rounded bg-gray-100 px-1">isPreview</code> and{' '}
              <code className="rounded bg-gray-100 px-1">contextMode</code> from BlockRenderer to
              your block (already wired for existing blocks).
            </li>
            <li>
              Put <code className="rounded bg-gray-100 px-1">data-epi-edit</code> on editable
              elements when <code className="rounded bg-gray-100 px-1">contextMode === &apos;edit&apos;</code>.
            </li>
            <li>
              Test by opening preview from Optimizely CMS — not by visiting /preview directly.
            </li>
          </ol>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-300">
{`<h2
  {...(contextMode === 'edit' && { 'data-epi-edit': 'Title' })}
>
  {Title}
</h2>`}
          </pre>
          <p className="mt-3 text-sm text-gray-600">
            See{' '}
            <code className="rounded bg-gray-100 px-1">
              components/blocks/_examples/SimpleBlock.example.tsx
            </code>{' '}
            and <code className="rounded bg-gray-100 px-1">components/blocks/Heading.tsx</code>{' '}
            for working examples.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">More reading</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <strong>POC_START_HERE.md</strong> — day 1 checklist, gotchas, debug tools
            </li>
            <li>
              <strong>README.md</strong> — env vars, live preview, full block workflow
            </li>
            <li>
              <strong>OVERLAY_TROUBLESHOOTING.md</strong> — fix preview overlay issues
            </li>
            <li>
              <strong>docs/DATA_SHAPES.md</strong> — why JSON looks like data.data.data
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            Run <code className="rounded bg-gray-100 px-1">npm run setup</code> if env is not
            configured. Ignore the floating debug menu until you understand the flow above.
          </p>
        </section>

        <p className="mt-12 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </main>
  )
}
