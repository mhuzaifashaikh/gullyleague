import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LeaderCard } from '@/components/LeaderCard';
import { PinDialog } from '@/components/PinDialog';
import { useAdminMode } from '@/hooks/useAdminMode';
import { useActiveSeason } from '@/hooks/useSeasons';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Trophy, ChartBar, Shield, Zap } from 'lucide-react';

const Index = () => {
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const { isAdmin, verifyPin } = useAdminMode();
  const { data: season } = useActiveSeason();
  const { data: leaderboard } = useLeaderboard(season?.id || null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-pitch p-6 pb-8">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-black text-white tracking-tight">GULLY LEAGUE</h1>
          </div>
          <p className="text-white/80 text-sm">
            {season?.name || 'Loading...'} • Track your squad's glory
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 -mt-4 pb-24 space-y-6">
        {/* Quick Leaders */}
        <div className="grid gap-4">
          <LeaderCard
            title="Top Scorer"
            icon="trophy"
            playerName={leaderboard?.topScorers[0]?.playerName || ''}
            count={leaderboard?.topScorers[0]?.count || 0}
            subtitle="goals"
          />
          <LeaderCard
            title="Top Assister"
            icon="target"
            playerName={leaderboard?.topAssisters[0]?.playerName || ''}
            count={leaderboard?.topAssisters[0]?.count || 0}
            subtitle="assists"
          />
          <LeaderCard
            title="Best Keeper"
            icon="shield"
            playerName={leaderboard?.topKeepers[0]?.playerName || ''}
            count={leaderboard?.topKeepers[0]?.count || 0}
            subtitle="wins"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          <Link to="/leaderboards" className="block">
            <Button className="w-full h-14 text-lg" variant="outline">
              <ChartBar className="h-5 w-5 mr-2" />
              View Full Standings
            </Button>
          </Link>

          {isAdmin ? (
            <Link to="/admin" className="block">
              <Button className="w-full h-14 text-lg gradient-fire shadow-glow-orange">
                <Shield className="h-5 w-5 mr-2" />
                Enter Admin Panel
              </Button>
            </Link>
          ) : (
            <Button
              className="w-full h-14 text-lg"
              variant="secondary"
              onClick={() => setPinDialogOpen(true)}
            >
              <Shield className="h-5 w-5 mr-2" />
              Admin Mode
            </Button>
          )}
        </div>
      </main>

      <PinDialog
        open={pinDialogOpen}
        onOpenChange={setPinDialogOpen}
        onVerify={verifyPin}
      />
    </div>
  );
};

export default Index;
