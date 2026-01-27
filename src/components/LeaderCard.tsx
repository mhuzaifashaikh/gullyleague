import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Target, Shield } from 'lucide-react';

interface LeaderCardProps {
  title: string;
  icon: 'trophy' | 'target' | 'shield';
  playerName: string;
  count: number;
  subtitle: string;
}

const iconMap = {
  trophy: Trophy,
  target: Target,
  shield: Shield,
};

const gradientMap = {
  trophy: 'gradient-gold',
  target: 'gradient-pitch',
  shield: 'gradient-fire',
};

export const LeaderCard = ({ title, icon, playerName, count, subtitle }: LeaderCardProps) => {
  const Icon = iconMap[icon];
  const gradient = gradientMap[icon];

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className={`${gradient} p-3`}>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-white" />
          <span className="text-white font-bold text-sm">{title}</span>
        </div>
      </div>
      <CardContent className="p-4">
        {playerName ? (
          <>
            <p className="text-xl font-bold text-foreground truncate">{playerName}</p>
            <p className="text-muted-foreground text-sm">
              {count} {subtitle}
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No data yet</p>
        )}
      </CardContent>
    </Card>
  );
};
