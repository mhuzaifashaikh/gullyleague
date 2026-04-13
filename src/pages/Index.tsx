import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PinDialog } from '@/components/PinDialog';
import { GullyDorDialog } from '@/components/GullyDorDialog';
import { WeekDetailDialog } from '@/components/WeekDetailDialog';
import { StandingsSection } from '@/components/StandingsSection';
import { WeekCard } from '@/components/WeekCard';
import { PlayerProfileDialog } from '@/components/PlayerProfileDialog';
import { useAdminMode } from '@/hooks/useAdminMode';
import { useActiveSeason } from '@/hooks/useSeasons';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useGullyDor } from '@/hooks/useGullyDor';
import { useWeeklyBreakdown } from '@/hooks/useWeeklyBreakdown';
import { Shield, Calendar, Clock, Trophy } from 'lucide-react';

const Index = () => {
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [gullyDorOpen, setGullyDorOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<{ gameId: string; label: string } | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const { isAdmin, verifyPin } = useAdminMode();
  const { data: season } = useActiveSeason();
  const { data: seasonStats, isLoading: seasonLoading } = useLeaderboard(season?.id || null, 'season');
  const { data: weeklyBreakdown, isLoading: weeklyLoading } = useWeeklyBreakdown(season?.id || null);
  const { data: gullyDorEntries, isLoading: gullyDorLoading } = useGullyDor(season?.id || null);

  const handlePlayerClick = (playerId: string) => setSelectedPlayerId(playerId);

  return (
    <div className="min-h-screen bg-background gradient-dark">
      {/* Header */}
      <header className="bg-card/50 border-b border-border/50 p-6 pb-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="h-7 w-7 text-primary neon-text-cyan" />
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              GULLY <span className="text-gradient-gold">LEAGUE</span>
            </h1>
          </div>
          <Button
            onClick={() => setGullyDorOpen(true)}
            className="gradient-gold shadow-glow-gold text-secondary-foreground font-bold"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Gully D'Or
          </Button>
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

          <TabsContent value="season" className="mt-0">
            {seasonLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <StandingsSection
                    title="Top Scorers"
                    icon="trophy"
                    entries={seasonStats?.topScorers || []}
                    unit="goals"
                    defaultShowCount={7}
                    onPlayerClick={handlePlayerClick}
                  />
                  <StandingsSection
                    title="Top Assisters"
                    icon="target"
                    entries={seasonStats?.topAssisters || []}
                    unit="assists"
                    defaultShowCount={7}
                    onPlayerClick={handlePlayerClick}
                  />
                </div>
                <StandingsSection
                  title="Top Goalkeeper Wins"
                  icon="shield"
                  entries={seasonStats?.topKeepers || []}
                  unit="wins"
                  defaultShowCount={7}
                  onPlayerClick={handlePlayerClick}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            {weeklyLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : weeklyBreakdown && weeklyBreakdown.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-320px)]">
                <div className="space-y-4 pr-4">
                  {weeklyBreakdown.map((week) => (
                    <WeekCard
                      key={week.gameId}
                      weekLabel={week.weekLabel}
                      playedAt={week.playedAt}
                      scoreA={week.scoreA}
                      scoreB={week.scoreB}
                      topScorer={week.topScorer}
                      topAssister={week.topAssister}
                      topKeeper={week.topKeeper}
                      onClick={() => setSelectedWeek({ 
                        gameId: week.gameId,
                        label: week.weekLabel, 
                      })}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-center text-muted-foreground py-8">No games played yet</p>
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

      <GullyDorDialog
        open={gullyDorOpen}
        onOpenChange={setGullyDorOpen}
        entries={gullyDorEntries || []}
        isLoading={gullyDorLoading}
        onPlayerClick={handlePlayerClick}
      />

      <WeekDetailDialog
        open={!!selectedWeek}
        onOpenChange={(open) => !open && setSelectedWeek(null)}
        gameId={selectedWeek?.gameId || null}
        weekLabel={selectedWeek?.label || ''}
      />

      <PlayerProfileDialog
        open={!!selectedPlayerId}
        onOpenChange={(open) => !open && setSelectedPlayerId(null)}
        playerId={selectedPlayerId}
        seasonId={season?.id || null}
      />
    </div>
  );
};

export default Index;
