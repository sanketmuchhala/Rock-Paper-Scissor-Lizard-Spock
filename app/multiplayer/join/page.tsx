'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function JoinRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [username, setUsername] = useState('')
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

  const handleJoin = async () => {
    const trimmedCode = roomCode.trim().toUpperCase()

    if (trimmedCode.length !== 6) {
      setError('Room code must be 6 characters')
      return
    }

    setIsJoining(true)
    setError('')

    try {
      const response = await fetch('/api/multiplayer/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode: trimmedCode, username })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join room')
      }

      // Navigate to game
      router.push(`/multiplayer/game?roomCode=${trimmedCode}&playerId=${data.playerId}`)
    } catch (err: any) {
      setError(err.message || 'Failed to join room')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass border-0 shadow-2xl bg-black/30">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white mb-2">Join Room</CardTitle>
            <p className="text-gray-400">Enter the 6-character room code</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="ABCD12"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase())
                  setError('')
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJoin()
                  }
                }}
                className="glass text-white placeholder:text-gray-400 border-0 py-6 text-2xl font-mono text-center tracking-widest bg-black/20"
                maxLength={6}
                autoFocus
                disabled={isJoining}
              />
              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
            </div>

            <Button
              onClick={handleJoin}
              disabled={roomCode.length !== 6 || isJoining}
              className="w-full py-6 bg-white text-black hover:bg-gray-200 font-bold rounded-xl text-lg"
            >
              {isJoining ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Joining...</>
              ) : (
                'Join Room'
              )}
            </Button>

            <div className="text-center">
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
