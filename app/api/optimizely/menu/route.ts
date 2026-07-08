import { NextResponse } from 'next/server'
import { fetchSettingsMenu } from '@/lib/optimizely/fetchSettingsMenu'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
  let previewToken: string | null = null
  if (authHeader) {
    const headerValue = authHeader.split(',')[0].trim()
    previewToken = headerValue.replace(/^Bearer\s+/i, '').trim() || null
  }

  try {
    const menuItems = await fetchSettingsMenu(previewToken)

    return NextResponse.json({
      success: true,
      data: menuItems,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
