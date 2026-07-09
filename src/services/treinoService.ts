import { criarSupabaseClient } from "./supabaseClient";
import type {
  CriarTreinoInput,
  AtualizarTreinoInput,
  Treino,
  TreinoExercicio,
} from "@/types/treino.types";

interface TreinoExercicioRow {
  id: string;
  treino_id: string;
  exercicio_id: string;
  series: number;
  repeticoes: number;
  peso_kg: string;
  intervalo_segundos: number;
  ordem: number;
  exercicios: {
    nome: string;
    categorias_exercicio: { nome: string } | null;
  } | null;
}

interface TreinoRow {
  id: string;
  user_id: string;
  data: string;
  aquecimento_equipamento: string | null;
  aquecimento_minutos: number | null;
  created_at: string;
  treino_exercicios: TreinoExercicioRow[];
}

const SELECT_TREINO_COMPLETO = `
  id,
  user_id,
  data,
  aquecimento_equipamento,
  aquecimento_minutos,
  created_at,
  treino_exercicios (
    id,
    treino_id,
    exercicio_id,
    series,
    repeticoes,
    peso_kg,
    intervalo_segundos,
    ordem,
    exercicios ( nome, categorias_exercicio ( nome ) )
  )
`;

function converterParaItem(linha: TreinoExercicioRow): TreinoExercicio {
  return {
    id: linha.id,
    treinoId: linha.treino_id,
    exercicioId: linha.exercicio_id,
    exercicioNome: linha.exercicios?.nome ?? "Exercício removido",
    categoriaNome: linha.exercicios?.categorias_exercicio?.nome ?? "-",
    series: linha.series,
    repeticoes: linha.repeticoes,
    pesoKg: linha.peso_kg,
    intervaloSegundos: linha.intervalo_segundos,
    ordem: linha.ordem,
  };
}

function converterParaTreino(linha: TreinoRow): Treino {
  return {
    id: linha.id,
    userId: linha.user_id,
    data: linha.data,
    aquecimentoEquipamento: linha.aquecimento_equipamento,
    aquecimentoMinutos: linha.aquecimento_minutos,
    createdAt: linha.created_at,
    exercicios: (linha.treino_exercicios ?? [])
      .map(converterParaItem)
      .sort((a, b) => a.ordem - b.ordem),
  };
}

export async function listarTreinos(userId: string): Promise<Treino[]> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("treinos")
    .select(SELECT_TREINO_COMPLETO)
    .eq("user_id", userId)
    .order("data", { ascending: false });

  if (error) {
    throw new Error(`Falha ao listar treinos: ${error.message}`);
  }

  return ((data ?? []) as unknown as TreinoRow[]).map(converterParaTreino);
}

export async function criarTreino(
  userId: string,
  input: CriarTreinoInput
): Promise<Treino> {
  const supabase = criarSupabaseClient();

  const { data: treinoCriado, error: erroTreino } = await supabase
    .from("treinos")
    .insert({
      user_id: userId,
      data: input.data,
      aquecimento_equipamento: input.aquecimentoEquipamento,
      aquecimento_minutos: input.aquecimentoMinutos,
    })
    .select("id")
    .single();

  if (erroTreino) {
    throw new Error(`Falha ao criar treino: ${erroTreino.message}`);
  }

  const treinoId = treinoCriado.id as string;

  if (input.itens.length > 0) {
    const { error: erroItens } = await supabase.from("treino_exercicios").insert(
      input.itens.map((item, indice) => ({
        treino_id: treinoId,
        exercicio_id: item.exercicioId,
        series: item.series,
        repeticoes: item.repeticoes,
        peso_kg: item.pesoKg,
        intervalo_segundos: item.intervaloSegundos,
        ordem: indice,
      }))
    );

    if (erroItens) {
      await supabase.from("treinos").delete().eq("id", treinoId);
      throw new Error(`Falha ao salvar exercícios do treino: ${erroItens.message}`);
    }
  }

  return buscarTreinoPorId(treinoId);
}

export async function atualizarTreino(
  treinoId: string,
  input: AtualizarTreinoInput
): Promise<Treino> {
  const supabase = criarSupabaseClient();

  const { error: erroTreino } = await supabase
    .from("treinos")
    .update({
      data: input.data,
      aquecimento_equipamento: input.aquecimentoEquipamento,
      aquecimento_minutos: input.aquecimentoMinutos,
    })
    .eq("id", treinoId);

  if (erroTreino) {
    throw new Error(`Falha ao atualizar treino: ${erroTreino.message}`);
  }

  const { error: erroExclusao } = await supabase
    .from("treino_exercicios")
    .delete()
    .eq("treino_id", treinoId);

  if (erroExclusao) {
    throw new Error(`Falha ao atualizar exercícios do treino: ${erroExclusao.message}`);
  }

  if (input.itens.length > 0) {
    const { error: erroItens } = await supabase.from("treino_exercicios").insert(
      input.itens.map((item, indice) => ({
        treino_id: treinoId,
        exercicio_id: item.exercicioId,
        series: item.series,
        repeticoes: item.repeticoes,
        peso_kg: item.pesoKg,
        intervalo_segundos: item.intervaloSegundos,
        ordem: indice,
      }))
    );

    if (erroItens) {
      throw new Error(`Falha ao salvar exercícios do treino: ${erroItens.message}`);
    }
  }

  return buscarTreinoPorId(treinoId);
}

export async function excluirTreino(treinoId: string): Promise<void> {
  const supabase = criarSupabaseClient();
  const { error } = await supabase.from("treinos").delete().eq("id", treinoId);

  if (error) {
    throw new Error(`Falha ao excluir treino: ${error.message}`);
  }
}

async function buscarTreinoPorId(treinoId: string): Promise<Treino> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("treinos")
    .select(SELECT_TREINO_COMPLETO)
    .eq("id", treinoId)
    .single();

  if (error) {
    throw new Error(`Falha ao buscar treino salvo: ${error.message}`);
  }

  return converterParaTreino(data as unknown as TreinoRow);
}
