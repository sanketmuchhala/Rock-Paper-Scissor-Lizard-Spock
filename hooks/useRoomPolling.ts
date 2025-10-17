import { useState, useEffect, useRef, useCallback } from 'react'
import { MultiplayerRoom } from '@/types/multiplayer'

interface UseRoomPollingOptions {
  roomCode: string
  playerId: string
  enabled?: boolean
  onRoomUpdate?: (room: MultiplayerRoom) => void
}

export function useRoomPolling({ roomCode, playerId, enabled = true, onRoomUpdate }: UseRoomPollingOptions) {
  const [roomState, setRoomState] = useState<MultiplayerRoom | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const MAX_RETRIES = 5

  const fetchRoomStatus = useCallback(async () => {
    if (!enabled || !roomCode || !playerId) return

    try {
      const response = await fetch(
        `/api/multiplayer/room-status?roomCode=${roomCode}&playerId=${playerId}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          setError('Room not found')
          setIsConnected(false)
          return
        }

        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      setRoomState(data.room)
      setIsConnected(true)
      setError(null)
      setIsLoading(false)
      retryCountRef.current = 0

      // Call optional callback
      if (onRoomUpdate) {
        onRoomUpdate(data.room)
      }
    } catch (err) {
      console.error('Polling error:', err)
      retryCountRef.current++

      if (retryCountRef.current >= MAX_RETRIES) {
        setIsConnected(false)
        setError('Connection lost. Please refresh the page.')
      } else {
        setError('Reconnecting...')
      }

      setIsLoading(false)
    }
  }, [roomCode, playerId, enabled, onRoomUpdate])

  // Determine polling interval based on game state
  const getPollingInterval = useCallback(() => {
    if (!roomState) return 2000 // Default: 2 seconds

    // If waiting for opponent, poll every 3 seconds
    if (roomState.status === 'waiting') return 3000

    // If both players have made choices, poll every 1 second for quick result reveal
    if (roomState.playerA?.isReady && roomState.playerB?.isReady) return 1000

    // During active play, poll every 2 seconds
    if (roomState.status === 'playing') return 2000

    // Game finished, poll every 5 seconds
    if (roomState.status === 'finished') return 5000

    return 2000
  }, [roomState])

  // Start polling
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Initial fetch
    fetchRoomStatus()

    // Set up polling interval
    const interval = getPollingInterval()
    intervalRef.current = setInterval(fetchRoomStatus, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, fetchRoomStatus, getPollingInterval])

  // Adjust polling frequency when room state changes
  useEffect(() => {
    if (!enabled || !intervalRef.current) return

    const newInterval = getPollingInterval()

    // Clear old interval and set new one
    clearInterval(intervalRef.current)
    intervalRef.current = setInterval(fetchRoomStatus, newInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [getPollingInterval, fetchRoomStatus, enabled])

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchRoomStatus()
  }, [fetchRoomStatus])

  return {
    roomState,
    isConnected,
    error,
    isLoading,
    refetch
  }
}
