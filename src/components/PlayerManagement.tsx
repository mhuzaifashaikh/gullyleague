import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlayers, useAddPlayer, useDeletePlayer, Player } from '@/hooks/usePlayers';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export const PlayerManagement = () => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const { data: players, isLoading } = usePlayers();
  const addPlayer = useAddPlayer();
  const deletePlayer = useDeletePlayer();
  
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) {
      toast.error('Enter a player name');
      return;
    }
    
    try {
      await addPlayer.mutateAsync(trimmedName);
      setNewPlayerName('');
      toast.success(`${trimmedName} added to the squad!`);
    } catch (error) {
      toast.error('Failed to add player');
    }
  };
  
  const handleDeletePlayer = async (player: Player) => {
    try {
      await deletePlayer.mutateAsync(player.id);
      toast.success(`${player.name} removed from squad`);
    } catch (error) {
      toast.error('Failed to remove player');
    }
  };
  
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Player Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddPlayer} className="flex gap-2">
          <Input
            placeholder="Player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="gradient-pitch" disabled={addPlayer.isPending}>
            <UserPlus className="h-4 w-4" />
          </Button>
        </form>
        
        {isLoading ? (
          <p className="text-muted-foreground text-center py-4">Loading...</p>
        ) : players?.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No players yet. Add some!</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {players?.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <span className="font-medium">{player.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeletePlayer(player)}
                  disabled={deletePlayer.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
