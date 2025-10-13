import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cmsDemo = request.headers.get('cms_demo') || request.headers.get('cms-demo')
  
  return NextResponse.json({ 
    cmsDemo: cmsDemo || null,
    available: cmsDemo ? true : false
  })
}
