import { NextRequest, NextResponse } from 'next/server'
import {
  generateRoomCode,
  generatePlayerId,
  validateUsername,
  createPlayerData,
  createMultiplayerRoom
} from '@/lib/room-utils'
import { saveRoom, addToActiveRooms, getRoom } from '@/lib/kv'
import { CreateRoomResponse } from '@/types/multiplayer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = body

    // Validate username
    if (!username || !validateUsername(username)) {
      return NextResponse.json(
        { error: 'Invalid username. Must be 3-20 characters.' },
        { status: 400 }
      )
    }

    // Generate unique room code (retry if collision)
    let roomCode: string
    let attempts = 0
    const MAX_ATTEMPTS = 10

    do {
      roomCode = generateRoomCode()
      const existing = await getRoom(roomCode)
      if (!existing) break

      attempts++
      if (attempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Failed to generate unique room code. Please try again.' },
          { status: 500 }
        )
      }
    } while (attempts < MAX_ATTEMPTS)

    // Create player and room
    const playerId = generatePlayerId()
    const playerA = createPlayerData(playerId, username)
    const room = createMultiplayerRoom(roomCode, playerA)

    // Save to database
    await saveRoom(room)
    await addToActiveRooms(roomCode)

    const response: CreateRoomResponse = {
      roomCode,
      playerId
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
