import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pin, type, filters } = await req.json();

    // Validate PIN
    const adminPin = Deno.env.get('ADMIN_PIN');
    if (!adminPin || pin !== adminPin) {
      return new Response(
        JSON.stringify({ error: 'PIN inválido' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (type === 'requests') {
      let query = supabase
        .from('ride_requests')
        .select('id, requester_name, requester_phone, pickup_location_text, dropoff_location_text, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, passengers, special_needs, notes, status, window_start, window_end, matched_offer_id, created_at, updated_at')
        .order('window_start', { ascending: false });

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`pickup_location_text.ilike.%${filters.search}%,dropoff_location_text.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'offers') {
      let query = supabase
        .from('ride_offers')
        .select('id, driver_name, driver_phone, departure_area_text, vehicle_type, seats_available, can_go_distance, equipment, notes, status, time_window_start, time_window_end, created_at, updated_at')
        .order('time_window_start', { ascending: false });

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.ilike('departure_area_text', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'matches') {
      let query = supabase
        .from('matches')
        .select(`
          *,
          ride_requests (id, requester_name, requester_phone, pickup_location_text, dropoff_location_text, passengers, special_needs, window_start, window_end, status),
          ride_offers (id, driver_name, driver_phone, departure_area_text, vehicle_type, seats_available, can_go_distance, status)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'update_status') {
      const { entity_type, entity_id, new_status } = filters || {};
      if (!entity_type || !entity_id || !new_status) {
        return new Response(
          JSON.stringify({ error: 'entity_type, entity_id e new_status são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const table = entity_type === 'request' ? 'ride_requests' : 'ride_offers';
      const { error } = await supabase
        .from(table)
        .update({ status: new_status, updated_at: new Date().toISOString() })
        .eq('id', entity_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Tipo inválido. Use: requests, offers, matches, update_status' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Admin data error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
