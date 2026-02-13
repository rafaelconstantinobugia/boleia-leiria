import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type RideRequest = Tables<'ride_requests'>;
type RideOffer = Tables<'ride_offers'>;

export function useAdminRideRequests(pin: string | null, filters?: {
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['admin_ride_requests', filters],
    queryFn: async () => {
      const response = await supabase.functions.invoke('get-admin-data', {
        body: { pin, type: 'requests', filters },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      return response.data?.data as RideRequest[];
    },
    enabled: !!pin,
  });
}

export function useAdminRideOffers(pin: string | null, filters?: {
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['admin_ride_offers', filters],
    queryFn: async () => {
      const response = await supabase.functions.invoke('get-admin-data', {
        body: { pin, type: 'offers', filters },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      return response.data?.data as RideOffer[];
    },
    enabled: !!pin,
  });
}

export function useAdminMatches(pin: string | null, filters?: {
  status?: string;
}) {
  return useQuery({
    queryKey: ['admin_matches', filters],
    queryFn: async () => {
      const response = await supabase.functions.invoke('get-admin-data', {
        body: { pin, type: 'matches', filters },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      return response.data?.data;
    },
    enabled: !!pin,
  });
}

export function useUpdateStatus(pin: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ entityType, entityId, newStatus }: {
      entityType: 'request' | 'offer';
      entityId: string;
      newStatus: string;
    }) => {
      const response = await supabase.functions.invoke('get-admin-data', {
        body: {
          pin,
          type: 'update_status',
          filters: { entity_type: entityType, entity_id: entityId, new_status: newStatus },
        },
      });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_ride_requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin_ride_offers'] });
    },
  });
}
