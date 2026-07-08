'use server'

import { createPocChildPage, type CmsCreatePageResult } from './lib/cmsManagementApi'

export type ImportFormState = CmsCreatePageResult | null

export async function createImportPageAction(
  _prevState: ImportFormState,
  formData: FormData
): Promise<ImportFormState> {
  const pageName = formData.get('pageName')

  if (typeof pageName !== 'string') {
    return { ok: false, error: 'Page name is required' }
  }

  return createPocChildPage(pageName)
}
