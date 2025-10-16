'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Choice } from '@/types/game'
import { GestureButton } from './GestureButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { choiceEmojis, choiceNames, winner } from '@/lib/rpsls'

export function HotseatMode() {
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [player1Choice, setPlayer1Choice] = useState<Choice | null>(null)
  const [player2Choice, setPlayer2Choice] = useState<Choice | null>(null)
  const [winnerResult, setWinnerResult] = useState<'1' | '2' | 'tie' | null>(null)
  const [score, setScore] = useState({ player1: 0, player2: 0, ties: 0 })
  const [gameStatus, setGameStatus] = useState<'choosing' | 'result'>('choosing')

  const handleChoice = (choice: Choice) => {
    if (currentPlayer === 1) {
      setPlayer1Choice(choice)
      setCurrentPlayer(2)
    } else {
      setPlayer2Choice(choice)
      // Determine winner
      const result = winner(player1Choice!, choice)
      setWinnerResult(result === 'A' ? '1' : result === 'B' ? '2' : 'tie')
      setGameStatus('result')
      
      // Update score
      if (result === 'A') {
        setScore(prev => ({ ...prev, player1: prev.player1 + 1 }))
      } else if (result === 'B') {
        setScore(prev => ({ ...prev, player2: prev.player2 + 1 }))
      } else {
        setScore(prev => ({ ...prev, ties: prev.ties + 1 }))
      }
    }
  }

  const resetRound = () => {
    setPlayer1Choice(null)
    setPlayer2Choice(null)
    setWinnerResult(null)
    setCurrentPlayer(1)
    setGameStatus('choosing')
  }

  const resetGame = () => {
    resetRound()
    setScore({ player1: 0, player2: 0, ties: 0 })
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
            Hotseat Mode
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

        {/* Score */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-xs text-gray-400">Player 1</div>
              <div className="text-2xl font-bold text-white">{score.player1}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Player 2</div>
              <div className="text-2xl font-bold text-white">{score.player2}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Ties</div>
              <div className="text-2xl font-bold text-white">{score.ties}</div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <Card className="glass border-0 shadow-2xl mb-6 bg-black/30">
          <CardHeader>
            <CardTitle className="text-center">
              {gameStatus === 'choosing' ? (
                currentPlayer === 1 
                  ? "Player 1's turn" 
                  : "Player 2's turn"
              ) : (
                winnerResult === 'tie' 
                  ? "It's a tie!" 
                  : `Player ${winnerResult} wins! Bazinga!`
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center min-h-64 gap-8">
              <AnimatePresence mode="wait">
                {/* Player 1 Side */}
                <div className="flex-1 w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">Player 1</h3>
                  </div>
                  
                  {gameStatus === 'choosing' && currentPlayer === 2 && player1Choice && (
                    <motion.div
                      key="player1-waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <div className="text-6xl mb-2 emoji">{choiceEmojis[player1Choice]}</div>
                      <div className="text-lg capitalize">{choiceNames[player1Choice]}</div>
                    </motion.div>
                  )}
                  
                  {gameStatus === 'choosing' && currentPlayer === 1 && !player1Choice && (
                    <motion.div
                      key="player1-choosing"
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
                  
                  {gameStatus === 'result' && (
                    <motion.div
                      key="player1-result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="text-6xl mb-2 emoji">
                        {player1Choice ? choiceEmojis[player1Choice] : '❓'}
                      </div>
                      <div className="text-lg capitalize">{player1Choice ? choiceNames[player1Choice] : '...'}</div>
                    </motion.div>
                  )}
                </div>
                
                {/* VS Separator */}
                <div className="text-2xl font-bold text-white hidden md:block">VS</div>
                <div className="text-2xl font-bold text-white md:hidden">VS</div>
                
                {/* Player 2 Side */}
                <div className="flex-1 w-full">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-white">Player 2</h3>
                  </div>
                  
                  {gameStatus === 'choosing' && currentPlayer === 1 && (
                    <motion.div
                      key="player2-waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-center items-center h-32"
                    >
                      <div className="text-gray-400 text-center">
                        <div className="text-4xl mb-2">👤</div>
                        <div>Waiting for Player 2</div>
                      </div>
                    </motion.div>
                  )}
                  
                  {gameStatus === 'choosing' && currentPlayer === 2 && !player2Choice && (
                    <motion.div
                      key="player2-choosing"
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
                  
                  {gameStatus === 'result' && (
                    <motion.div
                      key="player2-result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="text-6xl mb-2 emoji">
                        {player2Choice ? choiceEmojis[player2Choice] : '❓'}
                      </div>
                      <div className="text-lg capitalize">{player2Choice ? choiceNames[player2Choice] : '...'}</div>
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
            onClick={resetRound}
            className="flex-1 min-w-[120px] bg-white text-black hover:bg-gray-200"
          >
            {gameStatus === 'result' ? 'Next Round' : 'Reset Round'}
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
          <p>"Scissors cuts paper, paper covers rock, rock crushes lizard..." - Sheldon Cooper</p>
        </motion.div>
      </motion.div>
    </div>
  )
}