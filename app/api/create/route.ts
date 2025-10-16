import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game'

export async function POST(request: NextRequest) {
  try {
    const { playerName } = await request.json()

    const room = gameEngine.createRoom(playerName)

    return NextResponse.json({
      roomId: room.id,
      playerId: room.playerA?.id
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
