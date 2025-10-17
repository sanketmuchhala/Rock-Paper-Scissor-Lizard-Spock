import { kv } from '@vercel/kv'
import { MultiplayerRoom, RoomListItem } from '@/types/multiplayer'

const ROOM_TTL = 30 * 60 // 30 minutes in seconds
const ACTIVE_ROOMS_KEY = 'rooms:active'

// Room operations
export async function saveRoom(room: MultiplayerRoom): Promise<void> {
  const key = `room:${room.id}`
  await kv.set(key, JSON.stringify(room), { ex: ROOM_TTL })
}

export async function getRoom(roomCode: string): Promise<MultiplayerRoom | null> {
  const key = `room:${roomCode}`
  const data = await kv.get<string>(key)

  if (!data) return null

  try {
    return JSON.parse(data) as MultiplayerRoom
  } catch {
    return null
  }
}

export async function deleteRoom(roomCode: string): Promise<void> {
  const key = `room:${roomCode}`
  await kv.del(key)
  await removeFromActiveRooms(roomCode)
}

// Active rooms set operations
export async function addToActiveRooms(roomCode: string): Promise<void> {
  await kv.sadd(ACTIVE_ROOMS_KEY, roomCode)
}

export async function removeFromActiveRooms(roomCode: string): Promise<void> {
  await kv.srem(ACTIVE_ROOMS_KEY, roomCode)
}

export async function getActiveRoomCodes(): Promise<string[]> {
  const codes = await kv.smembers(ACTIVE_ROOMS_KEY)
  return codes as string[]
}

export async function getAvailableRooms(): Promise<RoomListItem[]> {
  const roomCodes = await getActiveRoomCodes()
  const rooms: RoomListItem[] = []

  for (const code of roomCodes) {
    const room = await getRoom(code)

    // Only include rooms that are waiting for a player
    if (room && room.status === 'waiting' && room.playerA && !room.playerB) {
      rooms.push({
        code: room.id,
        creatorName: room.playerA.username,
        createdAt: room.createdAt
      })
    } else if (!room) {
      // Clean up invalid room codes
      await removeFromActiveRooms(code)
    }
  }

  // Sort by creation time (newest first)
  return rooms.sort((a, b) => b.createdAt - a.createdAt)
}

// Update room and refresh TTL
export async function updateRoom(room: MultiplayerRoom): Promise<void> {
  room.lastActivity = Date.now()
  await saveRoom(room)
}
