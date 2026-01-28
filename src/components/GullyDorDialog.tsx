import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, Star } from 'lucide-react';

interface GullyDorEntry {
  playerId: string;
  playerName: string;
  points: number;
  wins: number;
  keeperWins: number;
  goals: number;
  assists: number;
}

interface GullyDorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: GullyDorEntry[];
  isLoading: boolean;
}

export const GullyDorDialog = ({ open, onOpenChange, entries, isLoading }: GullyDorDialogProps) => {
  const getRankBadge = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-glow-gold';
    if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-black';
    if (index === 2) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-secondary/50 max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-secondary neon-text-gold" />
            <span className="text-gradient-gold font-black">GULLY D'OR</span>
          </DialogTitle>
          <p className="text-muted-foreground text-sm">Player of the Season Race</p>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No data yet</p>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.playerId}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  index === 0
                    ? 'bg-secondary/20 border border-secondary/50'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadge(index)}`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-foreground">{entry.playerName}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{entry.wins + entry.keeperWins}W</span>
                      <span>{entry.goals}G</span>
                      <span>{entry.assists}A</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black ${index === 0 ? 'neon-text-gold' : 'text-foreground'}`}>
                    {entry.points.toFixed(1)}
                  </span>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Points System:</p>
          <div className="grid grid-cols-2 gap-1">
            <span>Win: +3 pts</span>
            <span>Keeper Win: +4 pts</span>
            <span>Goal: +0.2 pts</span>
            <span>Assist: +0.2 pts</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
