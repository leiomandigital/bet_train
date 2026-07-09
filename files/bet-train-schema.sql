-- =====================================================================
-- BET TRAIN — SCHEMA SUPABASE
-- =====================================================================
-- Ordem de execução: rodar este arquivo inteiro no SQL Editor do Supabase.
-- Todas as tabelas usam RLS (Row Level Security) para isolar dados por usuário.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PERFIL DO USUÁRIO (dados pessoais)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  telefone text,
  data_nascimento date,
  altura_cm numeric(5,1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuário vê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário edita o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuário cria o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Cria o perfil automaticamente quando o usuário faz login pela primeira vez
create function public.criar_perfil_ao_cadastrar()
returns trigger as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute procedure public.criar_perfil_ao_cadastrar();


-- ---------------------------------------------------------------------
-- 2. MEDIDAS CORPORAIS (histórico)
-- ---------------------------------------------------------------------
create table public.medidas_corporais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null default current_date,
  peso_kg numeric(5,1) not null,
  circ_abdominal_umbigo_cm numeric(5,1),
  circ_abdominal_estomago_cm numeric(5,1),
  circ_peitoral_cm numeric(5,1),
  circ_biceps_direito_cm numeric(5,1),
  circ_biceps_esquerdo_cm numeric(5,1),
  created_at timestamptz not null default now()
);

alter table public.medidas_corporais enable row level security;

create policy "Usuário vê as próprias medidas"
  on public.medidas_corporais for select
  using (auth.uid() = user_id);

create policy "Usuário insere as próprias medidas"
  on public.medidas_corporais for insert
  with check (auth.uid() = user_id);

create policy "Usuário edita as próprias medidas"
  on public.medidas_corporais for update
  using (auth.uid() = user_id);

create policy "Usuário exclui as próprias medidas"
  on public.medidas_corporais for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 3. CATEGORIAS DE EXERCÍCIO (dado de referência, leitura pública)
-- ---------------------------------------------------------------------
create table public.categorias_exercicio (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ordem int not null default 0
);

alter table public.categorias_exercicio enable row level security;

create policy "Qualquer usuário autenticado lê as categorias"
  on public.categorias_exercicio for select
  using (auth.role() = 'authenticated');

insert into public.categorias_exercicio (nome, ordem) values
  ('Peito', 1),
  ('Costas', 2),
  ('Ombro', 3),
  ('Bíceps', 4),
  ('Tríceps', 5),
  ('Perna', 6),
  ('Abdômen', 7),
  ('Cardio', 8);


-- ---------------------------------------------------------------------
-- 4. EXERCÍCIOS (biblioteca padrão + exercícios customizados do usuário)
-- ---------------------------------------------------------------------
create table public.exercicios (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias_exercicio(id),
  nome text not null,
  padrao boolean not null default true,     -- true = biblioteca padrão do app
  criado_por uuid references auth.users(id) on delete cascade, -- null se for padrão
  created_at timestamptz not null default now(),
  unique (categoria_id, nome, criado_por)
);

alter table public.exercicios enable row level security;

-- Todo usuário autenticado lê exercícios padrão + os próprios customizados
create policy "Usuário lê exercícios padrão e os próprios"
  on public.exercicios for select
  using (padrao = true or criado_por = auth.uid());

create policy "Usuário cria exercícios customizados"
  on public.exercicios for insert
  with check (criado_por = auth.uid() and padrao = false);

create policy "Usuário edita os próprios exercícios customizados"
  on public.exercicios for update
  using (criado_por = auth.uid());

create policy "Usuário exclui os próprios exercícios customizados"
  on public.exercicios for delete
  using (criado_por = auth.uid());

