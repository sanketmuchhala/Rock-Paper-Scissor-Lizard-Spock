import { customAlphabet } from 'nanoid'
import { Choice } from '@/types/game'
import { MultiplayerRoom, PlayerData, RoundResult } from '@/types/multiplayer'
import { winner } from './rpsls'

// Generate a 6-character alphanumeric room code (uppercase)
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6)

export function generateRoomCode(): string {
  return nanoid()
}

// Generate a unique player ID
export function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

// Validate room code format
export function validateRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code)
}

// Validate username
export function validateUsername(username: string): boolean {
  return username.length >= 3 && username.length <= 20 && username.trim().length > 0
}

// Check if room has expired (30 minutes of inactivity)
export function isRoomExpired(lastActivity: number): boolean {
  const THIRTY_MINUTES = 30 * 60 * 1000
  return Date.now() - lastActivity > THIRTY_MINUTES
}

// Create a new player data object
export function createPlayerData(id: string, username: string): PlayerData {
  return {
    id,
    username,
    choice: null,
    isReady: false,
    score: 0
  }
}

// Create a new multiplayer room
export function createMultiplayerRoom(roomCode: string, playerA: PlayerData): MultiplayerRoom {
  return {
    id: roomCode,
    playerA,
    playerB: null,
    status: 'waiting',
    currentRound: 1,
    rounds: [],
    createdAt: Date.now(),
    lastActivity: Date.now()
  }
}

// Calculate round winner and update room state
export function resolveRound(room: MultiplayerRoom): MultiplayerRoom {
  if (!room.playerA || !room.playerB) {
    throw new Error('Both players required to resolve round')
  }

  if (!room.playerA.choice || !room.playerB.choice) {
    throw new Error('Both players must make a choice')
  }

  const roundWinner = winner(room.playerA.choice, room.playerB.choice)

  const roundResult: RoundResult = {
    round: room.currentRound,
    playerAChoice: room.playerA.choice,
    playerBChoice: room.playerB.choice,
    winner: roundWinner,
    timestamp: Date.now()
  }

  // Update scores
  if (roundWinner === 'A') {
    room.playerA.score++
  } else if (roundWinner === 'B') {
    room.playerB.score++
  }

  // Add round to history
  room.rounds.push(roundResult)

  // Check if game is finished (best of 5 = first to 3)
  if (room.playerA.score >= 3 || room.playerB.score >= 3) {
    room.status = 'finished'
  }

  return room
}

// Reset round state for next round
export function resetRoundState(room: MultiplayerRoom): MultiplayerRoom {
  if (room.playerA) {
    room.playerA.choice = null
    room.playerA.isReady = false
  }

  if (room.playerB) {
    room.playerB.choice = null
    room.playerB.isReady = false
  }

  room.currentRound++
  room.lastActivity = Date.now()

  return room
}

// Update room's last activity timestamp
export function updateActivity(room: MultiplayerRoom): MultiplayerRoom {
  room.lastActivity = Date.now()
  return room
}

// Check if both players are ready
export function areBothPlayersReady(room: MultiplayerRoom): boolean {
  return Boolean(
    room.playerA?.isReady &&
    room.playerB?.isReady &&
    room.playerA?.choice &&
    room.playerB?.choice
  )
}
