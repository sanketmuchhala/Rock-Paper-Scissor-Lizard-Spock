'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Choice } from '@/types/game'
import { GestureButton } from './GestureButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Timer, RotateCcw } from 'lucide-react'
import { choiceEmojis, choiceNames, winner } from '@/lib/rpsls'

export function ComputerGame() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null)
  const [timeLeft, setTimeLeft] = useState(10)
  const [gameStatus, setGameStatus] = useState<'waiting' | 'choosing' | 'revealing' | 'result'>('waiting')
  const [score, setScore] = useState({ player: 0, computer: 0, ties: 0 })
  const [winnerResult, setWinnerResult] = useState<'player' | 'computer' | 'tie' | null>(null)
  const [isComputerThinking, setIsComputerThinking] = useState(false)

  // Timer effect
  useEffect(() => {
    if (gameStatus !== 'choosing' || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          // Time's up, auto-select for player
          if (!playerChoice) {
            handleChoiceAuto()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStatus, timeLeft, playerChoice])

  const handleChoice = (choice: Choice) => {
    if (gameStatus !== 'choosing') return
    setPlayerChoice(choice)
    setIsComputerThinking(true)
    
    // Computer makes choice after a delay to simulate thinking
    setTimeout(() => {
      const choices: Choice[] = ['rock', 'paper', 'scissors', 'lizard', 'spock']
      const randomChoice = choices[Math.floor(Math.random() * choices.length)]
      setComputerChoice(randomChoice)
      setIsComputerThinking(false)
      setGameStatus('revealing')
      
      // Determine winner after a short delay for dramatic effect
      setTimeout(() => {
        const result = winner(choice, randomChoice)
        setWinnerResult(result === 'A' ? 'player' : result === 'B' ? 'computer' : 'tie')
        setGameStatus('result')
        
        // Update score
        if (result === 'A') {
          setScore(prev => ({ ...prev, player: prev.player + 1 }))
        } else if (result === 'B') {
          setScore(prev => ({ ...prev, computer: prev.computer + 1 }))
        } else {
          setScore(prev => ({ ...prev, ties: prev.ties + 1 }))
        }
      }, 1000)
    }, 1500)
  }

  const handleChoiceAuto = () => {
    if (gameStatus !== 'choosing') return
    const choices: Choice[] = ['rock', 'paper', 'scissors', 'lizard', 'spock']
    const randomChoice = choices[Math.floor(Math.random() * choices.length)]
    handleChoice(randomChoice)
  }

  const startRound = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setWinnerResult(null)
    setTimeLeft(10)
    setGameStatus('choosing')
  }

  const resetGame = () => {
    setScore({ player: 0, computer: 0, ties: 0 })
    startRound()
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
            Computer Mode
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-white"
          >
            Back
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
              <div className="text-xs text-gray-400">Computer</div>
              <div className="text-2xl font-bold text-white">{score.computer}</div>
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

        {/* Game Area */}
        <Card className="glass border-0 shadow-2xl mb-6 bg-black/30">
          <CardHeader>
            <CardTitle className="text-center">
              {gameStatus === 'waiting' && 'Get Ready!'}
              {gameStatus === 'choosing' && 'Make your choice'}
              {gameStatus === 'revealing' && isComputerThinking && 'Computer is thinking...'}
              {gameStatus === 'revealing' && !isComputerThinking && 'Revealing choices...'}
              {gameStatus === 'result' && (
                winnerResult === 'tie' 
                  ? "It's a tie!" 
                  : winnerResult === 'player' 
                    ? "You win! Bazinga!" 
                    : "Computer wins!"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center min-h-64 gap-8">
              <AnimatePresence mode="wait">
                {/* Player Side */}
                <div className="flex-1 w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">You</h3>
                  </div>
                  
                  {gameStatus === 'waiting' && (
                    <motion.div
                      key="player-waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center h-32"
                    >
                      <div className="text-gray-400">Waiting to start...</div>
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
                
                {/* Computer Side */}
                <div className="flex-1 w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">Computer</h3>
                  </div>
                  
                  {gameStatus === 'waiting' && (
                    <motion.div
                      key="computer-waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center h-32"
                    >
                      <div className="text-gray-400">Waiting to start...</div>
                    </motion.div>
                  )}
                  
                  {gameStatus === 'choosing' && (
                    <motion.div
                      key="computer-choosing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center h-32"
                    >
                      <div className="text-6xl">🤖</div>
                    </motion.div>
                  )}
                  
                  {gameStatus === 'revealing' && isComputerThinking && (
                    <motion.div
                      key="computer-thinking"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="relative">
                        <div className="text-6xl animate-pulse">🤖</div>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </div>
                      </div>
                      <div className="text-sm mt-2 text-gray-400">Thinking...</div>
                    </motion.div>
                  )}
                  
                  {(computerChoice || (gameStatus === 'result')) && (
                    <motion.div
                      key="computer-result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="text-6xl mb-2 emoji">{computerChoice ? choiceEmojis[computerChoice] : '❓'}</div>
                      <div className="text-lg capitalize">{computerChoice ? choiceNames[computerChoice] : '...'}</div>
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
            disabled={gameStatus === 'choosing' && timeLeft > 0 && !playerChoice}
            className="flex-1 min-w-[120px] bg-white text-black hover:bg-gray-200"
          >
            {gameStatus === 'waiting' ? 'Start Game' : 'Next Round'}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetGame}
            className="flex-1 min-w-[120px] border-white text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Game
          </Button>
        </div>
        
        {/* TBBT Quote */}
        <motion.div 
          className="mt-8 text-center text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>"I'm not crazy, my mother had me tested!" - Sheldon Cooper</p>
        </motion.div>
      </motion.div>
    </div>
  )
}