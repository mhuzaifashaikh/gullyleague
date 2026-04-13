import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { usePlayerProfile } from '@/hooks/usePlayerProfile';
import { Users, Trophy, Target, Star, Volleyball, Shield, ShieldAlert } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

interface PlayerProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerId: string | null;
  seasonId: string | null;
}

const outfieldChartConfig = {
  ga: {
    label: "G+A",
    color: "hsl(var(--primary))",
  },
};

const keeperChartConfig = {
  ga: {
    label: "Goals Conceded",
    color: "hsl(var(--destructive))",
  },
};

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
          <div className="space-y-5 relative">
            {/* Hero photo with fade */}
            {profile.photoUrl && (
              <div className="absolute -top-12 left-0 right-0 h-48 z-0 overflow-hidden rounded-t-lg">
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover object-top"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `
                      linear-gradient(to bottom, transparent 20%, hsl(var(--card)) 100%),
                      linear-gradient(to top, transparent 60%, hsl(var(--card)) 100%),
                      linear-gradient(to right, hsl(var(--card)) 0%, transparent 20%, transparent 80%, hsl(var(--card)) 100%)
                    `,
                  }}
                />
              </div>
            )}

            {/* Avatar + Name */}
            <div className={`flex flex-col items-center gap-3 relative z-10 ${profile.photoUrl ? 'pt-28' : ''}`}>
              {!profile.photoUrl && (
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <h2 className="text-xl font-black text-foreground">{profile.name}</h2>
            </div>

            {/* Stats Grid */}
            {profile.isKeeper ? (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/40">
                  <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-black text-foreground">{profile.gamesPlayed}</p>
                  <p className="text-xs text-muted-foreground">Games</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/40">
                  <Shield className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-black text-foreground">{profile.gamesWon}</p>
                  <p className="text-xs text-muted-foreground">Won</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/40">
                  <ShieldAlert className="h-4 w-4 mx-auto mb-1 text-destructive" />
                  <p className="text-2xl font-black text-foreground">
                    {profile.gamesPlayed > 0 ? (profile.goalsConceded / profile.gamesPlayed).toFixed(1) : '0.0'}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Conceded</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/40">
                  <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-black text-foreground">{profile.gamesPlayed}</p>
                  <p className="text-xs text-muted-foreground">Games</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/40">
                  <Volleyball className="h-4 w-4 mx-auto mb-1 text-secondary" />
                  <p className="text-2xl font-black text-foreground">{profile.goals}</p>
                  <p className="text-xs text-muted-foreground">Goals</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/40">
                  <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-black text-foreground">{profile.assists}</p>
                  <p className="text-xs text-muted-foreground">Assists</p>
                </div>
              </div>
            )}

            {/* Best Game (outfield only) */}
            {!profile.isKeeper && profile.bestGame && (
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

            {/* Chart */}
            {profile.isKeeper ? (
              profile.keeperTrend.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Goals Conceded Trend</p>
                  <ChartContainer config={keeperChartConfig} className="aspect-[2/1] w-full">
                    <LineChart data={profile.keeperTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="game" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}`} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => `Game ${v}`} />} />
                      <Line type="monotone" dataKey="ga" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--destructive))" }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ChartContainer>
                </div>
              )
            ) : (
              profile.trend.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">G+A Trend</p>
                  <ChartContainer config={outfieldChartConfig} className="aspect-[2/1] w-full">
                    <LineChart data={profile.trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                      <XAxis dataKey="game" tickLine={false} axisLine={false} fontSize={11} tickFormatter={(v) => `${v}`} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => `Game ${v}`} />} />
                      <Line type="monotone" dataKey="ga" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ChartContainer>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Player not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
};
