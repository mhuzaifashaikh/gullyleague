import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Player } from '@/hooks/usePlayers';
import { useStartGame } from '@/hooks/useGames';
import { startGame } from '@/lib/gameStore';
import { Users, Shield, Play } from 'lucide-react';
import { toast } from 'sonner';

interface GameSetupProps {
  players: Player[];
  seasonId: string;
  onGameStart: () => void;
}

type SetupStep = 'select-players' | 'assign-teams' | 'select-keepers';

export const GameSetup = ({ players, seasonId, onGameStart }: GameSetupProps) => {
  const [step, setStep] = useState<SetupStep>('select-players');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [teamAKeeper, setTeamAKeeper] = useState<string | null>(null);
  const [teamBKeeper, setTeamBKeeper] = useState<string | null>(null);
  
  const startGameMutation = useStartGame();
  
  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };
  
  const handlePlayersSelected = () => {
    if (selectedPlayers.length < 4) {
      toast.error('Select at least 4 players');
      return;
    }
    // Auto-split players into two teams
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
    const mid = Math.ceil(shuffled.length / 2);
    setTeamA(shuffled.slice(0, mid));
    setTeamB(shuffled.slice(mid));
    setStep('assign-teams');
  };
  
  const moveToTeamA = (playerId: string) => {
    setTeamB(prev => prev.filter(id => id !== playerId));
    setTeamA(prev => [...prev, playerId]);
    if (teamBKeeper === playerId) setTeamBKeeper(null);
  };
  
  const moveToTeamB = (playerId: string) => {
    setTeamA(prev => prev.filter(id => id !== playerId));
    setTeamB(prev => [...prev, playerId]);
    if (teamAKeeper === playerId) setTeamAKeeper(null);
  };
  
  const handleTeamsAssigned = () => {
    if (teamA.length === 0 || teamB.length === 0) {
      toast.error('Both teams need players');
      return;
    }
    setStep('select-keepers');
  };
  
  const handleStartGame = async () => {
    if (!teamAKeeper || !teamBKeeper) {
      toast.error('Select a keeper for each team');
      return;
    }
    
    try {
      const game = await startGameMutation.mutateAsync({
        seasonId,
        teamAPlayers: teamA,
        teamBPlayers: teamB,
        teamAKeeper,
        teamBKeeper,
      });
      
      startGame(game.id, teamA, teamB, teamAKeeper, teamBKeeper);
      toast.success('Game started! 🎮');
      onGameStart();
    } catch (error) {
      toast.error('Failed to start game');
    }
  };
  
  const getPlayerName = (id: string) => players.find(p => p.id === id)?.name || 'Unknown';
  
  if (step === 'select-players') {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Who's playing today?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            {players.map(player => (
              <label
                key={player.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
              >
                <Checkbox
                  checked={selectedPlayers.includes(player.id)}
                  onCheckedChange={() => togglePlayer(player.id)}
                />
                <span className="font-medium">{player.name}</span>
              </label>
            ))}
          </div>
          <Button
            onClick={handlePlayersSelected}
            className="w-full gradient-pitch"
            disabled={selectedPlayers.length < 4}
          >
            Continue ({selectedPlayers.length} selected)
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (step === 'assign-teams') {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Assign Teams
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tap a player to move them to the other team
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-primary mb-2">Team A</h3>
              <div className="space-y-2">
                {teamA.map(id => (
                  <Button
                    key={id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => moveToTeamB(id)}
                  >
                    {getPlayerName(id)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-secondary mb-2">Team B</h3>
              <div className="space-y-2">
                {teamB.map(id => (
                  <Button
                    key={id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => moveToTeamA(id)}
                  >
                    {getPlayerName(id)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleTeamsAssigned} className="w-full gradient-pitch">
            Continue
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-secondary" />
          Select Goalkeepers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-bold text-primary mb-2">Team A Keeper</h3>
          <div className="grid gap-2">
            {teamA.map(id => (
              <label
                key={id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  teamAKeeper === id ? 'bg-primary/20 border border-primary' : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <input
                  type="radio"
                  name="teamAKeeper"
                  checked={teamAKeeper === id}
                  onChange={() => setTeamAKeeper(id)}
                  className="sr-only"
                />
                <Shield className={`h-4 w-4 ${teamAKeeper === id ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="font-medium">{getPlayerName(id)}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-bold text-secondary mb-2">Team B Keeper</h3>
          <div className="grid gap-2">
            {teamB.map(id => (
              <label
                key={id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  teamBKeeper === id ? 'bg-secondary/20 border border-secondary' : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <input
                  type="radio"
                  name="teamBKeeper"
                  checked={teamBKeeper === id}
                  onChange={() => setTeamBKeeper(id)}
                  className="sr-only"
                />
                <Shield className={`h-4 w-4 ${teamBKeeper === id ? 'text-secondary' : 'text-muted-foreground'}`} />
                <span className="font-medium">{getPlayerName(id)}</span>
              </label>
            ))}
          </div>
        </div>
        
        <Button
          onClick={handleStartGame}
          className="w-full h-14 text-lg gradient-pitch shadow-glow-green"
          disabled={!teamAKeeper || !teamBKeeper || startGameMutation.isPending}
        >
          <Play className="h-5 w-5 mr-2" />
          START GAME
        </Button>
      </CardContent>
    </Card>
  );
};
