-- Create seasons table
CREATE TABLE public.seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE NOT NULL,
  team_a_keeper_id UUID REFERENCES public.players(id),
  team_b_keeper_id UUID REFERENCES public.players(id),
  winning_team TEXT CHECK (winning_team IN ('A', 'B')),
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create game_players junction table (who played in each game)
CREATE TABLE public.game_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  team TEXT CHECK (team IN ('A', 'B')) NOT NULL,
  UNIQUE(game_id, player_id)
);

-- Create game_events table (goals, assists)
CREATE TABLE public.game_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT CHECK (event_type IN ('goal', 'assist')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read, will secure writes later)
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_events ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (everyone can view stats)
CREATE POLICY "Anyone can view seasons" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Anyone can view game_players" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "Anyone can view game_events" ON public.game_events FOR SELECT USING (true);

-- Public insert/update/delete for admin operations (PIN-protected in app)
CREATE POLICY "Anyone can insert seasons" ON public.seasons FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update seasons" ON public.seasons FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete players" ON public.players FOR DELETE USING (true);
CREATE POLICY "Anyone can insert games" ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update games" ON public.games FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert game_players" ON public.game_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert game_events" ON public.game_events FOR INSERT WITH CHECK (true);

-- Create initial season
INSERT INTO public.seasons (name, is_active) VALUES ('Season 1', true);