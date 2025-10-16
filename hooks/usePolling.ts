import { useState, useEffect, useRef, useCallback } from 'react'

type PollingMessage = {
  type: string
  [key: string]: any
}

export function usePolling() {
  const [isConnected, setIsConnected] = useState(true) // Always connected with polling
  const [error, setError] = useState<string | null>(null)
  const subscriptions = useRef<((data: any) => void)[]>([])
  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const sendMessage = useCallback(async (message: any) => {
    try {
      const { type, ...data } = message

      let endpoint = ''
      let method = 'POST'

      switch (type) {
        case 'create':
          endpoint = '/api/create'
          break
        case 'join':
          endpoint = '/api/join'
          break
        case 'choice':
          endpoint = '/api/choice'
          break
        case 'rematch':
          endpoint = '/api/rematch'
          break
        case 'getAvailableRooms':
          endpoint = '/api/rooms'
          method = 'GET'
          break
        default:
          console.warn('Unknown message type:', type)
          return
      }

      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      }

      if (method === 'POST') {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(endpoint, options)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // Notify subscribers
      subscriptions.current.forEach(callback => {
        if (type === 'create') {
          callback({ type: 'roomCreated', ...result })
        } else if (type === 'join') {
          callback({ type: 'roomJoined', ...result })
        } else if (type === 'getAvailableRooms') {
          callback({ type: 'roomListUpdate', rooms: result.rooms })
        } else if (type === 'choice') {
          callback({ type: 'choiceReceived' })
        } else if (type === 'rematch') {
          callback({ type: 'rematchAcknowledged' })
        }
      })

      setError(null)
      return result
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to communicate with server')
      subscriptions.current.forEach(callback => {
        callback({ type: 'error', message: 'Failed to communicate with server' })
      })
      throw err
    }
  }, [])

  const subscribe = useCallback((callback: (data: any) => void) => {
    subscriptions.current.push(callback)

    return () => {
      const index = subscriptions.current.indexOf(callback)
      if (index > -1) {
        subscriptions.current.splice(index, 1)
      }
    }
  }, [])

  const startPolling = useCallback((roomId: string, interval: number = 1500) => {
    // Stop existing polling for this room
    const existingInterval = pollingIntervals.current.get(roomId)
    if (existingInterval) {
      clearInterval(existingInterval)
    }

    // Start new polling
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/status?roomId=${roomId}`)
        if (response.ok) {
          const data = await response.json()
          subscriptions.current.forEach(callback => {
            callback({ type: 'roomUpdate', room: data.room })
          })
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, interval)

    pollingIntervals.current.set(roomId, pollInterval)
  }, [])

  const stopPolling = useCallback((roomId: string) => {
    const interval = pollingIntervals.current.get(roomId)
    if (interval) {
      clearInterval(interval)
      pollingIntervals.current.delete(roomId)
    }
  }, [])

  const connect = useCallback(() => {
    setIsConnected(true)
    setError(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pollingIntervals.current.forEach((interval) => {
        clearInterval(interval)
      })
      pollingIntervals.current.clear()
    }
  }, [])

  return {
    isConnected,
    error,
    connect,
    sendMessage,
    subscribe,
    startPolling,
    stopPolling
  }
}
