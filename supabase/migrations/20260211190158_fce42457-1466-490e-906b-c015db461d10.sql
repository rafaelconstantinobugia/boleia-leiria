
-- Add sync tracking columns
ALTER TABLE public.ride_requests ADD COLUMN sheets_synced_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.ride_offers ADD COLUMN sheets_synced_at timestamp with time zone DEFAULT NULL;

-- Update the public views to NOT include the sync column (keep them clean)
DROP VIEW IF EXISTS public.ride_requests_public;
CREATE VIEW public.ride_requests_public AS
SELECT
  id,
  requester_name,
  pickup_location_text,
  dropoff_location_text,
  pickup_lat,
  pickup_lng,
  dropoff_lat,
  dropoff_lng,
  passengers,
  special_needs,
  notes,
  status,
  window_start,
  window_end,
  matched_offer_id,
  created_at,
  updated_at
FROM public.ride_requests;

DROP VIEW IF EXISTS public.ride_offers_public;
CREATE VIEW public.ride_offers_public AS
SELECT
  id,
  driver_name,
  departure_area_text,
  vehicle_type,
  seats_available,
  can_go_distance,
  equipment,
  notes,
  status,
  time_window_start,
  time_window_end,
  created_at,
  updated_at
FROM public.ride_offers;
