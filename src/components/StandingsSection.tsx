import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface RankingEntry {
  playerId: string;
  playerName: string;
  count: number;
}

interface StandingsSectionProps {
  title: string;
  icon: 'trophy' | 'target' | 'shield';
  entries: RankingEntry[];
  unit: string;
  defaultShowCount?: number;
  onPlayerClick?: (playerId: string) => void;
}

const iconMap = {
  trophy: Trophy,
  target: Target,
  shield: Shield,
};

export const StandingsSection = ({ 
  title, 
  icon, 
  entries, 
  unit, 
  defaultShowCount = 7,
  onPlayerClick,
}: StandingsSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[icon];
  
  const displayEntries = expanded ? entries : entries.slice(0, defaultShowCount);
  const hasMore = entries.length > defaultShowCount;

  const getIconColor = () => {
    switch (icon) {
      case 'trophy': return 'text-secondary neon-text-gold';
      case 'target': return 'text-primary neon-text-cyan';
      case 'shield': return 'text-emerald-400';
      default: return 'text-primary';
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-glow-gold';
    if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-black';
    if (index === 2) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Icon className={`h-5 w-5 ${getIconColor()}`} />
          <span className="text-foreground">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No data yet</p>
        ) : (
          <>
            {displayEntries.map((entry, index) => (
              <div
                key={entry.playerId}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-all ${
                  index === 0 
                    ? 'bg-secondary/10 border border-secondary/30' 
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadge(index)}`}
                  >
                    {index + 1}
                  </span>
                  <button
                    className="font-medium text-sm text-foreground hover:text-primary underline-offset-2 hover:underline transition-colors text-left"
                    onClick={() => onPlayerClick?.(entry.playerId)}
                  >
                    {entry.playerName}
                  </button>
                </div>
                <span className={`text-sm font-bold ${index === 0 ? 'neon-text-gold' : 'text-muted-foreground'}`}>
                  {entry.count} {unit}
                </span>
              </div>
            ))}
            
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-primary hover:text-primary/80 hover:bg-primary/10"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    See All ({entries.length})
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
