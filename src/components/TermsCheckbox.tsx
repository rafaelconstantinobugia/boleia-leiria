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
                      <p className="text-xs italic">
                        (Adaptado ao contexto jurídico português – RGPD e Lei n.º 58/2019)
                      </p>

                      <h3 className="font-semibold text-foreground">1. Identificação do Grupo Cívico</h3>
                      <p>
                        O presente termo aplica-se ao Grupo Vamos Ajudar Leiria (doravante designado "Grupo"), 
                        uma estrutura informal, não constituída como associação, fundação ou pessoa coletiva, 
                        sem fins lucrativos, de natureza cívica, social e comunitária.
                      </p>
                      <p>
                        O Grupo atua de forma autónoma, voluntária e independente, não estando sujeito a 
                        regime jurídico associativo nem a obrigações próprias de pessoas coletivas formalmente 
                        constituídas, sem prejuízo do cumprimento da legislação aplicável em matéria de proteção de dados.
                      </p>

                      <h3 className="font-semibold text-foreground">2. Âmbito do Consentimento</h3>
                      <p>
                        Ao fornecer voluntariamente os seus dados pessoais, o titular declara, de forma livre, 
                        específica, informada e inequívoca, que autoriza expressamente o Grupo a proceder ao 
                        tratamento dos seus dados pessoais nos termos do presente documento.
                      </p>
                      <p>O consentimento abrange todos os dados fornecidos direta ou indiretamente, incluindo, mas não se limitando a:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>nome, contacto telefónico, endereço eletrónico;</li>
                        <li>dados de localização ou área geográfica;</li>
                        <li>informações sobre disponibilidade, competências, interesses cívicos;</li>
                        <li>comunicações, mensagens, registos de participação;</li>
                        <li>imagens, fotografias, vídeos ou áudios captados no âmbito das atividades.</li>
                      </ul>

                      <h3 className="font-semibold text-foreground">3. Finalidades do Tratamento</h3>
                      <p>Os dados pessoais poderão ser utilizados para todas as finalidades relacionadas, direta ou indiretamente, com a atividade do Grupo, incluindo, designadamente:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>organização, gestão e coordenação de voluntários;</li>
                        <li>comunicação interna e externa;</li>
                        <li>planeamento e execução de iniciativas cívicas, sociais, comunitárias ou informativas;</li>
                        <li>registo histórico e documental das atividades;</li>
                        <li>divulgação de ações, eventos ou iniciativas, em qualquer meio ou plataforma;</li>
                        <li>adaptação, evolução ou reformulação futura das atividades do Grupo.</li>
                      </ul>
                      <p>
                        O titular reconhece que as atividades do Grupo são dinâmicas e evolutivas, aceitando 
                        que os dados possam ser utilizados para finalidades futuras compatíveis com o seu envolvimento cívico.
                      </p>

                      <h3 className="font-semibold text-foreground">4. Fundamentos de Licitude</h3>
                      <p>O tratamento dos dados assenta cumulativamente nos seguintes fundamentos legais:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Consentimento do titular (art.º 6.º, n.º 1, al. a) do RGPD);</li>
                        <li>Interesse legítimo do Grupo na prossecução das suas atividades cívicas (art.º 6.º, n.º 1, al. f));</li>
                        <li>Participação voluntária do titular nas iniciativas promovidas.</li>
                      </ul>

                      <h3 className="font-semibold text-foreground">5. Partilha de Dados</h3>
                      <p>O titular autoriza o Grupo a:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>partilhar os dados internamente entre membros organizadores;</li>
                        <li>comunicar dados a terceiros sempre que tal seja necessário à concretização das atividades;</li>
                        <li>utilizar plataformas digitais, serviços de comunicação ou armazenamento, nacionais ou internacionais.</li>
                      </ul>

                      <h3 className="font-semibold text-foreground">6. Conservação dos Dados</h3>
                      <p>
                        Os dados poderão ser conservados por tempo indeterminado, enquanto se mantiverem 
                        relevantes para as finalidades acima descritas, ou até ao exercício do direito de 
                        retirada de consentimento, sem prejuízo de obrigações legais ou de interesse legítimo.
                      </p>

                      <h3 className="font-semibold text-foreground">7. Direitos do Titular</h3>
                      <p>Nos termos do RGPD e da Lei n.º 58/2019, o titular pode, a qualquer momento:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>solicitar acesso, retificação ou apagamento dos dados;</li>
                        <li>retirar o consentimento, sem comprometer a licitude do tratamento anterior;</li>
                        <li>opor-se a determinados tratamentos, quando legalmente admissível.</li>
                      </ul>
                      <p>
                        O exercício destes direitos poderá, contudo, limitar ou inviabilizar a continuidade 
                        da participação do titular nas atividades do Grupo.
                      </p>

                      <h3 className="font-semibold text-foreground">8. Limitação de Responsabilidade</h3>
                      <p>O Grupo compromete-se a adotar medidas razoáveis de segurança, mas:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>não garante a inexistência absoluta de riscos;</li>
                        <li>não se responsabiliza por utilizações indiretas, incidentais ou consequências não previsíveis;</li>
                        <li>exclui a responsabilidade na máxima extensão permitida por lei.</li>
                      </ul>

                      <h3 className="font-semibold text-foreground">9. Confirmação</h3>
                      <p>
                        Ao submeter os seus dados e colaborar com o Grupo, o titular declara ter lido, 
                        compreendido e aceite integralmente os presentes Termos e Condições.
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
