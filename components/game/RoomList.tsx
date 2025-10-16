'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { usePolling } from '@/hooks/usePolling'

interface RoomInfo {
  id: string
  creatorName: string
}

interface RoomListProps {
  onJoinRoom: (roomId: string) => void
  onCreateRoom: () => void
  playerName: string
  playerId: string
}

export function RoomList({ onJoinRoom, onCreateRoom, playerName, playerId }: RoomListProps) {
  const [rooms, setRooms] = useState<RoomInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState<string | null>(null)

  const { isConnected, connect, sendMessage, subscribe } = usePolling()

  // Handle WebSocket messages
  useEffect(() => {
    if (!isConnected) return

    const unsubscribe = subscribe((data) => {
      switch (data.type) {
        case 'roomListUpdate':
          setRooms(data.rooms)
          setLoading(false)
          break
        case 'roomJoined':
          // Successfully joined room
          setJoining(null)
          onJoinRoom(data.roomId)
          break
        case 'error':
          setError(data.message)
          setJoining(null)
          setLoading(false)
          break
      }
    })

    // Request available rooms
    sendMessage({ type: 'getAvailableRooms' })

    // Cleanup subscription
    return unsubscribe
  }, [isConnected, onJoinRoom, subscribe, sendMessage])

  const handleRefresh = () => {
    if (isConnected) {
      setLoading(true)
      sendMessage({ type: 'getAvailableRooms' })
    }
  }

  const handleJoinRoom = (roomId: string) => {
    if (!isConnected || !playerName.trim()) {
      setError('Please enter your name first')
      return
    }

    setJoining(roomId)
    setError(null)

    sendMessage({
      type: 'join',
      roomId,
      playerName,
      playerId
    })
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
              Available Rooms
            </motion.h1>
            <CardTitle className="text-xl text-gray-300">Select a room to join</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                disabled={loading || !isConnected}
                className="flex items-center gap-2 border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={onCreateRoom}
                className="bg-white text-black hover:bg-gray-200"
              >
                Create New Room
              </Button>
            </div>

            {error && (
              <div className="text-center text-red-400 p-4 bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}

            {!isConnected ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4" />
                  <p className="text-gray-400">Connecting to server...</p>
                </div>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center p-8 bg-white/5 rounded-lg">
                <p className="text-gray-400 text-lg">No rooms available at the moment</p>
                <p className="text-gray-500 mt-2">Create a new room to start playing!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <motion.div
                    key={room.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass p-4 rounded-lg border border-white/10 hover:border-white/50 transition-all cursor-pointer bg-black/20"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-lg">Room #{room.id}</div>
                        <div className="text-gray-400">Created by: {room.creatorName}</div>
                      </div>
                      <Button 
                        variant="secondary"
                        className="bg-white text-black hover:bg-gray-200"
                        onClick={() => handleJoinRoom(room.id)}
                        disabled={joining === room.id}
                      >
                        {joining === room.id ? 'Joining...' : 'Join'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
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
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-white"
          >
            Back to Home
          </Button>
        </motion.div>
        
        {/* TBBT Quote */}
        <motion.div 
          className="mt-8 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>"I'm not insane, my mother had me tested!" - Sheldon Cooper</p>
        </motion.div>
      </motion.div>
    </div>
  )
}