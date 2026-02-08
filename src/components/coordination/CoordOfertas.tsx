import { useState } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Search, Car, MapPin, Clock, Phone, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { useRideOffers } from '@/hooks/useRideOffers';
import { 
  OFFER_STATUS_LABELS, 
  OFFER_STATUS_COLORS, 
  EQUIPMENT_OPTIONS,
  VEHICLE_TYPES,
  DISTANCE_LABELS 
} from '@/lib/constants';

export function CoordOfertas() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  
  const { data: offers, isLoading } = useRideOffers({
    status: statusFilter,
    search: search.length > 2 ? search : undefined,
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por zona..."
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
            {Object.entries(OFFER_STATUS_LABELS).map(([value, label]) => (
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
      ) : offers?.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          Nenhuma oferta encontrada
        </div>
      ) : (
        <div className="space-y-3">
          {offers?.map((offer) => {
            const equipmentLabels = (offer.equipment || [])
              .map((eq) => EQUIPMENT_OPTIONS.find((opt) => opt.value === eq)?.label)
              .filter(Boolean);

            const vehicleLabel = VEHICLE_TYPES.find((v) => v.value === offer.vehicle_type)?.label || offer.vehicle_type;

            return (
              <Card key={offer.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {offer.driver_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {offer.driver_phone}
                      </CardDescription>
                    </div>
                    <StatusBadge
                      status={offer.status}
                      labels={OFFER_STATUS_LABELS}
                      colors={OFFER_STATUS_COLORS}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>{vehicleLabel} • {offer.seats_available} lugares</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{offer.departure_area_text}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(offer.time_window_start), "d MMM HH:mm", { locale: pt })} - {' '}
                      {format(new Date(offer.time_window_end), "HH:mm", { locale: pt })}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {DISTANCE_LABELS[offer.can_go_distance]}
                  </p>

                  {equipmentLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {equipmentLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {offer.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      "{offer.notes}"
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
