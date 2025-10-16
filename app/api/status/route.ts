import { NextResponse } from 'next/server'

export async function GET() {
  const adapter = process.env.NEXT_PUBLIC_WS_ADAPTER || 'vercel'
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    adapter,
    buildInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  })
}