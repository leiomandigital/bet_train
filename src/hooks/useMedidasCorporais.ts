"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  atualizarMedida,
  criarMedida,
  excluirMedida,
  listarMedidas,
} from "@/services/medidasService";
import type { MedidaCorporal, SalvarMedidaInput } from "@/types/medidas.types";
import { validarMedida } from "@/utils/validators";

export function useMedidasCorporais() {
  const { usuario } = useAuth();
  const [medidas, setMedidas] = useState<MedidaCorporal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarMedidas = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    setErro(null);
    try {
      const medidasCarregadas = await listarMedidas(usuario.id);
      setMedidas(medidasCarregadas);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar medidas corporais.");
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar
    carregarMedidas();
  }, [carregarMedidas]);

  const adicionarMedida = useCallback(
    async (input: SalvarMedidaInput): Promise<boolean> => {
      if (!usuario) return false;

      const mensagemValidacao = validarMedida(input);
      if (mensagemValidacao) {
        setErro(mensagemValidacao);
        return false;
      }

      setErro(null);
      try {
        await criarMedida(usuario.id, input);
        await carregarMedidas();
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao salvar medida corporal.");
        return false;
      }
    },
    [usuario, carregarMedidas]
  );

  const editarMedida = useCallback(
    async (medidaId: string, input: SalvarMedidaInput): Promise<boolean> => {
      const mensagemValidacao = validarMedida(input);
      if (mensagemValidacao) {
        setErro(mensagemValidacao);
        return false;
      }

      setErro(null);
      try {
        await atualizarMedida(medidaId, input);
        await carregarMedidas();
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao editar medida corporal.");
        return false;
      }
    },
    [carregarMedidas]
  );

  const removerMedida = useCallback(
    async (medidaId: string): Promise<boolean> => {
      setErro(null);
      try {
        await excluirMedida(medidaId);
        await carregarMedidas();
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao excluir medida corporal.");
        return false;
      }
    },
    [carregarMedidas]
  );

  return { medidas, carregando, erro, adicionarMedida, editarMedida, removerMedida };
}
