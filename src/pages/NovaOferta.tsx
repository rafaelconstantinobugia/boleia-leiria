import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';

import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useToast } from '@/hooks/use-toast';
import { useCreateRideOffer } from '@/hooks/useRideOffers';
import { rideOfferSchema, type RideOfferFormData } from '@/lib/validation';
import { EQUIPMENT_OPTIONS, VEHICLE_TYPES, DISTANCE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { TermsCheckbox } from '@/components/TermsCheckbox';

export default function NovaOferta() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createOffer = useCreateRideOffer();
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
      honeypot: '',
      accept_terms: false,
    },
  });

  async function onSubmit(data: RideOfferFormData) {
    // Verificar honeypot
    if (data.honeypot && data.honeypot.length > 0) {
      toast({
        title: 'Erro',
        description: 'Submissão inválida.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await createOffer.mutateAsync({
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
        status: 'AVAILABLE',
      });

      navigate(`/oferta-criada/${result.edit_token}`);
    } catch (error) {
      toast({
        title: 'Erro ao criar oferta',
        description: 'Por favor tente novamente.',
        variant: 'destructive',
      });
    }
  }

  return (
    <PageLayout title="Nova Oferta de Boleia">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo honeypot invisível */}
          <div className="hidden" aria-hidden="true">
            <FormField
              control={form.control}
              name="honeypot"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} tabIndex={-1} autoComplete="off" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="driver_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input placeholder="O seu nome" {...field} />
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
                  <Input placeholder="912345678" type="tel" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <Input placeholder="Ex: Lisboa, Almada, Setúbal" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP HH:mm', { locale: pt })
                          ) : (
                            <span>Selecione data e hora</span>
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
                          if (date) {
                            const now = new Date();
                            date.setHours(now.getHours() + 1);
                            date.setMinutes(0);
                            field.onChange(date);
                          }
                        }}
                        disabled={(date) => date < new Date()}
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
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP HH:mm', { locale: pt })
                          ) : (
                            <span>Selecione data e hora</span>
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
                          if (date) {
                            date.setHours(23);
                            date.setMinutes(59);
                            field.onChange(date);
                          }
                        }}
                        disabled={(date) => {
                          const start = form.getValues('time_window_start');
                          return date < (start || new Date());
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
                  <Textarea
                    placeholder="Informações adicionais relevantes..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={createOffer.isPending}
          >
            {createOffer.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A criar oferta...
              </>
            ) : (
              'Criar Oferta'
            )}
          </Button>
        </form>
      </Form>
    </PageLayout>
  );
}
