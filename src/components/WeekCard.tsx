import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Shield, Calendar } from 'lucide-react';

interface WeekCardProps {
  weekLabel: string;
  gamesPlayed: number;
  topScorer: { playerName: string; count: number } | null;
  topAssister: { playerName: string; count: number } | null;
  topKeeper: { playerName: string; count: number } | null;
  onClick?: () => void;
}

export const WeekCard = ({ 
  weekLabel, 
  gamesPlayed, 
  topScorer, 
  topAssister, 
  topKeeper,
  onClick,
}: WeekCardProps) => {
  return (
    <Card 
      className="bg-card/80 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2 text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            {weekLabel}
          </span>
          <span className="text-sm text-muted-foreground font-normal">
            {gamesPlayed} game{gamesPlayed !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Top Scorer */}
        <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Top Scorer</span>
          </div>
          {topScorer ? (
            <div className="text-right">
              <span className="font-semibold text-foreground">{topScorer.playerName}</span>
              <span className="text-sm text-primary ml-2">{topScorer.count} goals</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>

        {/* Top Assister */}
        <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-secondary" />
            <span className="text-sm text-muted-foreground">Top Assister</span>
          </div>
          {topAssister ? (
            <div className="text-right">
              <span className="font-semibold text-foreground">{topAssister.playerName}</span>
              <span className="text-sm text-secondary ml-2">{topAssister.count} assists</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>

        {/* Top Keeper */}
        <div className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-sm text-muted-foreground">Top Keeper</span>
          </div>
          {topKeeper ? (
            <div className="text-right">
              <span className="font-semibold text-foreground">{topKeeper.playerName}</span>
              <span className="text-sm text-green-400 ml-2">{topKeeper.count} wins</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

