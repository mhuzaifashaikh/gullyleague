import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GameDetail {
  gameId: string;
  playedAt: Date;
  winningTeam: string | null;
  teamAPlayers: { id: string; name: string; isKeeper: boolean }[];
  teamBPlayers: { id: string; name: string; isKeeper: boolean }[];
  goals: { playerId: string; playerName: string; team: string; minute: number | null }[];
  assists: { playerId: string; playerName: string; team: string; minute: number | null }[];
}

export const useWeeklyDetails = (gameId: string | null) => {
  return useQuery({
    queryKey: ['weeklyDetails', gameId],
    queryFn: async (): Promise<GameDetail | null> => {
      if (!gameId) return null;

      // Get the game
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id, winning_team, team_a_keeper_id, team_b_keeper_id, played_at')
        .eq('id', gameId)
        .single();

      if (gameError) throw gameError;
      if (!game) return null;

      // Get all players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name');

      if (playersError) throw playersError;
      const playerMap = new Map(players?.map(p => [p.id, p.name]) || []);

      // Get game players
      const { data: gamePlayers, error: gpError } = await supabase
        .from('game_players')
        .select('player_id, team')
        .eq('game_id', gameId);

      if (gpError) throw gpError;

      // Get events
      const { data: events, error: eventsError } = await supabase
        .from('game_events')
        .select('player_id, event_type, minute')
        .eq('game_id', gameId)
        .order('minute', { ascending: true });

      if (eventsError) throw eventsError;

      const teamAPlayers = (gamePlayers || [])
        .filter(gp => gp.team === 'A')
        .map(gp => ({
          id: gp.player_id,
          name: playerMap.get(gp.player_id) || 'Unknown',
          isKeeper: gp.player_id === game.team_a_keeper_id,
        }));

      const teamBPlayers = (gamePlayers || [])
        .filter(gp => gp.team === 'B')
        .map(gp => ({
          id: gp.player_id,
          name: playerMap.get(gp.player_id) || 'Unknown',
          isKeeper: gp.player_id === game.team_b_keeper_id,
        }));

      const playerTeamMap = new Map<string, string>();
      (gamePlayers || []).forEach(gp => playerTeamMap.set(gp.player_id, gp.team));

      const goals = (events || [])
        .filter(e => e.event_type === 'goal')
        .map(e => ({
          playerId: e.player_id,
          playerName: playerMap.get(e.player_id) || 'Unknown',
          team: playerTeamMap.get(e.player_id) || '',
          minute: e.minute,
        }));

      const assists = (events || [])
        .filter(e => e.event_type === 'assist')
        .map(e => ({
          playerId: e.player_id,
          playerName: playerMap.get(e.player_id) || 'Unknown',
          team: playerTeamMap.get(e.player_id) || '',
          minute: e.minute,
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
    },
    enabled: !!gameId,
  });
};
