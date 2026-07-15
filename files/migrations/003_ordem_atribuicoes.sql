-- =====================================================================
-- BET TRAIN — MIGRATION 003: ORDEM DAS ATRIBUIÇÕES NO CICLO
-- =====================================================================
-- Pré-requisito: 002_treino_templates.sql já aplicado.
-- Permite ao admin definir a sequência dos treinos dentro do ciclo de
-- cada usuário (hoje era implícito pela ordem de criação).
-- Rodar este arquivo inteiro no SQL Editor do Supabase.
-- =====================================================================

alter table public.treino_atribuicoes
  add column ordem int not null default 0;

-- Backfill: numera as atribuições existentes por usuário, na ordem em que
-- foram criadas, preservando o comportamento atual como ponto de partida.
with numeradas as (
  select id, row_number() over (partition by user_id order by created_at asc) - 1 as posicao
  from public.treino_atribuicoes
)
update public.treino_atribuicoes t
set ordem = numeradas.posicao
from numeradas
where t.id = numeradas.id;

create index idx_treino_atribuicoes_user_ordem on public.treino_atribuicoes (user_id, ordem);
