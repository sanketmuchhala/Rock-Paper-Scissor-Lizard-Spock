'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Choice } from '@/types/game'
import { GestureButton } from './GestureButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Timer, RotateCw } from 'lucide-react'
import { choiceEmojis, choiceNames } from '@/lib/rpsls'
import { usePolling } from '@/hooks/usePolling'

interface GameRoomProps {
  roomId: string
  playerName: string
  playerId?: string
  onLeave: () => void
}

export function GameRoom({ roomId, playerName, playerId: initialPlayerId, onLeave }: GameRoomProps) {
  const [playerId, setPlayerId] = useState<string | null>(initialPlayerId || null)
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
  const [opponentChoice, setOpponentChoice] = useState<Choice | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [gameStatus, setGameStatus] = useState<'waiting' | 'choosing' | 'revealing' | 'result'>('waiting')
  const [score, setScore] = useState({ player: 0, opponent: 0, ties: 0 })
  const [winnerResult, setWinnerResult] = useState<'player' | 'opponent' | 'tie' | null>(null)
  const [opponentName, setOpponentName] = useState<string | null>(null)
  const [autoSelected, setAutoSelected] = useState(false) // Track if player's choice was auto-selected
  
  const { isConnected, error, connect, sendMessage, subscribe, startPolling, stopPolling } = usePolling()

  // Handle room updates from WebSocket
  const handleRoomUpdate = useCallback((room: any) => {
    // Check if this is our room
    if (room.id !== roomId) return

    // Determine if we are player A or player B
    const isPlayerA = room.playerA && room.playerA.id === playerId
    const isPlayerB = room.playerB && room.playerB.id === playerId

    // Update opponent info
    if (isPlayerA && room.playerB) {
      setOpponentName(room.playerB.displayName)
    } else if (isPlayerB && room.playerA) {
      setOpponentName(room.playerA.displayName)
    }

    // Update game state based on room status
    if (room.status === 'playing' && gameStatus === 'waiting') {
      setGameStatus('choosing')
      setTimeLeft(10)
      setAutoSelected(false)
    }

    // Update scores based on our perspective
    const playerAWins = room.rounds.filter((r: any) => r.winner === 'A').length
    const playerBWins = room.rounds.filter((r: any) => r.winner === 'B').length
    const ties = room.rounds.filter((r: any) => r.winner === 'tie').length

    if (isPlayerA) {
      setScore({
        player: playerAWins,
        opponent: playerBWins,
        ties: ties
      })
    } else if (isPlayerB) {
      setScore({
        player: playerBWins,
        opponent: playerAWins,
        ties: ties
      })
    }

    // Handle round results
    if (room.rounds.length > 0) {
      const latestRound = room.rounds[room.rounds.length - 1]
      if (latestRound.playerAChoice && latestRound.playerBChoice) {
        // Set choices based on our perspective
        if (isPlayerA) {
          setPlayerChoice(latestRound.playerAChoice)
          setOpponentChoice(latestRound.playerBChoice)
          const result = latestRound.winner
          setWinnerResult(result === 'A' ? 'player' : result === 'B' ? 'opponent' : 'tie')
        } else if (isPlayerB) {
          setPlayerChoice(latestRound.playerBChoice)
          setOpponentChoice(latestRound.playerAChoice)
          const result = latestRound.winner
          setWinnerResult(result === 'B' ? 'player' : result === 'A' ? 'opponent' : 'tie')
        }
        setGameStatus('result')
      }
    }
  }, [roomId, gameStatus, playerId])

  // Initialize connection and start polling
  useEffect(() => {
    connect()
    if (roomId) {
      startPolling(roomId)
    }

    // Clean up on unmount
    return () => {
      if (roomId) {
        stopPolling(roomId)
      }
    }
  }, [connect, roomId, startPolling, stopPolling])

  // Handle WebSocket messages
  useEffect(() => {
    if (!isConnected) return

    const unsubscribe = subscribe((data) => {
      switch (data.type) {
        case 'roomCreated':
          if (!playerId) setPlayerId(data.playerId)
          setGameStatus('waiting')
          break
        case 'roomJoined':
          if (!playerId) setPlayerId(data.playerId)
          setGameStatus('waiting')
          break
        case 'roomUpdate':
          handleRoomUpdate(data.room)
          break
        case 'error':
          console.error('WebSocket error:', data.message)
          break
      }
    })

    return unsubscribe
  }, [isConnected, playerId, subscribe, handleRoomUpdate])

  // Timer effect
  useEffect(() => {
    if (gameStatus !== 'choosing' || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Time's up, reveal choices
          setGameStatus('revealing')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStatus, timeLeft])

  const handleChoice = (choice: Choice) => {
    if (gameStatus !== 'choosing' || !playerId) return
    
    setPlayerChoice(choice)
    setAutoSelected(false) // Reset auto-selected flag when player makes choice
    
    // Send choice to server
    sendMessage({
      type: 'choice',
      roomId,
      choice
    })
  }

  const startRound = () => {
    setPlayerChoice(null)
    setOpponentChoice(null)
    setWinnerResult(null)
    setTimeLeft(10)
    setGameStatus('choosing')
    setAutoSelected(false)
  }

  const resetGame = () => {
    setScore({ player: 0, opponent: 0, ties: 0 })
    startRound()
    
    // Send rematch request to server
    sendMessage({
      type: 'rematch',
      roomId
    })
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
            Room: {roomId}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLeave}
            className="text-gray-400 hover:text-white"
          >
            Leave
          </Button>
        </div>

        {/* Score and Timer */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-xs text-gray-400">You</div>
              <div className="text-2xl font-bold text-white">{score.player}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Opponent</div>
              <div className="text-2xl font-bold text-white">{score.opponent}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Ties</div>
              <div className="text-2xl font-bold text-white">{score.ties}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
            <Timer className="w-4 h-4" />
            <span className="font-mono">{timeLeft}s</span>
          </div>
        </div>

        {/* Auto-selected notification */}
        {autoSelected && (
          <div className="text-center text-yellow-400 mb-4 p-2 bg-yellow-900/20 rounded-lg">
            Time's up! Your choice was automatically selected.
          </div>
        )}

        {/* Game Area */}
        <Card className="glass border-0 shadow-2xl mb-6 bg-black/30">
          <CardHeader>
            <CardTitle className="text-center">
              {gameStatus === 'waiting' && `Waiting for opponent...${opponentName ? ` (${opponentName} joined!)` : ''}`}
              {gameStatus === 'choosing' && 'Make your choice'}
              {gameStatus === 'revealing' && 'Revealing...'}
              {gameStatus === 'result' && (
                winnerResult === 'tie' 
                  ? "It's a tie!" 
                  : winnerResult === 'player' 
                    ? "You win! Bazinga!" 
                    : "Opponent wins!"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center min-h-64 gap-8">
              <AnimatePresence mode="wait">
                {/* Player Side */}
                <div className="flex-1 w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">You ({playerName})</h3>
                  </div>
                  
                  {gameStatus === 'waiting' && (
                    <motion.div
                      key="player-waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center h-32"
                    >
                      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                      <p className="ml-4 text-gray-400">Waiting for another player</p>
                    </motion.div>
                  )}
                  
                  {gameStatus === 'choosing' && !playerChoice && (
                    <motion.div
                      key="player-choosing"
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
                        />
                      ))}
                    </motion.div>
                  )}
                  
                  {(playerChoice || gameStatus === 'revealing' || gameStatus === 'result') && (
                    <motion.div
                      key="player-result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="text-6xl mb-2 emoji">{playerChoice ? choiceEmojis[playerChoice] : '❓'}</div>
                      <div className="text-lg capitalize">{playerChoice ? choiceNames[playerChoice] : '...'}</div>
                    </motion.div>
                  )}
                </div>
                
                {/* VS Separator */}
                <div className="text-2xl font-bold text-white hidden md:block">VS</div>
                <div className="text-2xl font-bold text-white md:hidden">VS</div>
                
                {/* Opponent Side */}
                <div className="flex-1 w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">Opponent{opponentName ? ` (${opponentName})` : ''}</h3>
                  </div>
                  
                  {gameStatus === 'waiting' && (
                    <motion.div
                      key="opponent-waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center h-32"
                    >
                      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                      <p className="ml-4 text-gray-400">Waiting for another player</p>
                    </motion.div>
                  )}
                  
                  {gameStatus === 'choosing' && !opponentChoice && (
                    <motion.div
                      key="opponent-choosing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center h-32"
                    >
                      <div className="text-6xl">👤</div>
                    </motion.div>
                  )}
                  
                  {(opponentChoice || gameStatus === 'revealing' || gameStatus === 'result') && (
                    <motion.div
                      key="opponent-result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="text-6xl mb-2 emoji">{opponentChoice ? choiceEmojis[opponentChoice] : '❓'}</div>
                      <div className="text-lg capitalize">{opponentChoice ? choiceNames[opponentChoice] : '...'}</div>
                    </motion.div>
                  )}
                </div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button 
            onClick={startRound}
            disabled={gameStatus === 'waiting'}
            className="flex-1 min-w-[120px] bg-white text-black hover:bg-gray-200"
          >
            {gameStatus === 'waiting' ? 'Start Game' : 'Next Round'}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetGame}
            className="flex-1 min-w-[120px] border-white text-white hover:bg-white/10"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Reset Game
          </Button>
        </div>
        
        {/* Connection Status */}
        {error && (
          <div className="mt-4 text-center text-red-400">
            Connection error: {error}
          </div>
        )}
        
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