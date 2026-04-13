import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { usePlayers, useAddPlayer, useDeletePlayer, Player } from '@/hooks/usePlayers';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Trash2, Users, Camera, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const PlayerManagement = () => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { data: players, isLoading } = usePlayers();
  const addPlayer = useAddPlayer();
  const deletePlayer = useDeletePlayer();
  const queryClient = useQueryClient();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newPlayerName.trim();
    if (!trimmedName) {
      toast.error('Enter a player name');
      return;
    }
    
    try {
      await addPlayer.mutateAsync(trimmedName);
      setNewPlayerName('');
      toast.success(`${trimmedName} added to the squad!`);
    } catch (error) {
      toast.error('Failed to add player');
    }
  };
  
  const handleDeletePlayer = async (player: Player) => {
    try {
      await deletePlayer.mutateAsync(player.id);
      toast.success(`${player.name} removed from squad`);
    } catch (error) {
      toast.error('Failed to remove player');
    }
  };

  const handleStartEdit = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (player: Player) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }
    if (trimmed === player.name) {
      handleCancelEdit();
      return;
    }
    try {
      const { error } = await supabase
        .from('players')
        .update({ name: trimmed })
        .eq('id', player.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success(`Renamed to ${trimmed}`);
      handleCancelEdit();
    } catch (error) {
      toast.error('Failed to rename player');
    }
  };

  const handlePhotoUpload = async (player: Player, file: File) => {
    try {
      const path = `${player.id}`;
      
      await supabase.storage
        .from('player-photos')
        .remove([path]);
      
      const { error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(path, file, { 
          upsert: true,
          contentType: file.type,
        });
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('player-photos')
        .getPublicUrl(path);

      const photoUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('players')
        .update({ photo_url: photoUrl })
        .eq('id', player.id);
      
      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success(`Photo updated for ${player.name}`);
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Player Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddPlayer} className="flex gap-2">
          <Input
            placeholder="Player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" className="gradient-pitch" disabled={addPlayer.isPending}>
            <UserPlus className="h-4 w-4" />
          </Button>
        </form>
        
        {isLoading ? (
          <p className="text-muted-foreground text-center py-4">Loading...</p>
        ) : players?.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No players yet. Add some!</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {players?.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    {player.photo_url ? (
                      <AvatarImage src={player.photo_url} alt={player.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  {editingId === player.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-sm flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(player);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                  ) : (
                    <span className="font-medium truncate">{player.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editingId === player.id ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleSaveEdit(player)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleStartEdit(player)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => { fileInputRefs.current[player.id] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(player, file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => fileInputRefs.current[player.id]?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeletePlayer(player)}
                        disabled={deletePlayer.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
