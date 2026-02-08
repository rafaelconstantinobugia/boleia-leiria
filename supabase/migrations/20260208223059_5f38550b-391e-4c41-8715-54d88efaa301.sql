-- Drop existing restrictive INSERT policies and recreate as permissive
DROP POLICY IF EXISTS "Qualquer pessoa pode criar pedidos" ON public.ride_requests;
DROP POLICY IF EXISTS "Qualquer pessoa pode criar ofertas" ON public.ride_offers;

-- Recreate as PERMISSIVE (default) policies for public INSERT
CREATE POLICY "Qualquer pessoa pode criar pedidos" 
ON public.ride_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Qualquer pessoa pode criar ofertas" 
ON public.ride_offers 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);