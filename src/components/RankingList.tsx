import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, Shield } from 'lucide-react';

interface RankingEntry {
  playerId: string;
  playerName: string;
  count: number;
}

interface RankingListProps {
  title: string;
  icon: 'trophy' | 'target' | 'shield';
  entries: RankingEntry[];
  unit: string;
}

const iconMap = {
  trophy: Trophy,
  target: Target,
  shield: Shield,
};

const colorMap = {
  trophy: 'neon-text-gold',
  target: 'neon-text-cyan',
  shield: 'text-emerald-400',
};

export const RankingList = ({ title, icon, entries, unit }: RankingListProps) => {
  const Icon = iconMap[icon];
  const color = colorMap[icon];

  return (
    <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No data yet</p>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.playerId}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0 ? 'bg-secondary/10 border border-secondary/30' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                      : index === 1
                      ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black'
                      : index === 2
                      ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="font-medium text-foreground">{entry.playerName}</span>
              </div>
              <span className={`font-bold ${index === 0 ? color : 'text-muted-foreground'}`}>
                {entry.count} {unit}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
