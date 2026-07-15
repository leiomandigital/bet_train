"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { listarExecucoesConcluidas } from "@/services/treinoAtribuicaoService";
import type { TreinoExecucao } from "@/types/treinoExecucao.types";

export function useExecucoesConcluidas() {
  const { usuario } = useAuth();
  const [execucoes, setExecucoes] = useState<TreinoExecucao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarExecucoes = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    setErro(null);
    try {
      const execucoesCarregadas = await listarExecucoesConcluidas(usuario.id);
      setExecucoes(execucoesCarregadas);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar treinos executados.");
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar
    carregarExecucoes();
  }, [carregarExecucoes]);

  return { execucoes, carregando, erro };
}
