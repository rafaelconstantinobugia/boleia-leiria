import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Car, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCreateMatch } from '@/hooks/useMatches';
import { VEHICLE_TYPES, DISTANCE_LABELS } from '@/lib/constants';
import { isValidPTPhone, normalizePhone } from '@/lib/validation';
import type { Tables } from '@/integrations/supabase/types';

interface MatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: Tables<'ride_requests'> | undefined;
  compatibleOffers: Tables<'ride_offers'>[];
}

export function MatchDialog({ open, onOpenChange, request, compatibleOffers }: MatchDialogProps) {
  const { toast } = useToast();
  const createMatch = useCreateMatch();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [coordinatorName, setCoordinatorName] = useState('');
  const [coordinatorPhone, setCoordinatorPhone] = useState('');

  async function handleConfirm() {
    if (!request || !selectedOfferId) return;

    if (!coordinatorName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor introduza o nome do coordenador.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidPTPhone(coordinatorPhone)) {
      toast({
        title: 'Telefone inválido',
        description: 'Por favor introduza um telefone válido.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMatch.mutateAsync({
        request_id: request.id,
        offer_id: selectedOfferId,
        coordinator_name: coordinatorName.trim(),
        coordinator_phone: normalizePhone(coordinatorPhone),
        status: 'PROPOSED',
      });

      toast({
        title: 'Match criado',
        description: 'O match foi proposto com sucesso.',
      });

      onOpenChange(false);
      setSelectedOfferId(null);
      setCoordinatorName('');
      setCoordinatorPhone('');
    } catch (error) {
      toast({
        title: 'Erro ao criar match',
        description: 'Por favor tente novamente.',
        variant: 'destructive',
      });
    }
  }

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Propor Match</DialogTitle>
          <DialogDescription>
            Selecione uma oferta compatível e introduza os dados do coordenador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo do pedido */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">{request.requester_name}</p>
            <p className="text-muted-foreground">
              {request.pickup_location_text} → {request.dropoff_location_text}
            </p>
            <p className="text-muted-foreground">
              {format(new Date(request.window_start), "d MMM HH:mm", { locale: pt })} • {request.passengers} passageiro(s)
            </p>
          </div>

          {/* Ofertas compatíveis */}
          <div className="space-y-2">
            <Label>Ofertas Compatíveis ({compatibleOffers.length})</Label>
            {compatibleOffers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma oferta compatível encontrada
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {compatibleOffers.map((offer) => {
                  const vehicleLabel = VEHICLE_TYPES.find((v) => v.value === offer.vehicle_type)?.label || offer.vehicle_type;
                  const isSelected = selectedOfferId === offer.id;

                  return (
                    <Card
                      key={offer.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedOfferId(offer.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{offer.driver_name}</span>
                          <span className="text-sm text-muted-foreground">
                            • {vehicleLabel} • {offer.seats_available} lugares
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {offer.departure_area_text} • {DISTANCE_LABELS[offer.can_go_distance]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(offer.time_window_start), "d MMM HH:mm", { locale: pt })} - {' '}
                          {format(new Date(offer.time_window_end), "HH:mm", { locale: pt })}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dados do coordenador */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-base font-medium">Dados do Coordenador</Label>
            <div className="space-y-2">
              <Label htmlFor="coord-name">Nome *</Label>
              <Input
                id="coord-name"
                placeholder="O seu nome"
                value={coordinatorName}
                onChange={(e) => setCoordinatorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coord-phone">Telefone *</Label>
              <Input
                id="coord-phone"
                type="tel"
                placeholder="912345678"
                value={coordinatorPhone}
                onChange={(e) => setCoordinatorPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedOfferId || createMatch.isPending}
          >
            {createMatch.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A criar...
              </>
            ) : (
              'Confirmar Match'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
