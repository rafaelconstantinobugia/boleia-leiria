import { Link } from 'react-router-dom';
import { Car, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';

const Index = () => {
  return (
    <PageLayout>
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Boleias Solidárias
          </h1>
          <p className="text-muted-foreground">
            Coordenação de transporte entre voluntários
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <Button
            asChild
            size="lg"
            className="h-20 text-lg"
          >
            <Link to="/novo-pedido">
              <Users className="mr-3 h-6 w-6" />
              Preciso de Boleia
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="secondary"
            className="h-20 text-lg"
          >
            <Link to="/nova-oferta">
              <Car className="mr-3 h-6 w-6" />
              Posso Dar Boleia
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link
            to="/coordenacao"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Área de Coordenação
          </Link>
          <a
            href="/termos_e_condicoes.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Termos e Condições
          </a>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
