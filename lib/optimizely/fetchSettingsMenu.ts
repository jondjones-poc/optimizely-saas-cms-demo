/**
 * Fetches site navigation from the Optimizely SettingsPage Menu content area.
 *
 * The Menu block on pages is a placeholder — it has no fields of its own.
 * Editors configure menu items under Settings → Menu in the CMS.
 */

import { getOptimizelySdkKey, getOptimizelySettingsPageKey } from '@/lib/optimizely/env'

export interface SettingsMenuItem {
  _metadata: {
    key: string | null
    displayName: string
    types?: string[]
  }
  Link?: {
    target?: string
    text?: string
    title?: string
    url?: {
      base?: string
      default?: string
    }
  }
  SubMenuItems?: SettingsMenuItem[]
}

const SETTINGS_MENU_QUERY = `
  query GetSettingsMenu($key: String) {
    _Content(
      where: {
        _metadata: {
          key: { eq: $key }
        }
      }
      limit: 1
    ) {
      items {
        _metadata {
          key
          displayName
          types
        }
        ... on SettingsPage {
          Menu {
            _metadata {
              key
              displayName
              types
            }
            ... on MenuItem {
              Link {
                target
                text
                title
                url {
                  base
                  default
                }
              }
              SubMenuItems {
                _metadata {
                  key
                  displayName
                  types
                }
                ... on MenuItem {
                  Link {
                    target
                    text
                    title
                    url {
                      base
                      default
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const SETTINGS_MENU_BY_TYPE_QUERY = `
  query GetSettingsMenuByType {
    _Content(
      where: {
        _metadata: {
          types: {
            in: ["SettingsPage"]
          }
        }
      }
      limit: 1
    ) {
      items {
        _metadata {
          key
          displayName
          types
        }
        ... on SettingsPage {
          Menu {
            _metadata {
              key
              displayName
              types
            }
            ... on MenuItem {
              Link {
                target
                text
                title
                url {
                  base
                  default
                }
              }
              SubMenuItems {
                _metadata {
                  key
                  displayName
                  types
                }
                ... on MenuItem {
                  Link {
                    target
                    text
                    title
                    url {
                      base
                      default
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

function getSettingsPageKey(): string | null {
  const key = getOptimizelySettingsPageKey()
  return key || null
}

export async function fetchSettingsMenu(
  previewToken: string | null = null
): Promise<SettingsMenuItem[]> {
  const sdkKey = getOptimizelySdkKey()
  if (!sdkKey && !previewToken) {
    throw new Error('SDK Key not configured')
  }

  const settingsPageKey = getSettingsPageKey()
  const query = settingsPageKey ? SETTINGS_MENU_QUERY : SETTINGS_MENU_BY_TYPE_QUERY
  const variables = settingsPageKey ? { key: settingsPageKey } : undefined

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  }

  let apiUrl = 'https://cg.optimizely.com/content/v2'

  if (previewToken) {
    const token = previewToken.replace(/^Bearer\s+/i, '').trim()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      apiUrl = `${apiUrl}?t=${Date.now()}`
    }
  } else {
    apiUrl = `${apiUrl}?auth=${sdkKey}`
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  const menu = data.data?._Content?.items?.[0]?.Menu
  return Array.isArray(menu) ? menu : []
}
