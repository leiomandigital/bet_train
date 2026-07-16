"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listarAtribuicoesPorUsuario,
  removerAtribuicao,
  trocarOrdemAtribuicoes,
} from "@/services/treinoAtribuicaoService";
import type { TreinoAtribuicao } from "@/types/treinoAtribuicao.types";

export function useOrdenarAtribuicoes(userId: string | null) {
  const [atribuicoes, setAtribuicoes] = useState<TreinoAtribuicao[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!userId) {
      setAtribuicoes([]);
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const atribuicoesCarregadas = await listarAtribuicoesPorUsuario(userId);
      setAtribuicoes(atribuicoesCarregadas);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar treinos do usuário.");
    } finally {
      setCarregando(false);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- recarrega ao trocar de usuário
    carregar();
  }, [carregar]);

  const mover = useCallback(
    async (indice: number, direcao: -1 | 1) => {
      const indiceVizinho = indice + direcao;
      if (indiceVizinho < 0 || indiceVizinho >= atribuicoes.length) return;

      const atual = atribuicoes[indice];
      const vizinho = atribuicoes[indiceVizinho];

      setErro(null);
      try {
        await trocarOrdemAtribuicoes(atual.id, atual.ordem, vizinho.id, vizinho.ordem);
        await carregar();
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao reordenar treinos.");
      }
    },
    [atribuicoes, carregar]
  );

  const remover = useCallback(
    async (atribuicaoId: string) => {
      setErro(null);
      try {
        await removerAtribuicao(atribuicaoId);
        await carregar();
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao remover treino atribuído.");
      }
    },
    [carregar]
  );

  return { atribuicoes, carregando, erro, mover, remover };
}
