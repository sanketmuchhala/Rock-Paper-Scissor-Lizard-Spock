export type Choice = 'rock' | 'paper' | 'scissors' | 'lizard' | 'spock'

export interface Player {
  id: string
  displayName: string
  choice?: Choice
  isReady: boolean
}

export interface Round {
  id: number
  playerAChoice?: Choice
  playerBChoice?: Choice
  winner?: 'A' | 'B' | 'tie'
  timestamp: Date
}

export interface Room {
  id: string
  playerA: Player | null
  playerB: Player | null
  spectators: Player[]
  rounds: Round[]
  currentRound: number
  status: 'waiting' | 'playing' | 'finished'
  createdAt: Date
}

export interface GameResult {
  winner: 'A' | 'B' | 'tie'
  rounds: Round[]
}