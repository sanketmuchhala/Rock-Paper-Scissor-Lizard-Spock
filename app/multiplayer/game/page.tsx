'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MultiplayerGame } from '@/components/game/MultiplayerGame'
import { Loader2 } from 'lucide-react'

export default function GamePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('roomCode')
    const id = searchParams.get('playerId')

    if (!code || !id) {
      router.push('/multiplayer')
      return
    }

    setRoomCode(code)
    setPlayerId(id)
  }, [searchParams, router])

  if (!roomCode || !playerId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    )
  }

  return <MultiplayerGame roomCode={roomCode} playerId={playerId} />
}
