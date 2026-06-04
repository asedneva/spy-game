import LOCATIONS from "./locations";

// Unambiguous characters only — no O/0, I/1 confusion
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateRoomCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

// Pick a location that hasn't been used in this room yet.
// Falls back to full list if all have been used.
export function pickLocation(usedLocations = []) {
  const available = LOCATIONS.filter(l => !usedLocations.includes(l));
  const pool = available.length > 0 ? available : LOCATIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Pick one random spy from the player list.
export function pickSpy(players) {
  if (!players || players.length === 0) throw new Error("pickSpy called with empty player list");
  return players[Math.floor(Math.random() * players.length)];
}

// Player colors — one per slot, cycles if > 12 players.
const PLAYER_COLORS = [
  "#a78bfa", "#c084fc", "#818cf8", "#38bdf8",
  "#34d399", "#fb923c", "#f472b6", "#22d3ee",
  "#a3e635", "#facc15", "#fb7185", "#6ee7b7",
];
export function playerColor(index) {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

// Calculate voting result.
// votes = { [voterName]: votedForName }
// Returns { winner, votedOut, playersWon }
export function calculateVoteResult(votes, spyName, playerNames) {
  const counts = {};
  Object.values(votes).forEach(v => {
    counts[v] = (counts[v] || 0) + 1;
  });

  // Find player with most votes
  let mostVoted = null;
  let maxCount = 0;
  Object.entries(counts).forEach(([name, count]) => {
    if (count > maxCount) { mostVoted = name; maxCount = count; }
  });

  const totalVotes = Object.keys(votes).length;
  const majority = Math.floor(totalVotes / 2) + 1;
  const playersWon = mostVoted === spyName && maxCount >= majority;

  return { votedOut: mostVoted, spyName, playersWon };
}

// Check if all non-spy players have voted.
export function allVotesCast(votes, players, spyName) {
  const voters = players.filter(p => p !== spyName);
  return voters.every(p => votes[p] !== undefined);
}