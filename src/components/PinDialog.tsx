import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, AlertCircle } from 'lucide-react';

interface PinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (pin: string) => boolean;
}

export const PinDialog = ({ open, onOpenChange, onVerify }: PinDialogProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onVerify(pin)) {
      setPin('');
      setError(false);
      onOpenChange(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Lock className="h-5 w-5 text-primary" />
            Enter Admin PIN
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            className="text-center text-2xl tracking-widest"
            maxLength={6}
            autoFocus
          />
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              Incorrect PIN. Try again.
            </div>
          )}
          <Button type="submit" className="w-full gradient-pitch">
            Unlock Admin Mode
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
