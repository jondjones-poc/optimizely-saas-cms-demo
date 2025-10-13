import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const clientId = request.headers.get('clientId') || request.headers.get('clientid')
  
  return NextResponse.json({ 
    clientId: clientId || null,
    theme: clientId === 'test' ? 'dark' : 'default'
  })
}
