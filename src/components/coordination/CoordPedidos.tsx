import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Search, Users, MapPin, Clock, Phone, Loader2, Link2, Archive } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAdmin } from '@/contexts/AdminContext';
import { useAdminRideRequests, useUpdateStatus } from '@/hooks/useAdminData';
import { useCompatibleOffers } from '@/hooks/useRideOffers';
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS, SPECIAL_NEEDS_OPTIONS } from '@/lib/constants';
import { MatchDialog } from './MatchDialog';
import { useToast } from '@/hooks/use-toast';

export function CoordPedidos() {
  const { adminPin } = useAdmin();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const { toast } = useToast();
  const updateStatus = useUpdateStatus(adminPin);
  
  const { data: requests, isLoading } = useAdminRideRequests(adminPin, {
    status: statusFilter,
    search: search.length > 2 ? search : undefined,
  });

  const { data: compatibleOffers } = useCompatibleOffers(selectedRequestId || undefined);

  const selectedRequest = requests?.find((r) => r.id === selectedRequestId);

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por local..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os estados</SelectItem>
            {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : requests?.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Nenhum pedido encontrado
        </div>
      ) : (
        <div className="space-y-3">
          {requests?.map((request) => {
            const specialNeedsLabels = (request.special_needs || [])
              .map((need) => SPECIAL_NEEDS_OPTIONS.find((opt) => opt.value === need)?.label)
              .filter(Boolean);

            return (
              <Card key={request.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {request.requester_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {request.requester_phone}
                      </CardDescription>
                    </div>
                    <StatusBadge
                      status={request.status}
                      labels={REQUEST_STATUS_LABELS}
                      colors={REQUEST_STATUS_COLORS}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p>{request.pickup_location_text}</p>
                      <p className="text-muted-foreground">→ {request.dropoff_location_text}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(request.window_start), "d MMM HH:mm", { locale: pt })} - {' '}
                      {format(new Date(request.window_end), "HH:mm", { locale: pt })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{request.passengers} passageiro{request.passengers > 1 ? 's' : ''}</span>
                  </div>

                  {specialNeedsLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {specialNeedsLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-800"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {request.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      "{request.notes}"
                    </p>
                  )}

                  <div className="flex gap-2 mt-2">
                    {(request.status === 'NEW' || request.status === 'TRIAGE') && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedRequestId(request.id);
                          setShowMatchDialog(true);
                        }}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Propor Match
                      </Button>
                    )}
                    {request.status !== 'DONE' && request.status !== 'CANCELLED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateStatus.mutate(
                            { entityType: 'request', entityId: request.id, newStatus: 'DONE' },
                            {
                              onSuccess: () => toast({ title: 'Pedido arquivado' }),
                              onError: () => toast({ title: 'Erro ao arquivar', variant: 'destructive' }),
                            }
                          );
                        }}
                        disabled={updateStatus.isPending}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Arquivar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Match */}
      <MatchDialog
        open={showMatchDialog}
        onOpenChange={setShowMatchDialog}
        request={selectedRequest}
        compatibleOffers={compatibleOffers || []}
      />
    </div>
  );
}
