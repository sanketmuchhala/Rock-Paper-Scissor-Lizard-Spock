import { NextResponse } from 'next/server'
import { getAvailableRooms } from '@/lib/kv'
import { RoomsListResponse } from '@/types/multiplayer'

export async function GET() {
  try {
    const rooms = await getAvailableRooms()

    const response: RoomsListResponse = {
      rooms
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}
