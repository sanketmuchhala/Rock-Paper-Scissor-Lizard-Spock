import { NextRequest, NextResponse } from 'next/server'
import { validateRoomCode } from '@/lib/room-utils'
import { getRoom, updateRoom } from '@/lib/kv'
import { RoomStatusResponse } from '@/types/multiplayer'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const roomCode = searchParams.get('roomCode')
    const playerId = searchParams.get('playerId')

    // Validate inputs
    if (!roomCode || !validateRoomCode(roomCode)) {
      return NextResponse.json(
        { error: 'Invalid room code' },
        { status: 400 }
      )
    }

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID required' },
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

    // Verify player belongs to this room
    const isPlayerA = room.playerA?.id === playerId
    const isPlayerB = room.playerB?.id === playerId

    if (!isPlayerA && !isPlayerB) {
      return NextResponse.json(
        { error: 'Player not in this room' },
        { status: 403 }
      )
    }

    // Update last activity timestamp
    room.lastActivity = Date.now()
    await updateRoom(room)

    const response: RoomStatusResponse = {
      room,
      timestamp: Date.now()
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error fetching room status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room status' },
      { status: 500 }
    )
  }
}
