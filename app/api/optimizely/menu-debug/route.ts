import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const sdkKey = process.env.NEXT_PUBLIC_SDK_KEY || process.env.OPTIMIZELY_GRAPH_SINGLE_KEY

  if (!sdkKey) {
    return NextResponse.json({ success: false, error: 'SDK Key not configured' }, { status: 500 })
  }

  // Try multiple possible query structures for ContentArea
  const queries = [
    // Query 1: Direct ContentArea with items
    {
      name: 'ContentArea with items',
      query: `
        query GetMenu {
          _Content(
            where: {
              _metadata: {
                key: {
                  eq: "0299cbbf-61a2-430a-9fb3-ab907b464f4e"
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
                ContentArea {
                  items {
                    _metadata {
                      key
                      displayName
                      types
                    }
                    ... on Menu {
                      MenuItem {
                        _metadata {
                          key
                          displayName
                        }
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
    },
    // Query 2: ContentArea without items wrapper
    {
      name: 'ContentArea direct',
      query: `
        query GetMenu {
          _Content(
            where: {
              _metadata: {
                key: {
                  eq: "0299cbbf-61a2-430a-9fb3-ab907b464f4e"
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
                ContentArea {
                  _metadata {
                    key
                    displayName
                    types
                  }
                  MenuItem {
                    _metadata {
                      key
                      displayName
                    }
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
      `
    },
    // Query 3: Try different property names
    {
      name: 'Different property names',
      query: `
        query GetMenu {
          _Content(
            where: {
              _metadata: {
                key: {
                  eq: "0299cbbf-61a2-430a-9fb3-ab907b464f4e"
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
                  MenuItem {
                    _metadata {
                      key
                      displayName
                    }
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
      `
    }
  ]

  const results = []

  for (const { name, query } of queries) {
    try {
      console.log(`Menu Debug - Trying ${name}:`, query)
      
      const response = await fetch(`https://cg.optimizely.com/content/v2?auth=${sdkKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        cache: 'no-store'
      })

      const data = await response.json()
      
      results.push({
        name,
        success: response.ok && !data.errors,
        status: response.status,
        data: data,
        errors: data.errors
      })
      
      console.log(`Menu Debug - ${name} result:`, data)
      
    } catch (error) {
      results.push({
        name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return NextResponse.json({
    success: true,
    results: results
  })
}


