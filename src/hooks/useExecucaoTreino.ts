"use client";

import { useCallback, useEffect, useState } from "react";
import {
  atualizarSerie,
  buscarExecucaoPorId,
  concluirAtribuicao,
} from "@/services/treinoAtribuicaoService";
import type { AtualizarSerieInput, TreinoExecucao } from "@/types/treinoExecucao.types";

export function useExecucaoTreino(execucaoId: string) {
  const [execucao, setExecucao] = useState<TreinoExecucao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarExecucao = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const execucaoCarregada = await buscarExecucaoPorId(execucaoId);
      setExecucao(execucaoCarregada);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar treino.");
    } finally {
      setCarregando(false);
    }
  }, [execucaoId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar
    carregarExecucao();
  }, [carregarExecucao]);

  const salvarSerie = useCallback(
    async (serieId: string, input: AtualizarSerieInput): Promise<boolean> => {
      setErro(null);
      try {
        await atualizarSerie(serieId, input);
        await carregarExecucao();
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao salvar série.");
        return false;
      }
    },
    [carregarExecucao]
  );

  const concluir = useCallback(async (): Promise<boolean> => {
    if (!execucao) return false;
    setErro(null);
    try {
      await concluirAtribuicao(execucao.atribuicaoId, execucao.id, execucao.userId);
      await carregarExecucao();
      return true;
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao concluir treino.");
      return false;
    }
  }, [execucao, carregarExecucao]);

  return { execucao, carregando, erro, salvarSerie, concluir };
}
