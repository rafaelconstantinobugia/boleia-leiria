import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Match = Tables<'matches'>;
type MatchInsert = TablesInsert<'matches'>;

export function useMatches(filters?: {
  status?: string;
}) {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: async () => {
      let query = supabase
        .from('matches')
        .select(`
          *,
          ride_requests (*),
          ride_offers (*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status as 'PROPOSED' | 'CONFIRMED' | 'CANCELLED' | 'DONE');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<MatchInsert, 'id' | 'created_at' | 'updated_at'>) => {
      // Criar match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert(data)
        .select()
        .single();

      if (matchError) throw matchError;

      // Atualizar estado do pedido para CONFIRMED
      const { error: requestError } = await supabase
        .from('ride_requests')
        .update({ status: 'CONFIRMED', matched_offer_id: data.offer_id })
        .eq('id', data.request_id);

      if (requestError) throw requestError;

      // Atualizar estado da oferta para RESERVED
      const { error: offerError } = await supabase
        .from('ride_offers')
        .update({ status: 'RESERVED' })
        .eq('id', data.offer_id);

      if (offerError) throw offerError;

      // Registar log
      await supabase.from('coordinator_logs').insert({
        action: 'CREATE_MATCH',
        entity_type: 'match',
        entity_id: match.id,
        metadata: { request_id: data.request_id, offer_id: data.offer_id },
      });

      return match as Match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['ride_requests'] });
      queryClient.invalidateQueries({ queryKey: ['ride_offers'] });
    },
  });
}

type MatchStatus = 'PROPOSED' | 'CONFIRMED' | 'CANCELLED' | 'DONE';

export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: MatchStatus }) => {
      // Buscar match atual
      const { data: match, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar match
      const { data: updatedMatch, error: matchError } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId)
        .select()
        .single();

      if (matchError) throw matchError;

      // Atualizar estados relacionados
      if (status === 'CONFIRMED') {
        await supabase.from('ride_requests').update({ status: 'CONFIRMED' }).eq('id', match.request_id);
        await supabase.from('ride_offers').update({ status: 'RESERVED' }).eq('id', match.offer_id);
      } else if (status === 'IN_PROGRESS') {
        await supabase.from('ride_requests').update({ status: 'IN_PROGRESS' }).eq('id', match.request_id);
        await supabase.from('ride_offers').update({ status: 'IN_PROGRESS' }).eq('id', match.offer_id);
      } else if (status === 'DONE') {
        await supabase.from('ride_requests').update({ status: 'DONE' }).eq('id', match.request_id);
        await supabase.from('ride_offers').update({ status: 'DONE' }).eq('id', match.offer_id);
      } else if (status === 'CANCELLED') {
        // Libertar pedido e oferta
        await supabase.from('ride_requests').update({ status: 'NEW', matched_offer_id: null }).eq('id', match.request_id);
        await supabase.from('ride_offers').update({ status: 'AVAILABLE' }).eq('id', match.offer_id);
      }

      // Registar log
      await supabase.from('coordinator_logs').insert({
        action: `UPDATE_MATCH_STATUS_${status}`,
        entity_type: 'match',
        entity_id: matchId,
        metadata: { previous_status: match.status, new_status: status },
      });

      return updatedMatch as Match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['ride_requests'] });
      queryClient.invalidateQueries({ queryKey: ['ride_offers'] });
    },
  });
}
