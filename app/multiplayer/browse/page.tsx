'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, RefreshCw, Users } from 'lucide-react'

export default function BrowseRoomsPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedUsername = localStorage.getItem('rpsls_username')
    if (!savedUsername) {
      router.push('/multiplayer')
      return
    }
    setUsername(savedUsername)
  }, [router])

  const fetchRooms = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/multiplayer/rooms')
      if (!response.ok) throw new Error('Failed to fetch rooms')

      const data = await response.json()
      setRooms(data.rooms)
    } catch (err) {
      setError('Failed to load rooms')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (username) {
      fetchRooms()
      const interval = setInterval(fetchRooms, 5000)
      return () => clearInterval(interval)
    }
  }, [username])

  const handleJoinRoom = async (roomCode: string) => {
    setIsJoining(true)

    try {
      const response = await fetch('/api/multiplayer/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, username })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join room')
      }

      router.push(`/multiplayer/game?roomCode=${roomCode}&playerId=${data.playerId}`)
    } catch (err: any) {
      alert(err.message || 'Failed to join room')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Card className="glass border-0 shadow-2xl bg-black/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl text-white mb-2">Browse Rooms</CardTitle>
                <p className="text-gray-400">Join an available room</p>
              </div>
              <Button
                onClick={fetchRooms}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="border-white/20 hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading && rooms.length === 0 ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
                <p className="text-gray-400">Loading rooms...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={fetchRooms}>Try Again</Button>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No available rooms</p>
                <p className="text-gray-500 text-sm mb-4">Be the first to create one!</p>
                <Button onClick={() => router.push('/multiplayer/create')}>
                  Create Room
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <motion.div
                    key={room.code}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div>
                      <p className="text-white font-bold text-lg font-mono">{room.code}</p>
                      <p className="text-gray-400 text-sm">Created by {room.creatorName}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(room.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleJoinRoom(room.code)}
                      disabled={isJoining}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="text-center mt-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/multiplayer')}
                className="text-gray-400 hover:text-white"
                disabled={isJoining}
              >
                ← Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
