# Bet Train

Diário de treino pessoal para academia: cadastro de treinos, histórico e medidas corporais, com dashboard de evolução. Mobile-first, PWA (instalável na tela inicial do celular).

## Stack

- Next.js 14+ (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth + Row Level Security)
- Login via Google OAuth (`@supabase/ssr`)
- Recharts (gráficos do dashboard)
- Deploy: Vercel

## Arquitetura

```
Component/Page → Hook → Service → Supabase
```

- `src/services/` — única camada que fala com o Supabase.
- `src/hooks/` — estado e regras de negócio, chamam os services.
- `src/components/` e `src/app/` — apenas renderização, chamam os hooks.

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
3. Em **SQL Editor**, abra uma nova query, cole todo o conteúdo do arquivo [`files/bet-train-schema.sql`](files/bet-train-schema.sql) deste repositório e execute. Isso cria as tabelas, políticas de RLS, triggers e a biblioteca padrão de exercícios.

## 2. Configurar login com Google (OAuth)

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto (ou use um existente) e configure a **tela de consentimento OAuth**.
2. Em **Credenciais**, crie um **ID do cliente OAuth** do tipo "Aplicativo da Web".
3. Em **URIs de redirecionamento autorizados**, adicione a URL de callback do Supabase, no formato:
   `https://<SEU-PROJETO>.supabase.co/auth/v1/callback`
4. Copie o **Client ID** e o **Client Secret** gerados.
5. No painel do Supabase, vá em **Authentication → Providers → Google**, ative o provider e cole o Client ID e Client Secret.
6. Em **Authentication → URL Configuration**, adicione as URLs de redirecionamento da sua aplicação (local e produção), por exemplo:
   - `http://localhost:3000/auth/callback`
   - `https://<seu-dominio-na-vercel>.vercel.app/auth/callback`

## 3. Rodar o projeto localmente

```bash
npm install
cp .env.example .env.local
```

Preencha o `.env.local` com os valores do seu projeto Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://<SEU-PROJETO>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

Depois:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## 4. Deploy na Vercel

1. Suba este repositório para o GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Em **Environment Variables**, adicione `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os mesmos valores do `.env.local`.
4. Faça o deploy. Depois, volte ao passo 2 e adicione a URL de produção (`https://<seu-dominio>.vercel.app/auth/callback`) nas **Redirect URLs** do Supabase.

## Estrutura de pastas

```
src/
├── app/                # rotas (App Router)
├── components/         # ui/, treino/, medidas/, perfil/, dashboard/
├── hooks/               # estado + regras de negócio
├── services/            # única camada que fala com o Supabase
├── types/
└── utils/
```

## PWA

O app inclui `manifest.json` e ícones em `public/icons/`. No celular, abra o site no navegador e use "Adicionar à tela inicial".
