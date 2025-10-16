import { Choice } from '@/types/game'

/**
 * RPSLS rules:
 * Rock crushes Scissors, crushes Lizard
 * Paper covers Rock, disproves Spock
 * Scissors cuts Paper, decapitates Lizard
 * Lizard poisons Spock, eats Paper
 * Spock vaporizes Rock, smashes Scissors
 */

export const choices: Choice[] = ['rock', 'paper', 'scissors', 'lizard', 'spock']

export const choiceEmojis: Record<Choice, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
  lizard: '🤏',
  spock: '🖖'
}

export const choiceNames: Record<Choice, string> = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors',
  lizard: 'Lizard',
  spock: 'Spock'
}

export const beats = (a: Choice, b: Choice): boolean => {
  const rules: Record<Choice, Choice[]> = {
    rock: ['scissors', 'lizard'],
    paper: ['rock', 'spock'],
    scissors: ['paper', 'lizard'],
    lizard: ['spock', 'paper'],
    spock: ['scissors', 'rock']
  }
  
  return rules[a].includes(b)
}

export const winner = (a: Choice, b: Choice): 'A' | 'B' | 'tie' => {
  if (a === b) return 'tie'
  return beats(a, b) ? 'A' : 'B'
}

// Simulate a round for testing
export const simulateRound = (choiceA: Choice, choiceB: Choice) => {
  return {
    playerAChoice: choiceA,
    playerBChoice: choiceB,
    winner: winner(choiceA, choiceB)
  }
}