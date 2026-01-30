import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Shield, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useWeeklyDetails } from '@/hooks/useWeeklyDetails';

interface WeekDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string | null;
  weekLabel: string;
}

export const WeekDetailDialog = ({
  open,
  onOpenChange,
  gameId,
  weekLabel,
}: WeekDetailDialogProps) => {
  const { data: game, isLoading } = useWeeklyDetails(gameId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            {weekLabel} Stats
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : game ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 pr-4">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{format(game.playedAt, 'EEEE, MMMM d, yyyy')}</span>
              </div>

              {/* Teams */}
              <div className="grid grid-cols-2 gap-4">
                {/* Team A */}
                <div className={`p-3 rounded-lg ${game.winningTeam === 'A' ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30' : 'bg-muted/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className={`h-4 w-4 ${game.winningTeam === 'A' ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                    <span className={`font-semibold text-sm ${game.winningTeam === 'A' ? 'text-yellow-400' : 'text-foreground'}`}>
                      Team A {game.winningTeam === 'A' && '🏆'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {game.teamAPlayers.map(player => (
                      <div 
                        key={player.id} 
                        className={`text-sm flex items-center gap-1 ${game.winningTeam === 'A' ? 'text-yellow-200' : 'text-foreground/80'}`}
                      >
                        {player.isKeeper && <Shield className="h-3 w-3 text-green-400" />}
                        <span>{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team B */}
                <div className={`p-3 rounded-lg ${game.winningTeam === 'B' ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30' : 'bg-muted/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className={`h-4 w-4 ${game.winningTeam === 'B' ? 'text-yellow-400' : 'text-muted-foreground'}`} />
                    <span className={`font-semibold text-sm ${game.winningTeam === 'B' ? 'text-yellow-400' : 'text-foreground'}`}>
                      Team B {game.winningTeam === 'B' && '🏆'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {game.teamBPlayers.map(player => (
                      <div 
                        key={player.id} 
                        className={`text-sm flex items-center gap-1 ${game.winningTeam === 'B' ? 'text-yellow-200' : 'text-foreground/80'}`}
                      >
                        {player.isKeeper && <Shield className="h-3 w-3 text-green-400" />}
                        <span>{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goals & Assists */}
              <div className="grid grid-cols-2 gap-4">
                {/* Goals */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Trophy className="h-4 w-4" />
                    Goals
                  </div>
                  {game.goals.length > 0 ? (
                    <div className="space-y-1">
                      {game.goals.map((goal, gIdx) => (
                        <div 
                          key={gIdx} 
                          className={`text-sm flex items-center justify-between ${
                            game.winningTeam === goal.team ? 'text-yellow-200' : 'text-foreground/80'
                          }`}
                        >
                          <span>{goal.playerName}</span>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {goal.team}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No goals</p>
                  )}
                </div>

                {/* Assists */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                    <Target className="h-4 w-4" />
                    Assists
                  </div>
                  {game.assists.length > 0 ? (
                    <div className="space-y-1">
                      {game.assists.map((assist, aIdx) => (
                        <div 
                          key={aIdx} 
                          className={`text-sm flex items-center justify-between ${
                            game.winningTeam === assist.team ? 'text-yellow-200' : 'text-foreground/80'
                          }`}
                        >
                          <span>{assist.playerName}</span>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {assist.team}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No assists</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground py-8">No game data available</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
