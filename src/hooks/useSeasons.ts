import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Season {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  ended_at: string | null;
}

export const useActiveSeason = () => {
  return useQuery({
    queryKey: ['active-season'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as Season | null;
    },
  });
};

export const useEndSeason = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // End current season
      const { error: endError } = await supabase
        .from('seasons')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('is_active', true);
      
      if (endError) throw endError;
      
      // Get count of seasons to name the new one
      const { count } = await supabase
        .from('seasons')
        .select('*', { count: 'exact', head: true });
      
      // Create new season
      const { data, error: createError } = await supabase
        .from('seasons')
        .insert({ name: `Season ${(count || 0) + 1}`, is_active: true })
        .select()
        .single();
      
      if (createError) throw createError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-season'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};
