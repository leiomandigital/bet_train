"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  atribuirTemplate,
  criarTemplate,
  excluirTemplate,
  listarTemplatesCriados,
  listarUsuariosParaAtribuicao,
  type UsuarioParaAtribuicao,
} from "@/services/treinoTemplateService";
import type { CriarTemplateInput, TreinoTemplate } from "@/types/treinoTemplate.types";
import { validarTemplate } from "@/utils/validators";

export function useTreinoTemplates() {
  const { usuario } = useAuth();
  const [templates, setTemplates] = useState<TreinoTemplate[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioParaAtribuicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarTemplates = useCallback(async () => {
    if (!usuario) return;
    setCarregando(true);
    setErro(null);
    try {
      const [templatesCarregados, usuariosCarregados] = await Promise.all([
        listarTemplatesCriados(usuario.id),
        listarUsuariosParaAtribuicao(),
      ]);
      setTemplates(templatesCarregados);
      setUsuarios(usuariosCarregados);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar treinos modelo.");
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca inicial de dados ao montar
    carregarTemplates();
  }, [carregarTemplates]);

  const criar = useCallback(
    async (input: CriarTemplateInput): Promise<boolean> => {
      if (!usuario) return false;

      const mensagemValidacao = validarTemplate({ nome: input.nome, itensCount: input.itens.length });
      if (mensagemValidacao) {
        setErro(mensagemValidacao);
        return false;
      }

      setErro(null);
      try {
        await criarTemplate(usuario.id, input);
        await carregarTemplates();
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao criar treino modelo.");
        return false;
      }
    },
    [usuario, carregarTemplates]
  );

  const atribuir = useCallback(
    async (templateId: string, userIds: string[]): Promise<boolean> => {
      if (!usuario) return false;
      if (userIds.length === 0) {
        setErro("Selecione ao menos um usuário.");
        return false;
      }

      setErro(null);
      try {
        await atribuirTemplate(templateId, usuario.id, userIds);
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao atribuir treino.");
        return false;
      }
    },
    [usuario]
  );

  const remover = useCallback(
    async (templateId: string): Promise<boolean> => {
      setErro(null);
      try {
        await excluirTemplate(templateId);
        await carregarTemplates();
        return true;
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao excluir treino modelo.");
        return false;
      }
    },
    [carregarTemplates]
  );

  return { templates, usuarios, carregando, erro, criar, atribuir, remover };
}
