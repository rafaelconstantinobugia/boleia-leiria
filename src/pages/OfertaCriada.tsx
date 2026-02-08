import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CheckCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';

import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRideOfferByToken } from '@/hooks/useRideOffers';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  OFFER_STATUS_LABELS, 
  OFFER_STATUS_COLORS, 
  EQUIPMENT_OPTIONS,
  VEHICLE_TYPES,
  DISTANCE_LABELS 
} from '@/lib/constants';
import { maskPhone, maskName } from '@/lib/validation';

export default function OfertaCriada() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { data: offer, isLoading, error } = useRideOfferByToken(token || '');

  const editUrl = `${window.location.origin}/editar/oferta/${token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(editUrl);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência.',
      });
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Por favor copie o link manualmente.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="A carregar...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (error || !offer) {
    return (
      <PageLayout title="Oferta não encontrada">
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível encontrar a oferta. Verifique se o link está correto.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </PageLayout>
    );
  }

  const equipmentLabels = (offer.equipment || [])
    .map((eq) => EQUIPMENT_OPTIONS.find((opt) => opt.value === eq)?.label)
    .filter(Boolean);

  const vehicleLabel = VEHICLE_TYPES.find((v) => v.value === offer.vehicle_type)?.label || offer.vehicle_type;

  return (
    <PageLayout title="Oferta Criada">
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="font-semibold text-green-900">Oferta criada com sucesso!</h2>
            <p className="text-sm text-green-700">
              Guarde o link abaixo para poder editar ou cancelar a sua oferta.
            </p>
          </div>
        </div>

        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertTitle>Link Privado de Edição</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p className="text-sm">
              Este é o único link que lhe permite editar ou cancelar a sua oferta. 
              <strong className="text-foreground"> Guarde-o num local seguro!</strong>
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <code className="flex-1 rounded bg-muted px-2 py-1 text-xs break-all">
                {editUrl}
              </code>
              <Button size="sm" variant="outline" onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resumo da Oferta</CardTitle>
              <StatusBadge
                status={offer.status}
                labels={OFFER_STATUS_LABELS}
                colors={OFFER_STATUS_COLORS}
              />
            </div>
            <CardDescription>
              Criada em {format(new Date(offer.created_at), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{maskName(offer.driver_name)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{maskPhone(offer.driver_phone)}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Veículo</p>
                <p className="font-medium">{vehicleLabel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lugares</p>
                <p className="font-medium">{offer.seats_available}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Zona de Partida</p>
              <p className="font-medium">{offer.departure_area_text}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Distância</p>
                <p className="font-medium">{DISTANCE_LABELS[offer.can_go_distance]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disponibilidade</p>
                <p className="font-medium">
                  {format(new Date(offer.time_window_start), "d MMM HH:mm", { locale: pt })} - {' '}
                  {format(new Date(offer.time_window_end), "d MMM HH:mm", { locale: pt })}
                </p>
              </div>
            </div>

            {equipmentLabels.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Equipamento</p>
                <p className="font-medium">{equipmentLabels.join(', ')}</p>
              </div>
            )}

            {offer.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notas</p>
                <p className="font-medium">{offer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/editar/oferta/${token}`}>
              Editar Oferta
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link to="/">
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
