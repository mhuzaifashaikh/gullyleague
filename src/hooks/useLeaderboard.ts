import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  count: number;
}

interface LeaderboardData {
  topScorers: LeaderboardEntry[];
  topAssisters: LeaderboardEntry[];
  topKeepers: LeaderboardEntry[];
}

export const useLeaderboard = (seasonId: string | null, timeframe: 'season' | 'week' = 'season') => {
  return useQuery({
    queryKey: ['leaderboard', seasonId, timeframe],
    queryFn: async (): Promise<LeaderboardData> => {
      if (!seasonId) {
        return { topScorers: [], topAssisters: [], topKeepers: [] };
      }

      // Calculate date filter for "this week"
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      // Get all games for this season (optionally filtered by week)
      let gamesQuery = supabase
        .from('games')
        .select('id, winning_team, team_a_keeper_id, team_b_keeper_id, played_at')
        .eq('season_id', seasonId)
        .eq('is_active', false);
      
      if (timeframe === 'week') {
        gamesQuery = gamesQuery.gte('played_at', weekAgo.toISOString());
      }
      
      const { data: games, error: gamesError } = await gamesQuery;
      if (gamesError) throw gamesError;
      
      if (!games || games.length === 0) {
        return { topScorers: [], topAssisters: [], topKeepers: [] };
      }
      
      const gameIds = games.map(g => g.id);
      
      // Get all events for these games
      const { data: events, error: eventsError } = await supabase
        .from('game_events')
        .select('player_id, event_type')
        .in('game_id', gameIds);
      
      if (eventsError) throw eventsError;
      
      // Get all players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name');
      
      if (playersError) throw playersError;
      
      const playerMap = new Map(players?.map(p => [p.id, p.name]) || []);
      
      // Count goals
      const goalCounts = new Map<string, number>();
      const assistCounts = new Map<string, number>();
      
      events?.forEach(event => {
        if (event.event_type === 'goal') {
          goalCounts.set(event.player_id, (goalCounts.get(event.player_id) || 0) + 1);
        } else if (event.event_type === 'assist') {
          assistCounts.set(event.player_id, (assistCounts.get(event.player_id) || 0) + 1);
        }
      });
      
      // Count keeper wins
      const keeperWins = new Map<string, number>();
      games?.forEach(game => {
        if (game.winning_team === 'A' && game.team_a_keeper_id) {
          keeperWins.set(game.team_a_keeper_id, (keeperWins.get(game.team_a_keeper_id) || 0) + 1);
        } else if (game.winning_team === 'B' && game.team_b_keeper_id) {
          keeperWins.set(game.team_b_keeper_id, (keeperWins.get(game.team_b_keeper_id) || 0) + 1);
        }
      });
      
      // Convert to sorted arrays
      const toSortedArray = (countMap: Map<string, number>): LeaderboardEntry[] => {
        return Array.from(countMap.entries())
          .map(([playerId, count]) => ({
            playerId,
            playerName: playerMap.get(playerId) || 'Unknown',
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      };
      
      return {
        topScorers: toSortedArray(goalCounts),
        topAssisters: toSortedArray(assistCounts),
        topKeepers: toSortedArray(keeperWins),
      };
    },
    enabled: !!seasonId,
  });
};
