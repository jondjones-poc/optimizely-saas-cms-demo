#!/usr/bin/env node
/**
 * Debug homepage Graph connection — run: node scripts/debug-homepage.mjs
 * Does not print secrets.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(rootDir, '.env.local')

function parseEnv(content) {
  const values = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    values[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return values
}

async function graphQuery(sdkKey, query) {
  const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  const data = await response.json()
  return { ok: response.ok, status: response.status, data }
}

async function main() {
  const env = parseEnv(await readFile(envPath, 'utf8'))
  const sdkKey = env.NEXT_PUBLIC_SDK_KEY
  const homepageUrl = env.OPTIMIZELY_HOMEPAGE_URL || '/en/'

  if (!sdkKey) {
    console.error('NEXT_PUBLIC_SDK_KEY is missing in .env.local')
    process.exit(1)
  }

  console.log('Homepage debug')
  console.log(`  OPTIMIZELY_HOMEPAGE_URL=${homepageUrl}`)
  console.log(`  NEXT_PUBLIC_SDK_KEY=(set, ${sdkKey.length} chars)\n`)

  const configuredQuery = `
    query ConfiguredHomepage {
      BlankExperience(
        where: { _metadata: { url: { default: { eq: "${homepageUrl}" } } } }
        limit: 1
      ) {
        total
        items {
          _metadata {
            displayName
            url { default }
            status
            published
          }
        }
      }
    }
  `

  const listQuery = `
    query ListBlankExperiences {
      BlankExperience(limit: 20) {
        total
        items {
          _metadata {
            displayName
            url { default }
            status
            published
          }
        }
      }
    }
  `

  try {
    const configured = await graphQuery(sdkKey, configuredQuery)
    if (configured.data.errors) {
      console.log('Configured URL query — GraphQL errors:')
      configured.data.errors.forEach((e) => console.log(`  - ${e.message}`))
    } else {
      const total = configured.data.data?.BlankExperience?.total ?? 0
      const item = configured.data.data?.BlankExperience?.items?.[0]
      console.log(`Configured URL query (${homepageUrl}): total=${total}`)
      if (item) {
        console.log(`  displayName: ${item._metadata?.displayName}`)
        console.log(`  url: ${item._metadata?.url?.default}`)
        console.log(`  status: ${item._metadata?.status}, published: ${item._metadata?.published}`)
      } else {
        console.log('  No BlankExperience found at this URL.')
      }
    }

    console.log('')
    const list = await graphQuery(sdkKey, listQuery)
    if (list.data.errors) {
      console.log('List query — GraphQL errors:')
      list.data.errors.forEach((e) => console.log(`  - ${e.message}`))
    } else {
      const items = list.data.data?.BlankExperience?.items ?? []
      console.log(`All BlankExperience pages in Graph (up to 20): total=${list.data.data?.BlankExperience?.total ?? 0}`)
      if (items.length === 0) {
        console.log('  (none — page may be unpublished or not synced to Graph yet)')
      } else {
        for (const item of items) {
          const m = item._metadata
          console.log(`  - "${m?.displayName}" url=${m?.url?.default} status=${m?.status} published=${m?.published}`)
        }
        console.log('\nIf your Main Website URL changed in CMS, update OPTIMIZELY_HOMEPAGE_URL in .env.local to match.')
      }
    }
  } catch (error) {
    console.error('Network/request failed:', error.message)
    process.exit(1)
  }
}

main()
