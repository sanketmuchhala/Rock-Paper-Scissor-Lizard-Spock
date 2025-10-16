import { NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game'
import { z } from 'zod'

const joinRoomSchema = z.object({
  roomId: z.string().min(6).max(6),
  playerName: z.string().min(1).max(50),
  playerId: z.string().min(1)
})

// POST /api/join - Join a room
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roomId, playerName, playerId } = joinRoomSchema.parse(body)
    
    const room = gameEngine.joinRoom(roomId, playerId, playerName)
    
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      roomId: room.id,
      playerId
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}