import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, Loader2, AlertTriangle } from 'lucide-react';

import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRideOfferByToken, useUpdateRideOffer, useCancelRideOffer } from '@/hooks/useRideOffers';
import { rideOfferSchema, type RideOfferFormData } from '@/lib/validation';
import { EQUIPMENT_OPTIONS, VEHICLE_TYPES, DISTANCE_LABELS, OFFER_STATUS_LABELS, OFFER_STATUS_COLORS } from '@/lib/constants';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

export default function EditarOferta() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: offer, isLoading, error } = useRideOfferByToken(token || '');
  const updateOffer = useUpdateRideOffer();
  const cancelOffer = useCancelRideOffer();
  const [windowStartDate, setWindowStartDate] = useState<Date>();
  const [windowEndDate, setWindowEndDate] = useState<Date>();

  const form = useForm<RideOfferFormData>({
    resolver: zodResolver(rideOfferSchema),
    defaultValues: {
      driver_name: '',
      driver_phone: '',
      vehicle_type: '',
      seats_available: 4,
      departure_area_text: '',
      can_go_distance: 'LOCAL',
      equipment: [],
      notes: '',
    },
  });

  useEffect(() => {
    if (offer) {
      const startDate = new Date(offer.time_window_start);
      const endDate = new Date(offer.time_window_end);
      
      form.reset({
        driver_name: offer.driver_name,
        driver_phone: offer.driver_phone.replace('+351', ''),
        vehicle_type: offer.vehicle_type,
        seats_available: offer.seats_available,
        departure_area_text: offer.departure_area_text,
        can_go_distance: offer.can_go_distance as 'LOCAL' | 'UP_TO_1H' | 'ANY',
        time_window_start: startDate,
        time_window_end: endDate,
        equipment: offer.equipment || [],
        notes: offer.notes || '',
      });
      
      setWindowStartDate(startDate);
      setWindowEndDate(endDate);
    }
  }, [offer, form]);

  async function onSubmit(data: RideOfferFormData) {
    if (!token) return;

    try {
      await updateOffer.mutateAsync({
        token,
        data: {
          driver_name: data.driver_name,
          driver_phone: data.driver_phone,
          vehicle_type: data.vehicle_type,
          seats_available: data.seats_available,
          departure_area_text: data.departure_area_text,
          can_go_distance: data.can_go_distance,
          time_window_start: data.time_window_start.toISOString(),
          time_window_end: data.time_window_end.toISOString(),
          equipment: data.equipment || [],
          notes: data.notes || null,
        },
      });

      toast({
        title: 'Oferta atualizada',
        description: 'As alterações foram guardadas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Por favor tente novamente.',
        variant: 'destructive',
      });
    }
  }

  async function handleCancel() {
    if (!token) return;

    try {
      await cancelOffer.mutateAsync(token);
      toast({
        title: 'Oferta cancelada',
        description: 'A sua oferta foi cancelada com sucesso.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Por favor tente novamente.',
        variant: 'destructive',
      });
    }
  }

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

  const isCancelled = offer.status === 'CANCELLED';
  const isDone = offer.status === 'DONE';
  const isEditable = !isCancelled && !isDone;

  return (
    <PageLayout title="Editar Oferta">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <StatusBadge
            status={offer.status}
            labels={OFFER_STATUS_LABELS}
            colors={OFFER_STATUS_COLORS}
          />
          <p className="text-sm text-muted-foreground">
            Atualizado: {format(new Date(offer.updated_at), "d MMM HH:mm", { locale: pt })}
          </p>
        </div>

        {!isEditable && (
          <Alert variant={isCancelled ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {isCancelled ? 'Oferta Cancelada' : 'Oferta Concluída'}
            </AlertTitle>
            <AlertDescription>
              Esta oferta não pode ser editada.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="driver_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driver_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone *</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} disabled={!isEditable} />
                  </FormControl>
                  <FormDescription>
                    Formato: 9XXXXXXXX ou +351XXXXXXXXX
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Veículo *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!isEditable}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VEHICLE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seats_available"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lugares Disponíveis *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        disabled={!isEditable}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="departure_area_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona de Partida *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="can_go_distance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distância Disponível *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditable}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(DISTANCE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="time_window_start"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Disponível a partir de *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={!isEditable}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP HH:mm', { locale: pt })
                            ) : (
                              <span>Selecione</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={windowStartDate}
                          onSelect={(date) => {
                            setWindowStartDate(date);
                            if (date && field.value) {
                              date.setHours(field.value.getHours());
                              date.setMinutes(field.value.getMinutes());
                              field.onChange(date);
                            }
                          }}
                          initialFocus
                        />
                        {windowStartDate && (
                          <div className="border-t p-3">
                            <Input
                              type="time"
                              value={field.value ? format(field.value, 'HH:mm') : ''}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(windowStartDate);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                field.onChange(newDate);
                              }}
                            />
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_window_end"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Disponível até *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            disabled={!isEditable}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP HH:mm', { locale: pt })
                            ) : (
                              <span>Selecione</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={windowEndDate}
                          onSelect={(date) => {
                            setWindowEndDate(date);
                            if (date && field.value) {
                              date.setHours(field.value.getHours());
                              date.setMinutes(field.value.getMinutes());
                              field.onChange(date);
                            }
                          }}
                          initialFocus
                        />
                        {windowEndDate && (
                          <div className="border-t p-3">
                            <Input
                              type="time"
                              value={field.value ? format(field.value, 'HH:mm') : ''}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':');
                                const newDate = new Date(windowEndDate);
                                newDate.setHours(parseInt(hours), parseInt(minutes));
                                field.onChange(newDate);
                              }}
                            />
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="equipment"
              render={() => (
                <FormItem>
                  <FormLabel>Equipamento Disponível</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {EQUIPMENT_OPTIONS.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="equipment"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                disabled={!isEditable}
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, option.value]);
                                  } else {
                                    field.onChange(current.filter((v) => v !== option.value));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionais</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={!isEditable} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditable && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateOffer.isPending}
                >
                  {updateOffer.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    'Guardar Alterações'
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="flex-1">
                      Cancelar Oferta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar Oferta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser revertida. A sua oferta será cancelada
                        e removida da lista de ofertas ativas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Voltar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sim, Cancelar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </form>
        </Form>

        <Button asChild variant="outline" className="w-full">
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    </PageLayout>
  );
}
