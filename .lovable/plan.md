

## Player Profile Dialog

### Overview
Make every player name clickable across the app (Gully D'Or, Standings, Leaderboards, Week Details). Clicking opens a player profile dialog with stats, best game, and a photo (uploaded by admin).

### What gets built

**1. New hook: `src/hooks/usePlayerProfile.ts`**
- Takes a `playerId` and `seasonId`
- Queries `game_players` to count games played
- Queries `game_events` to total goals and assists
- Per-game breakdown to find best game (max goals+assists), including which week number it was
- Returns: `{ gamesPlayed, goals, assists, bestGame: { weekLabel, goalsAndAssists } }`

**2. New component: `src/components/PlayerProfileDialog.tsx`**
- Dialog with player photo (Avatar with fallback to initials), name, and stats
- Stats displayed: Games Played, Goals, Assists, Best Game (e.g. "Week 3 (5 G+A)")
- Photo pulled from `players.photo_url`

**3. Photo upload for admin**
- Database: Create a storage bucket `player-photos` for images
- In the Admin player management section, add an upload button next to each player
- On upload, store file in storage bucket and update `players.photo_url`

**4. Make names clickable in these components**
- `StandingsSection` — player names become clickable buttons
- `GullyDorDialog` — player names become clickable
- `RankingList` — player names become clickable
- `WeekDetailDialog` — player names in teams/goals/assists become clickable

Each click sets state for `selectedPlayerId` and opens the `PlayerProfileDialog`.

### Database changes
- Create storage bucket `player-photos` (public, for player avatars)
- No table schema changes needed (`players.photo_url` column already exists)

### Files to create/modify
- **Create**: `src/hooks/usePlayerProfile.ts`, `src/components/PlayerProfileDialog.tsx`
- **Modify**: `src/components/StandingsSection.tsx`, `src/components/GullyDorDialog.tsx`, `src/components/RankingList.tsx`, `src/components/WeekDetailDialog.tsx`, `src/pages/Leaderboards.tsx`, `src/pages/Index.tsx`, `src/components/PlayerManagement.tsx` (add photo upload)

