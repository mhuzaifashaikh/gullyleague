import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GameTrendPoint {
  game: number;
  ga: number;
}

interface PlayerProfile {
  id: string;
  name: string;
  photoUrl: string | null;
  gamesPlayed: number;
  goals: number;
  assists: number;
  bestGame: { weekLabel: string; goalsAndAssists: number } | null;
  trend: GameTrendPoint[];
}

export const usePlayerProfile = (playerId: string | null, seasonId: string | null) => {
  return useQuery({
    queryKey: ['player-profile', playerId, seasonId],
    enabled: !!playerId && !!seasonId,
    queryFn: async (): Promise<PlayerProfile> => {
      // Get player info
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId!)
        .single();
      if (playerError) throw playerError;

      // Get games in this season where player participated
      const { data: gamePlayerRows, error: gpError } = await supabase
        .from('game_players')
        .select('game_id')
        .eq('player_id', playerId!);
      if (gpError) throw gpError;

      const allGameIds = gamePlayerRows.map(gp => gp.game_id);

      // Filter to completed season games only
      let seasonGameIds: string[] = [];
      if (allGameIds.length > 0) {
        const { data: seasonGames, error: sgError } = await supabase
          .from('games')
          .select('id')
          .eq('season_id', seasonId!)
          .eq('is_active', false)
          .in('id', allGameIds);
        if (sgError) throw sgError;
        seasonGameIds = seasonGames.map(g => g.id);
      }

      const gamesPlayed = seasonGameIds.length;

      // Get all events for this player in season games
      let goals = 0;
      let assists = 0;
      let bestGame: PlayerProfile['bestGame'] = null;
      let trend: GameTrendPoint[] = [];
      if (seasonGameIds.length > 0) {
        const { data: events, error: evError } = await supabase
          .from('game_events')
          .select('event_type, game_id')
          .eq('player_id', playerId!)
          .in('game_id', seasonGameIds);
        if (evError) throw evError;

        // Count totals and per-game breakdown
        const perGame: Record<string, number> = {};
        for (const ev of events) {
          if (ev.event_type === 'goal') goals++;
          if (ev.event_type === 'assist') assists++;
          if (ev.event_type === 'goal' || ev.event_type === 'assist') {
            perGame[ev.game_id] = (perGame[ev.game_id] || 0) + 1;
          }
        }

        // Find best game
        let bestGameId: string | null = null;
        let bestCount = 0;
        for (const [gid, count] of Object.entries(perGame)) {
          if (count > bestCount) {
            bestCount = count;
            bestGameId = gid;
          }
        }

        // Get ordered season games for week labels and trend
        const { data: orderedGames } = await supabase
          .from('games')
          .select('id')
          .eq('season_id', seasonId!)
          .eq('is_active', false)
          .order('played_at', { ascending: true });

        // Build trend: G+A per game in chronological order
        trend = (orderedGames || [])
          .filter(g => seasonGameIds.includes(g.id))
          .map((g, i) => ({
            game: i + 1,
            ga: perGame[g.id] || 0,
          }));

        if (bestGameId) {
          const weekIndex = (orderedGames || []).findIndex(g => g.id === bestGameId);
          const weekLabel = weekIndex >= 0 ? `Week ${weekIndex + 1}` : 'N/A';
          bestGame = { weekLabel, goalsAndAssists: bestCount };
        }
      }

      return {
        id: player.id,
        name: player.name,
        photoUrl: player.photo_url,
        gamesPlayed,
        goals,
        assists,
        bestGame,
        trend,
      };
    },
  });
};
