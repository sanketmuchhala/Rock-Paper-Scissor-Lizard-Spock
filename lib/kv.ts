import { MultiplayerRoom, RoomListItem } from '@/types/multiplayer'

const ROOM_TTL = 30 * 60 // 30 minutes in seconds
const ACTIVE_ROOMS_KEY = 'rooms:active'

// Development fallback: In-memory store when Vercel KV is not configured
const isDevelopment = !process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN
const devStore = new Map<string, string>()
const devSet = new Set<string>()

// Helper to get KV client only in production
async function getKV() {
  if (isDevelopment) {
    return null
  }
  const { kv } = await import('@vercel/kv')
  return kv
}

// Room operations
export async function saveRoom(room: MultiplayerRoom): Promise<void> {
  const key = `room:${room.id}`
  const kvClient = await getKV()

  if (kvClient) {
    await kvClient.set(key, JSON.stringify(room), { ex: ROOM_TTL })
  } else {
    // Development fallback
    devStore.set(key, JSON.stringify(room))
    // Clean up after TTL in dev mode
    setTimeout(() => devStore.delete(key), ROOM_TTL * 1000)
  }
}

export async function getRoom(roomCode: string): Promise<MultiplayerRoom | null> {
  const key = `room:${roomCode}`
  const kvClient = await getKV()

  let data: string | null = null
  if (kvClient) {
    data = await kvClient.get<string>(key)
  } else {
    data = devStore.get(key) || null
  }

  if (!data) return null

  try {
    return JSON.parse(data) as MultiplayerRoom
  } catch {
    return null
  }
}

export async function deleteRoom(roomCode: string): Promise<void> {
  const key = `room:${roomCode}`
  const kvClient = await getKV()

  if (kvClient) {
    await kvClient.del(key)
  } else {
    devStore.delete(key)
  }
  await removeFromActiveRooms(roomCode)
}

// Active rooms set operations
export async function addToActiveRooms(roomCode: string): Promise<void> {
  const kvClient = await getKV()

  if (kvClient) {
    await kvClient.sadd(ACTIVE_ROOMS_KEY, roomCode)
  } else {
    devSet.add(roomCode)
  }
}

export async function removeFromActiveRooms(roomCode: string): Promise<void> {
  const kvClient = await getKV()

  if (kvClient) {
    await kvClient.srem(ACTIVE_ROOMS_KEY, roomCode)
  } else {
    devSet.delete(roomCode)
  }
}

export async function getActiveRoomCodes(): Promise<string[]> {
  const kvClient = await getKV()

  if (kvClient) {
    const codes = await kvClient.smembers(ACTIVE_ROOMS_KEY)
    return codes as string[]
  } else {
    return Array.from(devSet)
  }
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
