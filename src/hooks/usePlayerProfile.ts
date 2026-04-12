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
  isKeeper: boolean;
  // Outfield stats
  goals: number;
  assists: number;
  bestGame: { weekLabel: string; goalsAndAssists: number } | null;
  trend: GameTrendPoint[];
  // Keeper stats
  gamesWon: number;
  goalsConceded: number;
  keeperTrend: GameTrendPoint[]; // goals conceded per game
}

export const usePlayerProfile = (playerId: string | null, seasonId: string | null) => {
  return useQuery({
    queryKey: ['player-profile', playerId, seasonId],
    enabled: !!playerId && !!seasonId,
    queryFn: async (): Promise<PlayerProfile> => {
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId!)
        .single();
      if (playerError) throw playerError;

      // Get all completed season games
      const { data: allSeasonGames, error: asgError } = await supabase
        .from('games')
        .select('id, team_a_keeper_id, team_b_keeper_id, winning_team')
        .eq('season_id', seasonId!)
        .eq('is_active', false)
        .order('played_at', { ascending: true });
      if (asgError) throw asgError;

      // Determine if this player is a keeper (was keeper in any season game)
      const keeperGames = (allSeasonGames || []).filter(
        g => g.team_a_keeper_id === playerId || g.team_b_keeper_id === playerId
      );
      const isKeeper = keeperGames.length > 0;

      // Get games player participated in
      const { data: gamePlayerRows, error: gpError } = await supabase
        .from('game_players')
        .select('game_id')
        .eq('player_id', playerId!);
      if (gpError) throw gpError;

      const allGameIds = gamePlayerRows.map(gp => gp.game_id);
      const seasonGameIds = (allSeasonGames || [])
        .filter(g => allGameIds.includes(g.id))
        .map(g => g.id);
      const gamesPlayed = seasonGameIds.length;

      if (isKeeper) {
        // --- Keeper profile ---
        const keeperGameIds = keeperGames.map(g => g.id);

        // Games won: games where their team won
        let gamesWon = 0;
        for (const g of keeperGames) {
          const team = g.team_a_keeper_id === playerId ? 'A' : 'B';
          if (g.winning_team === team) gamesWon++;
        }

        // Goals conceded: goals scored by opposition in keeper games
        let goalsConceded = 0;
        const perGameConceded: Record<string, number> = {};

        if (keeperGameIds.length > 0) {
          // Get all goal events in keeper games
          const { data: goalEvents, error: geError } = await supabase
            .from('game_events')
            .select('game_id, player_id, event_type')
            .eq('event_type', 'goal')
            .in('game_id', keeperGameIds);
          if (geError) throw geError;

          // Get game_players for these games to know which team scored
          const { data: gamePlayers, error: gpError2 } = await supabase
            .from('game_players')
            .select('game_id, player_id, team')
            .in('game_id', keeperGameIds);
          if (gpError2) throw gpError2;

          // Build lookup: game_id -> player_id -> team
          const playerTeamMap: Record<string, Record<string, string>> = {};
          for (const gp of gamePlayers) {
            if (!playerTeamMap[gp.game_id]) playerTeamMap[gp.game_id] = {};
            playerTeamMap[gp.game_id][gp.player_id] = gp.team;
          }

          // Initialize all keeper games to 0 conceded
          for (const gid of keeperGameIds) {
            perGameConceded[gid] = 0;
          }

          for (const ev of goalEvents) {
            const game = keeperGames.find(g => g.id === ev.game_id);
            if (!game) continue;
            const keeperTeam = game.team_a_keeper_id === playerId ? 'A' : 'B';
            const scorerTeam = playerTeamMap[ev.game_id]?.[ev.player_id];
            // If the scorer is on the opposing team, it's a goal conceded
            if (scorerTeam && scorerTeam !== keeperTeam) {
              goalsConceded++;
              perGameConceded[ev.game_id] = (perGameConceded[ev.game_id] || 0) + 1;
            }
          }
        }

        // Build keeper trend (goals conceded per game, chronological)
        const keeperTrend = keeperGames.map((g, i) => ({
          game: i + 1,
          ga: perGameConceded[g.id] || 0,
        }));

        return {
          id: player.id,
          name: player.name,
          photoUrl: player.photo_url,
          gamesPlayed,
          isKeeper: true,
          goals: 0,
          assists: 0,
          bestGame: null,
          trend: [],
          gamesWon,
          goalsConceded,
          keeperTrend,
        };
      }

      // --- Outfield profile ---
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

        const perGame: Record<string, number> = {};
        for (const ev of events) {
          if (ev.event_type === 'goal') goals++;
          if (ev.event_type === 'assist') assists++;
          if (ev.event_type === 'goal' || ev.event_type === 'assist') {
            perGame[ev.game_id] = (perGame[ev.game_id] || 0) + 1;
          }
        }

        let bestGameId: string | null = null;
        let bestCount = 0;
        for (const [gid, count] of Object.entries(perGame)) {
          if (count > bestCount) {
            bestCount = count;
            bestGameId = gid;
          }
        }

        trend = (allSeasonGames || [])
          .filter(g => seasonGameIds.includes(g.id))
          .map((g, i) => ({
            game: i + 1,
            ga: perGame[g.id] || 0,
          }));

        if (bestGameId) {
          const weekIndex = (allSeasonGames || []).findIndex(g => g.id === bestGameId);
          const weekLabel = weekIndex >= 0 ? `Week ${weekIndex + 1}` : 'N/A';
          bestGame = { weekLabel, goalsAndAssists: bestCount };
        }
      }

      return {
        id: player.id,
        name: player.name,
        photoUrl: player.photo_url,
        gamesPlayed,
        isKeeper: false,
        goals,
        assists,
        bestGame,
        trend,
        gamesWon: 0,
        goalsConceded: 0,
        keeperTrend: [],
      };
    },
  });
};
