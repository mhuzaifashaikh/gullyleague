import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, format, isSameWeek } from 'date-fns';

interface WeekStats {
  gameId: string;
  playedAt: Date;
  weekLabel: string;
  weekNumber: number;
  scoreA: number;
  scoreB: number;
  topScorer: { playerId: string; playerName: string; count: number } | null;
  topAssister: { playerId: string; playerName: string; count: number } | null;
  topKeeper: { playerId: string; playerName: string } | null;
}

export const useWeeklyBreakdown = (seasonId: string | null) => {
  return useQuery({
    queryKey: ['weeklyBreakdown', seasonId],
    queryFn: async (): Promise<WeekStats[]> => {
      if (!seasonId) return [];

      // Get all completed games for this season (oldest first for numbering)
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('id, winning_team, team_a_keeper_id, team_b_keeper_id, played_at')
        .eq('season_id', seasonId)
        .eq('is_active', false)
        .order('played_at', { ascending: true });

      if (gamesError) throw gamesError;
      if (!games || games.length === 0) return [];

      const gameIds = games.map(g => g.id);

      // Get all events for these games
      const { data: events, error: eventsError } = await supabase
        .from('game_events')
        .select('player_id, event_type, game_id')
        .in('game_id', gameIds);

      if (eventsError) throw eventsError;

      // Get all game_players to know team assignments
      const { data: gamePlayers, error: gamePlayersError } = await supabase
        .from('game_players')
        .select('game_id, player_id, team')
        .in('game_id', gameIds);

      if (gamePlayersError) throw gamePlayersError;

      // Get all players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name');

      if (playersError) throw playersError;

      const playerMap = new Map(players?.map(p => [p.id, p.name]) || []);
      
      // Create a map of game_id -> player_id -> team
      const playerTeamMap = new Map<string, Map<string, string>>();
      gamePlayers?.forEach(gp => {
        if (!playerTeamMap.has(gp.game_id)) {
          playerTeamMap.set(gp.game_id, new Map());
        }
        playerTeamMap.get(gp.game_id)!.set(gp.player_id, gp.team);
      });

      // Each game = 1 week, calculate stats per game
      const weekStats: WeekStats[] = games.map((game, index) => {
        const weekNumber = index + 1;
        const gameEvents = events?.filter(e => e.game_id === game.id) || [];
        const gameTeamMap = playerTeamMap.get(game.id) || new Map();

        // Count goals and assists for this game
        const goalCounts = new Map<string, number>();
        const assistCounts = new Map<string, number>();
        let scoreA = 0;
        let scoreB = 0;

        gameEvents.forEach(event => {
          if (event.event_type === 'goal') {
            goalCounts.set(event.player_id, (goalCounts.get(event.player_id) || 0) + 1);
            // Count score by team
            const team = gameTeamMap.get(event.player_id);
            if (team === 'A') scoreA++;
            else if (team === 'B') scoreB++;
          } else if (event.event_type === 'assist') {
            assistCounts.set(event.player_id, (assistCounts.get(event.player_id) || 0) + 1);
          }
        });

        // Get winning keeper
        let topKeeper: { playerId: string; playerName: string } | null = null;
        if (game.winning_team === 'A' && game.team_a_keeper_id) {
          topKeeper = {
            playerId: game.team_a_keeper_id,
            playerName: playerMap.get(game.team_a_keeper_id) || 'Unknown',
          };
        } else if (game.winning_team === 'B' && game.team_b_keeper_id) {
          topKeeper = {
            playerId: game.team_b_keeper_id,
            playerName: playerMap.get(game.team_b_keeper_id) || 'Unknown',
          };
        }

        // Get top scorer and assister
        const getTop = (countMap: Map<string, number>) => {
          const sorted = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]);
          if (sorted.length === 0) return null;
          return {
            playerId: sorted[0][0],
            playerName: playerMap.get(sorted[0][0]) || 'Unknown',
            count: sorted[0][1],
          };
        };

        return {
          gameId: game.id,
          playedAt: new Date(game.played_at),
          weekLabel: `Week ${weekNumber}`,
          weekNumber,
          scoreA,
          scoreB,
          topScorer: getTop(goalCounts),
          topAssister: getTop(assistCounts),
          topKeeper,
        };
      });

      // Sort by week number (most recent/highest first)
      return weekStats.sort((a, b) => b.weekNumber - a.weekNumber);
    },
    enabled: !!seasonId,
  });
};

