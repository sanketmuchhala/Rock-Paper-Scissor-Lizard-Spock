import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game'

export async function POST(request: NextRequest) {
  try {
    const { roomId, playerId, choice } = await request.json()

    const room = gameEngine.makeChoice(roomId, playerId, choice)

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error making choice:', error)
    return NextResponse.json(
      { error: 'Failed to make choice' },
      { status: 500 }
    )
  }
}
