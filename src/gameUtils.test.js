import { describe, it, expect } from 'vitest'
import {
  generateRoomCode,
  pickLocation,
  pickSpy,
  calculateVoteResult,
  allVotesCast,
} from './gameUtils'

// ── Locations (duplicated here to avoid import issues with default export)
const LOCATIONS = [
  "Space rocket","Space station","Bank","Office","Conference room",
  "Reception area","Call center","Data center","Laboratory","Television studio",
  "Radio station","Recycling plant","Power substation","Mine","Home",
  "Backyard","Balcony","Garden","Garage","Kitchen","Bedroom","Attic",
  "Farmhouse","Treehouse","Eiffel Tower (France)","Colosseum (Italy)",
  "Big Ben (UK)","Statue of Liberty (USA)","Great Wall of China (China)",
  "Mount Fuji (Japan)","Burj Khalifa (UAE)","Times Square (USA)",
  "Red Square (Russia)","Grand Canyon (USA)","Temple","Church","Monastery",
  "Park","Forest","Lake","Waterfall","Beach","Mountain","Desert","Cave",
  "Volcano","Botanical garden","Zoo","Aquarium","Picnic area","Supermarket",
  "Butcher shop","Bakery","Flower shop","Barber shop","Beauty salon",
  "Shopping mall","Post office","Dry cleaner","Car wash","Gas station",
  "Hotel","Restaurant","Café","Bar","Nightclub","Casino","Bookstore",
  "Electronics store","Pet shop","Hospital","Pharmacy","Dentist",
  "Veterinary clinic","Fire station","Police station","Nursing home",
  "School","Kindergarten","University campus","Playground","Library",
  "Art gallery","Museum","Theater","Gym","Swimming pool","Stadium",
  "Music school","Dance studio","Driving school","Planetarium","Bus stop",
  "Metro station","Train station","Airport","Parking lot","City square",
  "Skyscraper","Bridge","Fountain","Public restroom","Factory",
  "Office building","Embassy","Courthouse","Paris","Tokyo","New York",
  "London","Rome","Hawaii","Ski resort","Village","Bowling","Tennis court",
]

// ── Unit tests ────────────────────────────────────────────────────────────────

describe('generateRoomCode', () => {
  it('returns a 6-character string', () => {
    expect(generateRoomCode()).toHaveLength(6)
  })

  it('contains only valid characters (no O, 0, I, 1)', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode()
      expect(code).not.toMatch(/[O0I1]/)
    }
  })
})

describe('pickSpy', () => {
  it('always returns a player from the list', () => {
    const players = ['player1', 'player2', 'player3']
    for (let i = 0; i < 200; i++) {
      const spy = pickSpy(players)
      expect(players).toContain(spy)
    }
  })

  it('never returns undefined', () => {
    const players = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6']
    for (let i = 0; i < 500; i++) {
      expect(pickSpy(players)).toBeDefined()
    }
  })

  it('distributes spy selection across all players (no player always skipped)', () => {
    const players = ['player1', 'player2', 'player3', 'player4']
    const counts = {}
    players.forEach(p => counts[p] = 0)
    for (let i = 0; i < 1000; i++) {
      counts[pickSpy(players)]++
    }
    // Each player should be picked at least once in 1000 trials
    players.forEach(p => expect(counts[p]).toBeGreaterThan(0))
  })
})

describe('pickLocation', () => {
  it('returns a known location', () => {
    for (let i = 0; i < 50; i++) {
      expect(LOCATIONS).toContain(pickLocation())
    }
  })

  it('avoids already-used locations when pool allows', () => {
    const used = LOCATIONS.slice(0, LOCATIONS.length - 5)
    const remaining = LOCATIONS.slice(LOCATIONS.length - 5)
    for (let i = 0; i < 50; i++) {
      expect(remaining).toContain(pickLocation(used))
    }
  })

  it('falls back to full list when all locations used', () => {
    const location = pickLocation(LOCATIONS)
    expect(LOCATIONS).toContain(location)
  })
})

