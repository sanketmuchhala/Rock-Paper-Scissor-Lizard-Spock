import { Choice, Player, Room, Round } from '@/types/game'
import { beats, winner } from './rpsls'

// Global state cache to persist across serverless invocations
// This ensures rooms persist during Vercel's execution context warm period (~5 min)
declare global {
  var gameRoomsCache: Map<string, Room> | undefined
}

export class GameEngine {
  private rooms: Map<string, Room>

  constructor() {
    // Use global cache if it exists, otherwise create new Map
    if (!global.gameRoomsCache) {
      global.gameRoomsCache = new Map()
    }
    this.rooms = global.gameRoomsCache
  }

  // Create a new room
  createRoom(playerName: string): Room {
    const roomId = this.generateRoomId()
    const player: Player = {
      id: this.generatePlayerId(),
      displayName: playerName,
      isReady: false
    }

    const room: Room = {
      id: roomId,
      playerA: player,
      playerB: null,
      spectators: [],
      rounds: [],
      currentRound: 1,
      status: 'waiting',
      createdAt: new Date(),
      roundTimer: null,
      roundStartTime: null
    }

    this.rooms.set(roomId, room)
    console.log(`[GameEngine] Room created: ${roomId}, Total rooms: ${this.rooms.size}`)
    return room
  }

  // Join an existing room
  joinRoom(roomId: string, playerId: string, playerName: string): Room | null {
    const room = this.rooms.get(roomId)
    if (!room) return null

    // Check if room is full
    if (room.playerA && room.playerB) {
      // Add as spectator
      const spectator: Player = {
        id: playerId,
        displayName: playerName,
        isReady: false
      }
      room.spectators.push(spectator)
      return room
    }

    // Add as player B
    const playerB: Player = {
      id: playerId,
      displayName: playerName,
      isReady: false
    }

    room.playerB = playerB
    room.status = 'playing'

    // Start the first round timer
    this.startRoundTimer(room)

    return room
  }

  // Start round timer (10 seconds)
  startRoundTimer(room: Room) {
    // Clear any existing timer
    if (room.roundTimer) {
      clearTimeout(room.roundTimer)
    }

    room.roundStartTime = new Date()

    // Set timer for 10 seconds
    room.roundTimer = setTimeout(() => {
      this.handleRoundTimeout(room)
    }, 10000)
  }

  // Handle round timeout - auto-select random choices for players who haven't chosen
  handleRoundTimeout(room: Room) {
    console.log('Round timeout for room:', room.id)

    // Generate random choices for players who haven't made a choice
    const choices: Choice[] = ['rock', 'paper', 'scissors', 'lizard', 'spock']

    if (room.playerA && !room.playerA.isReady) {
      const randomChoice = choices[Math.floor(Math.random() * choices.length)]
      room.playerA.choice = randomChoice
      room.playerA.isReady = true
      console.log('Auto-selected choice for player A:', randomChoice)
    }

    if (room.playerB && !room.playerB.isReady) {
      const randomChoice = choices[Math.floor(Math.random() * choices.length)]
      room.playerB.choice = randomChoice
      room.playerB.isReady = true
      console.log('Auto-selected choice for player B:', randomChoice)
    }

    // Resolve the round since both players are now ready
    if (room.playerA?.isReady && room.playerB?.isReady) {
      this.resolveRound(room)
    }
  }

  // Get list of available rooms (rooms with only one player)
  getAvailableRooms(): { id: string; creatorName: string }[] {
    console.log(`[GameEngine] Getting available rooms. Total rooms in memory: ${this.rooms.size}`)
    const availableRooms: { id: string; creatorName: string }[] = []

    this.rooms.forEach((room, roomId) => {
      console.log(`[GameEngine] Checking room ${roomId}: status=${room.status}, playerA=${!!room.playerA}, playerB=${!!room.playerB}`)
      // Check if room has only one player (playerA) and no playerB
      if (room.playerA && !room.playerB && room.status === 'waiting') {
        availableRooms.push({
          id: room.id,
          creatorName: room.playerA.displayName
        })
        console.log(`[GameEngine] Room ${roomId} is available`)
      }

      // Clean up finished rooms
      if (room.status === 'finished') {
        // Remove rooms that have been finished for more than 5 minutes
        const now = new Date()
        const diff = now.getTime() - room.createdAt.getTime()
        if (diff > 300000) { // 5 minutes
          this.rooms.delete(roomId)
        }
      }
    })

    console.log(`[GameEngine] Found ${availableRooms.length} available rooms`)
    return availableRooms
  }

