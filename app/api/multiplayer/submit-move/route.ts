import { NextRequest, NextResponse } from 'next/server'
import { validateRoomCode, areBothPlayersReady, resolveRound } from '@/lib/room-utils'
import { getRoom, updateRoom } from '@/lib/kv'
import { SubmitMoveResponse } from '@/types/multiplayer'
import { Choice } from '@/types/game'

const VALID_CHOICES: Choice[] = ['rock', 'paper', 'scissors', 'lizard', 'spock']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomCode, playerId, choice } = body

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

    if (!choice || !VALID_CHOICES.includes(choice)) {
      return NextResponse.json(
        { error: 'Invalid choice' },
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

    // Check game status
    if (room.status !== 'playing') {
      return NextResponse.json(
        { error: 'Game is not active' },
        { status: 400 }
      )
    }

    // Find player and set their choice
    let player = null
    if (room.playerA?.id === playerId) {
      player = room.playerA
    } else if (room.playerB?.id === playerId) {
      player = room.playerB
    }

    if (!player) {
      return NextResponse.json(
        { error: 'Player not in this room' },
        { status: 403 }
      )
    }

    // Check if player already made a choice this round
    if (player.isReady) {
      return NextResponse.json(
        { error: 'You have already made your choice for this round' },
        { status: 400 }
      )
    }

    // Set player's choice
    player.choice = choice
    player.isReady = true

    // Check if both players are ready
    if (areBothPlayersReady(room)) {
      // Resolve the round
      resolveRound(room)
    }

    // Update room in database
    room.lastActivity = Date.now()
    await updateRoom(room)

    const response: SubmitMoveResponse = {
      success: true,
      room
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error submitting move:', error)
    return NextResponse.json(
      { error: 'Failed to submit move' },
      { status: 500 }
    )
  }
}
