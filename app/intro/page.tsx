'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function IntroScreen() {
  const [showRules, setShowRules] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="bg-white/5 border border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center">
            <motion.h1 
              className="text-5xl font-bold mb-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              RPSLS
            </motion.h1>
            <CardTitle className="text-2xl text-gray-300">Rock Paper Scissors Lizard Spock</CardTitle>
            <p className="text-lg text-gray-400 mt-2">Bazinga! Ready to bend the odds?</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center">
              <p className="text-xl mb-6">
                "It's not about winning or losing, it's about the journey... and maybe a little luck!" - Sheldon Cooper
              </p>
              
              <Button 
                onClick={() => setShowRules(!showRules)}
                variant="outline"
                className="mb-6 border-white/20 text-white hover:bg-white/10"
              >
                {showRules ? 'Hide Rules' : 'Show Game Rules'}
              </Button>
            </div>

            {showRules && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="bg-black/30 p-6 rounded-lg border border-white/10"
              >
                <h3 className="text-2xl font-bold mb-4 text-center">Game Rules</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">✊</span>
                      <span className="text-lg">crushes</span>
                      <span className="text-3xl">✌️</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">✊</span>
                      <span className="text-lg">crushes</span>
                      <span className="text-3xl">🤏</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">✋</span>
                      <span className="text-lg">covers</span>
                      <span className="text-3xl">✊</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">✋</span>
                      <span className="text-lg">disproves</span>
                      <span className="text-3xl">🖖</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">✌️</span>
                      <span className="text-lg">cuts</span>
                      <span className="text-3xl">✋</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">✌️</span>
                      <span className="text-lg">decapitates</span>
                      <span className="text-3xl">🤏</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">🤏</span>
                      <span className="text-lg">poisons</span>
                      <span className="text-3xl">🖖</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">🤏</span>
                      <span className="text-lg">eats</span>
                      <span className="text-3xl">✋</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">🖖</span>
                      <span className="text-lg">vaporizes</span>
                      <span className="text-3xl">✊</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-3xl">🖖</span>
                      <span className="text-lg">smashes</span>
                      <span className="text-3xl">✌️</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-lg italic">
                    "Scissors cuts paper, paper covers rock, rock crushes lizard, 
                    lizard poisons Spock, Spock smashes scissors, scissors decapitates lizard, 
                    lizard eats paper, paper disproves Spock, Spock vaporizes rock, 
                    and as it always has, rock crushes scissors." - Sheldon Cooper
                  </p>
                </div>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="block">
                <Button className="w-full sm:w-auto py-6 px-8 text-lg bg-white text-black hover:bg-gray-200">
                  Start Playing
                </Button>
              </Link>
            </div>
            
            <div className="text-center text-gray-500 mt-8">
              <p>"I'm not crazy, my mother had me tested!" - Sheldon Cooper</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}