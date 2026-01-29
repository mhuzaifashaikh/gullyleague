import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGameHistory, useUpdateGameWinner, useAddGameEvent, useDeleteGameEvent } from '@/hooks/useGameHistory';
import { usePlayers } from '@/hooks/usePlayers';
import { PlayerSelector } from './PlayerSelector';
import { format } from 'date-fns';
import { Edit2, Trophy, Goal, Target, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface GameHistoryProps {
  seasonId: string;
}

export const GameHistory = ({ seasonId }: GameHistoryProps) => {
  const { data: games, isLoading } = useGameHistory(seasonId);
  const { data: players } = usePlayers();
  const updateWinner = useUpdateGameWinner();
  const addEvent = useAddGameEvent();
  const deleteEvent = useDeleteGameEvent();

  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [addingEvent, setAddingEvent] = useState<{ gameId: string; type: 'goal' | 'assist' } | null>(null);

  const selectedGame = games?.find(g => g.id === editingGame);
  const gamePlayers = selectedGame 
    ? [...selectedGame.teamAPlayers, ...selectedGame.teamBPlayers]
    : [];

  const handleWinnerChange = async (gameId: string, winner: 'A' | 'B') => {
    try {
      await updateWinner.mutateAsync({ gameId, winningTeam: winner });
      toast.success('Winner updated!');
    } catch {
      toast.error('Failed to update winner');
    }
  };

  const handleAddEvent = async (playerId: string) => {
    if (!addingEvent) return;
    try {
      await addEvent.mutateAsync({
        gameId: addingEvent.gameId,
        playerId,
        eventType: addingEvent.type,
      });
      toast.success(`${addingEvent.type === 'goal' ? 'Goal' : 'Assist'} added!`);
      setAddingEvent(null);
    } catch {
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent.mutateAsync(eventId);
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  if (isLoading) {
    return <p className="text-center text-muted-foreground py-8">Loading games...</p>;
  }

  if (!games || games.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No completed games yet</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Game History</h3>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-3 pr-4">
          {games.map(game => (
            <Card key={game.id} className="bg-card/80 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>{format(new Date(game.played_at), 'MMM d, yyyy • h:mm a')}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingGame(game.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm">
                  <div className={`${game.winning_team === 'A' ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                    Team A {game.winning_team === 'A' && <Trophy className="inline h-3 w-3" />}
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div className={`${game.winning_team === 'B' ? 'text-secondary font-semibold' : 'text-muted-foreground'}`}>
                    {game.winning_team === 'B' && <Trophy className="inline h-3 w-3" />} Team B
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {game.events.filter(e => e.event_type === 'goal').length} goals, {' '}
                  {game.events.filter(e => e.event_type === 'assist').length} assists
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Edit Game Dialog */}
      <Dialog open={!!editingGame} onOpenChange={(open) => !open && setEditingGame(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Game</DialogTitle>
          </DialogHeader>
          
          {selectedGame && (
            <div className="space-y-4">
              {/* Winner Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Winner</label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedGame.winning_team === 'A' ? 'default' : 'outline'}
                    className={selectedGame.winning_team === 'A' ? 'gradient-pitch' : ''}
                    onClick={() => handleWinnerChange(selectedGame.id, 'A')}
                    disabled={updateWinner.isPending}
                  >
                    Team A
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedGame.winning_team === 'B' ? 'default' : 'outline'}
                    className={selectedGame.winning_team === 'B' ? 'gradient-fire' : ''}
                    onClick={() => handleWinnerChange(selectedGame.id, 'B')}
                    disabled={updateWinner.isPending}
                  >
                    Team B
                  </Button>
                </div>
              </div>

              {/* Events List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Events</label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddingEvent({ gameId: selectedGame.id, type: 'goal' })}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      <Goal className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddingEvent({ gameId: selectedGame.id, type: 'assist' })}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      <Target className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {selectedGame.events.map(event => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          {event.event_type === 'goal' ? (
                            <Goal className="h-4 w-4 text-primary" />
                          ) : (
                            <Target className="h-4 w-4 text-secondary" />
                          )}
                          <span className="text-sm">{event.playerName}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={deleteEvent.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {selectedGame.events.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No events recorded</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Teams Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-primary mb-1">Team A</p>
                  <ul className="text-muted-foreground space-y-0.5">
                    {selectedGame.teamAPlayers.map(p => (
                      <li key={p.id}>{p.name}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-secondary mb-1">Team B</p>
                  <ul className="text-muted-foreground space-y-0.5">
                    {selectedGame.teamBPlayers.map(p => (
                      <li key={p.id}>{p.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Event Player Selector */}
      <PlayerSelector
        open={!!addingEvent}
        onOpenChange={(open) => !open && setAddingEvent(null)}
        players={gamePlayers.map(p => ({ id: p.id, name: p.name, photo_url: null, created_at: '' }))}
        onSelect={handleAddEvent}
        title={addingEvent?.type === 'goal' ? '⚽ Who scored?' : '👟 Who assisted?'}
      />
    </div>
  );
};
