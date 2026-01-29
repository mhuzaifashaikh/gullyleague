import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, format, isSameWeek } from 'date-fns';

interface WeekStats {
  weekStart: Date;
  weekEnd: Date;
  weekLabel: string;
  topScorer: { playerId: string; playerName: string; count: number } | null;
  topAssister: { playerId: string; playerName: string; count: number } | null;
  topKeeper: { playerId: string; playerName: string; count: number } | null;
  gamesPlayed: number;
}

export const useWeeklyBreakdown = (seasonId: string | null) => {
  return useQuery({
    queryKey: ['weeklyBreakdown', seasonId],
    queryFn: async (): Promise<WeekStats[]> => {
      if (!seasonId) return [];

      // Get all completed games for this season
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('id, winning_team, team_a_keeper_id, team_b_keeper_id, played_at')
        .eq('season_id', seasonId)
        .eq('is_active', false)
        .order('played_at', { ascending: false });

      if (gamesError) throw gamesError;
      if (!games || games.length === 0) return [];

      const gameIds = games.map(g => g.id);

      // Get all events for these games
      const { data: events, error: eventsError } = await supabase
        .from('game_events')
        .select('player_id, event_type, game_id')
        .in('game_id', gameIds);

      if (eventsError) throw eventsError;

      // Get all players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name');

      if (playersError) throw playersError;

      const playerMap = new Map(players?.map(p => [p.id, p.name]) || []);

      // Group games by week
      const weekMap = new Map<string, typeof games>();
      games.forEach(game => {
        const gameDate = new Date(game.played_at);
        const weekStartDate = startOfWeek(gameDate, { weekStartsOn: 1 });
        const weekKey = weekStartDate.toISOString();
        
        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, []);
        }
        weekMap.get(weekKey)!.push(game);
      });

      // Calculate stats for each week
      const weekStats: WeekStats[] = [];

      weekMap.forEach((weekGames, weekKey) => {
        const weekStartDate = new Date(weekKey);
        const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });
        const weekGameIds = weekGames.map(g => g.id);
        
        // Count goals and assists for this week
        const goalCounts = new Map<string, number>();
        const assistCounts = new Map<string, number>();

        events?.filter(e => weekGameIds.includes(e.game_id)).forEach(event => {
          if (event.event_type === 'goal') {
            goalCounts.set(event.player_id, (goalCounts.get(event.player_id) || 0) + 1);
          } else if (event.event_type === 'assist') {
            assistCounts.set(event.player_id, (assistCounts.get(event.player_id) || 0) + 1);
          }
        });

        // Count keeper wins for this week
        const keeperWins = new Map<string, number>();
        weekGames.forEach(game => {
          if (game.winning_team === 'A' && game.team_a_keeper_id) {
            keeperWins.set(game.team_a_keeper_id, (keeperWins.get(game.team_a_keeper_id) || 0) + 1);
          } else if (game.winning_team === 'B' && game.team_b_keeper_id) {
            keeperWins.set(game.team_b_keeper_id, (keeperWins.get(game.team_b_keeper_id) || 0) + 1);
          }
        });

        // Get top for each category
        const getTop = (countMap: Map<string, number>) => {
          const sorted = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]);
          if (sorted.length === 0) return null;
          return {
            playerId: sorted[0][0],
            playerName: playerMap.get(sorted[0][0]) || 'Unknown',
            count: sorted[0][1],
          };
        };

        const isCurrentWeek = isSameWeek(weekStartDate, new Date(), { weekStartsOn: 1 });
        const weekLabel = isCurrentWeek 
          ? 'This Week' 
          : `${format(weekStartDate, 'MMM d')} - ${format(weekEndDate, 'MMM d')}`;

        weekStats.push({
          weekStart: weekStartDate,
          weekEnd: weekEndDate,
          weekLabel,
          topScorer: getTop(goalCounts),
          topAssister: getTop(assistCounts),
          topKeeper: getTop(keeperWins),
          gamesPlayed: weekGames.length,
        });
      });

      // Sort by week start date (most recent first)
      return weekStats.sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime());
    },
    enabled: !!seasonId,
  });
};

