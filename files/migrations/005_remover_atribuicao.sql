-- =====================================================================
-- BET TRAIN — MIGRATION 005: PERMITIR REMOVER ATRIBUIÇÃO
-- =====================================================================
-- Pré-requisito: 004_grupo_bisset.sql já aplicado.
-- Permite ao admin remover uma atribuição de um usuário. As execuções já
-- feitas (histórico) são preservadas — o vínculo com a atribuição removida
-- só fica nulo, não é apagado em cascata.
-- Rodar este arquivo inteiro no SQL Editor do Supabase.
-- =====================================================================

alter table public.treino_execucoes
  alter column atribuicao_id drop not null;

alter table public.treino_execucoes
  drop constraint treino_execucoes_atribuicao_id_fkey;

alter table public.treino_execucoes
  add constraint treino_execucoes_atribuicao_id_fkey
  foreign key (atribuicao_id) references public.treino_atribuicoes(id) on delete set null;

create policy "Admin remove atribuições que fez"
  on public.treino_atribuicoes for delete
  using (atribuido_por = auth.uid());
