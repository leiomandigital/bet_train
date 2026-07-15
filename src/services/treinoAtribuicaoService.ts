import { criarSupabaseClient } from "./supabaseClient";
import type { StatusAtribuicao, TreinoAtribuicao } from "@/types/treinoAtribuicao.types";
import type {
  AtualizarSerieInput,
  TreinoExecucao,
  TreinoExecucaoExercicio,
  TreinoSerie,
} from "@/types/treinoExecucao.types";

interface AtribuicaoRow {
  id: string;
  template_id: string;
  user_id: string;
  atribuido_por: string;
  status: StatusAtribuicao;
  ordem: number;
  iniciado_em: string | null;
  concluido_em: string | null;
  duracao_total_segundos: number | null;
  created_at: string;
  treino_templates: { nome: string } | null;
}

function converterParaAtribuicao(linha: AtribuicaoRow): TreinoAtribuicao {
  return {
    id: linha.id,
    templateId: linha.template_id,
    templateNome: linha.treino_templates?.nome ?? "Treino removido",
    userId: linha.user_id,
    atribuidoPor: linha.atribuido_por,
    status: linha.status,
    ordem: linha.ordem,
    iniciadoEm: linha.iniciado_em,
    concluidoEm: linha.concluido_em,
    duracaoTotalSegundos: linha.duracao_total_segundos,
    createdAt: linha.created_at,
  };
}

export async function listarMinhasAtribuicoes(userId: string): Promise<TreinoAtribuicao[]> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("treino_atribuicoes")
    .select("*, treino_templates ( nome )")
    .eq("user_id", userId)
    .order("ordem", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar treinos atribuídos: ${error.message}`);
  }

  return ((data ?? []) as unknown as AtribuicaoRow[]).map(converterParaAtribuicao);
}

export async function listarAtribuicoesPorUsuario(userId: string): Promise<TreinoAtribuicao[]> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("treino_atribuicoes")
    .select("*, treino_templates ( nome )")
    .eq("user_id", userId)
    .order("ordem", { ascending: true });

  if (error) {
    throw new Error(`Falha ao listar treinos do usuário: ${error.message}`);
  }

  return ((data ?? []) as unknown as AtribuicaoRow[]).map(converterParaAtribuicao);
}

export async function trocarOrdemAtribuicoes(
  atribuicaoIdA: string,
  ordemA: number,
  atribuicaoIdB: string,
  ordemB: number
): Promise<void> {
  const supabase = criarSupabaseClient();

  const [respostaA, respostaB] = await Promise.all([
    supabase.from("treino_atribuicoes").update({ ordem: ordemB }).eq("id", atribuicaoIdA),
    supabase.from("treino_atribuicoes").update({ ordem: ordemA }).eq("id", atribuicaoIdB),
  ]);

  if (respostaA.error || respostaB.error) {
    throw new Error(
      `Falha ao reordenar treinos: ${respostaA.error?.message ?? respostaB.error?.message}`
    );
  }
}

interface SerieRow {
  id: string;
  execucao_exercicio_id: string;
  numero_serie: number;
  repeticoes: number;
  peso_kg: number | null;
  concluida: boolean;
}

interface ExecucaoExercicioRow {
  id: string;
  execucao_id: string;
  exercicio_id: string;
  intervalo_segundos: number;
  ordem: number;
  exercicios: {
    nome: string;
    categorias_exercicio: { nome: string } | null;
  } | null;
  treino_series: SerieRow[];
}

interface ExecucaoRow {
  id: string;
  atribuicao_id: string;
  template_id: string;
  user_id: string;
  iniciado_em: string;
  concluido_em: string | null;
  duracao_total_segundos: number | null;
  treino_templates: { nome: string } | null;
  treino_execucao_exercicios: ExecucaoExercicioRow[];
}

const SELECT_EXECUCAO_COMPLETA = `
  id,
  atribuicao_id,
  template_id,
  user_id,
  iniciado_em,
  concluido_em,
  duracao_total_segundos,
  treino_templates ( nome ),
  treino_execucao_exercicios (
    id,
    execucao_id,
    exercicio_id,
    intervalo_segundos,
    ordem,
    exercicios ( nome, categorias_exercicio ( nome ) ),
    treino_series ( id, execucao_exercicio_id, numero_serie, repeticoes, peso_kg, concluida )
  )
`;

function converterParaSerie(linha: SerieRow): TreinoSerie {
  return {
    id: linha.id,
    execucaoExercicioId: linha.execucao_exercicio_id,
    numeroSerie: linha.numero_serie,
    repeticoes: linha.repeticoes,
    pesoKg: linha.peso_kg,
    concluida: linha.concluida,
  };
}

function converterParaExecucaoExercicio(linha: ExecucaoExercicioRow): TreinoExecucaoExercicio {
  return {
    id: linha.id,
    execucaoId: linha.execucao_id,
    exercicioId: linha.exercicio_id,
    exercicioNome: linha.exercicios?.nome ?? "Exercício removido",
    categoriaNome: linha.exercicios?.categorias_exercicio?.nome ?? "-",
    intervaloSegundos: linha.intervalo_segundos,
    ordem: linha.ordem,
    series: (linha.treino_series ?? [])
      .map(converterParaSerie)
      .sort((a, b) => a.numeroSerie - b.numeroSerie),
  };
}

function converterParaExecucao(linha: ExecucaoRow): TreinoExecucao {
  return {
    id: linha.id,
    atribuicaoId: linha.atribuicao_id,
    templateId: linha.template_id,
    templateNome: linha.treino_templates?.nome ?? "Treino removido",
    userId: linha.user_id,
    iniciadoEm: linha.iniciado_em,
    concluidoEm: linha.concluido_em,
    duracaoTotalSegundos: linha.duracao_total_segundos,
    exercicios: (linha.treino_execucao_exercicios ?? [])
      .map(converterParaExecucaoExercicio)
      .sort((a, b) => a.ordem - b.ordem),
  };
}

async function buscarUltimosPesosPorExercicio(
  templateId: string,
  userId: string
): Promise<Map<string, number[]>> {
  const supabase = criarSupabaseClient();
  const { data: ultimaExecucao } = await supabase
    .from("treino_execucoes")
    .select("id")
    .eq("template_id", templateId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const mapaPesos = new Map<string, number[]>();
  if (!ultimaExecucao) return mapaPesos;

  const { data: exerciciosAnteriores } = await supabase
    .from("treino_execucao_exercicios")
    .select("exercicio_id, treino_series ( numero_serie, peso_kg )")
    .eq("execucao_id", ultimaExecucao.id);

  for (const exercicio of exerciciosAnteriores ?? []) {
    const series = (exercicio.treino_series as { numero_serie: number; peso_kg: number | null }[]) ?? [];
    const pesos = [...series]
      .sort((a, b) => a.numero_serie - b.numero_serie)
      .map((serie) => serie.peso_kg ?? null);
    mapaPesos.set(exercicio.exercicio_id as string, pesos.filter((p): p is number => p !== null));
  }

  return mapaPesos;
}

export interface ExecucaoEmAndamento {
  atribuicaoId: string;
  execucaoId: string;
}

export async function buscarExecucaoEmAndamento(
  userId: string
): Promise<ExecucaoEmAndamento | null> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("treino_execucoes")
    .select("id, atribuicao_id")
    .eq("user_id", userId)
    .is("concluido_em", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao verificar treino em andamento: ${error.message}`);
  }

  return data ? { atribuicaoId: data.atribuicao_id, execucaoId: data.id } : null;
}

