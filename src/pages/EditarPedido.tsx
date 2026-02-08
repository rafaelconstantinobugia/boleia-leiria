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
import { useRideRequestByToken, useUpdateRideRequest, useCancelRideRequest } from '@/hooks/useRideRequests';
import { rideRequestSchema, type RideRequestFormData } from '@/lib/validation';
import { SPECIAL_NEEDS_OPTIONS, REQUEST_STATUS_LABELS, REQUEST_STATUS_COLORS } from '@/lib/constants';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

export default function EditarPedido() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: request, isLoading, error } = useRideRequestByToken(token || '');
  const updateRequest = useUpdateRideRequest();
  const cancelRequest = useCancelRideRequest();
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
    },
  });

  useEffect(() => {
    if (request) {
      const startDate = new Date(request.window_start);
      const endDate = new Date(request.window_end);
      
      form.reset({
        requester_name: request.requester_name,
        requester_phone: request.requester_phone.replace('+351', ''),
        pickup_location_text: request.pickup_location_text,
        dropoff_location_text: request.dropoff_location_text,
        window_start: startDate,
        window_end: endDate,
        passengers: request.passengers,
        special_needs: request.special_needs || [],
        notes: request.notes || '',
      });
      
      setWindowStartDate(startDate);
      setWindowEndDate(endDate);
    }
  }, [request, form]);

  async function onSubmit(data: RideRequestFormData) {
    if (!token) return;

    try {
      await updateRequest.mutateAsync({
        token,
        data: {
          requester_name: data.requester_name,
          requester_phone: data.requester_phone,
          pickup_location_text: data.pickup_location_text,
          dropoff_location_text: data.dropoff_location_text,
          window_start: data.window_start.toISOString(),
          window_end: data.window_end.toISOString(),
          passengers: data.passengers,
          special_needs: data.special_needs || [],
          notes: data.notes || null,
        },
      });

      toast({
        title: 'Pedido atualizado',
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
      await cancelRequest.mutateAsync(token);
      toast({
        title: 'Pedido cancelado',
        description: 'O seu pedido foi cancelado com sucesso.',
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

  const isCancelled = request.status === 'CANCELLED';
  const isDone = request.status === 'DONE';
  const isEditable = !isCancelled && !isDone;

  return (
    <PageLayout title="Editar Pedido">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <StatusBadge
            status={request.status}
            labels={REQUEST_STATUS_LABELS}
            colors={REQUEST_STATUS_COLORS}
          />
          <p className="text-sm text-muted-foreground">
            Atualizado: {format(new Date(request.updated_at), "d MMM HH:mm", { locale: pt })}
          </p>
        </div>

        {!isEditable && (
          <Alert variant={isCancelled ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {isCancelled ? 'Pedido Cancelado' : 'Pedido Concluído'}
            </AlertTitle>
            <AlertDescription>
              Este pedido não pode ser editado.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="requester_name"
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
              name="requester_phone"
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

            <FormField
              control={form.control}
              name="pickup_location_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local de Partida *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!isEditable} />
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
                    <Input {...field} disabled={!isEditable} />
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
                name="window_end"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data/Hora Fim *</FormLabel>
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
              name="passengers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Passageiros *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      disabled={!isEditable}
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
                  disabled={updateRequest.isPending}
                >
                  {updateRequest.isPending ? (
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
                      Cancelar Pedido
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancelar Pedido?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser revertida. O seu pedido será cancelado
                        e removido da lista de pedidos ativos.
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
