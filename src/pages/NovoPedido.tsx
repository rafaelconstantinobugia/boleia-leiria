import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, startOfDay } from 'date-fns';
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
import { useToast } from '@/hooks/use-toast';
import { useCreateRideRequest } from '@/hooks/useRideRequests';
import { rideRequestSchema, type RideRequestFormData } from '@/lib/validation';
import { SPECIAL_NEEDS_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { TermsCheckbox } from '@/components/TermsCheckbox';

export default function NovoPedido() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createRequest = useCreateRideRequest();
  const [windowStartDate, setWindowStartDate] = useState<Date>();
  const [windowEndDate, setWindowEndDate] = useState<Date>();

  const form = useForm<RideRequestFormData>({
    resolver: zodResolver(rideRequestSchema),
    defaultValues: {
      requester_name: '',
      requester_phone: '',
      pickup_location_text: '',
      dropoff_location_text: '',
      passengers: 1,
      special_needs: [],
      notes: '',
      honeypot: '',
      accept_terms: false,
    },
  });

  async function onSubmit(data: RideRequestFormData) {
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
      const result = await createRequest.mutateAsync({
        requester_name: data.requester_name,
        requester_phone: data.requester_phone,
        pickup_location_text: data.pickup_location_text,
        dropoff_location_text: data.dropoff_location_text,
        window_start: data.window_start.toISOString(),
        window_end: data.window_end.toISOString(),
        passengers: data.passengers,
        special_needs: data.special_needs || [],
        notes: data.notes || null,
        status: 'NEW',
      });

      navigate(`/pedido-criado/${result.edit_token}`);
    } catch (error) {
      toast({
        title: 'Erro ao criar pedido',
        description: 'Por favor tente novamente.',
        variant: 'destructive',
      });
    }
  }

  return (
    <PageLayout title="Novo Pedido de Boleia">
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
            name="requester_name"
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
            name="requester_phone"
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

          <FormField
            control={form.control}
            name="pickup_location_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local de Partida *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Rua Principal, Lisboa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dropoff_location_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Hospital de Santa Maria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="window_start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data/Hora Início *</FormLabel>
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
                        disabled={(date) => startOfDay(date) < startOfDay(new Date())}
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
              name="window_end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data/Hora Fim *</FormLabel>
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
                          const start = form.getValues('window_start');
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
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Passageiros *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="special_needs"
            render={() => (
              <FormItem>
                <FormLabel>Necessidades Especiais</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                  {SPECIAL_NEEDS_OPTIONS.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="special_needs"
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

          <TermsCheckbox control={form.control} name="accept_terms" />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={createRequest.isPending}
          >
            {createRequest.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A criar pedido...
              </>
            ) : (
              'Criar Pedido'
            )}
          </Button>
        </form>
      </Form>
    </PageLayout>
  );
}
