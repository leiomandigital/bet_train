-- =====================================================================
-- BET TRAIN — MIGRATION 004: ENCADEAMENTO DE EXERCÍCIOS (BISSET/SUPERSET)
-- =====================================================================
-- Pré-requisito: 003_ordem_atribuicoes.sql já aplicado.
-- Permite ao admin marcar um exercício do template como "encadeado com o
-- próximo" — na execução, exercícios encadeados aparecem agrupados num
-- único bloco, sem intervalo entre eles.
-- Rodar este arquivo inteiro no SQL Editor do Supabase.
-- =====================================================================

alter table public.treino_template_exercicios
  add column encadeado_com_proximo boolean not null default false;

alter table public.treino_execucao_exercicios
  add column encadeado_com_proximo boolean not null default false;
