-- =====================================================================
-- BET TRAIN — MIGRATION 002: TEMPLATES DE TREINO, ATRIBUIÇÕES E EXECUÇÕES
-- =====================================================================
-- Pré-requisito: bet-train-schema.sql já aplicado.
-- Aditivo: não altera nem migra dados de `treinos` / `treino_exercicios`
-- (o diário pessoal atual continua funcionando como está).
-- Rodar este arquivo inteiro no SQL Editor do Supabase.
--
-- Fase A: tabelas (sem policies, para permitir referências cruzadas entre
--         elas nas policies da Fase B independente da ordem de criação).
-- Fase B: RLS + policies.
-- Fase C: índices.
-- =====================================================================

-- =====================================================================
-- FASE A — TABELAS
-- =====================================================================

-- 0. Papel do usuário (admin cria/atribui templates, usuario só executa)
alter table public.profiles
  add column role text not null default 'usuario' check (role in ('admin', 'usuario'));

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- 1. Templates de treino (molde criado pelo admin)
create table public.treino_templates (
  id uuid primary key default gen_random_uuid(),
  criado_por uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  aquecimento_equipamento text,
  aquecimento_minutos int,
  created_at timestamptz not null default now()
);

-- 2. Exercícios planejados do template (sem peso — item 4)
create table public.treino_template_exercicios (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.treino_templates(id) on delete cascade,
  exercicio_id uuid not null references public.exercicios(id),
  series int not null,
  repeticoes int not null,
  intervalo_segundos int not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- 3. Atribuições (vínculo template ↔ usuário + status)
create table public.treino_atribuicoes (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.treino_templates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  atribuido_por uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'em_andamento', 'concluido')),
  iniciado_em timestamptz,
  concluido_em timestamptz,
  duracao_total_segundos int,
  created_at timestamptz not null default now()
);

