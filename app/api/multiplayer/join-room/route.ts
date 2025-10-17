import { NextRequest, NextResponse } from 'next/server'
import {
  validateRoomCode,
  validateUsername,
  generatePlayerId,
  createPlayerData,
  updateActivity
} from '@/lib/room-utils'
import { getRoom, updateRoom } from '@/lib/kv'
import { JoinRoomResponse } from '@/types/multiplayer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomCode, username } = body

    // Validate inputs
    if (!roomCode || !validateRoomCode(roomCode)) {
      return NextResponse.json(
        { error: 'Invalid room code format' },
        { status: 400 }
      )
    }

    if (!username || !validateUsername(username)) {
      return NextResponse.json(
        { error: 'Invalid username. Must be 3-20 characters.' },
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

    // Check if room is full
    if (room.playerB) {
      return NextResponse.json(
        { error: 'Room is full' },
        { status: 400 }
      )
    }

    // Check if room is already finished
    if (room.status === 'finished') {
      return NextResponse.json(
        { error: 'Game has already finished' },
        { status: 400 }
      )
    }

    // Add player B to the room
    const playerId = generatePlayerId()
    room.playerB = createPlayerData(playerId, username)
    room.status = 'playing'

    // Update room in database
    updateActivity(room)
    await updateRoom(room)

    const response: JoinRoomResponse = {
      success: true,
      playerId,
      room
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}
