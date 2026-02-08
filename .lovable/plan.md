

# CRM de Boleias - Plano de Implementação

## 🎯 Visão Geral
Uma aplicação mobile-first em PT-PT para coordenar boleias entre voluntários e pessoas que precisam de transporte. Sem contas de utilizador, com segurança baseada em tokens privados e PIN de administração.

---

## Fase 1: Estrutura Base e Páginas Públicas

### Página Inicial
- Dois botões grandes e claros: "Preciso de Boleia" e "Posso Dar Boleia"
- Link discreto para "Área de Coordenação"
- Design limpo, cores sóbrias, muito legível em telemóvel

### Formulário de Pedido de Boleia
- Campos organizados por prioridade (nome, telefone, local de partida, destino, data/hora, nº de passageiros)
- Opções de necessidades especiais (idosos, mobilidade reduzida, crianças)
- Campo de notas opcional
- Validação de telefone PT (+351 / 9XXXXXXXX)
- Proteção anti-spam (honeypot invisível)

### Formulário de Oferta de Boleia
- Nome, telefone, tipo de veículo, lugares disponíveis
- Zona de partida e disponibilidade de distância
- Janela temporal disponível
- Equipamento especial (reboque, espaço para ferramentas)

### Páginas de Confirmação
- Após submeter, mostra mensagem de sucesso
- **Link privado único** para editar/cancelar (com aviso para guardar)
- Botão para copiar link facilmente
- Mostra resumo do pedido/oferta criado

---

## Fase 2: Base de Dados e Lógica

### Tabelas Principais
- **Pedidos** (RideRequest): todos os dados do pedido + token de edição + estado
- **Ofertas** (RideOffer): todos os dados da oferta + token de edição + estado
- **Matches**: ligação entre pedido e oferta + dados do coordenador
- **Log de Coordenação**: auditoria de ações

### Estados e Transições
- Pedidos: Novo → Em Triagem → Confirmado → Em Curso → Concluído/Cancelado
- Ofertas: Disponível → Reservada → Em Curso → Concluída/Cancelada
- Lógica automática: ao confirmar match, atualiza estados de ambos os lados

---

## Fase 3: Página de Edição (via Link Privado)

### Acesso por Token
- URL única com token secreto (ex: `/editar/abc123xyz`)
- Permite editar todos os campos do próprio pedido/oferta
- Botão para cancelar com confirmação
- Mostra estado atual e histórico simples

---

## Fase 4: Painel de Coordenação

### Acesso por PIN
- Ecrã simples com campo de PIN (sem contas)
- PIN validado contra variável de ambiente

### Dashboard com 3 Separadores
1. **Pedidos**: lista com filtros (estado, zona, janela temporal, passageiros, necessidades especiais)
2. **Ofertas**: lista com filtros (estado, lugares, área, distância)
3. **Matches**: ver ligações feitas, pendentes e concluídas

### Funcionalidades de Coordenação
- Ver detalhes completos (telefones não mascarados)
- Botão "Propor Match" que sugere ofertas compatíveis
- Ao criar match: pede nome e telefone do coordenador
- Ações rápidas: marcar em curso, concluído, cancelar
- Contadores de estados (ex: "Novo: 12")

### Matching Inteligente
- Filtra ofertas por: zona aproximada (texto), janela temporal sobreposta, lugares suficientes
- Modal para selecionar oferta e confirmar match

---

## Fase 5: Segurança e Anti-Abuso

### Proteções Implementadas
- Rate limiting por IP (limite de submissões por minuto)
- Campo honeypot invisível para bots
- Validação rigorosa de telefone PT
- Dados pessoais mascarados em listas públicas (ex: "João S.", "962***040")
- PIN de admin em variável de ambiente segura

### Privacidade
- Listas públicas só mostram dados parciais
- Telefones completos apenas no painel de coordenação (com PIN)
- Cada pessoa só edita o próprio registo via link único

---

## Fase 6: Extras e Polimento

### Preparação para Comunicação
- Gerar mensagem pronta para copiar/colar no WhatsApp
- Template com detalhes do match (sem integração API necessária)

### UX Final
- Navegação inferior (Home / Pedidos / Ofertas / Coordenação)
- Chips coloridos para estados
- "Última atualização" visível
- Feedback visual claro em todas as ações
- Responsivo mas otimizado para telemóvel

---

## Resumo Técnico
- **Frontend**: React com Tailwind CSS, componentes shadcn/ui
- **Backend**: Supabase (base de dados PostgreSQL + Edge Functions)
- **Sem login**: tokens de edição + PIN de admin
- **Idioma**: PT-PT em toda a interface

