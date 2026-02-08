import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { normalizePhone } from '@/lib/validation';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type RideRequest = Tables<'ride_requests'>;
type RideRequestInsert = TablesInsert<'ride_requests'>;
type RideRequestUpdate = TablesUpdate<'ride_requests'>;

export function useRideRequests(filters?: {
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['ride_requests', filters],
    queryFn: async () => {
      // Use the public view that excludes edit_token
      let query = supabase
        .from('ride_requests_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status as 'NEW' | 'TRIAGE' | 'CONFIRMED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED');
      }

      if (filters?.search) {
        query = query.or(`pickup_location_text.ilike.%${filters.search}%,dropoff_location_text.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RideRequest[];
    },
  });
}

export function useRideRequestByToken(token: string) {
  return useQuery({
    queryKey: ['ride_request', 'token', token],
    queryFn: async () => {
      // Use edge function to validate token securely (bypasses RLS)
      const response = await supabase.functions.invoke('get-request-by-token', {
        body: { token },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data?.data as RideRequest | null;
    },
    enabled: !!token,
  });
}

export function useCreateRideRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<RideRequestInsert, 'id' | 'created_at' | 'updated_at' | 'edit_token'>) => {
      const normalizedData = {
        ...data,
        requester_phone: normalizePhone(data.requester_phone),
      };

      const { data: result, error } = await supabase
        .from('ride_requests')
        .insert(normalizedData)
        .select()
        .single();

      if (error) throw error;
      return result as RideRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride_requests'] });
    },
  });
}

export function useUpdateRideRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, data }: { token: string; data: RideRequestUpdate }) => {
      const normalizedData = {
        ...data,
        requester_phone: data.requester_phone ? normalizePhone(data.requester_phone) : undefined,
      };

      const { data: result, error } = await supabase
        .from('ride_requests')
        .update(normalizedData)
        .eq('edit_token', token)
        .select()
        .single();

      if (error) throw error;
      return result as RideRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride_requests'] });
    },
  });
}

export function useCancelRideRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase
        .from('ride_requests')
        .update({ status: 'CANCELLED' })
        .eq('edit_token', token)
        .select()
        .single();

      if (error) throw error;
      return data as RideRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ride_requests'] });
    },
  });
}
