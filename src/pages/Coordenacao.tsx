import { useState } from 'react';
import { Loader2, Lock, LogOut, RefreshCw } from 'lucide-react';

import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/contexts/AdminContext';
import { CoordPedidos } from '@/components/coordination/CoordPedidos';
import { CoordOfertas } from '@/components/coordination/CoordOfertas';
import { CoordMatches } from '@/components/coordination/CoordMatches';
import { supabase } from '@/integrations/supabase/client';
import { syncToGoogleSheets } from '@/lib/syncGoogleSheets';

export default function Coordenacao() {
  const { isAdmin, login, logout } = useAdmin();
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsLoading(true);
    try {
      const success = await login(pin);
      if (success) {
        toast({
          title: 'Acesso autorizado',
          description: 'Bem-vindo à área de coordenação.',
        });
        setPin('');
      } else {
        toast({
          title: 'PIN incorreto',
          description: 'Por favor verifique o PIN e tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAdmin) {
    return (
      <PageLayout title="Área de Coordenação">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Acesso Restrito</CardTitle>
              <CardDescription>
                Introduza o PIN de coordenação para aceder a esta área.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="PIN de acesso"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-lg tracking-widest"
                  maxLength={10}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !pin.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A verificar...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Coordenação">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Painel de Coordenação</h2>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="pedidos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="ofertas">Ofertas</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos">
            <CoordPedidos />
          </TabsContent>

          <TabsContent value="ofertas">
            <CoordOfertas />
          </TabsContent>

          <TabsContent value="matches">
            <CoordMatches />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
