-- =====================================================================
-- BET TRAIN — MIGRATION 007: LANÇAMENTO RETROATIVO PERSONALIZADO
-- =====================================================================
-- Pré-requisito: 006_excluir_execucoes.sql já aplicado.
-- Permite lançar um treino do passado sem vínculo com nenhum treino
-- modelo (ex: o usuário treinou algo fora do que estava atribuído).
-- Rodar este arquivo inteiro no SQL Editor do Supabase.
-- =====================================================================

alter table public.treino_execucoes
  alter column template_id drop not null;

alter table public.treino_execucoes
  drop constraint treino_execucoes_template_id_fkey;

alter table public.treino_execucoes
  add constraint treino_execucoes_template_id_fkey
  foreign key (template_id) references public.treino_templates(id) on delete set null;
