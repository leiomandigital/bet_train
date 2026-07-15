"use client";

import { useMemo } from "react";
import { useTreinos } from "./useTreinos";
import { useMedidasCorporais } from "./useMedidasCorporais";
import { useExecucoesConcluidas } from "./useExecucoesConcluidas";
import { diasDesde } from "@/utils/formatters";

export interface PontoEvolucaoPeso {
  data: string;
  pesoKg: number;
}

export interface PontoEvolucaoMedidas {
  data: string;
  umbigo: number | null;
  peitoral: number | null;
  bicepsDireito: number | null;
}

export interface PontoDistribuicaoCategoria {
  categoria: string;
  quantidade: number;
}

export interface ExercicioComHistorico {
  id: string;
  nome: string;
}

export interface PontoEvolucaoPesoExercicio {
  data: string;
  pesoKg: number;
}

export function useDashboard() {
  const { treinos, carregando: carregandoTreinos, erro: erroTreinos } = useTreinos();
  const { medidas, carregando: carregandoMedidas, erro: erroMedidas } = useMedidasCorporais();
  const {
    execucoes,
    carregando: carregandoExecucoes,
    erro: erroExecucoes,
  } = useExecucoesConcluidas();

  const carregando = carregandoTreinos || carregandoMedidas || carregandoExecucoes;
  const erro = erroTreinos ?? erroMedidas ?? erroExecucoes;

  const totalTreinosNoMes = useMemo(() => {
    const hoje = new Date();
    return treinos.filter((treino) => {
      const data = new Date(`${treino.data}T00:00:00`);
      return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
    }).length;
  }, [treinos]);

  const pesoAtual = medidas[0]?.pesoKg ?? null;
  const pesoInicial = medidas[medidas.length - 1]?.pesoKg ?? null;

  const diasDesdeUltimoTreino = useMemo(() => {
    if (treinos.length === 0) return null;
    return diasDesde(treinos[0].data);
  }, [treinos]);

  const totalExerciciosRealizados = useMemo(
    () => treinos.reduce((total, treino) => total + treino.exercicios.length, 0),
    [treinos]
  );

  const evolucaoPeso: PontoEvolucaoPeso[] = useMemo(
    () =>
      [...medidas]
        .sort((a, b) => a.data.localeCompare(b.data))
        .map((medida) => ({ data: medida.data, pesoKg: medida.pesoKg })),
    [medidas]
  );

  const evolucaoMedidas: PontoEvolucaoMedidas[] = useMemo(
    () =>
      [...medidas]
        .sort((a, b) => a.data.localeCompare(b.data))
        .map((medida) => ({
          data: medida.data,
          umbigo: medida.circAbdominalUmbigoCm,
          peitoral: medida.circPeitoralCm,
          bicepsDireito: medida.circBicepsDireitoCm,
        })),
    [medidas]
  );

  const exerciciosComHistorico: ExercicioComHistorico[] = useMemo(() => {
    const exerciciosPorId = new Map<string, string>();
    execucoes.forEach((execucao) => {
      execucao.exercicios.forEach((item) => {
        exerciciosPorId.set(item.exercicioId, item.exercicioNome);
      });
    });
    return Array.from(exerciciosPorId.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [execucoes]);

  const evolucaoPesoPorExercicio: Map<string, PontoEvolucaoPesoExercicio[]> = useMemo(() => {
    const mapa = new Map<string, PontoEvolucaoPesoExercicio[]>();

    [...execucoes]
      .sort((a, b) => (a.concluidoEm ?? "").localeCompare(b.concluidoEm ?? ""))
      .forEach((execucao) => {
        if (!execucao.concluidoEm) return;
        execucao.exercicios.forEach((item) => {
          const pesosDaSessao = item.series
            .map((serie) => serie.pesoKg)
            .filter((peso): peso is number => peso !== null);
          if (pesosDaSessao.length === 0) return;

          const pesoMaximo = Math.max(...pesosDaSessao);
          const pontos = mapa.get(item.exercicioId) ?? [];
          pontos.push({ data: execucao.concluidoEm!.slice(0, 10), pesoKg: pesoMaximo });
          mapa.set(item.exercicioId, pontos);
        });
      });

    return mapa;
  }, [execucoes]);

  const distribuicaoPorCategoria: PontoDistribuicaoCategoria[] = useMemo(() => {
    const contagemPorCategoria = new Map<string, number>();
    treinos.forEach((treino) => {
      treino.exercicios.forEach((item) => {
        contagemPorCategoria.set(
          item.categoriaNome,
          (contagemPorCategoria.get(item.categoriaNome) ?? 0) + 1
        );
      });
    });
    return Array.from(contagemPorCategoria.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([categoria, quantidade]) => ({ categoria, quantidade }));
  }, [treinos]);

  return {
    carregando,
    erro,
    totalTreinosNoMes,
    pesoAtual,
    pesoInicial,
    diasDesdeUltimoTreino,
    totalExerciciosRealizados,
    evolucaoPeso,
    evolucaoMedidas,
    exerciciosComHistorico,
    evolucaoPesoPorExercicio,
    distribuicaoPorCategoria,
  };
}
