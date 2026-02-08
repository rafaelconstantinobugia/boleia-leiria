import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CheckCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';

import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useRideRequestByToken } from '@/hooks/useRideRequests';
import { StatusBadge } from '@/components/ui/status-badge';
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS, SPECIAL_NEEDS_OPTIONS } from '@/lib/constants';
import { maskPhone, maskName } from '@/lib/validation';

export default function PedidoCriado() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const { data: request, isLoading, error } = useRideRequestByToken(token || '');

  const editUrl = `${window.location.origin}/editar/pedido/${token}`;

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

  if (error || !request) {
    return (
      <PageLayout title="Pedido não encontrado">
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível encontrar o pedido. Verifique se o link está correto.
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

  const specialNeedsLabels = (request.special_needs || [])
    .map((need) => SPECIAL_NEEDS_OPTIONS.find((opt) => opt.value === need)?.label)
    .filter(Boolean);

  return (
    <PageLayout title="Pedido Criado">
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="font-semibold text-green-900">Pedido criado com sucesso!</h2>
            <p className="text-sm text-green-700">
              Guarde o link abaixo para poder editar ou cancelar o seu pedido.
            </p>
          </div>
        </div>

        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertTitle>Link Privado de Edição</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p className="text-sm">
              Este é o único link que lhe permite editar ou cancelar o seu pedido. 
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
              <CardTitle>Resumo do Pedido</CardTitle>
              <StatusBadge
                status={request.status}
                labels={REQUEST_STATUS_LABELS}
                colors={REQUEST_STATUS_COLORS}
              />
            </div>
            <CardDescription>
              Criado em {format(new Date(request.created_at), "d 'de' MMMM 'às' HH:mm", { locale: pt })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{maskName(request.requester_name)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{maskPhone(request.requester_phone)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Partida</p>
              <p className="font-medium">{request.pickup_location_text}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Destino</p>
              <p className="font-medium">{request.dropoff_location_text}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Janela Temporal</p>
                <p className="font-medium">
                  {format(new Date(request.window_start), "d MMM HH:mm", { locale: pt })} - {' '}
                  {format(new Date(request.window_end), "d MMM HH:mm", { locale: pt })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passageiros</p>
                <p className="font-medium">{request.passengers}</p>
              </div>
            </div>

            {specialNeedsLabels.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Necessidades Especiais</p>
                <p className="font-medium">{specialNeedsLabels.join(', ')}</p>
              </div>
            )}

            {request.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notas</p>
                <p className="font-medium">{request.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline" className="flex-1">
            <Link to={`/editar/pedido/${token}`}>
              Editar Pedido
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
