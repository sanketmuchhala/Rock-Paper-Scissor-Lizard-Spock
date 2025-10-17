import { Choice } from './game'

export interface PlayerData {
  id: string
  username: string
  choice: Choice | null
  isReady: boolean
  score: number
}

export interface RoundResult {
  round: number
  playerAChoice: Choice
  playerBChoice: Choice
  winner: 'A' | 'B' | 'tie'
  timestamp: number
}

export interface MultiplayerRoom {
  id: string // 6-character room code
  playerA: PlayerData | null
  playerB: PlayerData | null
  status: 'waiting' | 'playing' | 'finished'
  currentRound: number
  rounds: RoundResult[]
  createdAt: number
  lastActivity: number
}

export interface RoomListItem {
  code: string
  creatorName: string
  createdAt: number
}

export interface ChatMessage {
  playerId: string
  username: string
  message: string
  timestamp: number
}

// API Response Types
export interface CreateRoomResponse {
  roomCode: string
  playerId: string
}

export interface JoinRoomResponse {
  success: boolean
  playerId: string
  room: MultiplayerRoom
}

export interface RoomStatusResponse {
  room: MultiplayerRoom
  timestamp: number
}

export interface SubmitMoveResponse {
  success: boolean
  room: MultiplayerRoom
}

export interface RoomsListResponse {
  rooms: RoomListItem[]
}
