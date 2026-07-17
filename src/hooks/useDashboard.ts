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

export interface PontoEvolucaoPesoExercicio {
  data: string;
  pesoKg: number;
}

export interface ExercicioEvolucaoPeso {
  exercicioId: string;
  exercicioNome: string;
  pontos: PontoEvolucaoPesoExercicio[];
}

const DIAS_JANELA_EVOLUCAO_PESO = 90;
const MAX_EXERCICIOS_POR_CATEGORIA = 8;

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

  // Une o diário livre antigo (treinos) com as execuções do fluxo de treino
  // atribuído (execucoes), pra nenhuma métrica do dashboard ignorar uma delas.
  const sessoesRealizadas = useMemo(() => {
    const doDiario = treinos.map((treino) => ({
      data: treino.data,
      categorias: treino.exercicios.map((item) => item.categoriaNome),
    }));
    const doFluxoAtribuido = execucoes
      .filter((execucao) => execucao.concluidoEm !== null)
      .map((execucao) => ({
        data: execucao.concluidoEm!.slice(0, 10),
        categorias: execucao.exercicios.map((item) => item.categoriaNome),
      }));
    return [...doDiario, ...doFluxoAtribuido];
  }, [treinos, execucoes]);

  const totalTreinosNoMes = useMemo(() => {
    const hoje = new Date();
    return sessoesRealizadas.filter((sessao) => {
      const data = new Date(`${sessao.data}T00:00:00`);
      return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
    }).length;
  }, [sessoesRealizadas]);

  const pesoAtual = medidas[0]?.pesoKg ?? null;
  const pesoInicial = medidas[medidas.length - 1]?.pesoKg ?? null;

  const diasDesdeUltimoTreino = useMemo(() => {
    if (sessoesRealizadas.length === 0) return null;
    const dataMaisRecente = [...sessoesRealizadas].sort((a, b) => b.data.localeCompare(a.data))[0];
    return diasDesde(dataMaisRecente.data);
  }, [sessoesRealizadas]);

  const totalExerciciosRealizados = useMemo(
    () => sessoesRealizadas.reduce((total, sessao) => total + sessao.categorias.length, 0),
    [sessoesRealizadas]
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

  // Só considera os últimos 90 dias — na prática os treinos costumam trocar
  // nesse ritmo, então dados mais antigos não ajudam a comparar progressão.
  const limiteDataEvolucaoPeso = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - DIAS_JANELA_EVOLUCAO_PESO);
    return limite.toISOString().slice(0, 10);
  }, []);

  const evolucaoPesoPorCategoria: Map<string, ExercicioEvolucaoPeso[]> = useMemo(() => {
    interface Acumulado {
      nome: string;
      pontos: PontoEvolucaoPesoExercicio[];
      ultimaData: string;
    }
    const porCategoria = new Map<string, Map<string, Acumulado>>();

    [...execucoes]
      .sort((a, b) => (a.concluidoEm ?? "").localeCompare(b.concluidoEm ?? ""))
      .forEach((execucao) => {
        if (!execucao.concluidoEm) return;
        const dataExecucao = execucao.concluidoEm.slice(0, 10);
        if (dataExecucao < limiteDataEvolucaoPeso) return;

        execucao.exercicios.forEach((item) => {
          const pesosDaSessao = item.series
            .map((serie) => serie.pesoKg)
            .filter((peso): peso is number => peso !== null);
          if (pesosDaSessao.length === 0) return;
          const pesoMaximo = Math.max(...pesosDaSessao);

          const exerciciosDaCategoria = porCategoria.get(item.categoriaNome) ?? new Map();
          const acumulado = exerciciosDaCategoria.get(item.exercicioId) ?? {
            nome: item.exercicioNome,
            pontos: [],
            ultimaData: dataExecucao,
          };
          acumulado.pontos.push({ data: dataExecucao, pesoKg: pesoMaximo });
          acumulado.ultimaData = dataExecucao;
          exerciciosDaCategoria.set(item.exercicioId, acumulado);
          porCategoria.set(item.categoriaNome, exerciciosDaCategoria);
        });
      });

    const resultado = new Map<string, ExercicioEvolucaoPeso[]>();
    porCategoria.forEach((exerciciosDaCategoria, categoria) => {
      const lista = Array.from(exerciciosDaCategoria.entries())
        .map(([exercicioId, acumulado]) => ({
          exercicioId,
          exercicioNome: acumulado.nome,
          pontos: acumulado.pontos,
          ultimaData: acumulado.ultimaData,
        }))
        .sort((a, b) => b.ultimaData.localeCompare(a.ultimaData))
        .slice(0, MAX_EXERCICIOS_POR_CATEGORIA)
        .map(({ exercicioId, exercicioNome, pontos }) => ({ exercicioId, exercicioNome, pontos }));
      resultado.set(categoria, lista);
    });
    return resultado;
  }, [execucoes, limiteDataEvolucaoPeso]);

  const categoriasComHistoricoPeso = useMemo(
    () => Array.from(evolucaoPesoPorCategoria.keys()).sort((a, b) => a.localeCompare(b)),
    [evolucaoPesoPorCategoria]
  );

  const distribuicaoPorCategoria: PontoDistribuicaoCategoria[] = useMemo(() => {
    const contagemPorCategoria = new Map<string, number>();
    sessoesRealizadas.forEach((sessao) => {
      sessao.categorias.forEach((categoriaNome) => {
        contagemPorCategoria.set(categoriaNome, (contagemPorCategoria.get(categoriaNome) ?? 0) + 1);
      });
    });
    return Array.from(contagemPorCategoria.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([categoria, quantidade]) => ({ categoria, quantidade }));
  }, [sessoesRealizadas]);

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
    categoriasComHistoricoPeso,
    evolucaoPesoPorCategoria,
    distribuicaoPorCategoria,
  };
}