describe('calculateVoteResult', () => {
  it('players win when majority votes for the spy', () => {
    const votes = {
      player1: 'player3',
      player2: 'player3',
      player4: 'player3',
    }
    const result = calculateVoteResult(votes, 'player3', ['player1','player2','player3','player4'])
    expect(result.playersWon).toBe(true)
    expect(result.votedOut).toBe('player3')
  })

  it('spy wins when votes are split and no majority', () => {
    const votes = {
      player1: 'player2',
      player2: 'player1',
      player4: 'player1',
    }
    // player1 gets 2 votes, majority of 3 voters = 2 — this is a win
    // Let's test a true split: 4 voters, 2-2
    const splitVotes = {
      player1: 'player3',
      player2: 'player4',
      player3: 'player1',
      player4: 'player2',
    }
    const result = calculateVoteResult(splitVotes, 'player5', ['player1','player2','player3','player4','player5'])
    expect(result.playersWon).toBe(false)
  })

  it('spy wins when wrong player voted out', () => {
    const votes = {
      player1: 'player2',
      player3: 'player2',
      player4: 'player2',
    }
    const result = calculateVoteResult(votes, 'player4', ['player1','player2','player3','player4'])
    expect(result.playersWon).toBe(false)
    expect(result.votedOut).toBe('player2')
  })
})

describe('allVotesCast', () => {
  it('returns true when all non-spy players have voted', () => {
    const players = ['player1','player2','player3','player4']
    const spy = 'player4'
    const votes = { player1: 'player2', player2: 'player1', player3: 'player2' }
    expect(allVotesCast(votes, players, spy)).toBe(true)
  })

  it('returns false when some non-spy players have not voted', () => {
    const players = ['player1','player2','player3','player4']
    const spy = 'player4'
    const votes = { player1: 'player2' }
    expect(allVotesCast(votes, players, spy)).toBe(false)
  })

  it('does not require the spy to vote', () => {
    const players = ['player1','player2','player3']
    const spy = 'player3'
    const votes = { player1: 'player2', player2: 'player1' }
    expect(allVotesCast(votes, players, spy)).toBe(true)
  })
})

// ── 100-game simulation ───────────────────────────────────────────────────────

describe('Simulation — 100 games, 3–12 players, 1–20 rounds', () => {
  function simulateVotes(players, spyName) {
    const votes = {}
    const nonSpy = players.filter(p => p !== spyName)
    nonSpy.forEach(voter => {
      const targets = players.filter(p => p !== voter)
      votes[voter] = targets[Math.floor(Math.random() * targets.length)]
    })
    return votes
  }

  const results = []

  for (let game = 1; game <= 100; game++) {
    const roomCode = generateRoomCode()
    const playerCount = Math.floor(Math.random() * 10) + 3
    const players = Array.from({ length: playerCount }, (_, i) => `player${i + 1}`)
    const roundCount = Math.floor(Math.random() * 20) + 1
    const usedLocations = []

    for (let round = 1; round <= roundCount; round++) {
      const spy = pickSpy(players)
      const location = pickLocation(usedLocations)
      usedLocations.push(location)
      const votes = simulateVotes(players, spy)
      const result = calculateVoteResult(votes, spy, players)
      results.push({ game, roomCode, round, playerCount, players: players.join(', '), spy, location, ...result })
    }
  }

  it('runs 100 games without errors', () => {
    expect(results.length).toBeGreaterThan(0)
  })

  it('every round has exactly one spy assigned', () => {
    results.forEach(r => {
      expect(r.spy).toBeDefined()
      expect(r.spy).not.toBe('')
      expect(r.players.split(', ')).toContain(r.spy)
    })
  })

  it('every round has a valid location', () => {
    results.forEach(r => {
      expect(LOCATIONS).toContain(r.location)
    })
  })

  it('spy is never undefined across all rounds', () => {
    const undefinedSpies = results.filter(r => r.spy === undefined || r.spy === null)
    expect(undefinedSpies).toHaveLength(0)
  })

  it('total rounds simulated is between 100 and 2000', () => {
    expect(results.length).toBeGreaterThanOrEqual(100)
    expect(results.length).toBeLessThanOrEqual(2000)
  })

  it('prints simulation summary', () => {
    const total = results.length
    const spyWins = results.filter(r => !r.playersWon).length
    const playerWins = results.filter(r => r.playersWon).length
    console.log(`\n  Rounds: ${total} | Spy wins: ${spyWins} | Player wins: ${playerWins}`)
    expect(total).toBeGreaterThan(0)
  })
})
