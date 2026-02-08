-- Create public views that exclude edit_token for safe public listing
CREATE VIEW public.ride_requests_public
WITH (security_invoker=off) AS
  SELECT 
    id, created_at, updated_at, status, requester_name, requester_phone,
    pickup_location_text, pickup_lat, pickup_lng, 
    dropoff_location_text, dropoff_lat, dropoff_lng,
    window_start, window_end, passengers, special_needs, notes, matched_offer_id
  FROM public.ride_requests;
  -- Excludes edit_token

CREATE VIEW public.ride_offers_public
WITH (security_invoker=off) AS
  SELECT 
    id, created_at, updated_at, status, driver_name, driver_phone,
    vehicle_type, seats_available, departure_area_text, can_go_distance,
    time_window_start, time_window_end, equipment, notes
  FROM public.ride_offers;
  -- Excludes edit_token

-- Grant SELECT on views to public
GRANT SELECT ON public.ride_requests_public TO anon, authenticated;
GRANT SELECT ON public.ride_offers_public TO anon, authenticated;

-- Update RLS policies on base tables to deny direct SELECT access
-- First drop existing permissive SELECT policies
DROP POLICY IF EXISTS "Qualquer pessoa pode ver pedidos" ON public.ride_requests;
DROP POLICY IF EXISTS "Qualquer pessoa pode ver ofertas" ON public.ride_offers;

-- Create restrictive SELECT policy that denies direct table access
-- (users must use views for listing or edge functions for token-based access)
CREATE POLICY "Bloquear SELECT direto - usar views"
  ON public.ride_requests FOR SELECT
  USING (false);

CREATE POLICY "Bloquear SELECT direto - usar views"
  ON public.ride_offers FOR SELECT
  USING (false);