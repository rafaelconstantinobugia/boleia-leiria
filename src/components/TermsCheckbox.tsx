import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink } from 'lucide-react';
import { Control } from 'react-hook-form';

interface TermsCheckboxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: string;
}

export function TermsCheckbox({ control, name }: TermsCheckboxProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/50">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-normal cursor-pointer">
              Li e aceito os{' '}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-primary underline"
                  >
                    Termos e Condições
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Termos e Condições</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4 text-sm text-muted-foreground">
                      <h3 className="font-semibold text-foreground">1. Objetivo</h3>
                      <p>
                        A plataforma Boleias Solidárias Leiria tem como objetivo facilitar a 
                        coordenação de boleias voluntárias em situações de emergência ou 
                        catástrofe, conectando pessoas que necessitam de transporte com 
                        condutores voluntários.
                      </p>

                      <h3 className="font-semibold text-foreground">2. Natureza Voluntária</h3>
                      <p>
                        Este serviço é totalmente voluntário e gratuito. Os condutores 
                        oferecem os seus serviços de forma altruísta e não recebem 
                        qualquer compensação monetária.
                      </p>

                      <h3 className="font-semibold text-foreground">3. Responsabilidade</h3>
                      <p>
                        A plataforma atua apenas como intermediário na coordenação de 
                        boleias. Não nos responsabilizamos por:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Danos pessoais ou materiais ocorridos durante o transporte</li>
                        <li>Atrasos ou cancelamentos de boleias</li>
                        <li>Comportamento dos utilizadores</li>
                        <li>Estado dos veículos utilizados</li>
                      </ul>

                      <h3 className="font-semibold text-foreground">4. Proteção de Dados</h3>
                      <p>
                        Os dados pessoais fornecidos (nome e telefone) são utilizados 
                        exclusivamente para coordenação de boleias e são tratados de 
                        acordo com o RGPD. Os dados são:
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Parcialmente mascarados nas listagens públicas</li>
                        <li>Partilhados apenas quando há correspondência confirmada</li>
                        <li>Eliminados após conclusão do serviço</li>
                      </ul>

                      <h3 className="font-semibold text-foreground">5. Condições de Utilização</h3>
                      <p>Ao utilizar esta plataforma, compromete-se a:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Fornecer informações verdadeiras e atualizadas</li>
                        <li>Utilizar o serviço apenas para fins legítimos</li>
                        <li>Respeitar os outros utilizadores</li>
                        <li>Comunicar prontamente qualquer alteração ou cancelamento</li>
                      </ul>

                      <h3 className="font-semibold text-foreground">6. Condutores Voluntários</h3>
                      <p>Os condutores que oferecem boleias confirmam que:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Possuem carta de condução válida</li>
                        <li>O veículo está em condições adequadas e com seguro em dia</li>
                        <li>Estão em condições físicas e psicológicas para conduzir</li>
                        <li>Respeitam as regras de trânsito</li>
                      </ul>

                      <h3 className="font-semibold text-foreground">7. Passageiros</h3>
                      <p>Os passageiros que solicitam boleias comprometem-se a:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Estar no local combinado à hora marcada</li>
                        <li>Respeitar o condutor e o veículo</li>
                        <li>Utilizar cinto de segurança</li>
                        <li>Informar sobre necessidades especiais de mobilidade</li>
                      </ul>

                      <h3 className="font-semibold text-foreground">8. Contacto</h3>
                      <p>
                        Para questões relacionadas com a plataforma ou estes termos, 
                        contacte a equipa de coordenação através dos canais oficiais.
                      </p>

                      <div className="pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href="/termos_e_condicoes.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Descarregar PDF completo
                          </a>
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              {' '}*
            </FormLabel>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
}
