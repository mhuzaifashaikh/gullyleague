import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayerSelector } from './PlayerSelector';
import { Player } from '@/hooks/usePlayers';
import { useEndGame } from '@/hooks/useGames';
import { getGameState, addEvent, getGameEvents, endGame as endGameState } from '@/lib/gameStore';
import { Goal, Footprints, Flag, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface GameRecorderProps {
  players: Player[];
  onGameEnd: () => void;
}

export const GameRecorder = ({ players, onGameEnd }: GameRecorderProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorType, setSelectorType] = useState<'goal' | 'assist'>('goal');
  const [showEndGame, setShowEndGame] = useState(false);
  const endGameMutation = useEndGame();
  
  const gameState = getGameState();
  const events = getGameEvents();
  
  const allPlayersInGame = players.filter(
    p => gameState.teamAPlayers.includes(p.id) || gameState.teamBPlayers.includes(p.id)
  );
  
  const handleEventClick = (type: 'goal' | 'assist') => {
    setSelectorType(type);
    setSelectorOpen(true);
  };
  
  const handlePlayerSelect = (playerId: string) => {
    addEvent(selectorType, playerId);
    const playerName = players.find(p => p.id === playerId)?.name || 'Player';
    toast.success(`${selectorType === 'goal' ? '⚽ Goal' : '👟 Assist'} recorded for ${playerName}!`);
  };
  
  const handleEndGame = async (winningTeam: 'A' | 'B') => {
    if (!gameState.gameId) return;
    
    try {
      await endGameMutation.mutateAsync({
        gameId: gameState.gameId,
        winningTeam,
        events: events.map(e => ({ type: e.type, playerId: e.playerId })),
      });
      
      endGameState();
      toast.success('Game saved successfully!');
      onGameEnd();
    } catch (error) {
      toast.error('Failed to save game');
    }
  };
  
  // Count current game stats
  const goalCount = events.filter(e => e.type === 'goal').length;
  const assistCount = events.filter(e => e.type === 'assist').length;
  
  return (
    <div className="space-y-6">
      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold text-primary">{goalCount}</p>
            <p className="text-muted-foreground text-sm">Goals</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <p className="text-4xl font-bold text-secondary">{assistCount}</p>
            <p className="text-muted-foreground text-sm">Assists</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Buttons */}
      {!showEndGame ? (
        <div className="space-y-4">
          <Button
            onClick={() => handleEventClick('goal')}
            className="w-full h-24 text-2xl font-bold gradient-pitch shadow-glow-green"
          >
            <Goal className="h-8 w-8 mr-3" />
            GOAL
          </Button>
          
          <Button
            onClick={() => handleEventClick('assist')}
            className="w-full h-24 text-2xl font-bold gradient-fire shadow-glow-orange"
          >
            <Footprints className="h-8 w-8 mr-3" />
            ASSIST
          </Button>
          
          <Button
            onClick={() => setShowEndGame(true)}
            variant="outline"
            className="w-full h-16 text-xl"
          >
            <Flag className="h-6 w-6 mr-2" />
            END GAME
          </Button>
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Who won?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => handleEndGame('A')}
              className="w-full h-14 text-lg gradient-pitch"
              disabled={endGameMutation.isPending}
            >
              Team A Wins
            </Button>
            <Button
              onClick={() => handleEndGame('B')}
              className="w-full h-14 text-lg gradient-fire"
              disabled={endGameMutation.isPending}
            >
              Team B Wins
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowEndGame(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
      
      <PlayerSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        players={allPlayersInGame}
        onSelect={handlePlayerSelect}
        title={selectorType === 'goal' ? '⚽ Who scored?' : '👟 Who assisted?'}
      />
    </div>
  );
};
