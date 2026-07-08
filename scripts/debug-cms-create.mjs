#!/usr/bin/env node
/**
 * Test CMS Management API create + publish flow (same as /import).
 * Run: npm run debug:cms-create
 * Requires OPTIMIZELY_CMS_CLIENT_ID, OPTIMIZELY_CMS_CLIENT_SECRET,
 * OPTIMIZELY_POC_PARENT_CONTENT_KEY in .env.local
 */

import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const env = Object.fromEntries(
  (await readFile('.env.local', 'utf8'))
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)

const clientId = env.OPTIMIZELY_CMS_CLIENT_ID
const clientSecret = env.OPTIMIZELY_CMS_CLIENT_SECRET
const parentKey = env.OPTIMIZELY_POC_PARENT_CONTENT_KEY
const pageType = env.OPTIMIZELY_POC_PAGE_TYPE_KEY || 'poc_page_type'
const locale = env.OPTIMIZELY_CMS_LOCALE || 'en'

if (!clientId || !clientSecret || !parentKey) {
  console.error('Missing OPTIMIZELY_CMS_CLIENT_ID, OPTIMIZELY_CMS_CLIENT_SECRET, or OPTIMIZELY_POC_PARENT_CONTENT_KEY in .env.local')
  process.exit(1)
}

console.log('1. OAuth token...')
const tokenRes = await fetch('https://api.cms.optimizely.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'api:admin',
  }),
})
const tokenBody = await tokenRes.json()
if (!tokenRes.ok) {
  console.error('Token failed', tokenRes.status, tokenBody)
  process.exit(1)
}
console.log('   OK')
const token = tokenBody.access_token

console.log('\n2. Create child page...')
const newKey = randomUUID().replace(/-/g, '')
const testName = `API Test ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`
const createRes = await fetch('https://api.cms.optimizely.com/v1/content', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify({
    key: newKey,
    contentType: pageType,
    container: parentKey,
    initialVersion: {
      displayName: testName,
      locale,
      properties: {
        Title: { value: testName },
        SeoSettings: {
          value: {
            properties: {
              MetaTitle: { value: testName },
              GraphType: { value: '-' },
            },
          },
        },
      },
    },
  }),
})
const createBody = await createRes.json().catch(async () => ({ raw: await createRes.text() }))
console.log('   Status', createRes.status)
if (!createRes.ok) {
  console.error('   Error:', createBody.detail || createBody.title || JSON.stringify(createBody))
  process.exit(1)
}

const contentKey = createBody.key || newKey
const versionId = createBody.initialVersion?.version ?? createBody.versions?.[0]?.version
const etag = createRes.headers.get('etag')
console.log('   OK — key', contentKey, 'version', versionId)

console.log('\n3. Publish...')
const publishRes = await fetch(
  `https://api.cms.optimizely.com/v1/content/${contentKey}/versions/${versionId}:publish`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      ...(etag ? { 'If-Match': etag } : {}),
    },
  }
)
const publishBody = await publishRes.text()
console.log('   Status', publishRes.status, publishRes.ok ? 'OK' : publishBody)

console.log('\nDone — created:', testName)
