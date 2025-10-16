import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerName } = body

    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      )
    }

    const room = gameEngine.createRoom(playerName)

    return NextResponse.json({
      roomId: room.id,
      playerId: room.playerA?.id
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
