"use client";

import { useEffect, useState } from "react";
import { buscarTemplatePorId } from "@/services/treinoTemplateService";
import type { TreinoTemplate } from "@/types/treinoTemplate.types";

export function useTemplateVisualizacao(templateId: string) {
  const [template, setTemplate] = useState<TreinoTemplate | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- busca o template ao trocar de id
    setCarregando(true);
    setErro(null);
    buscarTemplatePorId(templateId)
      .then((resultado) => {
        if (ativo) setTemplate(resultado);
      })
      .catch((excecao) => {
        if (ativo) setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar treino.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [templateId]);

  return { template, carregando, erro };
}
