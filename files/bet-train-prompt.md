# Prompt para o Antigravity — App Bet Train

Copie e cole o conteúdo abaixo no Antigravity para iniciar a construção do app.

---

## Contexto do Projeto

Construa um aplicativo web chamado **Bet Train**, um diário de treino pessoal para academia, com histórico de exercícios e medidas corporais. O app será usado principalmente pelo celular (mobile-first) e hospedado na Vercel, com banco de dados e autenticação no Supabase.

## Stack Técnica (obrigatória)

- **Framework:** Next.js 14+ (App Router), TypeScript
- **Estilo:** Tailwind CSS
- **Banco de dados e autenticação:** Supabase (Postgres + Supabase Auth + Row Level Security)
- **Login:** Autenticação via Google (OAuth), usando `@supabase/ssr` e `@supabase/supabase-js`
- **Gráficos do dashboard:** Recharts
- **Deploy:** Vercel (motivo: integração nativa, zero-config, suporte a Server Components e API Routes para manter chaves do Supabase seguras no servidor)
- **PWA:** configurar manifest e ícones para permitir "adicionar à tela inicial" no celular

## Arquitetura Obrigatória (Separation of Concerns)

Siga rigorosamente três camadas, sem misturar responsabilidades:

**1. Services (`/src/services/`)** — única camada que fala com o Supabase. Faz requisições, trata erro de dados, retorna dados brutos/transformados. Não contém `useState`, `useEffect` nem JSX.

**2. Custom Hooks (`/src/hooks/`)** — gerenciam estado e regras de negócio. Chamam os services, tratam erro em nível de aplicação, expõem apenas o que o componente precisa. Não contêm JSX.

**3. Components/Pages (`/src/components/`, `/src/app/`)** — apenas renderização e chamada aos hooks. Não fazem chamada direta ao Supabase.

Fluxo esperado: `Component → Hook → Service → Supabase → Service → Hook → Component`.

### Estrutura de pastas

```
src/
├── app/                          # rotas (App Router)
│   ├── login/
│   ├── dashboard/
│   ├── treino/
│   ├── historico/
│   └── perfil/
├── components/
│   ├── ui/                       # botões, inputs, cards genéricos
│   ├── treino/
│   ├── medidas/
│   └── dashboard/
├── hooks/
│   ├── useAuth.ts
│   ├── useTreinos.ts
│   ├── useExercicios.ts
│   ├── useMedidasCorporais.ts
│   └── usePerfil.ts
├── services/
│   ├── supabaseClient.ts
│   ├── authService.ts
│   ├── treinoService.ts
│   ├── exercicioService.ts
│   ├── medidasService.ts
│   └── perfilService.ts
├── types/
│   ├── treino.types.ts
│   ├── exercicio.types.ts
│   ├── medidas.types.ts
│   └── perfil.types.ts
└── utils/
    ├── formatters.ts
    └── validators.ts
```

## Banco de Dados (Supabase)

O schema SQL completo já está pronto no arquivo `bet-train-schema.sql` (anexo). Ele contém:

- `profiles` — nome, telefone, data de nascimento, altura (criado automaticamente no primeiro login via trigger)
- `medidas_corporais` — peso, circunferência abdominal (umbigo e estômago), peitoral, bíceps direito e esquerdo, por data
- `categorias_exercicio` — Peito, Costas, Ombro, Bíceps, Tríceps, Perna, Abdômen, Cardio
- `exercicios` — biblioteca padrão (mais de 50 exercícios pré-cadastrados) + exercícios customizados por usuário
- `treinos` — sessão do dia, com aquecimento (equipamento + minutos)
- `treino_exercicios` — cada exercício lançado dentro de um treino (séries, repetições, peso, intervalo)

Todas as tabelas têm RLS habilitado: cada usuário só acessa os próprios dados. Exercícios e categorias são de leitura pública para qualquer usuário autenticado.

Execute o SQL no editor do Supabase antes de iniciar o desenvolvimento do front-end.

## Funcionalidades

### 1. Login
- Tela de login com botão "Entrar com Google"
- Usar Supabase Auth (`signInWithOAuth`, provider `google`)
- Redirecionar para o dashboard após login bem-sucedido
- Proteger todas as rotas internas (middleware do Next.js verificando sessão)

### 2. Cadastro de Treino
- Selecionar data (padrão: hoje)
- Aquecimento: dropdown de equipamento (Esteira, Bicicleta ergométrica, Elíptico, Escada, Remo, Outro) + campo de tempo em minutos
- Adicionar exercício: dropdown de categoria → dropdown de exercícios já cadastrados naquela categoria (puxado do banco) com opção de criar exercício customizado → séries, repetições, peso (aceitar texto livre, ex: "5/6/7" para drop-set), intervalo em segundos
- Lista de exercícios adicionados na sessão atual (rascunho em estado local, não salvo até finalizar)
- Botão "Finalizar treino" grava o treino + todos os exercícios no Supabase em uma transação lógica (criar treino, depois criar os itens vinculados ao `treino_id`)

### 3. Menu de Dados Pessoais
- Editar nome, telefone, data de nascimento, altura
- Editar/adicionar medidas corporais: peso, circunferência abdominal (umbigo e estômago), peitoral, bíceps direito e esquerdo, com data
- Validar campos obrigatórios antes de salvar

### 4. Histórico
- Lista de treinos já lançados, mais recente primeiro, agrupados por data, mostrando todos os exercícios de cada sessão
- Lista de medidas corporais já lançadas, mais recente primeiro
- Permitir editar e excluir cada registro (com confirmação antes de excluir)

### 5. Dashboard
- Cards com métricas relevantes: total de treinos no mês, peso atual vs. peso inicial, dias desde o último treino, total de exercícios realizados
- Gráfico de evolução do peso ao longo do tempo (linha)
- Gráfico de evolução das medidas corporais (umbigo, peitoral, bíceps) ao longo do tempo
- Gráfico de frequência de treinos por semana/mês
- Gráfico de distribuição de treinos por grupo muscular (quais categorias mais treinadas)

## Padrões de Código Obrigatórios

- Comunicação e nomes de variáveis/funções: **Português do Brasil**, nomes autoexplicativos, sem abreviações (`buscarTreinos`, não `getTr`)
- Funções com responsabilidade única — nunca uma função que busca dado, transforma e atualiza UI ao mesmo tempo
- `async/await` sempre, nunca callbacks encadeados
- Todo `service` usa `try/catch` com erro relançado (`throw`) para o hook tratar
- Todo `hook` expõe: dado, estado de carregamento (`carregando`), erro (`erro`) e funções de ação
- Nenhuma chamada direta ao Supabase dentro de componentes — sempre via hook
- Componentes recebem dados prontos dos hooks e apenas renderizam
- Tratamento de erro visível ao usuário (mensagens claras, nunca apenas `console.log`)
- Mobile-first: testar cada tela em viewport de celular (largura ~390px) antes de considerar pronta

## Entregável

1. Projeto Next.js completo, seguindo a estrutura de pastas acima
2. Schema SQL já aplicado no Supabase (arquivo anexo)
3. Variáveis de ambiente documentadas em `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. README com passos para configurar OAuth do Google no Supabase e rodar o projeto localmente
5. App pronto para deploy direto na Vercel (conectar repositório e configurar as variáveis de ambiente no painel)
