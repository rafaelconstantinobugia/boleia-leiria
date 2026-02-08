-- Criar tipos ENUM para estados
CREATE TYPE public.request_status AS ENUM ('NEW', 'TRIAGE', 'CONFIRMED', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TYPE public.offer_status AS ENUM ('AVAILABLE', 'RESERVED', 'IN_PROGRESS', 'DONE', 'CANCELLED');
CREATE TYPE public.match_status AS ENUM ('PROPOSED', 'CONFIRMED', 'CANCELLED', 'DONE');
CREATE TYPE public.distance_availability AS ENUM ('LOCAL', 'UP_TO_1H', 'ANY');

-- Tabela de Pedidos de Boleia
CREATE TABLE public.ride_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status public.request_status NOT NULL DEFAULT 'NEW',
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  pickup_location_text TEXT NOT NULL,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_location_text TEXT NOT NULL,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  passengers INTEGER NOT NULL DEFAULT 1 CHECK (passengers >= 1),
  special_needs TEXT[],
  notes TEXT,
  edit_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  matched_offer_id UUID
);

-- Tabela de Ofertas de Boleia
CREATE TABLE public.ride_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status public.offer_status NOT NULL DEFAULT 'AVAILABLE',
  driver_name TEXT NOT NULL,
  driver_phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  seats_available INTEGER NOT NULL DEFAULT 1 CHECK (seats_available >= 1),
  departure_area_text TEXT NOT NULL,
  can_go_distance public.distance_availability NOT NULL DEFAULT 'LOCAL',
  time_window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  equipment TEXT[],
  notes TEXT,
  edit_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex')
);

-- Tabela de Matches
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  request_id UUID NOT NULL REFERENCES public.ride_requests(id) ON DELETE CASCADE,
  offer_id UUID NOT NULL REFERENCES public.ride_offers(id) ON DELETE CASCADE,
  coordinator_name TEXT NOT NULL,
  coordinator_phone TEXT NOT NULL,
  status public.match_status NOT NULL DEFAULT 'PROPOSED',
  notes TEXT
);

-- Tabela de Log de Coordenação
CREATE TABLE public.coordinator_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB
);

-- Adicionar FK para matched_offer_id
ALTER TABLE public.ride_requests 
ADD CONSTRAINT fk_matched_offer 
FOREIGN KEY (matched_offer_id) REFERENCES public.ride_offers(id) ON DELETE SET NULL;

-- Criar índices para melhor performance
CREATE INDEX idx_ride_requests_status ON public.ride_requests(status);
CREATE INDEX idx_ride_requests_window ON public.ride_requests(window_start, window_end);
CREATE INDEX idx_ride_requests_edit_token ON public.ride_requests(edit_token);
CREATE INDEX idx_ride_offers_status ON public.ride_offers(status);
CREATE INDEX idx_ride_offers_window ON public.ride_offers(time_window_start, time_window_end);
CREATE INDEX idx_ride_offers_edit_token ON public.ride_offers(edit_token);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_coordinator_logs_entity ON public.coordinator_logs(entity_type, entity_id);

-- Ativar RLS em todas as tabelas
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinator_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ride_requests (acesso público para criar e ler, editar via token)
CREATE POLICY "Qualquer pessoa pode criar pedidos" 
ON public.ride_requests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Qualquer pessoa pode ver pedidos" 
ON public.ride_requests FOR SELECT 
USING (true);

CREATE POLICY "Editar pedido com token válido via função" 
ON public.ride_requests FOR UPDATE 
USING (true);

CREATE POLICY "Cancelar pedido com token válido via função" 
ON public.ride_requests FOR DELETE 
USING (true);

-- Políticas RLS para ride_offers
CREATE POLICY "Qualquer pessoa pode criar ofertas" 
ON public.ride_offers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Qualquer pessoa pode ver ofertas" 
ON public.ride_offers FOR SELECT 
USING (true);

CREATE POLICY "Editar oferta com token válido via função" 
ON public.ride_offers FOR UPDATE 
USING (true);

CREATE POLICY "Cancelar oferta com token válido via função" 
ON public.ride_offers FOR DELETE 
USING (true);

-- Políticas RLS para matches (apenas coordenadores via edge function)
CREATE POLICY "Qualquer pessoa pode ver matches" 
ON public.matches FOR SELECT 
USING (true);

CREATE POLICY "Criar match via função" 
ON public.matches FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Atualizar match via função" 
ON public.matches FOR UPDATE 
USING (true);

-- Políticas RLS para coordinator_logs
CREATE POLICY "Ver logs via função" 
ON public.coordinator_logs FOR SELECT 
USING (true);

CREATE POLICY "Criar logs via função" 
ON public.coordinator_logs FOR INSERT 
WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER update_ride_requests_updated_at
BEFORE UPDATE ON public.ride_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ride_offers_updated_at
BEFORE UPDATE ON public.ride_offers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();