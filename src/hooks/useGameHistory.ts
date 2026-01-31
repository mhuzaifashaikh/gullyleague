import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GameWithDetails {
  id: string;
  played_at: string;
  winning_team: string | null;
  team_a_keeper_id: string | null;
  team_b_keeper_id: string | null;
  teamAPlayers: { id: string; name: string }[];
  teamBPlayers: { id: string; name: string }[];
  events: { id: string; player_id: string; event_type: string; playerName: string }[];
}

export const useGameHistory = (seasonId: string | null) => {
  return useQuery({
    queryKey: ['gameHistory', seasonId],
    queryFn: async (): Promise<GameWithDetails[]> => {
      if (!seasonId) return [];

      // Get all completed games
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .eq('season_id', seasonId)
        .eq('is_active', false)
        .order('played_at', { ascending: false });

      if (gamesError) throw gamesError;
      if (!games || games.length === 0) return [];

      const gameIds = games.map(g => g.id);

      // Get game players
      const { data: gamePlayers, error: gpError } = await supabase
        .from('game_players')
        .select('game_id, player_id, team')
        .in('game_id', gameIds);

      if (gpError) throw gpError;

      // Get game events
      const { data: events, error: eventsError } = await supabase
        .from('game_events')
        .select('id, game_id, player_id, event_type')
        .in('game_id', gameIds);

      if (eventsError) throw eventsError;

      // Get all players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name');

      if (playersError) throw playersError;

      const playerMap = new Map(players?.map(p => [p.id, p.name]) || []);

      // Build game details
      return games.map(game => ({
        ...game,
        teamAPlayers: (gamePlayers || [])
          .filter(gp => gp.game_id === game.id && gp.team === 'A')
          .map(gp => ({ id: gp.player_id, name: playerMap.get(gp.player_id) || 'Unknown' })),
        teamBPlayers: (gamePlayers || [])
          .filter(gp => gp.game_id === game.id && gp.team === 'B')
          .map(gp => ({ id: gp.player_id, name: playerMap.get(gp.player_id) || 'Unknown' })),
        events: (events || [])
          .filter(e => e.game_id === game.id)
          .map(e => ({ ...e, playerName: playerMap.get(e.player_id) || 'Unknown' })),
      }));
    },
    enabled: !!seasonId,
  });
};

export const useUpdateGameWinner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, winningTeam }: { gameId: string; winningTeam: 'A' | 'B' }) => {
      const { error } = await supabase
        .from('games')
        .update({ winning_team: winningTeam })
        .eq('id', gameId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameHistory'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyBreakdown'] });
      queryClient.invalidateQueries({ queryKey: ['gullyDor'] });
    },
  });
};

export const useAddGameEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, playerId, eventType }: { gameId: string; playerId: string; eventType: 'goal' | 'assist' }) => {
      const { error } = await supabase
        .from('game_events')
        .insert({ game_id: gameId, player_id: playerId, event_type: eventType });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameHistory'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyBreakdown'] });
      queryClient.invalidateQueries({ queryKey: ['gullyDor'] });
    },
  });
};

export const useDeleteGameEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('game_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameHistory'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyBreakdown'] });
      queryClient.invalidateQueries({ queryKey: ['gullyDor'] });
    },
  });
};

export const useDeleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      // Delete game events first
      const { error: eventsError } = await supabase
        .from('game_events')
        .delete()
        .eq('game_id', gameId);

      if (eventsError) throw eventsError;

      // Delete game players
      const { error: playersError } = await supabase
        .from('game_players')
        .delete()
        .eq('game_id', gameId);

      if (playersError) throw playersError;

      // Delete the game itself
      const { error: gameError } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (gameError) throw gameError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameHistory'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyBreakdown'] });
      queryClient.invalidateQueries({ queryKey: ['gullyDor'] });
    },
  });
};
