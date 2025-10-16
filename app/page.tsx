'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export default function Home() {
  const [showIntro, setShowIntro] = useState(false)

  // Check if user has seen intro before
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro')
    if (!hasSeenIntro) {
      setShowIntro(true)
    }
  }, [])

  const handleSkipIntro = () => {
    localStorage.setItem('hasSeenIntro', 'true')
    setShowIntro(false)
  }

  if (showIntro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl text-center"
        >
          <Card className="bg-white/5 border border-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Logo />
              </div>
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
            <CardContent className="space-y-6">
              <p className="text-xl">
                "It's not about winning or losing, it's about the journey... and maybe a little luck!" - Sheldon Cooper
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link href="/intro" className="block">
                  <Button className="w-full sm:w-auto py-6 px-8 text-lg bg-white text-black hover:bg-gray-200">
                    Learn the Rules
                  </Button>
                </Link>
                <Button
                  onClick={handleSkipIntro}
                  variant="outline"
                  className="w-full sm:w-auto py-6 px-8 text-lg border-white/20 text-white hover:bg-white/10"
                >
                  Skip Intro
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <motion.h1
              className="text-5xl font-bold mb-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              RPSLS
            </motion.h1>
            <CardTitle className="text-2xl text-gray-300">Hyperlink Edition</CardTitle>
            <p className="text-lg text-gray-400 mt-2">Pick a hand. Bend the odds.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/computer" className="block">
                <Button
                  className="w-full py-6 bg-white text-black hover:bg-gray-200 font-bold rounded-xl neon-glow transition-all duration-300 text-lg"
                >
                  Play vs Computer
                </Button>
              </Link>
              <Link href="/hotseat" className="block">
                <Button
                  variant="outline"
                  className="w-full py-6 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 text-lg"
                >
                  Hot Seat Mode
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <motion.div
          className="mt-8 text-center text-gray-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>"I'm not crazy, my mother had me tested!" - Sheldon Cooper</p>
          <p className="mt-2 text-sm">No sign-up required. Just play!</p>
        </motion.div>
      </motion.div>
    </div>
  )
}