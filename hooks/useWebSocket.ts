import { useState, useEffect, useRef, useCallback } from 'react'

type WebSocketMessage = {
  type: string
  [key: string]: any
}

export function useWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messageQueue = useRef<any[]>([])
  const subscriptions = useRef<((data: any) => void)[]>([])
  const shouldReconnect = useRef(true)

  const connect = useCallback(() => {
    try {
      // Use ws://localhost:3000 for development, wss:// for production
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      // Connect to the WebSocket endpoint
      const wsUrl = `${protocol}//${window.location.host}/ws`
      
      const websocket = new WebSocket(wsUrl)
      
      websocket.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        
        // Send any queued messages
        messageQueue.current.forEach(msg => {
          websocket.send(JSON.stringify(msg))
        })
        messageQueue.current = []
      }
      
      websocket.onclose = (event) => {
        console.log('WebSocket disconnected', event.reason)
        setIsConnected(false)
        
        // Attempt to reconnect if shouldReconnect is true
        if (shouldReconnect.current) {
          setTimeout(() => {
            connect()
          }, 1000)
        }
      }
      
      websocket.onerror = (err) => {
        console.error('WebSocket error:', err)
        setError('WebSocket connection error')
        setIsConnected(false)
      }
      
      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          // Notify all subscribers
          subscriptions.current.forEach(callback => {
            callback(data)
          })
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }
      
      setWs(websocket)
    } catch (err) {
      setError('Failed to connect to WebSocket')
      console.error('WebSocket connection error:', err)
    }
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (ws && isConnected && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
    } else {
      // Queue message for when connection is established
      messageQueue.current.push(message)
    }
  }, [ws, isConnected])

  const subscribe = useCallback((callback: (data: any) => void) => {
    subscriptions.current.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = subscriptions.current.indexOf(callback)
      if (index > -1) {
        subscriptions.current.splice(index, 1)
      }
    }
  }, [])

  // Initialize connection on mount
  useEffect(() => {
    connect()
    
    // Allow reconnection by default
    shouldReconnect.current = true
    
    // Clean up on unmount
    return () => {
      shouldReconnect.current = false
      if (ws) {
        ws.close()
      }
    }
  }, [connect])

  return {
    isConnected,
    error,
    connect,
    sendMessage,
    subscribe
  }
}