  // Player makes a choice
  makeChoice(roomId: string, playerId: string, choice: Choice): Room | null {
    const room = this.rooms.get(roomId)
    if (!room) return null

    // Find the player
    let player: Player | undefined
    if (room.playerA?.id === playerId) {
      player = room.playerA
    } else if (room.playerB?.id === playerId) {
      player = room.playerB
    } else {
      const spectator = room.spectators.find(p => p.id === playerId)
      if (spectator) {
        // Spectators can't make choices
        return null
      }
    }

    if (!player) return null

    // Set the choice
    player.choice = choice
    player.isReady = true

    // Check if both players are ready
    if (room.playerA?.isReady && room.playerB?.isReady) {
      // Clear the timer since both players have made their choices
      if (room.roundTimer) {
        clearTimeout(room.roundTimer)
        room.roundTimer = null
      }
      this.resolveRound(room)
    }

    return room
  }

  // Resolve the current round
  private resolveRound(room: Room) {
    if (!room.playerA || !room.playerB) return

    const round: Round = {
      id: room.currentRound,
      playerAChoice: room.playerA.choice,
      playerBChoice: room.playerB.choice,
      timestamp: new Date()
    }

    if (room.playerA.choice && room.playerB.choice) {
      round.winner = winner(room.playerA.choice, room.playerB.choice)
    }

    room.rounds.push(round)
    room.currentRound++

    // Reset player choices for next round
    room.playerA.choice = undefined
    room.playerA.isReady = false
    room.playerB.choice = undefined
    room.playerB.isReady = false

    // Check if game is finished (best of 5)
    const playerAWins = room.rounds.filter(r => r.winner === 'A').length
    const playerBWins = room.rounds.filter(r => r.winner === 'B').length

    if (playerAWins >= 3 || playerBWins >= 3 || room.rounds.length >= 5) {
      room.status = 'finished'
      // Clear any active timer
      if (room.roundTimer) {
        clearTimeout(room.roundTimer)
        room.roundTimer = null
      }
      // Schedule cleanup for this room after 5 minutes
      setTimeout(() => {
        this.rooms.delete(room.id)
      }, 300000) // 5 minutes
    } else {
      // Start timer for next round
      this.startRoundTimer(room)
    }
  }

  // Start a rematch
  rematch(roomId: string): Room | null {
    const room = this.rooms.get(roomId)
    if (!room) return null

    // Clear any active timer
    if (room.roundTimer) {
      clearTimeout(room.roundTimer)
      room.roundTimer = null
    }

    // Reset for a new game
    room.rounds = []
    room.currentRound = 1
    room.status = 'playing'

    if (room.playerA) {
      room.playerA.choice = undefined
      room.playerA.isReady = false
    }

    if (room.playerB) {
      room.playerB.choice = undefined
      room.playerB.isReady = false
    }

    // Start timer for first round of rematch
    this.startRoundTimer(room)

    return room
  }

  // Start a new round (called after showing results)
  startNewRound(roomId: string): Room | null {
    const room = this.rooms.get(roomId)
    if (!room) return null

    // Only allow starting new round if game is still playing
    if (room.status !== 'playing') return null

    // Clear any active timer
    if (room.roundTimer) {
      clearTimeout(room.roundTimer)
      room.roundTimer = null
    }

    // Reset player choices for new round
    if (room.playerA) {
      room.playerA.choice = undefined
      room.playerA.isReady = false
    }

    if (room.playerB) {
      room.playerB.choice = undefined
      room.playerB.isReady = false
    }

    // Start timer for new round
    this.startRoundTimer(room)

    return room
  }

  // Get room by ID
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  // Remove a room (cleanup)
  removeRoom(roomId: string): boolean {
    return this.rooms.delete(roomId)
  }

  // Cleanup expired rooms (older than 1 hour)
  cleanupExpiredRooms(): number {
    const now = new Date()
    let count = 0
    
    this.rooms.forEach((room, roomId) => {
      const diff = now.getTime() - room.createdAt.getTime()
      // Remove rooms older than 1 hour
      if (diff > 3600000) {
        this.rooms.delete(roomId)
        count++
      }
    })
    
    return count
  }

  // Generate a 6-digit room ID
  private generateRoomId(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Generate a player ID
  private generatePlayerId(): string {
    return Math.random().toString(36).substring(2, 15)
  }
}

// Export singleton instance
export const gameEngine = new GameEngine()