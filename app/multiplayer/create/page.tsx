'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy, Check, Loader2 } from 'lucide-react'
import { useRoomPolling } from '@/hooks/useRoomPolling'

export default function CreateRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Get username from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('rpsls_username')
    if (!savedUsername) {
      router.push('/multiplayer')
      return
    }
    setUsername(savedUsername)
  }, [router])

  // Create room on mount
  useEffect(() => {
    if (!username || roomCode) return

    const createRoom = async () => {
      setIsCreating(true)
      setError('')

      try {
        const response = await fetch('/api/multiplayer/create-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        })

        if (!response.ok) {
          throw new Error('Failed to create room')
        }

        const data = await response.json()
        setRoomCode(data.roomCode)
        setPlayerId(data.playerId)
      } catch (err) {
        setError('Failed to create room. Please try again.')
        console.error(err)
      } finally {
        setIsCreating(false)
      }
    }

    createRoom()
  }, [username, roomCode])

  // Poll for room updates
  const { roomState } = useRoomPolling({
    roomCode: roomCode || '',
    playerId: playerId || '',
    enabled: Boolean(roomCode && playerId)
  })

  // Navigate to game when opponent joins
  useEffect(() => {
    if (roomState?.status === 'playing' && roomState.playerB) {
      router.push(`/multiplayer/game?roomCode=${roomCode}&playerId=${playerId}`)
    }
  }, [roomState, roomCode, playerId, router])

  const copyRoomCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCancel = () => {
    if (roomCode && playerId) {
      fetch('/api/multiplayer/leave-room', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId })
      })
    }
    router.push('/multiplayer')
  }

  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Creating your room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="glass border-0 shadow-2xl bg-black/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => router.push('/multiplayer')}>
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass border-0 shadow-2xl bg-black/30">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white mb-2">Room Created!</CardTitle>
            <p className="text-gray-400">Share this code with your friend</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Room Code Display */}
            <div className="text-center">
              <p className="text-gray-400 mb-3">Room Code</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-6xl font-bold font-mono text-white tracking-widest bg-white/10 px-8 py-4 rounded-lg">
                  {roomCode}
                </div>
                <Button
                  onClick={copyRoomCode}
                  size="lg"
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                >
                  {copied ? (
                    <Check className="w-6 h-6 text-green-400" />
                  ) : (
                    <Copy className="w-6 h-6" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-green-400 text-sm mt-2">Copied to clipboard!</p>
              )}
            </div>

            {/* Waiting Animation */}
            <div className="text-center py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block"
              >
                <Loader2 className="w-16 h-16 animate-spin text-white mx-auto" />
              </motion.div>
              <p className="text-white text-xl mt-4">Waiting for opponent to join...</p>
              <p className="text-gray-400 mt-2">Player: {username}</p>
            </div>

            {/* Cancel Button */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-gray-400 hover:text-white"
              >
                Cancel and Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
