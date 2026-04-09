import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { Users, Trophy, Target, Star } from 'lucide-react';

interface PlayerProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string | null;
  seasonId: string | null;
}

export const PlayerProfileDialog = ({ open, onOpenChange, playerId, seasonId }: PlayerProfileDialogProps) => {
  const { data: profile, isLoading } = usePlayerProfile(playerId, seasonId);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Player Profile</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : profile ? (
          <div className="space-y-5">
            {/* Avatar + Name */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-20 w-20 border-2 border-primary/30">
                {profile.photoUrl ? (
                  <AvatarImage src={profile.photoUrl} alt={profile.name} />
                ) : null}
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-black text-foreground">{profile.name}</h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-black text-foreground">{profile.gamesPlayed}</p>
                <p className="text-xs text-muted-foreground">Games</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <Trophy className="h-4 w-4 mx-auto mb-1 text-secondary" />
                <p className="text-2xl font-black text-foreground">{profile.goals}</p>
                <p className="text-xs text-muted-foreground">Goals</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/40">
                <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-black text-foreground">{profile.assists}</p>
                <p className="text-xs text-muted-foreground">Assists</p>
              </div>
            </div>

            {/* Best Game */}
            {profile.bestGame && (
              <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center gap-3">
                <Star className="h-5 w-5 text-secondary neon-text-gold" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Best Game</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.bestGame.weekLabel} ({profile.bestGame.goalsAndAssists} G+A)
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Player not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
