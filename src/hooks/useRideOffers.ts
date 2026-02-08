import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { normalizePhone } from '@/lib/validation';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type RideOffer = Tables<'ride_offers'>;
type RideOfferInsert = TablesInsert<'ride_offers'>;
type RideOfferUpdate = TablesUpdate<'ride_offers'>;

export function useRideOffers(filters?: {
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['ride_offers', filters],
    queryFn: async () => {
      // Use the public view that excludes edit_token
      let query = supabase
        .from('ride_offers_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status as 'AVAILABLE' | 'RESERVED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED');
      }

      if (filters?.search) {
        query = query.ilike('departure_area_text', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RideOffer[];
    },
  });
}

export function useRideOfferByToken(token: string) {
  return useQuery({
    queryKey: ['ride_offer', 'token', token],
    queryFn: async () => {
      // Use edge function to validate token securely (bypasses RLS)
      const response = await supabase.functions.invoke('get-offer-by-token', {
        body: { token },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data?.data as RideOffer | null;
    },
    enabled: !!token,
  });
}

export function useCreateRideOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<RideOfferInsert, 'id' | 'created_at' | 'updated_at' | 'edit_token'>) => {
      const normalizedData = {
        ...data,
        driver_phone: normalizePhone(data.driver_phone),
      };

      const { data: result, error } = await supabase
        .from('ride_offers')
        .insert(normalizedData)
        .select()
        .single();

      if (error) throw error;
      return result as RideOffer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride_offers'] });
    },
  });
}

export function useUpdateRideOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, data }: { token: string; data: RideOfferUpdate }) => {
      const normalizedData = {
        ...data,
        driver_phone: data.driver_phone ? normalizePhone(data.driver_phone) : undefined,
      };

      const { data: result, error } = await supabase
        .from('ride_offers')
        .update(normalizedData)
        .eq('edit_token', token)
        .select()
        .single();

      if (error) throw error;
      return result as RideOffer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride_offers'] });
    },
  });
}

export function useCancelRideOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase
        .from('ride_offers')
        .update({ status: 'CANCELLED' })
        .eq('edit_token', token)
        .select()
        .single();

      if (error) throw error;
      return data as RideOffer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride_offers'] });
    },
  });
}

export function useCompatibleOffers(requestId?: string) {
  return useQuery({
    queryKey: ['compatible_offers', requestId],
    queryFn: async () => {
      if (!requestId) return [];

      // Buscar pedido
      const { data: request, error: requestError } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) throw requestError;

      // Buscar ofertas disponíveis com janela temporal sobreposta
      const { data: offers, error: offersError } = await supabase
        .from('ride_offers')
        .select('*')
        .eq('status', 'AVAILABLE')
        .gte('seats_available', request.passengers)
        .lte('time_window_start', request.window_end)
        .gte('time_window_end', request.window_start)
        .order('created_at', { ascending: false });

      if (offersError) throw offersError;
      return offers as RideOffer[];
    },
    enabled: !!requestId,
  });
}
