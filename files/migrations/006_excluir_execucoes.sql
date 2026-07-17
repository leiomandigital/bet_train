-- =====================================================================
-- BET TRAIN — MIGRATION 006: PERMITIR EXCLUIR EXECUÇÕES DE TREINO
-- =====================================================================
-- Pré-requisito: 005_remover_atribuicao.sql já aplicado.
--
-- A migration 002 nunca criou policies de "delete" para treino_execucoes /
-- treino_execucao_exercicios / treino_series. Isso tinha dois efeitos:
-- 1. Não dava pra excluir um treino do histórico (novo fluxo).
-- 2. A limpeza de exercícios não marcados como feitos ao concluir o treino
--    (treinoAtribuicaoService.apagarExerciciosNaoConcluidos) falhava
--    silenciosamente — o delete rodava sem erro, mas 0 linhas eram
--    afetadas, porque a policy de RLS bloqueava sem avisar.
--
-- Rodar este arquivo inteiro no SQL Editor do Supabase.
-- =====================================================================

create policy "Usuário exclui as próprias execuções"
  on public.treino_execucoes for delete
  using (user_id = auth.uid());

create policy "Usuário exclui itens das próprias execuções"
  on public.treino_execucao_exercicios for delete
  using (
    exists (
      select 1 from public.treino_execucoes e
      where e.id = treino_execucao_exercicios.execucao_id and e.user_id = auth.uid()
    )
  );

create policy "Usuário exclui as próprias séries"
  on public.treino_series for delete
  using (
    exists (
      select 1 from public.treino_execucao_exercicios ee
      join public.treino_execucoes e on e.id = ee.execucao_id
      where ee.id = treino_series.execucao_exercicio_id and e.user_id = auth.uid()
    )
  );