export async function iniciarAtribuicao(
  atribuicaoId: string,
  userId: string
): Promise<TreinoExecucao> {
  const supabase = criarSupabaseClient();

  const emAndamento = await buscarExecucaoEmAndamento(userId);
  if (emAndamento) {
    throw new Error("Você já tem um treino em andamento. Conclua-o antes de iniciar outro.");
  }

  const { data: atribuicao, error: erroAtribuicao } = await supabase
    .from("treino_atribuicoes")
    .select("id, template_id")
    .eq("id", atribuicaoId)
    .single();

  if (erroAtribuicao) {
    throw new Error(`Falha ao buscar treino atribuído: ${erroAtribuicao.message}`);
  }

  const { data: itensTemplate, error: erroItens } = await supabase
    .from("treino_template_exercicios")
    .select("exercicio_id, series, repeticoes, intervalo_segundos, ordem")
    .eq("template_id", atribuicao.template_id)
    .order("ordem", { ascending: true });

  if (erroItens) {
    throw new Error(`Falha ao carregar exercícios do treino: ${erroItens.message}`);
  }

  const agora = new Date().toISOString();

  const { data: execucaoCriada, error: erroExecucao } = await supabase
    .from("treino_execucoes")
    .insert({
      atribuicao_id: atribuicaoId,
      template_id: atribuicao.template_id,
      user_id: userId,
      iniciado_em: agora,
    })
    .select("id")
    .single();

  if (erroExecucao) {
    throw new Error(`Falha ao iniciar treino: ${erroExecucao.message}`);
  }

  const execucaoId = execucaoCriada.id as string;
  const ultimosPesos = await buscarUltimosPesosPorExercicio(atribuicao.template_id, userId);

  for (const item of itensTemplate ?? []) {
    const { data: execucaoExercicioCriado, error: erroExecucaoExercicio } = await supabase
      .from("treino_execucao_exercicios")
      .insert({
        execucao_id: execucaoId,
        exercicio_id: item.exercicio_id,
        intervalo_segundos: item.intervalo_segundos,
        ordem: item.ordem,
      })
      .select("id")
      .single();

    if (erroExecucaoExercicio) {
      throw new Error(`Falha ao preparar exercícios da execução: ${erroExecucaoExercicio.message}`);
    }

    const pesosAnteriores = ultimosPesos.get(item.exercicio_id) ?? [];
    const seriesParaInserir = Array.from({ length: item.series }, (_, indice) => ({
      execucao_exercicio_id: execucaoExercicioCriado.id as string,
      numero_serie: indice + 1,
      repeticoes: item.repeticoes,
      peso_kg: pesosAnteriores[indice] ?? null,
    }));

    const { error: erroSeries } = await supabase.from("treino_series").insert(seriesParaInserir);
    if (erroSeries) {
      throw new Error(`Falha ao preparar séries da execução: ${erroSeries.message}`);
    }
  }

  await supabase
    .from("treino_atribuicoes")
    .update({ status: "em_andamento", iniciado_em: agora })
    .eq("id", atribuicaoId);

  return buscarExecucaoPorId(execucaoId);
}