-- 4. Execuções (histórico do que de fato foi feito)
create table public.treino_execucoes (
  id uuid primary key default gen_random_uuid(),
  atribuicao_id uuid not null references public.treino_atribuicoes(id) on delete cascade,
  template_id uuid not null references public.treino_templates(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  iniciado_em timestamptz not null default now(),
  concluido_em timestamptz,
  duracao_total_segundos int,
  created_at timestamptz not null default now()
);

-- 5. Exercícios da execução (snapshot editável do template)
create table public.treino_execucao_exercicios (
  id uuid primary key default gen_random_uuid(),
  execucao_id uuid not null references public.treino_execucoes(id) on delete cascade,
  exercicio_id uuid not null references public.exercicios(id),
  intervalo_segundos int not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- 6. Séries (peso/reps editáveis por série — item 4)
create table public.treino_series (
  id uuid primary key default gen_random_uuid(),
  execucao_exercicio_id uuid not null references public.treino_execucao_exercicios(id) on delete cascade,
  numero_serie int not null,
  repeticoes int not null,
  peso_kg numeric(6, 2),
  concluida boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- =====================================================================
-- FASE B — RLS + POLICIES
-- =====================================================================

-- profiles: admin precisa enxergar todos os perfis para escolher a quem atribuir
create policy "Admin vê todos os perfis"
  on public.profiles for select
  using (public.is_admin());

-- treino_templates
alter table public.treino_templates enable row level security;

create policy "Vê templates próprios ou atribuídos"
  on public.treino_templates for select
  using (
    criado_por = auth.uid()
    or exists (
      select 1 from public.treino_atribuicoes a
      where a.template_id = treino_templates.id and a.user_id = auth.uid()
    )
  );

create policy "Admin cria templates"
  on public.treino_templates for insert
  with check (public.is_admin() and criado_por = auth.uid());

create policy "Admin edita os próprios templates"
  on public.treino_templates for update
  using (public.is_admin() and criado_por = auth.uid());

create policy "Admin exclui os próprios templates"
  on public.treino_templates for delete
  using (public.is_admin() and criado_por = auth.uid());

-- treino_template_exercicios
alter table public.treino_template_exercicios enable row level security;

create policy "Vê itens de templates acessíveis"
  on public.treino_template_exercicios for select
  using (
    exists (
      select 1 from public.treino_templates t
      where t.id = treino_template_exercicios.template_id
        and (
          t.criado_por = auth.uid()
          or exists (
            select 1 from public.treino_atribuicoes a
            where a.template_id = t.id and a.user_id = auth.uid()
          )
        )
    )
  );

create policy "Admin insere itens nos próprios templates"
  on public.treino_template_exercicios for insert
  with check (
    exists (
      select 1 from public.treino_templates t
      where t.id = treino_template_exercicios.template_id and t.criado_por = auth.uid()
    )
  );

create policy "Admin edita itens dos próprios templates"
  on public.treino_template_exercicios for update
  using (
    exists (
      select 1 from public.treino_templates t
      where t.id = treino_template_exercicios.template_id and t.criado_por = auth.uid()
    )
  );

create policy "Admin exclui itens dos próprios templates"
  on public.treino_template_exercicios for delete
  using (
    exists (
      select 1 from public.treino_templates t
      where t.id = treino_template_exercicios.template_id and t.criado_por = auth.uid()
    )
  );

-- treino_atribuicoes
alter table public.treino_atribuicoes enable row level security;

create policy "Vê as próprias atribuições ou as que atribuiu"
  on public.treino_atribuicoes for select
  using (user_id = auth.uid() or atribuido_por = auth.uid());

create policy "Admin atribui templates que criou"
  on public.treino_atribuicoes for insert
  with check (
    public.is_admin()
    and atribuido_por = auth.uid()
    and exists (
      select 1 from public.treino_templates t
      where t.id = template_id and t.criado_por = auth.uid()
    )
  );

create policy "Usuário ou admin dono atualiza a atribuição"
  on public.treino_atribuicoes for update
  using (user_id = auth.uid() or atribuido_por = auth.uid());

-- treino_execucoes
alter table public.treino_execucoes enable row level security;

create policy "Usuário vê as próprias execuções"
  on public.treino_execucoes for select
  using (user_id = auth.uid());

create policy "Usuário cria as próprias execuções"
  on public.treino_execucoes for insert
  with check (user_id = auth.uid());

create policy "Usuário edita as próprias execuções"
  on public.treino_execucoes for update
  using (user_id = auth.uid());

-- treino_execucao_exercicios
alter table public.treino_execucao_exercicios enable row level security;

create policy "Usuário vê itens das próprias execuções"
  on public.treino_execucao_exercicios for select
  using (
    exists (
      select 1 from public.treino_execucoes e
      where e.id = treino_execucao_exercicios.execucao_id and e.user_id = auth.uid()
    )
  );

create policy "Usuário insere itens nas próprias execuções"
  on public.treino_execucao_exercicios for insert
  with check (
    exists (
      select 1 from public.treino_execucoes e
      where e.id = treino_execucao_exercicios.execucao_id and e.user_id = auth.uid()
    )
  );

create policy "Usuário edita itens das próprias execuções"
  on public.treino_execucao_exercicios for update
  using (
    exists (
      select 1 from public.treino_execucoes e
      where e.id = treino_execucao_exercicios.execucao_id and e.user_id = auth.uid()
    )
  );

-- treino_series
alter table public.treino_series enable row level security;

create policy "Usuário vê as próprias séries"
  on public.treino_series for select
  using (
    exists (
      select 1 from public.treino_execucao_exercicios ee
      join public.treino_execucoes e on e.id = ee.execucao_id
      where ee.id = treino_series.execucao_exercicio_id and e.user_id = auth.uid()
    )
  );

create policy "Usuário insere as próprias séries"
  on public.treino_series for insert
  with check (
    exists (
      select 1 from public.treino_execucao_exercicios ee
      join public.treino_execucoes e on e.id = ee.execucao_id
      where ee.id = treino_series.execucao_exercicio_id and e.user_id = auth.uid()
    )
  );

create policy "Usuário edita as próprias séries"
  on public.treino_series for update
  using (
    exists (
      select 1 from public.treino_execucao_exercicios ee
      join public.treino_execucoes e on e.id = ee.execucao_id
      where ee.id = treino_series.execucao_exercicio_id and e.user_id = auth.uid()
    )
  );


-- =====================================================================
-- FASE C — ÍNDICES
-- =====================================================================
create index idx_treino_atribuicoes_user_status on public.treino_atribuicoes (user_id, status);
create index idx_treino_atribuicoes_template on public.treino_atribuicoes (template_id);
create index idx_treino_execucoes_template_user on public.treino_execucoes (template_id, user_id, created_at desc);
create index idx_treino_execucao_exercicios_execucao on public.treino_execucao_exercicios (execucao_id);
create index idx_treino_series_execucao_exercicio on public.treino_series (execucao_exercicio_id);
create index idx_treino_template_exercicios_template on public.treino_template_exercicios (template_id);
