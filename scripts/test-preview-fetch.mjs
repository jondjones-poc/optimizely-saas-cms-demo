import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Dynamic import of TS modules won't work easily; inline the fragments from blockFragments
const compositionBlockFields = readFileSync(resolve(__dirname, '../lib/optimizely/graphql/blockFragments.ts'), 'utf8')

function extractFragment(name) {
  const match = compositionBlockFields.match(new RegExp(`export const ${name} = \`([\\s\\S]*?)\``))
  return match ? match[1] : ''
}

const fragments = {
  compositionBlockFields: extractFragment('compositionBlockFields'),
  landingPageTopContentFields: extractFragment('landingPageTopContentFields'),
  landingPageMainContentFields: extractFragment('landingPageMainContentFields'),
  landingPageSeoFields: extractFragment('landingPageSeoFields'),
  articlePageFields: extractFragment('articlePageFields'),
  newsLandingPageFields: extractFragment('newsLandingPageFields'),
  pocPageTypeFields: extractFragment('pocPageTypeFields'),
}

const env = Object.fromEntries(
  readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    })
)

const sdkKey = env.NEXT_PUBLIC_SDK_KEY
const key = process.argv[2] || '1e8d15369e694cfcb08a86214d4f400f'
const ver = process.argv[3] || null

let queryVariables = '$key: String!'
let whereClause = '_metadata: { key: { eq: $key } }'
const variables = { key }
if (ver) {
  queryVariables = '$key: String!, $version: String!'
  whereClause = '_metadata: { key: { eq: $key }, version: { eq: $version } }'
  variables.version = ver
}

const query = `
  query GetContentByKey(${queryVariables}) {
    _Content(where: { ${whereClause} }, limit: 1) {
      total
      items {
        _metadata { key version types displayName url { default } status }
        ... on BlankExperience {
          composition {
            grids: nodes {
              ... on ICompositionStructureNode {
                key
                rows: nodes {
                  ... on ICompositionStructureNode {
                    columns: nodes {
                      ... on ICompositionStructureNode {
                        elements: nodes {
                          ... on ICompositionComponentNode {
                            component {
                              _metadata { key types }
                              ${fragments.compositionBlockFields}
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
        }
        ... on LandingPage {
          TopContentArea {
            _metadata { key types }
            ${fragments.landingPageTopContentFields}
          }
          MainContentArea {
            _metadata { key types }
            ${fragments.landingPageMainContentFields}
          }
          ${fragments.landingPageSeoFields}
        }
        ${fragments.articlePageFields}
        ${fragments.newsLandingPageFields}
        ${fragments.pocPageTypeFields}
      }
    }
  }
`

const res = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables }),
})

const data = await res.json()
console.log('Status:', res.status)
if (data.errors) {
  console.log('ERRORS:', JSON.stringify(data.errors, null, 2))
} else {
  const item = data.data?._Content?.items?.[0]
  console.log('SUCCESS:', JSON.stringify({ total: data.data._Content.total, types: item?._metadata?.types, title: item?.Title }, null, 2))
}
