"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  buscarExerciciosDoTemplate,
  lancarExecucaoRetroativa,
  listarMinhasAtribuicoes,
  type ItemRetroativo,
} from "@/services/treinoAtribuicaoService";
import type { TreinoAtribuicao } from "@/types/treinoAtribuicao.types";

export interface ExercicioParaLancamento {
  exercicioId: string;
  exercicioNome: string;
  categoriaNome: string;
  series: number;
  repeticoes: number;
  intervaloSegundos: number;
}

export function useLancamentoRetroativo() {
  const { usuario } = useAuth();
  const [atribuicoes, setAtribuicoes] = useState<TreinoAtribuicao[]>([]);
  const [carregandoAtribuicoes, setCarregandoAtribuicoes] = useState(true);
  const [carregandoExercicios, setCarregandoExercicios] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!usuario) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar
    setCarregandoAtribuicoes(true);
    listarMinhasAtribuicoes(usuario.id)
      .then(setAtribuicoes)
      .catch((excecao) =>
        setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar treinos atribuídos.")
      )
      .finally(() => setCarregandoAtribuicoes(false));
  }, [usuario]);

  const carregarExerciciosDoTemplate = useCallback(
    async (templateId: string): Promise<ExercicioParaLancamento[]> => {
      setCarregandoExercicios(true);
      setErro(null);
      try {
        const itensTemplate = await buscarExerciciosDoTemplate(templateId);
        return itensTemplate.map((item) => ({
          exercicioId: item.exercicio_id,
          exercicioNome: item.exercicios?.nome ?? "Exercício removido",
          categoriaNome: item.exercicios?.categorias_exercicio?.nome ?? "-",
          series: item.series,
          repeticoes: item.repeticoes,
          intervaloSegundos: item.intervalo_segundos,
        }));
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar exercícios do treino.");
        return [];
      } finally {
        setCarregandoExercicios(false);
      }
    },
    []
  );

  const salvar = useCallback(
    async (
      atribuicaoId: string | null,
      templateId: string | null,
      dataIso: string,
      itens: ItemRetroativo[]
    ): Promise<boolean> => {
      if (!usuario) return false;
      setErro(null);
      try {
        await lancarExecucaoRetroativa(atribuicaoId, templateId, usuario.id, dataIso, itens);
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao lançar treino.");
        return false;
      }
    },
    [usuario]
  );

  return {
    atribuicoes,
    carregandoAtribuicoes,
    carregandoExercicios,
    erro,
    carregarExerciciosDoTemplate,
    salvar,
  };
}
