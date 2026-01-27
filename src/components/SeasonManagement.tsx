import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveSeason, useEndSeason } from '@/hooks/useSeasons';
import { Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const SeasonManagement = () => {
  const { data: season, isLoading } = useActiveSeason();
  const endSeason = useEndSeason();
  
  const handleEndSeason = async () => {
    if (!confirm('Are you sure you want to end this season and start a new one? Stats will be archived.')) {
      return;
    }
    
    try {
      await endSeason.mutateAsync();
      toast.success('New season started! Previous stats have been archived.');
    } catch (error) {
      toast.error('Failed to end season');
    }
  };
  
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Season Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : season ? (
          <>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Current Season</p>
              <p className="text-xl font-bold text-foreground">{season.name}</p>
              <p className="text-sm text-muted-foreground">
                Started {new Date(season.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              onClick={handleEndSeason}
              variant="outline"
              className="w-full"
              disabled={endSeason.isPending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              End Season & Start New
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground">No active season</p>
        )}
      </CardContent>
    </Card>
  );
};
