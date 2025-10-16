import { NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game'

// GET /api/rooms - Get list of available rooms
export async function GET() {
  try {
    const rooms = gameEngine.getAvailableRooms()
    
    return NextResponse.json({
      rooms,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}