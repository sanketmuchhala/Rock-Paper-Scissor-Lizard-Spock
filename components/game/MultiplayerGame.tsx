'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Choice } from '@/types/game'
import { GestureButton } from './GestureButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { choiceImages, choiceNames } from '@/lib/rpsls'
import Image from 'next/image'
import { useRoomPolling } from '@/hooks/useRoomPolling'
import { useRouter } from 'next/navigation'

interface MultiplayerGameProps {
  roomCode: string
  playerId: string
}

export function MultiplayerGame({ roomCode, playerId }: MultiplayerGameProps) {
  const router = useRouter()
  const [myChoice, setMyChoice] = useState<Choice | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  // Poll for room updates
  const { roomState, isConnected, error, isLoading } = useRoomPolling({
    roomCode,
    playerId,
    enabled: true
  })

  // Determine if I'm player A or B
  const isPlayerA = roomState?.playerA?.id === playerId
  const isPlayerB = roomState?.playerB?.id === playerId

  // Get my player data and opponent data
  const myPlayer = isPlayerA ? roomState?.playerA : roomState?.playerB
  const opponentPlayer = isPlayerA ? roomState?.playerB : roomState?.playerA

  const handleChoice = async (choice: Choice) => {
    if (!roomState || myPlayer?.isReady) return

    setMyChoice(choice)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/multiplayer/submit-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId, choice })
      })

      if (!response.ok) {
        throw new Error('Failed to submit move')
      }
    } catch (err) {
      console.error('Error submitting move:', err)
      setMyChoice(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextRound = async () => {
    try {
      const response = await fetch('/api/multiplayer/next-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode })
      })

      if (!response.ok) {
        throw new Error('Failed to start next round')
      }

      setMyChoice(null)
    } catch (err) {
      console.error('Error starting next round:', err)
    }
  }

  const handleLeaveRoom = async () => {
    try {
      await fetch('/api/multiplayer/leave-room', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerId })
      })
    } catch (err) {
      console.error('Error leaving room:', err)
    } finally {
      router.push('/multiplayer')
    }
  }

  // Get the latest round result
  const latestRound = roomState?.rounds?.[roomState.rounds.length - 1]
  const bothPlayersReady = myPlayer?.isReady && opponentPlayer?.isReady

  // Determine game status message
  const getStatusMessage = () => {
    if (!roomState) return 'Loading...'

    if (roomState.status === 'finished') {
      const myScore = myPlayer?.score || 0
      const oppScore = opponentPlayer?.score || 0
      if (myScore > oppScore) return 'You Win the Game! 🎉'
      if (myScore < oppScore) return 'Opponent Wins the Game!'
      return 'Game Tied!'
    }

    if (bothPlayersReady && latestRound) {
      const myWon = (isPlayerA && latestRound.winner === 'A') || (isPlayerB && latestRound.winner === 'B')
      const tie = latestRound.winner === 'tie'

      if (tie) return "It's a Tie!"
      return myWon ? 'You Win This Round! 🎉' : 'Opponent Wins This Round'
    }

    if (myPlayer?.isReady && !opponentPlayer?.isReady) {
      return 'Waiting for opponent...'
    }

    if (!myPlayer?.isReady) {
      return 'Make your choice!'
    }

    return 'Get Ready!'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">Loading game...</p>
        </div>
      </div>
    )
  }

  if (error || !roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="glass border-0 shadow-2xl bg-black/30 max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-400 mb-4">{error || 'Room not found'}</p>
            <Button onClick={() => router.push('/multiplayer')}>
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm font-mono bg-white/10 px-3 py-1 rounded-full">
            Room: {roomCode}
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLeaveConfirm(true)}
              className="text-gray-400 hover:text-white"
            >
              Leave
            </Button>
          </div>
        </div>

        {/* Player Names Banner */}
        <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">You</div>
              <div className="text-lg font-bold text-white">{myPlayer?.username}</div>
            </div>
            <div className="text-2xl font-bold text-gray-500 px-4">VS</div>
            <div className="flex-1 text-right">
              <div className="text-xs text-gray-400 mb-1">Opponent</div>
              <div className="text-lg font-bold text-white">{opponentPlayer?.username || 'Waiting...'}</div>
            </div>
          </div>
        </div>

        {/* Score and Round */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-xs text-gray-400">{myPlayer?.username}</div>
              <div className="text-2xl font-bold text-white">{myPlayer?.score || 0}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">{opponentPlayer?.username || 'Opponent'}</div>
              <div className="text-2xl font-bold text-white">{opponentPlayer?.score || 0}</div>
            </div>
          </div>

          <div className="bg-white/10 px-4 py-2 rounded-full">
            <span className="font-mono text-white">Round {roomState.currentRound}</span>
          </div>
        </div>

        {/* Game Area */}
        <Card className="glass border-0 shadow-2xl mb-6 bg-black/30">
          <CardHeader>
            <CardTitle className="text-center">{getStatusMessage()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center min-h-64 gap-8">
              <AnimatePresence mode="wait">
                {/* My Side */}
                <div className="flex-1 w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">You ({myPlayer?.username})</h3>
                  </div>

                  {!myPlayer?.isReady && roomState.status === 'playing' && (
                    <motion.div
                      key="my-choosing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid grid-cols-5 gap-2 justify-center"
                    >
                      {(['rock', 'paper', 'scissors', 'lizard', 'spock'] as Choice[]).map((choice) => (
                        <GestureButton
                          key={choice}
                          choice={choice}
                          onClick={handleChoice}
                          disabled={isSubmitting}
                        />
                      ))}
                    </motion.div>
                  )}

                  {(myPlayer?.isReady || bothPlayersReady) && (
                    <motion.div
                      key="my-result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      {myPlayer?.choice ? (
                        <Image
                          src={choiceImages[myPlayer.choice]}
                          alt={choiceNames[myPlayer.choice]}
                          width={100}
                          height={100}
                          className="mb-2"
                        />
                      ) : (
                        <div className="text-6xl mb-2">❓</div>
                      )}
                      <div className="text-lg capitalize">
                        {myPlayer?.choice ? choiceNames[myPlayer.choice] : '...'}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* VS Separator */}
                <div className="text-2xl font-bold text-white">VS</div>

                {/* Opponent Side */}
                <div className="flex-1 w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">
                      Opponent{opponentPlayer ? ` (${opponentPlayer.username})` : ''}
                    </h3>
                  </div>

                  {!opponentPlayer?.isReady && !bothPlayersReady && (
                    <motion.div
                      key="opp-choosing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center h-32"
                    >
                      <div className="text-6xl">👤</div>
                    </motion.div>
                  )}

                  {opponentPlayer?.isReady && !bothPlayersReady && (
                    <motion.div
                      key="opp-waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center h-32 justify-center"
                    >
                      <Loader2 className="w-12 h-12 animate-spin text-white mb-2" />
                      <p className="text-gray-400">Ready!</p>
                    </motion.div>
                  )}

                  {bothPlayersReady && (
                    <motion.div
                      key="opp-result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      {opponentPlayer?.choice ? (
                        <Image
                          src={choiceImages[opponentPlayer.choice]}
                          alt={choiceNames[opponentPlayer.choice]}
                          width={100}
                          height={100}
                          className="mb-2"
                        />
                      ) : (
                        <div className="text-6xl mb-2">❓</div>
                      )}
                      <div className="text-lg capitalize">
                        {opponentPlayer?.choice ? choiceNames[opponentPlayer.choice] : '...'}
                      </div>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          {bothPlayersReady && roomState.status !== 'finished' && (
            <Button
              onClick={handleNextRound}
              className="flex-1 min-w-[120px] bg-white text-black hover:bg-gray-200"
            >
              Next Round
            </Button>
          )}

          {roomState.status === 'finished' && (
            <Button
              onClick={() => router.push('/multiplayer')}
              className="flex-1 min-w-[120px] bg-white text-black hover:bg-gray-200"
            >
              Back to Menu
            </Button>
          )}
        </div>

        {/* Leave Confirmation Modal */}
        {showLeaveConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="glass border-0 shadow-2xl bg-black/30 max-w-md">
              <CardHeader>
                <CardTitle className="text-white">Leave Game?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">Are you sure you want to leave? The game will end.</p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleLeaveRoom}
                    variant="destructive"
                    className="flex-1"
                  >
                    Leave
                  </Button>
                  <Button
                    onClick={() => setShowLeaveConfirm(false)}
                    variant="outline"
                    className="flex-1 border-white/20"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  )
}
