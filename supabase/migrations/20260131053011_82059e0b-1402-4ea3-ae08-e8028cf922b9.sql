-- Allow deleting games
CREATE POLICY "Anyone can delete games"
ON public.games
FOR DELETE
USING (true);

-- Allow deleting game_players (needed for cascade)
CREATE POLICY "Anyone can delete game_players"
ON public.game_players
FOR DELETE
USING (true);