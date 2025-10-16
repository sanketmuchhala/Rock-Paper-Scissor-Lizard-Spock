import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer } from 'ws'
import { gameEngine } from './lib/gameInstance.js'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Handle regular HTTP requests
    handle(req, res)
  })

  // Create WebSocket server
  const wss = new WebSocketServer({ noServer: true })

  // Store active connections and their associated players
  const connections = new Map()
  const playerConnections = new Map() // playerId -> connection
  const connectionPlayers = new Map() // connection -> playerId

  // Rate limiting
  const rateLimit = new Map()

  // Handle WebSocket upgrade requests
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url)
    
    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request)
      })
    } else {
      // Let Next.js handle other upgrade requests
      socket.destroy()
    }
  })

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection')
    
    // Add to connections map
    connections.set(ws, true)
    
    ws.on('message', (data) => {
      try {
        // Rate limiting check
        const now = Date.now()
        const limit = rateLimit.get(ws)
        
        if (limit && now - limit.timestamp < 1000) {
          if (limit.count >= 5) {
            ws.send(JSON.stringify({ type: 'error', message: 'Rate limit exceeded' }))
            return
          }
          limit.count++
        } else {
          rateLimit.set(ws, { count: 1, timestamp: now })
        }
        
        // Parse message
        const message = JSON.parse(data.toString())
        
        switch (message.type) {
          case 'create':
            handleCreateRoom(ws, message)
            break
          case 'join':
            handleJoinRoom(ws, message)
            break
          case 'choice':
            handleChoice(ws, message)
            break
          case 'rematch':
            handleRematch(ws, message)
            break
          case 'chat':
            handleChat(ws, message)
            break
          case 'getAvailableRooms':
            handleGetAvailableRooms(ws)
            break
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }))
        }
      } catch (error) {
        console.error('Error handling message:', error)
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }))
      }
    })
    
    ws.on('close', () => {
      console.log('WebSocket connection closed')
      // Clean up connection mappings
      const playerId = connectionPlayers.get(ws)
      if (playerId) {
        playerConnections.delete(playerId)
        connectionPlayers.delete(ws)
      }
      connections.delete(ws)
      rateLimit.delete(ws)
    })
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
    
    // Send initial room list to new connections
    handleGetAvailableRooms(ws)
  })

  // Handle room creation
  function handleCreateRoom(ws, message) {
    try {
      const room = gameEngine.createRoom(message.playerName)
      
      // Associate connection with player
      if (room.playerA) {
        playerConnections.set(room.playerA.id, ws)
        connectionPlayers.set(ws, room.playerA.id)
      }
      
      ws.send(JSON.stringify({
        type: 'roomCreated',
        roomId: room.id,
        playerId: room.playerA?.id
      }))
      
      // Broadcast room updates to all clients
      broadcastRoomListUpdate()
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to create room' }))
    }
  }

  // Handle joining a room
  function handleJoinRoom(ws, message) {
    try {
      console.log('Joining room:', message.roomId, 'with player:', message.playerId)
      const room = gameEngine.joinRoom(message.roomId, message.playerId, message.playerName)
      
      if (!room) {
        console.log('Room not found:', message.roomId)
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
        return
      }
      
      console.log('Room joined successfully. Room status:', room.status, 'Player B:', !!room.playerB)
      
      // Associate connection with player
      if (room.playerB && room.playerB.id === message.playerId) {
        playerConnections.set(room.playerB.id, ws)
        connectionPlayers.set(ws, room.playerB.id)
      }
      
      ws.send(JSON.stringify({
        type: 'roomJoined',
        roomId: room.id,
        playerId: message.playerId
      }))
      
      // Send room update to all players
      broadcastRoomUpdate(room.id)
      // Broadcast updated room list to all clients
      broadcastRoomListUpdate()
    } catch (error) {
      console.error('Error joining room:', error)
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to join room: ' + error.message }))
    }
  }

  // Handle player choice
  function handleChoice(ws, message) {
    try {
      const playerId = connectionPlayers.get(ws)
      
      if (!playerId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Player not found' }))
        return
      }
      
      const room = gameEngine.makeChoice(message.roomId, playerId, message.choice)
      
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
        return
      }
      
      ws.send(JSON.stringify({ type: 'choiceReceived' }))
      
      // Broadcast room update
      broadcastRoomUpdate(message.roomId)
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to make choice' }))
    }
  }

  // Handle rematch request
  function handleRematch(ws, message) {
    try {
      const room = gameEngine.rematch(message.roomId)
      
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
        return
      }
      
      ws.send(JSON.stringify({ type: 'rematchAcknowledged' }))
      
      // Broadcast room update
      broadcastRoomUpdate(message.roomId)
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to start rematch' }))
    }
  }

  // Handle chat message
  function handleChat(ws, message) {
    try {
      const playerId = connectionPlayers.get(ws)
      
      if (!playerId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Player not found' }))
        return
      }
      
      // Broadcast chat message to room
      broadcastChatMessage(message.roomId, {
        playerId,
        message: message.message,
        timestamp: new Date()
      })
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to send chat message' }))
    }
  }

  // Handle get available rooms request
  function handleGetAvailableRooms(ws) {
    try {
      const rooms = gameEngine.getAvailableRooms()
      console.log('Sending room list update with', rooms.length, 'rooms')
      ws.send(JSON.stringify({
        type: 'roomListUpdate',
        rooms
      }))
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to get available rooms' }))
    }
  }

  // Broadcast room updates to all connected clients in a specific room
  function broadcastRoomUpdate(roomId) {
    const room = gameEngine.getRoom(roomId)
    if (!room) return
    
    const message = JSON.stringify({
      type: 'roomUpdate',
      room
    })
    
    // Send to player A
    if (room.playerA) {
      const ws = playerConnections.get(room.playerA.id)
      if (ws && ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message)
      }
    }
    
    // Send to player B
    if (room.playerB) {
      const ws = playerConnections.get(room.playerB.id)
      if (ws && ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message)
      }
    }
    
    // Send to spectators
    room.spectators.forEach(spectator => {
      const ws = playerConnections.get(spectator.id)
      if (ws && ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message)
      }
    })
  }

  // Broadcast room list updates to all connected clients
  function broadcastRoomListUpdate() {
    const rooms = gameEngine.getAvailableRooms()
    console.log('Broadcasting room list update with', rooms.length, 'rooms')
    const message = JSON.stringify({
      type: 'roomListUpdate',
      rooms
    })
    
    connections.forEach((_, ws) => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message)
      }
    })
  }

  // Broadcast chat messages to all players in a room
  function broadcastChatMessage(roomId, chatMessage) {
    const room = gameEngine.getRoom(roomId)
    if (!room) return
    
    const message = JSON.stringify({
      type: 'chatMessage',
      ...chatMessage
    })
    
    // Send to player A
    if (room.playerA) {
      const ws = playerConnections.get(room.playerA.id)
      if (ws && ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message)
      }
    }
    
    // Send to player B
    if (room.playerB) {
      const ws = playerConnections.get(room.playerB.id)
      if (ws && ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message)
      }
    }
    
    // Send to spectators
    room.spectators.forEach(spectator => {
      const ws = playerConnections.get(spectator.id)
      if (ws && ws.readyState === 1) { // WebSocket.OPEN
        ws.send(message)
      }
    })
  }

  const port = process.env.PORT || 3000
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})