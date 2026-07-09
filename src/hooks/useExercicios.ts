"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  criarExercicioCustomizado,
  listarCategorias,
  listarExerciciosPorCategoria,
} from "@/services/exercicioService";
import type { CategoriaExercicio, Exercicio } from "@/types/exercicio.types";

export function useExercicios() {
  const { usuario } = useAuth();
  const [categorias, setCategorias] = useState<CategoriaExercicio[]>([]);
  const [exerciciosPorCategoria, setExerciciosPorCategoria] = useState<
    Record<string, Exercicio[]>
  >({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarCategorias() {
      setCarregando(true);
      setErro(null);
      try {
        const categoriasCarregadas = await listarCategorias();
        setCategorias(categoriasCarregadas);
      } catch (excecao) {
        setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar categorias.");
      } finally {
        setCarregando(false);
      }
    }
    carregarCategorias();
  }, []);

  const carregarExerciciosDaCategoria = useCallback(async (categoriaId: string) => {
    setErro(null);
    try {
      const exercicios = await listarExerciciosPorCategoria(categoriaId);
      setExerciciosPorCategoria((atual) => ({ ...atual, [categoriaId]: exercicios }));
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao carregar exercícios.");
    }
  }, []);

  const adicionarExercicioCustomizado = useCallback(
    async (categoriaId: string, nome: string): Promise<Exercicio | null> => {
      if (!usuario) return null;
      if (!nome.trim()) {
        setErro("Informe o nome do exercício customizado.");
        return null;
      }

      setErro(null);
      try {
        const exercicioCriado = await criarExercicioCustomizado(usuario.id, {
          categoriaId,
          nome: nome.trim(),
        });
        setExerciciosPorCategoria((atual) => ({
          ...atual,
          [categoriaId]: [...(atual[categoriaId] ?? []), exercicioCriado],
        }));
        return exercicioCriado;
      } catch (excecao) {
        setErro(
          excecao instanceof Error ? excecao.message : "Falha ao criar exercício customizado."
        );
        return null;
      }
    },
    [usuario]
  );

  return {
    categorias,
    exerciciosPorCategoria,
    carregando,
    erro,
    carregarExerciciosDaCategoria,
    adicionarExercicioCustomizado,
  };
}
