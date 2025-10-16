import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game'

// GET /api/status?roomId=123456 - Get room status for polling
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId is required' },
        { status: 400 }
      )
    }

    const room = gameEngine.getRoom(roomId)

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      room,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching room status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room status' },
      { status: 500 }
    )
  }
}
