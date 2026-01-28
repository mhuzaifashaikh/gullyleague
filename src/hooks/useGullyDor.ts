import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GullyDorEntry {
  playerId: string;
  playerName: string;
  points: number;
  wins: number;
  keeperWins: number;
  goals: number;
  assists: number;
}

export const useGullyDor = (seasonId: string | null) => {
  return useQuery({
    queryKey: ['gully-dor', seasonId],
    queryFn: async (): Promise<GullyDorEntry[]> => {
      if (!seasonId) return [];

      // Get all completed games for this season
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('id, winning_team, team_a_keeper_id, team_b_keeper_id')
        .eq('season_id', seasonId)
        .eq('is_active', false);

      if (gamesError) throw gamesError;
      if (!games || games.length === 0) return [];

      const gameIds = games.map(g => g.id);

      // Get all game_players for these games
      const { data: gamePlayers, error: gpError } = await supabase
        .from('game_players')
        .select('game_id, player_id, team')
        .in('game_id', gameIds);

      if (gpError) throw gpError;

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

      // Calculate points for each player
      const playerStats = new Map<string, { wins: number; keeperWins: number; goals: number; assists: number }>();

      // Initialize all players
      players?.forEach(p => {
        playerStats.set(p.id, { wins: 0, keeperWins: 0, goals: 0, assists: 0 });
      });

      // Count wins (+3 for players on winning team, +4 for keeper)
      games?.forEach(game => {
        if (!game.winning_team) return;

        const winningTeam = game.winning_team;
        const winningKeeperId = winningTeam === 'A' ? game.team_a_keeper_id : game.team_b_keeper_id;

        // Find all players on the winning team
        gamePlayers?.filter(gp => gp.game_id === game.id && gp.team === winningTeam)
          .forEach(gp => {
            const stats = playerStats.get(gp.player_id);
            if (stats) {
              if (gp.player_id === winningKeeperId) {
                stats.keeperWins++;
              } else {
                stats.wins++;
              }
            }
          });
      });

      // Count goals and assists (+0.2 each)
      events?.forEach(event => {
        const stats = playerStats.get(event.player_id);
        if (stats) {
          if (event.event_type === 'goal') {
            stats.goals++;
          } else if (event.event_type === 'assist') {
            stats.assists++;
          }
        }
      });

      // Calculate total points and sort
      const entries: GullyDorEntry[] = Array.from(playerStats.entries())
        .map(([playerId, stats]) => ({
          playerId,
          playerName: playerMap.get(playerId) || 'Unknown',
          points: (stats.wins * 3) + (stats.keeperWins * 4) + ((stats.goals + stats.assists) * 0.2),
          wins: stats.wins,
          keeperWins: stats.keeperWins,
          goals: stats.goals,
          assists: stats.assists,
        }))
        .filter(e => e.points > 0)
        .sort((a, b) => b.points - a.points);

      return entries;
    },
    enabled: !!seasonId,
  });
};

