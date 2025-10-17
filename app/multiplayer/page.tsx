'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Plus, Search, List } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function MultiplayerPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  // Load username from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('rpsls_username')
    if (savedUsername) {
      setUsername(savedUsername)
    }
  }, [])

  const validateAndSave = () => {
    const trimmed = username.trim()

    if (trimmed.length < 3) {
      setError('Username must be at least 3 characters')
      return false
    }

    if (trimmed.length > 20) {
      setError('Username must be less than 20 characters')
      return false
    }

    // Save to localStorage
    localStorage.setItem('rpsls_username', trimmed)
    setError('')
    return true
  }

  const handleCreateRoom = () => {
    if (validateAndSave()) {
      router.push('/multiplayer/create')
    }
  }

  const handleJoinRoom = () => {
    if (validateAndSave()) {
      router.push('/multiplayer/join')
    }
  }

  const handleBrowseRooms = () => {
    if (validateAndSave()) {
      router.push('/multiplayer/browse')
    }
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
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <motion.div
              className="flex items-center justify-center gap-2 mb-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Users className="w-8 h-8 text-white" />
              <h1 className="text-5xl font-bold text-white">Multiplayer</h1>
            </motion.div>
            <CardTitle className="text-2xl text-gray-300">Enter Your Username</CardTitle>
            <p className="text-sm text-gray-400 mt-2">Play against friends online!</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter your username (3-20 characters)"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRoom()
                  }
                }}
                className="glass text-white placeholder:text-gray-400 border-0 py-6 text-lg bg-black/20"
                maxLength={20}
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={handleCreateRoom}
                disabled={!username.trim()}
                className="py-6 bg-white text-black hover:bg-gray-200 font-bold rounded-xl neon-glow transition-all duration-300 text-lg flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Room
              </Button>

              <Button
                variant="outline"
                onClick={handleJoinRoom}
                disabled={!username.trim()}
                className="py-6 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 text-lg flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Join Room
              </Button>

              <Button
                variant="secondary"
                onClick={handleBrowseRooms}
                disabled={!username.trim()}
                className="py-6 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all duration-300 text-lg flex items-center justify-center gap-2"
              >
                <List className="w-5 h-5" />
                Browse Rooms
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="text-gray-400 hover:text-white"
              >
                ← Back to Menu
              </Button>
            </div>
          </CardContent>
        </Card>

        <motion.div
          className="mt-8 text-center text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>"In the game of Rock-Paper-Scissors-Lizard-Spock, there is no luck, only strategy!"</p>
          <p className="mt-2">- Sheldon Cooper</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
