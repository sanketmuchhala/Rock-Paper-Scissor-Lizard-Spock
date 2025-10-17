import { NextRequest, NextResponse } from 'next/server'
import { validateRoomCode, resetRoundState } from '@/lib/room-utils'
import { getRoom, updateRoom } from '@/lib/kv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomCode } = body

    // Validate input
    if (!roomCode || !validateRoomCode(roomCode)) {
      return NextResponse.json(
        { error: 'Invalid room code' },
        { status: 400 }
      )
    }

    // Get room from database
    const room = await getRoom(roomCode.toUpperCase())

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Check if game is finished
    if (room.status === 'finished') {
      return NextResponse.json(
        { error: 'Game has finished' },
        { status: 400 }
      )
    }

    // Reset round state
    resetRoundState(room)

    // Update room in database
    await updateRoom(room)

    return NextResponse.json({ room }, { status: 200 })
  } catch (error) {
    console.error('Error starting next round:', error)
    return NextResponse.json(
      { error: 'Failed to start next round' },
      { status: 500 }
    )
  }
}
