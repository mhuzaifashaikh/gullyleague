## Goal

Two improvements to the admin "End Game" flow:

1. **Add a "Draw" option** — neither team gets win/keeper points, but goals & assists still count.
2. **Replace generic "Team A Wins / Team B Wins" buttons** with each team labelled by its goalkeeper's name (e.g. "Team Ali Wins" / "Team Muhammad Wins").

## Changes

### 1. `src/components/GameRecorder.tsx` (end-game UI)

- Look up the Team A keeper and Team B keeper from `players` using `gameState.teamAKeeper` and `gameState.teamBKeeper`.
- Update the "Who won?" card to show three buttons:
  - `Team {keeperA.name} Wins` → calls `handleEndGame('A')`
  - `Team {keeperB.name} Wins` → calls `handleEndGame('B')`
  - `Draw` (neutral styling, e.g. outline) → calls `handleEndGame('draw')`
- Widen the `handleEndGame` parameter type to `'A' | 'B' | 'draw'`.

### 2. `src/hooks/useGames.ts` (`useEndGame`)

- Change `EndGameParams.winningTeam` type to `'A' | 'B' | 'draw'`.
- When value is `'draw'`, write `winning_team: null` to the `games` row (existing column is already nullable). Goals & assists are still inserted as today.
- No schema change required.

### 3. Verify downstream point logic (no edits expected)

- `useLeaderboard` and `useGullyDor` already only award keeper-win / team-win points when `winning_team === 'A'` or `'B'`. A `null` value naturally yields zero win points, while goals/assists keep counting. Confirmed — no changes needed.

### 4. Game history display (`src/components/GameHistory.tsx`)

- Quick check & update: if it currently renders "Team A won" / "Team B won", add a "Draw" label when `winning_team` is `null` so past draws read sensibly. (Will inspect during implementation and adjust only if needed.)

## Out of scope

- No DB migration (the column already supports `null`).
- No changes to the Gully D'Or scoring formula itself.
