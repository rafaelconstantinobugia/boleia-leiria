-- Drop and recreate views with security_invoker=on
DROP VIEW IF EXISTS public.ride_requests_public;
DROP VIEW IF EXISTS public.ride_offers_public;

-- Recreate ride_requests_public view with security_invoker
CREATE VIEW public.ride_requests_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    requester_name,
    requester_phone,
    pickup_location_text,
    dropoff_location_text,
    pickup_lat,
    pickup_lng,
    dropoff_lat,
    dropoff_lng,
    window_start,
    window_end,
    passengers,
    special_needs,
    notes,
    status,
    matched_offer_id,
    created_at,
    updated_at
  FROM public.ride_requests;

-- Recreate ride_offers_public view with security_invoker  
CREATE VIEW public.ride_offers_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    driver_name,
    driver_phone,
    vehicle_type,
    seats_available,
    departure_area_text,
    can_go_distance,
    time_window_start,
    time_window_end,
    equipment,
    notes,
    status,
    created_at,
    updated_at
  FROM public.ride_offers;

-- Grant SELECT on views to anon and authenticated
GRANT SELECT ON public.ride_requests_public TO anon, authenticated;
GRANT SELECT ON public.ride_offers_public TO anon, authenticated;