-- Allow deleting game_events (for admin editing)
CREATE POLICY "Anyone can delete game_events" 
ON public.game_events 
FOR DELETE 
USING (true);