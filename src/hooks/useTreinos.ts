"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  atualizarTreino,
  criarTreino,
  excluirTreino,
  listarTreinos,
} from "@/services/treinoService";
import type { AtualizarTreinoInput, CriarTreinoInput, Treino } from "@/types/treino.types";
import { validarTreino } from "@/utils/validators";

export function useTreinos() {
  const { usuario } = useAuth();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarTreinos = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    setErro(null);
    try {
      const treinosCarregados = await listarTreinos(usuario.id);
      setTreinos(treinosCarregados);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar treinos.");
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar
    carregarTreinos();
  }, [carregarTreinos]);

  const finalizarTreino = useCallback(
    async (input: CriarTreinoInput): Promise<boolean> => {
      if (!usuario) return false;

      const mensagemValidacao = validarTreino({
        data: input.data,
        itensCount: input.itens.length,
      });
      if (mensagemValidacao) {
        setErro(mensagemValidacao);
        return false;
      }

      setErro(null);
      try {
        await criarTreino(usuario.id, input);
        await carregarTreinos();
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao finalizar treino.");
        return false;
      }
    },
    [usuario, carregarTreinos]
  );

  const editarTreino = useCallback(
    async (treinoId: string, input: AtualizarTreinoInput): Promise<boolean> => {
      const mensagemValidacao = validarTreino({
        data: input.data,
        itensCount: input.itens.length,
      });
      if (mensagemValidacao) {
        setErro(mensagemValidacao);
        return false;
      }

      setErro(null);
      try {
        await atualizarTreino(treinoId, input);
        await carregarTreinos();
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao editar treino.");
        return false;
      }
    },
    [carregarTreinos]
  );

  const removerTreino = useCallback(
    async (treinoId: string): Promise<boolean> => {
      setErro(null);
      try {
        await excluirTreino(treinoId);
        await carregarTreinos();
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao excluir treino.");
        return false;
      }
    },
    [carregarTreinos]
  );

  return { treinos, carregando, erro, finalizarTreino, editarTreino, removerTreino };
}
