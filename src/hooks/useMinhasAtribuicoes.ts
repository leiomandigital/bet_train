"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";
import {
  buscarExecucaoEmAndamento,
  iniciarAtribuicao,
  listarMinhasAtribuicoes,
} from "@/services/treinoAtribuicaoService";
import type { TreinoAtribuicao } from "@/types/treinoAtribuicao.types";

export function useMinhasAtribuicoes() {
  const { usuario } = useAuth();
  const [atribuicoes, setAtribuicoes] = useState<TreinoAtribuicao[]>([]);
  const [execucaoIdAtual, setExecucaoIdAtual] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarAtribuicoes = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    setErro(null);
    try {
      const [atribuicoesCarregadas, emAndamento] = await Promise.all([
        listarMinhasAtribuicoes(usuario.id),
        buscarExecucaoEmAndamento(usuario.id),
      ]);
      setAtribuicoes(atribuicoesCarregadas);
      setExecucaoIdAtual(emAndamento?.execucaoId ?? null);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar treinos atribuídos.");
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar
    carregarAtribuicoes();
  }, [carregarAtribuicoes]);

  const iniciar = useCallback(
    async (atribuicaoId: string): Promise<string | null> => {
      if (!usuario) return null;
      setErro(null);
      try {
        const execucao = await iniciarAtribuicao(atribuicaoId, usuario.id);
        setExecucaoIdAtual(execucao.id);
        await carregarAtribuicoes();
        return execucao.id;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao iniciar treino.");
        return null;
      }
    },
    [usuario, carregarAtribuicoes]
  );

  const emAndamento = useMemo(
    () => atribuicoes.find((atribuicao) => atribuicao.status === "em_andamento") ?? null,
    [atribuicoes]
  );

  const pendentes = useMemo(
    () =>
      atribuicoes
        .filter((atribuicao) => atribuicao.status === "pendente")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [atribuicoes]
  );

  const proximaPendente = pendentes[0] ?? null;

  const ultimaConcluida = useMemo(() => {
    const concluidas = atribuicoes
      .filter((atribuicao) => atribuicao.status === "concluido" && atribuicao.concluidoEm)
      .sort((a, b) => (b.concluidoEm ?? "").localeCompare(a.concluidoEm ?? ""));
    return concluidas[0] ?? null;
  }, [atribuicoes]);

  return {
    atribuicoes,
    pendentes,
    emAndamento,
    execucaoIdAtual,
    proximaPendente,
    ultimaConcluida,
    carregando,
    erro,
    iniciar,
    recarregar: carregarAtribuicoes,
  };
}
