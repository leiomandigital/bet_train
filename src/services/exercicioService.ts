import { criarSupabaseClient } from "./supabaseClient";
import type {
  CategoriaExercicio,
  CriarExercicioCustomizadoInput,
  Exercicio,
} from "@/types/exercicio.types";

interface CategoriaRow {
  id: string;
  nome: string;
  ordem: number;
}

interface ExercicioRow {
  id: string;
  categoria_id: string;
  nome: string;
  padrao: boolean;
  criado_por: string | null;
  created_at: string;
}

function converterParaCategoria(linha: CategoriaRow): CategoriaExercicio {
  return { id: linha.id, nome: linha.nome, ordem: linha.ordem };
}

function converterParaExercicio(linha: ExercicioRow): Exercicio {
  return {
    id: linha.id,
    categoriaId: linha.categoria_id,
    nome: linha.nome,
    padrao: linha.padrao,
    criadoPor: linha.criado_por,
    createdAt: linha.created_at,
  };
}

export async function listarCategorias(): Promise<CategoriaExercicio[]> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("categorias_exercicio")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar categorias de exercício: ${error.message}`);
  }

  return (data ?? []).map(converterParaCategoria);
}

export async function listarExerciciosPorCategoria(
  categoriaId: string
): Promise<Exercicio[]> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("exercicios")
    .select("*")
    .eq("categoria_id", categoriaId)
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar exercícios da categoria: ${error.message}`);
  }

  return (data ?? []).map(converterParaExercicio);
}

export async function criarExercicioCustomizado(
  userId: string,
  input: CriarExercicioCustomizadoInput
): Promise<Exercicio> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("exercicios")
    .insert({
      categoria_id: input.categoriaId,
      nome: input.nome,
      padrao: false,
      criado_por: userId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Falha ao criar exercício customizado: ${error.message}`);
  }

  return converterParaExercicio(data);
}
