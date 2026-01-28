import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RankingList } from '@/components/RankingList';
import { useActiveSeason } from '@/hooks/useSeasons';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

const Leaderboards = () => {
  const { data: season } = useActiveSeason();
  const { data: seasonStats, isLoading: seasonLoading } = useLeaderboard(season?.id || null, 'season');
  const { data: weekStats, isLoading: weekLoading } = useLeaderboard(season?.id || null, 'week');

  return (
    <div className="min-h-screen bg-background gradient-dark">
      {/* Header */}
      <header className="bg-card/50 border-b border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Leaderboards</h1>
            <p className="text-muted-foreground text-sm">{season?.name || 'Loading...'}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
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

          <TabsContent value="season" className="space-y-4">
            {seasonLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : (
              <>
                <RankingList
                  title="Top Scorers"
                  icon="trophy"
                  entries={seasonStats?.topScorers || []}
                  unit="goals"
                />
                <RankingList
                  title="Top Assisters"
                  icon="target"
                  entries={seasonStats?.topAssisters || []}
                  unit="assists"
                />
                <RankingList
                  title="Top Goalkeeper Wins"
                  icon="shield"
                  entries={seasonStats?.topKeepers || []}
                  unit="wins"
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            {weekLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : (
              <>
                <RankingList
                  title="Top Scorers"
                  icon="trophy"
                  entries={weekStats?.topScorers || []}
                  unit="goals"
                />
                <RankingList
                  title="Top Assisters"
                  icon="target"
                  entries={weekStats?.topAssisters || []}
                  unit="assists"
                />
                <RankingList
                  title="Top Goalkeeper Wins"
                  icon="shield"
                  entries={weekStats?.topKeepers || []}
                  unit="wins"
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboards;
