import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, playerId, choice } = body

    if (!roomId || !playerId || !choice) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, playerId, choice' },
        { status: 400 }
      )
    }

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
      { error: 'Failed to make choice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
