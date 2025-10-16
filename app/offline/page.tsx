'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass border-0 shadow-2xl text-center">
          <CardHeader className="flex flex-col items-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <WifiOff className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Offline Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              You&apos;re currently offline. Try these options:
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full py-6 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
              >
                Retry Connection
              </Button>
              
              <Link href="/hotseat" className="block">
                <Button 
                  variant="outline"
                  className="w-full py-6 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/10"
                >
                  Hotseat Mode (2 Players)
                </Button>
              </Link>
            </div>
            
            <p className="text-xs text-gray-500 mt-6">
              Hotseat mode allows two players to play on the same device
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}