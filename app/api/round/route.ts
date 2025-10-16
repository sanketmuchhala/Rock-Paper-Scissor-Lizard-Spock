import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game'

// POST /api/round - Start a new round
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId } = body

    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId is required' },
        { status: 400 }
      )
    }

    const room = gameEngine.startNewRound(roomId)

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or game is finished' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      room
    })
  } catch (error) {
    console.error('Error starting new round:', error)
    return NextResponse.json(
      { error: 'Failed to start new round' },
      { status: 500 }
    )
  }
}
