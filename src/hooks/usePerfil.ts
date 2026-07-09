"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { atualizarPerfil, buscarPerfil } from "@/services/perfilService";
import type { AtualizarPerfilInput, Perfil } from "@/types/perfil.types";
import { validarPerfil } from "@/utils/validators";

export function usePerfil() {
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarPerfil = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    setErro(null);
    try {
      const perfilCarregado = await buscarPerfil(usuario.id);
      setPerfil(perfilCarregado);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar perfil.");
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar
    carregarPerfil();
  }, [carregarPerfil]);

  const salvarPerfil = useCallback(
    async (input: AtualizarPerfilInput): Promise<boolean> => {
      if (!usuario) return false;

      const mensagemValidacao = validarPerfil(input);
      if (mensagemValidacao) {
        setErro(mensagemValidacao);
        return false;
      }

      setErro(null);
      try {
        const perfilAtualizado = await atualizarPerfil(usuario.id, input);
        setPerfil(perfilAtualizado);
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao salvar perfil.");
        return false;
      }
    },
    [usuario]
  );

  return { perfil, carregando, erro, salvarPerfil, recarregar: carregarPerfil };
}
