import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlayerManagement } from '@/components/PlayerManagement';
import { SeasonManagement } from '@/components/SeasonManagement';
import { GameSetup } from '@/components/GameSetup';
import { GameRecorder } from '@/components/GameRecorder';
import { GameHistory } from '@/components/GameHistory';
import { usePlayers } from '@/hooks/usePlayers';
import { useActiveSeason } from '@/hooks/useSeasons';
import { isGameActive } from '@/lib/gameStore';
import { ArrowLeft, Play, LogOut, History } from 'lucide-react';

type AdminView = 'menu' | 'players' | 'game-setup' | 'game-active' | 'season' | 'history';

const Admin = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<AdminView>('menu');
  const { data: players } = usePlayers();
  const { data: season } = useActiveSeason();

  // Check if a game is already active on mount
  useEffect(() => {
    if (isGameActive()) {
      setView('game-active');
    }
  }, []);

  const handleExitAdmin = () => {
    navigate('/');
  };

  const renderContent = () => {
    switch (view) {
      case 'players':
        return <PlayerManagement />;
      case 'game-setup':
        return season && players ? (
          <GameSetup
            players={players}
            seasonId={season.id}
            onGameStart={() => setView('game-active')}
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        );
      case 'game-active':
        return players ? (
          <GameRecorder players={players} onGameEnd={() => setView('menu')} />
        ) : (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        );
      case 'season':
        return <SeasonManagement />;
      case 'history':
        return season ? (
          <GameHistory seasonId={season.id} />
        ) : (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        );
      default:
        return (
          <div className="space-y-4">
            <Button
              className="w-full h-16 text-lg gradient-pitch shadow-glow-green"
              onClick={() => setView('game-setup')}
            >
              <Play className="h-6 w-6 mr-3" />
              Start New Game
            </Button>

            <Button
              variant="outline"
              className="w-full h-14"
              onClick={() => setView('history')}
            >
              <History className="h-5 w-5 mr-2" />
              Edit Game History
            </Button>

            <Button
              variant="outline"
              className="w-full h-14"
              onClick={() => setView('players')}
            >
              Manage Players
            </Button>

            <Button
              variant="outline"
              className="w-full h-14"
              onClick={() => setView('season')}
            >
              Season Settings
            </Button>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleExitAdmin}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Exit Admin Mode
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-fire p-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {view !== 'menu' && view !== 'game-active' ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setView('menu')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : view === 'menu' ? (
            <Link to="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          ) : null}
          <div>
            <h1 className="text-xl font-bold text-white">
              {view === 'game-active' ? '🎮 Game Live' : 'Admin Mode'}
            </h1>
            <p className="text-white/70 text-sm">
              {view === 'menu' && 'Manage your league'}
              {view === 'players' && 'Add or remove players'}
              {view === 'game-setup' && 'Set up a new game'}
              {view === 'game-active' && 'Recording in progress'}
              {view === 'season' && 'Manage seasons'}
              {view === 'history' && 'Edit past games'}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6">{renderContent()}</main>
    </div>
  );
};

export default Admin;