export async function concluirAtribuicao(
  atribuicaoId: string,
  execucaoId: string,
  userId: string
): Promise<void> {
  const supabase = criarSupabaseClient();
  const agora = new Date().toISOString();

  const { data: atribuicao, error: erroAtribuicao } = await supabase
    .from("treino_atribuicoes")
    .select("iniciado_em")
    .eq("id", atribuicaoId)
    .single();

  if (erroAtribuicao) {
    throw new Error(`Falha ao concluir treino: ${erroAtribuicao.message}`);
  }

  const duracaoSegundos = atribuicao.iniciado_em
    ? Math.max(0, Math.round((Date.parse(agora) - Date.parse(atribuicao.iniciado_em)) / 1000))
    : null;

  const { error: erroAtualizaAtribuicao } = await supabase
    .from("treino_atribuicoes")
    .update({ status: "concluido", concluido_em: agora, duracao_total_segundos: duracaoSegundos })
    .eq("id", atribuicaoId);

  if (erroAtualizaAtribuicao) {
    throw new Error(`Falha ao concluir treino: ${erroAtualizaAtribuicao.message}`);
  }

  const { error: erroAtualizaExecucao } = await supabase
    .from("treino_execucoes")
    .update({ concluido_em: agora, duracao_total_segundos: duracaoSegundos })
    .eq("id", execucaoId);

  if (erroAtualizaExecucao) {
    throw new Error(`Falha ao concluir treino: ${erroAtualizaExecucao.message}`);
  }

  await reiniciarCicloSeCompleto(userId);
}

async function reiniciarCicloSeCompleto(userId: string): Promise<void> {
  const supabase = criarSupabaseClient();

  const { count, error: erroContagem } = await supabase
    .from("treino_atribuicoes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["pendente", "em_andamento"]);

  if (erroContagem) {
    throw new Error(`Falha ao verificar ciclo de treinos: ${erroContagem.message}`);
  }

  if (count && count > 0) return;

  const { error: erroReinicio } = await supabase
    .from("treino_atribuicoes")
    .update({ status: "pendente", iniciado_em: null, concluido_em: null, duracao_total_segundos: null })
    .eq("user_id", userId)
    .eq("status", "concluido");

  if (erroReinicio) {
    throw new Error(`Falha ao reiniciar ciclo de treinos: ${erroReinicio.message}`);
  }
}

export async function atualizarSerie(
  serieId: string,
  input: AtualizarSerieInput
): Promise<void> {
  const supabase = criarSupabaseClient();
  const { error } = await supabase
    .from("treino_series")
    .update({
      repeticoes: input.repeticoes,
      peso_kg: input.pesoKg,
      concluida: input.concluida,
      updated_at: new Date().toISOString(),
    })
    .eq("id", serieId);

  if (error) {
    throw new Error(`Falha ao atualizar série: ${error.message}`);
  }
}

export async function buscarExecucaoPorId(execucaoId: string): Promise<TreinoExecucao> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("treino_execucoes")
    .select(SELECT_EXECUCAO_COMPLETA)
    .eq("id", execucaoId)
    .single();

  if (error) {
    throw new Error(`Falha ao buscar execução do treino: ${error.message}`);
  }

  return converterParaExecucao(data as unknown as ExecucaoRow);
}

export async function listarExecucoesConcluidas(userId: string): Promise<TreinoExecucao[]> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("treino_execucoes")
    .select(SELECT_EXECUCAO_COMPLETA)
    .eq("user_id", userId)
    .not("concluido_em", "is", null)
    .order("concluido_em", { ascending: false });

  if (error) {
    throw new Error(`Falha ao listar treinos executados: ${error.message}`);
  }

  return ((data ?? []) as unknown as ExecucaoRow[]).map(converterParaExecucao);
}
