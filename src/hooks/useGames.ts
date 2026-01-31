import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StartGameParams {
  seasonId: string;
  teamAPlayers: string[];
  teamBPlayers: string[];
  teamAKeeper: string;
  teamBKeeper: string;
}

interface EndGameParams {
  gameId: string;
  winningTeam: 'A' | 'B';
  events: Array<{ type: 'goal' | 'assist'; playerId: string; minute: number }>;
}

export const useStartGame = () => {
  return useMutation({
    mutationFn: async ({ seasonId, teamAPlayers, teamBPlayers, teamAKeeper, teamBKeeper }: StartGameParams) => {
      // Create the game
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({
          season_id: seasonId,
          team_a_keeper_id: teamAKeeper,
          team_b_keeper_id: teamBKeeper,
          is_active: true,
        })
        .select()
        .single();
      
      if (gameError) throw gameError;
      
      // Add players to game
      const gamePlayers = [
        ...teamAPlayers.map(playerId => ({ game_id: game.id, player_id: playerId, team: 'A' as const })),
        ...teamBPlayers.map(playerId => ({ game_id: game.id, player_id: playerId, team: 'B' as const })),
      ];
      
      const { error: playersError } = await supabase
        .from('game_players')
        .insert(gamePlayers);
      
      if (playersError) throw playersError;
      
      return game;
    },
  });
};

export const useEndGame = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ gameId, winningTeam, events }: EndGameParams) => {
      // Update game with winner
      const { error: updateError } = await supabase
        .from('games')
        .update({ winning_team: winningTeam, is_active: false })
        .eq('id', gameId);
      
      if (updateError) throw updateError;
      
      // Insert all events
      if (events.length > 0) {
        const gameEvents = events.map(event => ({
          game_id: gameId,
          player_id: event.playerId,
          event_type: event.type,
          minute: event.minute,
        }));
        
        const { error: eventsError } = await supabase
          .from('game_events')
          .insert(gameEvents);
        
        if (eventsError) throw eventsError;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};
