-- The issue is that security_invoker views use the caller's permissions
-- We need to allow SELECT through the views by adding a permissive SELECT policy
-- that allows reading through security invoker views

-- First, drop the restrictive SELECT policies
DROP POLICY IF EXISTS "Bloquear SELECT direto - usar views" ON public.ride_requests;
DROP POLICY IF EXISTS "Bloquear SELECT direto - usar views" ON public.ride_offers;

-- Create permissive SELECT policies that allow public read
-- The views will use these policies
CREATE POLICY "Permitir leitura pública"
ON public.ride_requests
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Permitir leitura pública"
ON public.ride_offers
FOR SELECT
TO anon, authenticated
USING (true);