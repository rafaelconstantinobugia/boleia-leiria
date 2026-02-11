import { useQuery } from '@tanstack/react-query';
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
