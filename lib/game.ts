import { Choice, Player, Room, Round } from '@/types/game'
import { beats, winner } from './rpsls'

export class GameEngine {
  private rooms: Map<string, Room> = new Map()

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
      createdAt: new Date()
    }

    this.rooms.set(roomId, room)
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
    return room
  }

  // Get list of available rooms (rooms with only one player)
  getAvailableRooms(): { id: string; creatorName: string }[] {
    const availableRooms: { id: string; creatorName: string }[] = []
    
    this.rooms.forEach((room, roomId) => {
      // Check if room has only one player (playerA) and no playerB
      if (room.playerA && !room.playerB && room.status === 'waiting') {
        availableRooms.push({
          id: room.id,
          creatorName: room.playerA.displayName
        })
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
      // Schedule cleanup for this room after 5 minutes
      setTimeout(() => {
        this.rooms.delete(room.id)
      }, 300000) // 5 minutes
    }
  }

  // Start a rematch
  rematch(roomId: string): Room | null {
    const room = this.rooms.get(roomId)
    if (!room) return null

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