-- Biblioteca padrão de exercícios por categoria
insert into public.exercicios (categoria_id, nome, padrao, criado_por)
select c.id, e.nome, true, null
from public.categorias_exercicio c
join (values
  -- Peito
  ('Peito', 'Supino reto'),
  ('Peito', 'Supino inclinado'),
  ('Peito', 'Supino máquina'),
  ('Peito', 'Peito inclinado (máquina)'),
  ('Peito', 'Peito reto (máquina)'),
  ('Peito', 'Crucifixo máquina'),
  ('Peito', 'Crucifixo halteres'),
  ('Peito', 'Crossover'),
  ('Peito', 'Flexão de braço'),

  -- Costas
  ('Costas', 'Puxada na frente'),
  ('Costas', 'Puxada atrás'),
  ('Costas', 'Remada baixa supinada'),
  ('Costas', 'Remada baixa triângulo'),
  ('Costas', 'Remada curvada'),
  ('Costas', 'Remada cavalinho'),
  ('Costas', 'Pulldown'),
  ('Costas', 'Levantamento terra'),

  -- Ombro
  ('Ombro', 'Desenvolvimento máquina'),
  ('Ombro', 'Desenvolvimento halteres'),
  ('Ombro', 'Elevação lateral'),
  ('Ombro', 'Elevação frontal'),
  ('Ombro', 'Elevação posterior'),
  ('Ombro', 'Encolhimento de ombros'),
  ('Ombro', 'Remada alta'),

  -- Bíceps
  ('Bíceps', 'Rosca direta'),
  ('Bíceps', 'Rosca Scott'),
  ('Bíceps', 'Rosca martelo'),
  ('Bíceps', 'Rosca concentrada'),
  ('Bíceps', 'Rosca cabo'),
  ('Bíceps', 'Rosca 21'),

  -- Tríceps
  ('Tríceps', 'Tríceps corda polia alta'),
  ('Tríceps', 'Tríceps pulley'),
  ('Tríceps', 'Tríceps invertido'),
  ('Tríceps', 'Tríceps testa'),
  ('Tríceps', 'Tríceps francês'),
  ('Tríceps', 'Mergulho no banco'),

  -- Perna
  ('Perna', 'Leg press'),
  ('Perna', 'Extensora'),
  ('Perna', 'Flexora'),
  ('Perna', 'Cadeira adutora'),
  ('Perna', 'Cadeira abdutora'),
  ('Perna', 'Panturrilha em pé'),
  ('Perna', 'Panturrilha sentado'),
  ('Perna', 'Avanço (afundo)'),
  ('Perna', 'Agachamento livre'),
  ('Perna', 'Agachamento Smith'),

  -- Abdômen
  ('Abdômen', 'Abdominal paralela'),
  ('Abdômen', 'Abdominal articulado (máquina)'),
  ('Abdômen', 'Abdominal infra'),
  ('Abdômen', 'Prancha'),
  ('Abdômen', 'Elevação de pernas'),

  -- Cardio
  ('Cardio', 'Esteira'),
  ('Cardio', 'Bicicleta ergométrica'),
  ('Cardio', 'Elíptico'),
  ('Cardio', 'Escada'),
  ('Cardio', 'Remo')
) as e(categoria_nome, nome) on c.nome = e.categoria_nome;


-- ---------------------------------------------------------------------
-- 5. TREINOS (sessão do dia)
-- ---------------------------------------------------------------------
create table public.treinos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null default current_date,
  aquecimento_equipamento text,
  aquecimento_minutos int,
  created_at timestamptz not null default now()
);

alter table public.treinos enable row level security;

create policy "Usuário vê os próprios treinos"
  on public.treinos for select
  using (auth.uid() = user_id);

create policy "Usuário insere os próprios treinos"
  on public.treinos for insert
  with check (auth.uid() = user_id);

create policy "Usuário edita os próprios treinos"
  on public.treinos for update
  using (auth.uid() = user_id);

create policy "Usuário exclui os próprios treinos"
  on public.treinos for delete
  using (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 6. EXERCÍCIOS DE CADA TREINO (itens lançados na sessão)
-- ---------------------------------------------------------------------
create table public.treino_exercicios (
  id uuid primary key default gen_random_uuid(),
  treino_id uuid not null references public.treinos(id) on delete cascade,
  exercicio_id uuid not null references public.exercicios(id),
  series int not null,
  repeticoes int not null,
  peso_kg text not null,          -- texto para permitir "5/6/7" em drop-set
  intervalo_segundos int not null,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.treino_exercicios enable row level security;

-- Acesso via join: só quem é dono do treino pode ver/editar seus itens
create policy "Usuário vê os itens dos próprios treinos"
  on public.treino_exercicios for select
  using (
    exists (
      select 1 from public.treinos t
      where t.id = treino_exercicios.treino_id and t.user_id = auth.uid()
    )
  );

create policy "Usuário insere itens nos próprios treinos"
  on public.treino_exercicios for insert
  with check (
    exists (
      select 1 from public.treinos t
      where t.id = treino_exercicios.treino_id and t.user_id = auth.uid()
    )
  );

create policy "Usuário edita itens dos próprios treinos"
  on public.treino_exercicios for update
  using (
    exists (
      select 1 from public.treinos t
      where t.id = treino_exercicios.treino_id and t.user_id = auth.uid()
    )
  );

create policy "Usuário exclui itens dos próprios treinos"
  on public.treino_exercicios for delete
  using (
    exists (
      select 1 from public.treinos t
      where t.id = treino_exercicios.treino_id and t.user_id = auth.uid()
    )
  );


-- ---------------------------------------------------------------------
-- 7. ÍNDICES (performance para dashboard e históricos)
-- ---------------------------------------------------------------------
create index idx_medidas_user_data on public.medidas_corporais (user_id, data desc);
create index idx_treinos_user_data on public.treinos (user_id, data desc);
create index idx_treino_exercicios_treino on public.treino_exercicios (treino_id);
create index idx_exercicios_categoria on public.exercicios (categoria_id);
