// Simple JavaScript version of the game engine for the server
const rooms = new Map()

class GameEngine {
  // Create a new room
  createRoom(playerName) {
    const roomId = this.generateRoomId()
    const player = {
      id: this.generatePlayerId(),
      displayName: playerName,
      isReady: false
    }

    const room = {
      id: roomId,
      playerA: player,
      playerB: null,
      spectators: [],
      rounds: [],
      currentRound: 1,
      status: 'waiting',
      createdAt: new Date(),
      roundTimer: null, // Timer for current round
      roundStartTime: null // When the round started
    }

    rooms.set(roomId, room)
    return room
  }

  // Join an existing room
  joinRoom(roomId, playerId, playerName) {
    const room = rooms.get(roomId)
    if (!room) return null

    // Check if room is full
    if (room.playerA && room.playerB) {
      // Add as spectator
      const spectator = {
        id: playerId,
        displayName: playerName,
        isReady: false
      }
      room.spectators.push(spectator)
      return room
    }

    // Add as player B
    const playerB = {
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
  startRoundTimer(room) {
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
  handleRoundTimeout(room) {
    console.log('Round timeout for room:', room.id)
    
    // Generate random choices for players who haven't made a choice
    const choices = ['rock', 'paper', 'scissors', 'lizard', 'spock']
    
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
    if (room.playerA.isReady && room.playerB.isReady) {
      this.resolveRound(room)
    }
  }

  // Get list of available rooms (rooms with only one player)
  getAvailableRooms() {
    const availableRooms = []
    
    rooms.forEach((room, roomId) => {
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
          rooms.delete(roomId)
        }
      }
    })
    
    return availableRooms
  }

  // Player makes a choice
  makeChoice(roomId, playerId, choice) {
    const room = rooms.get(roomId)
    if (!room) return null

    // Find the player
    let player
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
  resolveRound(room) {
    if (!room.playerA || !room.playerB) return

    const round = {
      id: room.currentRound,
      playerAChoice: room.playerA.choice,
      playerBChoice: room.playerB.choice,
      timestamp: new Date()
    }

    if (room.playerA.choice && room.playerB.choice) {
      round.winner = this.winner(room.playerA.choice, room.playerB.choice)
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
        rooms.delete(room.id)
      }, 300000) // 5 minutes
    } else {
      // Start timer for next round
      this.startRoundTimer(room)
    }
  }

  // Determine winner
  winner(a, b) {
    if (a === b) return 'tie'
    return this.beats(a, b) ? 'A' : 'B'
  }

  // Check if a beats b
  beats(a, b) {
    const rules = {
      rock: ['scissors', 'lizard'],
      paper: ['rock', 'spock'],
      scissors: ['paper', 'lizard'],
      lizard: ['spock', 'paper'],
      spock: ['scissors', 'rock']
    }
    
    return rules[a].includes(b)
  }

  // Start a rematch
  rematch(roomId) {
    const room = rooms.get(roomId)
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

  // Get room by ID
  getRoom(roomId) {
    return rooms.get(roomId)
  }

  // Remove a room (cleanup)
  removeRoom(roomId) {
    const room = rooms.get(roomId)
    if (room) {
      // Clear any active timer
      if (room.roundTimer) {
        clearTimeout(room.roundTimer)
      }
      return rooms.delete(roomId)
    }
    return false
  }

  // Generate a 6-digit room ID
  generateRoomId() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Generate a player ID
  generatePlayerId() {
    return Math.random().toString(36).substring(2, 15)
  }
}

// Export singleton instance
const gameEngine = new GameEngine()
export { gameEngine }