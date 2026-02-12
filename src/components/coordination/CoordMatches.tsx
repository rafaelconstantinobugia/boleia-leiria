import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Loader2, Phone, MapPin, Users, Car, Copy, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { useAdminMatches } from "@/hooks/useAdminData";
import { useUpdateMatchStatus } from "@/hooks/useMatches";
import { MATCH_STATUS_LABELS, MATCH_STATUS_COLORS, VEHICLE_TYPES } from "@/lib/constants";

export function CoordMatches() {
  const { toast } = useToast();
  const { adminPin } = useAdmin();
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: matches, isLoading } = useAdminMatches(adminPin, {
    status: statusFilter,
  });

  const updateStatus = useUpdateMatchStatus();

  async function handleStatusChange(matchId: string, newStatus: "PROPOSED" | "CONFIRMED" | "CANCELLED" | "DONE") {
    try {
      await updateStatus.mutateAsync({ matchId, status: newStatus });
      toast({
        title: "Estado atualizado",
        description: `Match marcado como ${MATCH_STATUS_LABELS[newStatus]}.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Por favor tente novamente.",
        variant: "destructive",
      });
    }
  }

  function generateWhatsAppMessage(match: any) {
    const request = match.ride_requests;
    const offer = match.ride_offers;

    const message = `🚗 *Boleia Confirmada*

📍 *Trajeto:*
De: ${request.pickup_location_text}
Para: ${request.dropoff_location_text}

👤 *Passageiro:*
${request.requester_name}
📱 ${request.requester_phone}
👥 ${request.passengers} pessoa(s)

🚙 *Condutor:*
${offer.driver_name}
📱 ${offer.driver_phone}
${VEHICLE_TYPES.find((v: any) => v.value === offer.vehicle_type)?.label || offer.vehicle_type}

📅 *Janela Temporal:*
${format(new Date(request.window_start), "d 'de' MMMM 'às' HH:mm", { locale: pt })}

Sugestão: ${match.coordinator_name} (${match.coordinator_phone})`;

    return message;
  }

  async function copyMessage(match: any) {
    const message = generateWhatsAppMessage(match);
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Mensagem copiada!",
        description: "Cole no WhatsApp para enviar.",
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Por favor copie manualmente.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex justify-end">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os estados</SelectItem>
            {Object.entries(MATCH_STATUS_LABELS).map(([value, label]) => (
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
      ) : matches?.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Nenhum match encontrado</div>
      ) : (
        <div className="space-y-4">
          {matches?.map((match: any) => {
            const request = match.ride_requests;
            const offer = match.ride_offers;
            const vehicleLabel = VEHICLE_TYPES.find((v) => v.value === offer.vehicle_type)?.label || offer.vehicle_type;

            return (
              <Card key={match.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">Match #{match.id.substring(0, 8)}</CardTitle>
                      <CardDescription>
                        Criado em {format(new Date(match.created_at), "d MMM 'às' HH:mm", { locale: pt })}
                      </CardDescription>
                    </div>
                    <StatusBadge status={match.status} labels={MATCH_STATUS_LABELS} colors={MATCH_STATUS_COLORS} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pedido */}
                  <div className="rounded-lg border p-3 space-y-1">
                    <p className="font-medium text-sm">Pedido</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{request.requester_name}</span>
                      <Phone className="h-3 w-3 text-muted-foreground ml-2" />
                      <span className="text-muted-foreground">{request.requester_phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span>
                        {request.pickup_location_text} → {request.dropoff_location_text}
                      </span>
                    </div>
                  </div>

                  {/* Oferta */}
                  <div className="rounded-lg border p-3 space-y-1">
                    <p className="font-medium text-sm">Oferta</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {offer.driver_name} • {vehicleLabel}
                      </span>
                      <Phone className="h-3 w-3 text-muted-foreground ml-2" />
                      <span className="text-muted-foreground">{offer.driver_phone}</span>
                    </div>
                  </div>

                  {/* Coordenador */}
                  <div className="text-xs text-muted-foreground">
                    Sugestão: {match.coordinator_name} ({match.coordinator_phone})
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyMessage(match)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Mensagem
                    </Button>

                    {match.status === "PROPOSED" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(match.id, "CONFIRMED")}
                        disabled={updateStatus.isPending}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirmar
                      </Button>
                    )}

                    {match.status === "CONFIRMED" && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusChange(match.id, "DONE")}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Concluído
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(match.id, "CANCELLED")}
                          disabled={updateStatus.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
