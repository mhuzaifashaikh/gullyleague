import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GameDetail {
  gameId: string;
  playedAt: Date;
  winningTeam: string | null;
  teamAPlayers: { id: string; name: string; isKeeper: boolean }[];
  teamBPlayers: { id: string; name: string; isKeeper: boolean }[];
  goals: { playerId: string; playerName: string; team: string }[];
  assists: { playerId: string; playerName: string; team: string }[];
}

export const useWeeklyDetails = (
  seasonId: string | null,
  weekStart: Date | null,
  weekEnd: Date | null
) => {
  return useQuery({
    queryKey: ['weeklyDetails', seasonId, weekStart?.toISOString()],
    queryFn: async (): Promise<GameDetail[]> => {
      if (!seasonId || !weekStart || !weekEnd) return [];

      // Get games in this week
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('id, winning_team, team_a_keeper_id, team_b_keeper_id, played_at')
        .eq('season_id', seasonId)
        .eq('is_active', false)
        .gte('played_at', weekStart.toISOString())
        .lte('played_at', weekEnd.toISOString())
        .order('played_at', { ascending: false });

      if (gamesError) throw gamesError;
      if (!games || games.length === 0) return [];

      const gameIds = games.map(g => g.id);

      // Get all players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name');

      if (playersError) throw playersError;
      const playerMap = new Map(players?.map(p => [p.id, p.name]) || []);

      // Get game players
      const { data: gamePlayers, error: gpError } = await supabase
        .from('game_players')
        .select('game_id, player_id, team')
        .in('game_id', gameIds);

      if (gpError) throw gpError;

      // Get events
      const { data: events, error: eventsError } = await supabase
        .from('game_events')
        .select('game_id, player_id, event_type')
        .in('game_id', gameIds);

      if (eventsError) throw eventsError;

      // Build game details
      return games.map(game => {
        const gamePlayersList = gamePlayers?.filter(gp => gp.game_id === game.id) || [];
        const gameEvents = events?.filter(e => e.game_id === game.id) || [];

        const teamAPlayers = gamePlayersList
          .filter(gp => gp.team === 'A')
          .map(gp => ({
            id: gp.player_id,
            name: playerMap.get(gp.player_id) || 'Unknown',
            isKeeper: gp.player_id === game.team_a_keeper_id,
          }));

        const teamBPlayers = gamePlayersList
          .filter(gp => gp.team === 'B')
          .map(gp => ({
            id: gp.player_id,
            name: playerMap.get(gp.player_id) || 'Unknown',
            isKeeper: gp.player_id === game.team_b_keeper_id,
          }));

        const playerTeamMap = new Map<string, string>();
        gamePlayersList.forEach(gp => playerTeamMap.set(gp.player_id, gp.team));

        const goals = gameEvents
          .filter(e => e.event_type === 'goal')
          .map(e => ({
            playerId: e.player_id,
            playerName: playerMap.get(e.player_id) || 'Unknown',
            team: playerTeamMap.get(e.player_id) || '',
          }));

        const assists = gameEvents
          .filter(e => e.event_type === 'assist')
          .map(e => ({
            playerId: e.player_id,
            playerName: playerMap.get(e.player_id) || 'Unknown',
            team: playerTeamMap.get(e.player_id) || '',
          }));

        return {
          gameId: game.id,
          playedAt: new Date(game.played_at),
          winningTeam: game.winning_team,
          teamAPlayers,
          teamBPlayers,
          goals,
          assists,
        };
      });
    },
    enabled: !!seasonId && !!weekStart && !!weekEnd,
  });
};
