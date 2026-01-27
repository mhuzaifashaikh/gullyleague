import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Player } from '@/hooks/usePlayers';

interface PlayerSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  players: Player[];
  onSelect: (playerId: string) => void;
  title: string;
}

export const PlayerSelector = ({
  open,
  onOpenChange,
  players,
  onSelect,
  title,
}: PlayerSelectorProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {players.map((player) => (
            <Button
              key={player.id}
              variant="outline"
              className="w-full justify-start text-lg py-6"
              onClick={() => {
                onSelect(player.id);
                onOpenChange(false);
              }}
            >
              {player.name}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
