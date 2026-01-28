import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PinDialog } from '@/components/PinDialog';
import { StandingsSection } from '@/components/StandingsSection';
import { useAdminMode } from '@/hooks/useAdminMode';
import { useActiveSeason } from '@/hooks/useSeasons';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Shield, Zap, Calendar, Clock } from 'lucide-react';

const Index = () => {
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const { isAdmin, verifyPin } = useAdminMode();
  const { data: season } = useActiveSeason();
  const { data: seasonStats, isLoading: seasonLoading } = useLeaderboard(season?.id || null, 'season');
  const { data: weekStats, isLoading: weekLoading } = useLeaderboard(season?.id || null, 'week');

  return (
    <div className="min-h-screen bg-background gradient-dark">
      {/* Header */}
      <header className="bg-card/50 border-b border-border/50 p-6 pb-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="h-7 w-7 text-primary neon-text-cyan" />
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              GULLY <span className="text-gradient-gold">LEAGUE</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {season?.name || 'Loading...'} • Track your squad's glory
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <Tabs defaultValue="season" className="w-full">
          <TabsList className="w-full mb-6 bg-muted/50 p-1 border border-border/50">
            <TabsTrigger 
              value="season" 
              className="flex-1 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow-cyan"
            >
              <Calendar className="h-4 w-4" />
              Season
            </TabsTrigger>
            <TabsTrigger 
              value="week" 
              className="flex-1 gap-2 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground data-[state=active]:shadow-glow-gold"
            >
              <Clock className="h-4 w-4" />
              This Week
            </TabsTrigger>
          </TabsList>

          {/* Season Stats - Top 7 scorers & assists */}
          <TabsContent value="season" className="mt-0">
            {seasonLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <StandingsSection
                  title="Top Scorers"
                  icon="trophy"
                  entries={seasonStats?.topScorers || []}
                  unit="goals"
                  defaultShowCount={7}
                />
                <StandingsSection
                  title="Top Assisters"
                  icon="target"
                  entries={seasonStats?.topAssisters || []}
                  unit="assists"
                  defaultShowCount={7}
                />
              </div>
            )}
          </TabsContent>

          {/* Weekly Stats - All 3 categories */}
          <TabsContent value="week" className="mt-0">
            {weekLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <StandingsSection
                  title="Top Scorers"
                  icon="trophy"
                  entries={weekStats?.topScorers || []}
                  unit="goals"
                  defaultShowCount={5}
                />
                <StandingsSection
                  title="Top Assisters"
                  icon="target"
                  entries={weekStats?.topAssisters || []}
                  unit="assists"
                  defaultShowCount={5}
                />
                <StandingsSection
                  title="Top Keepers"
                  icon="shield"
                  entries={weekStats?.topKeepers || []}
                  unit="wins"
                  defaultShowCount={5}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Admin Button */}
        <div className="mt-8 space-y-3">
          {isAdmin ? (
            <Link to="/admin" className="block">
              <Button className="w-full h-14 text-lg gradient-gold shadow-glow-gold text-secondary-foreground font-bold">
                <Shield className="h-5 w-5 mr-2" />
                Enter Admin Panel
              </Button>
            </Link>
          ) : (
            <Button
              className="w-full h-14 text-lg bg-muted hover:bg-muted/80 border border-border/50"
              variant="ghost"
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
