import { beats, winner, simulateRound } from '../lib/rpsls'

describe('RPSLS Game Logic', () => {
  test('rock beats scissors', () => {
    expect(beats('rock', 'scissors')).toBe(true)
  })

  test('rock beats lizard', () => {
    expect(beats('rock', 'lizard')).toBe(true)
  })

  test('paper beats rock', () => {
    expect(beats('paper', 'rock')).toBe(true)
  })

  test('paper beats spock', () => {
    expect(beats('paper', 'spock')).toBe(true)
  })

  test('scissors beats paper', () => {
    expect(beats('scissors', 'paper')).toBe(true)
  })

  test('scissors beats lizard', () => {
    expect(beats('scissors', 'lizard')).toBe(true)
  })

  test('lizard beats spock', () => {
    expect(beats('lizard', 'spock')).toBe(true)
  })

  test('lizard beats paper', () => {
    expect(beats('lizard', 'paper')).toBe(true)
  })

  test('spock beats scissors', () => {
    expect(beats('spock', 'scissors')).toBe(true)
  })

  test('spock beats rock', () => {
    expect(beats('spock', 'rock')).toBe(true)
  })

  test('same choices result in tie', () => {
    expect(winner('rock', 'rock')).toBe('tie')
    expect(winner('paper', 'paper')).toBe('tie')
    expect(winner('scissors', 'scissors')).toBe('tie')
    expect(winner('lizard', 'lizard')).toBe('tie')
    expect(winner('spock', 'spock')).toBe('tie')
  })

  test('rock vs paper results in B win', () => {
    expect(winner('rock', 'paper')).toBe('B')
  })

  test('paper vs rock results in A win', () => {
    expect(winner('paper', 'rock')).toBe('A')
  })

  test('simulate round works correctly', () => {
    const result = simulateRound('rock', 'scissors')
    expect(result.playerAChoice).toBe('rock')
    expect(result.playerBChoice).toBe('scissors')
    expect(result.winner).toBe('A')
  })
})