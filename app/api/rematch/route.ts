import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game'

export async function POST(request: NextRequest) {
  try {
    const { roomId } = await request.json()

    const room = gameEngine.rematch(roomId)

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error starting rematch:', error)
    return NextResponse.json(
      { error: 'Failed to start rematch' },
      { status: 500 }
    )
  }
}
