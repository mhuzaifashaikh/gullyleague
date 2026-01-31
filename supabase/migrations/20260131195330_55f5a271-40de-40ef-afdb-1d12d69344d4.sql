-- Add minute column to game_events to store when each event occurred
ALTER TABLE public.game_events ADD COLUMN minute integer;