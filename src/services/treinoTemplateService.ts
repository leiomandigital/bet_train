import { criarSupabaseClient } from "./supabaseClient";
import type { CriarTemplateInput, TreinoTemplate, TreinoTemplateExercicio } from "@/types/treinoTemplate.types";

interface TemplateExercicioRow {
  id: string;
  template_id: string;
  exercicio_id: string;
  series: number;
  repeticoes: number;
  intervalo_segundos: number;
  ordem: number;
  encadeado_com_proximo: boolean;
  exercicios: {
    nome: string;
    categorias_exercicio: { nome: string } | null;
  } | null;
}

interface TemplateRow {
  id: string;
  criado_por: string;
  nome: string;
  aquecimento_equipamento: string | null;
  aquecimento_minutos: number | null;
  created_at: string;
  treino_template_exercicios: TemplateExercicioRow[];
}

const SELECT_TEMPLATE_COMPLETO = `
  id,
  criado_por,
  nome,
  aquecimento_equipamento,
  aquecimento_minutos,
  created_at,
  treino_template_exercicios (
    id,
    template_id,
    exercicio_id,
    series,
    repeticoes,
    intervalo_segundos,
    ordem,
    encadeado_com_proximo,
    exercicios ( nome, categorias_exercicio ( nome ) )
  )
`;

function converterParaItem(linha: TemplateExercicioRow): TreinoTemplateExercicio {
  return {
    id: linha.id,
    templateId: linha.template_id,
    exercicioId: linha.exercicio_id,
    exercicioNome: linha.exercicios?.nome ?? "Exercício removido",
    categoriaNome: linha.exercicios?.categorias_exercicio?.nome ?? "-",
    series: linha.series,
    repeticoes: linha.repeticoes,
    intervaloSegundos: linha.intervalo_segundos,
    ordem: linha.ordem,
    encadeadoComProximo: linha.encadeado_com_proximo,
  };
}

function converterParaTemplate(linha: TemplateRow): TreinoTemplate {
  return {
    id: linha.id,
    criadoPor: linha.criado_por,
    nome: linha.nome,
    aquecimentoEquipamento: linha.aquecimento_equipamento,
    aquecimentoMinutos: linha.aquecimento_minutos,
    createdAt: linha.created_at,
    exercicios: (linha.treino_template_exercicios ?? [])
      .map(converterParaItem)
      .sort((a, b) => a.ordem - b.ordem),
  };
}

export async function listarTemplatesCriados(adminId: string): Promise<TreinoTemplate[]> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("treino_templates")
    .select(SELECT_TEMPLATE_COMPLETO)
    .eq("criado_por", adminId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Falha ao listar treinos modelo: ${error.message}`);
  }

  return ((data ?? []) as unknown as TemplateRow[]).map(converterParaTemplate);
}

export async function criarTemplate(
  adminId: string,
  input: CriarTemplateInput
): Promise<TreinoTemplate> {
  const supabase = criarSupabaseClient();

  const { data: templateCriado, error: erroTemplate } = await supabase
    .from("treino_templates")
    .insert({
      criado_por: adminId,
      nome: input.nome,
      aquecimento_equipamento: input.aquecimentoEquipamento,
      aquecimento_minutos: input.aquecimentoMinutos,
    })
    .select("id")
    .single();

  if (erroTemplate) {
    throw new Error(`Falha ao criar treino modelo: ${erroTemplate.message}`);
  }

  const templateId = templateCriado.id as string;

  if (input.itens.length > 0) {
    const { error: erroItens } = await supabase.from("treino_template_exercicios").insert(
      input.itens.map((item, indice) => ({
        template_id: templateId,
        exercicio_id: item.exercicioId,
        series: item.series,
        repeticoes: item.repeticoes,
        intervalo_segundos: item.intervaloSegundos,
        ordem: indice,
        encadeado_com_proximo: item.encadeadoComProximo,
      }))
    );

    if (erroItens) {
      await supabase.from("treino_templates").delete().eq("id", templateId);
      throw new Error(`Falha ao salvar exercícios do treino modelo: ${erroItens.message}`);
    }
  }

  return buscarTemplatePorId(templateId);
}

export async function excluirTemplate(templateId: string): Promise<void> {
  const supabase = criarSupabaseClient();
  const { error } = await supabase.from("treino_templates").delete().eq("id", templateId);

  if (error) {
    throw new Error(`Falha ao excluir treino modelo: ${error.message}`);
  }
}

export async function buscarTemplatePorId(templateId: string): Promise<TreinoTemplate> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("treino_templates")
    .select(SELECT_TEMPLATE_COMPLETO)
    .eq("id", templateId)
    .single();

  if (error) {
    throw new Error(`Falha ao buscar treino modelo salvo: ${error.message}`);
  }

  return converterParaTemplate(data as unknown as TemplateRow);
}

export async function atribuirTemplate(
  templateId: string,
  adminId: string,
  userIds: string[]
): Promise<void> {
  if (userIds.length === 0) return;

  const supabase = criarSupabaseClient();

  // Cada usuário entra no fim da própria sequência de treinos (ciclo).
  const proximasOrdens = await Promise.all(
    userIds.map(async (userId) => {
      const { data } = await supabase
        .from("treino_atribuicoes")
        .select("ordem")
        .eq("user_id", userId)
        .order("ordem", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data?.ordem ?? -1) + 1;
    })
  );

  const { error } = await supabase.from("treino_atribuicoes").insert(
    userIds.map((userId, indice) => ({
      template_id: templateId,
      user_id: userId,
      atribuido_por: adminId,
      ordem: proximasOrdens[indice],
    }))
  );

  if (error) {
    throw new Error(`Falha ao atribuir treino: ${error.message}`);
  }
}

export interface UsuarioParaAtribuicao {
  id: string;
  nome: string | null;
}

export async function listarUsuariosParaAtribuicao(): Promise<UsuarioParaAtribuicao[]> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nome, role")
    .order("nome", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar usuários: ${error.message}`);
  }

  return (data ?? []).map((linha) => ({ id: linha.id, nome: linha.nome }));
}
