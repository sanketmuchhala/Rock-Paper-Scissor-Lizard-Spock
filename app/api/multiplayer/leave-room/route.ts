import { NextRequest, NextResponse } from 'next/server'
import { validateRoomCode } from '@/lib/room-utils'
import { getRoom, deleteRoom, updateRoom, removeFromActiveRooms } from '@/lib/kv'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomCode, playerId } = body

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

    // Determine which player is leaving
    const isPlayerA = room.playerA?.id === playerId
    const isPlayerB = room.playerB?.id === playerId

    if (!isPlayerA && !isPlayerB) {
      return NextResponse.json(
        { error: 'Player not in this room' },
        { status: 403 }
      )
    }

    // If only one player in room, delete it
    if (!room.playerB || (isPlayerB && !room.playerA)) {
      await deleteRoom(roomCode.toUpperCase())
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // If player A leaves, remove them and potentially delete room
    if (isPlayerA) {
      room.playerA = null
      // If player B exists, they become the only player - delete room
      if (room.playerB) {
        await deleteRoom(roomCode.toUpperCase())
        return NextResponse.json({ success: true }, { status: 200 })
      }
    }

    // If player B leaves, remove them
    if (isPlayerB) {
      room.playerB = null
      room.status = 'waiting'
      room.rounds = []
      room.currentRound = 1

      // Reset player A's state
      if (room.playerA) {
        room.playerA.choice = null
        room.playerA.isReady = false
        room.playerA.score = 0
      }

      await updateRoom(room)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error leaving room:', error)
    return NextResponse.json(
      { error: 'Failed to leave room' },
      { status: 500 }
    )
  }
}
