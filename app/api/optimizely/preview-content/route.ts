import { NextRequest, NextResponse } from 'next/server'
import { fetchPreviewContentFromGraph } from '@/lib/optimizely/fetchPreviewContent'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, ver, loc } = body
    
    // Log each parameter separately as received from client
    console.log('📥 API Route - Received Parameters from Client:', {
      '{key}': key || 'MISSING',
      '{version}': ver || 'MISSING',
      '{locale}': loc || 'MISSING',
      'version_type': typeof ver,
      'version_parsed': ver ? parseInt(ver, 10) : null,
      'note': 'Version parameter is REQUIRED per Optimizely docs for preview URLs'
    })
    
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Content key is required' },
        { status: 400 }
      )
    }

    // Get authorization header for preview token
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    
    // Normalize the authorization header - ensure it has Bearer prefix
    let previewToken: string | null = null
    if (authHeader) {
      let headerValue = authHeader.split(',')[0].trim()
      let token = headerValue.replace(/^Bearer\s+/i, '').trim()
      if (token && token.length > 0) {
        previewToken = token
      }
    }
    
    // Log authorization status
    if (previewToken) {
      console.log('✅ API Route - Using preview token for draft content:', {
        hasToken: true,
        tokenLength: previewToken.length,
        version: ver || 'not provided'
      })
    } else {
      console.log('⚠️ API Route - Using SDK key for published content (no preview token)')
    }
    
    // Use the shared function
    const result = await fetchPreviewContentFromGraph({
      key,
      ver: ver || null,
      loc: loc || null,
      previewToken: previewToken || null
    })
    
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ API Route - Error fetching preview content:', {
      error: error instanceof Error ? error.message : String(error),
      errorName: error instanceof Error ? error.name : 'Unknown'
    })
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
