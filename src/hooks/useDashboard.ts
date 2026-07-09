"use client";

import { useMemo } from "react";
import { useTreinos } from "./useTreinos";
import { useMedidasCorporais } from "./useMedidasCorporais";
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

export interface PontoFrequenciaTreino {
  semana: string;
  quantidade: number;
}

export interface PontoDistribuicaoCategoria {
  categoria: string;
  quantidade: number;
}

function inicioDaSemana(dataIso: string): string {
  const data = new Date(`${dataIso}T00:00:00`);
  const diaSemana = data.getDay();
  data.setDate(data.getDate() - diaSemana);
  return data.toISOString().slice(0, 10);
}

export function useDashboard() {
  const { treinos, carregando: carregandoTreinos, erro: erroTreinos } = useTreinos();
  const { medidas, carregando: carregandoMedidas, erro: erroMedidas } = useMedidasCorporais();

  const carregando = carregandoTreinos || carregandoMedidas;
  const erro = erroTreinos ?? erroMedidas;

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

  const frequenciaSemanal: PontoFrequenciaTreino[] = useMemo(() => {
    const contagemPorSemana = new Map<string, number>();
    treinos.forEach((treino) => {
      const semana = inicioDaSemana(treino.data);
      contagemPorSemana.set(semana, (contagemPorSemana.get(semana) ?? 0) + 1);
    });
    return Array.from(contagemPorSemana.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([semana, quantidade]) => ({ semana, quantidade }));
  }, [treinos]);

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
    frequenciaSemanal,
    distribuicaoPorCategoria,
  };
}
