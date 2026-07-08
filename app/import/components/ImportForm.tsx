'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createImportPageAction, type ImportFormState } from '../actions'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
        <label htmlFor="pageName" className="block text-sm font-medium text-gray-700">
          Page name
        </label>
        <input
          id="pageName"
          name="pageName"
          type="text"
          required
          placeholder="My new POC page"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-900">
          <p className="font-medium">Page created: {state.displayName}</p>
          <p className="mt-1 text-sm">
            Content key: <code className="rounded bg-white px-1">{state.contentKey}</code>
          </p>
          <p className="mt-1 text-sm">
            Published: {state.published ? 'Yes' : 'No (saved as draft — publish in CMS)'}
          </p>
          {state.cmsEditUrl && (
            <p className="mt-2 text-sm">
              <a href={state.cmsEditUrl} className="font-medium text-blue-700 hover:underline">
                Open in Optimizely CMS
              </a>
            </p>
          )}
        </div>
      )}
    </form>
  )
}
