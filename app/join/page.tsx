'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GameRoom } from '@/components/game/GameRoom'
import { RoomList } from '@/components/game/RoomList'
import Link from 'next/link'
import { usePolling } from '@/hooks/usePolling'

export default function JoinRoom() {
  const [roomId, setRoomId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [joined, setJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showRoomList, setShowRoomList] = useState(false)
  const [playerId, setPlayerId] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const { isConnected, connect, sendMessage, subscribe } = usePolling()

  // Initialize WebSocket connection
  useEffect(() => {
    // Generate a player ID
    setPlayerId(Math.random().toString(36).substring(2, 15))
    connect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle WebSocket messages
  useEffect(() => {
    if (!isConnected) return

    const unsubscribe = subscribe((data) => {
      if (data.type === 'roomJoined') {
        setRoomId(data.roomId)
        setIsLoading(false)
        setJoined(true)
      } else if (data.type === 'error') {
        console.error('WebSocket error:', data.message)
        setError(data.message)
        setIsLoading(false)
      }
    })

    // Cleanup subscription
    return unsubscribe
  }, [isConnected, subscribe])

  const handleJoin = (targetRoomId?: string) => {
    const finalRoomId = targetRoomId || roomId
    if (!finalRoomId.trim() || !displayName.trim() || !isConnected) return
    setIsLoading(true)
    setError(null)

    // Send join room message to WebSocket server
    sendMessage({
      type: 'join',
      roomId: finalRoomId,
      playerName: displayName,
      playerId
    })
  }

  const handleJoinRoom = (targetRoomId: string) => {
    setRoomId(targetRoomId)
    handleJoin(targetRoomId)
  }

  const handleCreateRoom = () => {
    // Redirect to home page to create room
    window.location.href = '/'
  }

  if (joined) {
    return <GameRoom roomId={roomId} playerName={displayName} playerId={playerId} onLeave={() => setJoined(false)} />
  }

  if (showRoomList) {
    return (
      <RoomList
        onJoinRoom={handleJoinRoom}
        onCreateRoom={handleCreateRoom}
        playerName={displayName}
        playerId={playerId}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass border-0 shadow-2xl bg-black/30">
          <CardHeader className="text-center">
            <motion.h1 
              className="text-4xl font-bold mb-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Join Room
            </motion.h1>
            <CardTitle className="text-xl text-gray-300">Enter room code to play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="glass text-white placeholder:text-gray-400 border-0 py-6 text-lg bg-black/20"
                disabled={isLoading}
              />
              <Input
                type="text"
                placeholder="Enter 6-digit room code"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="glass text-white placeholder:text-gray-400 border-0 py-6 text-lg bg-black/20"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => handleJoin()}
                disabled={!roomId.trim() || !displayName.trim() || isLoading || !isConnected}
                className="py-6 bg-white text-black hover:bg-gray-200 font-bold rounded-xl neon-glow transition-all duration-300 text-lg"
              >
                {isLoading ? 'Joining...' : 'Join Room'}
              </Button>
              <Button 
                onClick={() => setShowRoomList(true)}
                className="py-6 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-300 text-lg"
              >
                Browse Rooms
              </Button>
            </div>
            
            {!isConnected && (
              <div className="text-center text-red-400">
                Connecting to server...
              </div>
            )}
            
            {error && (
              <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
        
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/" className="text-gray-400 hover:text-white text-lg">
            Back to Home
          </Link>
        </motion.div>
        
        {/* TBBT Quote */}
        <motion.div 
          className="mt-8 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>"Bazinga! Ready to bend the odds?" - Sheldon Cooper</p>
        </motion.div>
      </motion.div>
    </div>
  )
}