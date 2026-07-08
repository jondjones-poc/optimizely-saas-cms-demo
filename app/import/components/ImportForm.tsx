'use client'

import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'
import { createImportPageAction, type ImportFormState } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-optimizely-forest px-4 py-2 text-sm font-medium text-optimizely-lime hover:bg-optimizely-forest/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Creating…' : 'Create page in CMS'}
    </button>
  )
}

export default function ImportForm() {
  const [state, formAction] = useFormState<ImportFormState, FormData>(createImportPageAction, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="pageName" className="block text-sm font-medium text-optimizely-forest">
          Page name
        </label>
        <input
          id="pageName"
          name="pageName"
          type="text"
          required
          placeholder="My new POC page"
          className="mt-1 w-full rounded-md border border-optimizely-sage px-3 py-2 text-gray-900 shadow-sm focus:border-optimizely-forest focus:outline-none focus:ring-1 focus:ring-optimizely-forest"
        />
      </div>

      <SubmitButton />

      {state && !state.ok && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-medium">Could not create page</p>
          <p className="mt-1 text-sm">{state.error}</p>
          {state.hint && <p className="mt-2 text-sm text-red-700">{state.hint}</p>}
        </div>
      )}

      {state?.ok && (
        <div className="rounded-md border border-optimizely-sage bg-optimizely-sage/50 p-4 text-optimizely-forest">
          <p className="font-medium">Page created: {state.displayName}</p>
          <p className="mt-1 text-sm text-optimizely-muted">
            Content key: <code className="rounded bg-white px-1">{state.contentKey}</code>
          </p>
          <p className="mt-1 text-sm text-optimizely-muted">
            Published: {state.published ? 'Yes' : 'No (saved as draft — publish in CMS)'}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {state.cmsEditUrl && (
              <a
                href={state.cmsEditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-md bg-optimizely-forest px-3 py-2 text-sm font-medium text-optimizely-lime hover:bg-optimizely-forest/90"
              >
                Open in CMS
              </a>
            )}
            {state.siteUrl && (
              <Link
                href={state.siteUrl}
                className="inline-flex items-center rounded-md border border-optimizely-forest px-3 py-2 text-sm font-medium text-optimizely-forest hover:bg-white"
              >
                View on site
              </Link>
            )}
          </div>

          <p className="mt-4 text-sm text-optimizely-muted">
            {state.published ? (
              <>
                Add <strong>Heading</strong> blocks in the CMS content area, publish, then refresh
                {state.siteUrl ? (
                  <>
                    {' '}
                    <Link href={state.siteUrl} className="font-medium text-optimizely-forest hover:underline">
                      {state.siteUrl}
                    </Link>
                  </>
                ) : (
                  ' the page on your site'
                )}
                .
              </>
            ) : (
              <>
                Open the page in CMS, publish it, then set the URL segment if needed. Add Heading
                blocks to the content area before viewing on the site.
              </>
            )}
          </p>
        </div>
      )}
    </form>
  )
}
