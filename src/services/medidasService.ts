import { criarSupabaseClient } from "./supabaseClient";
import type { MedidaCorporal, SalvarMedidaInput } from "@/types/medidas.types";

interface MedidaRow {
  id: string;
  user_id: string;
  data: string;
  peso_kg: number;
  circ_abdominal_umbigo_cm: number | null;
  circ_abdominal_estomago_cm: number | null;
  circ_peitoral_cm: number | null;
  circ_biceps_direito_cm: number | null;
  circ_biceps_esquerdo_cm: number | null;
  created_at: string;
}

function converterParaMedida(linha: MedidaRow): MedidaCorporal {
  return {
    id: linha.id,
    userId: linha.user_id,
    data: linha.data,
    pesoKg: linha.peso_kg,
    circAbdominalUmbigoCm: linha.circ_abdominal_umbigo_cm,
    circAbdominalEstomagoCm: linha.circ_abdominal_estomago_cm,
    circPeitoralCm: linha.circ_peitoral_cm,
    circBicepsDireitoCm: linha.circ_biceps_direito_cm,
    circBicepsEsquerdoCm: linha.circ_biceps_esquerdo_cm,
    createdAt: linha.created_at,
  };
}

export async function listarMedidas(userId: string): Promise<MedidaCorporal[]> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("medidas_corporais")
    .select("*")
    .eq("user_id", userId)
    .order("data", { ascending: false });

  if (error) {
    throw new Error(`Falha ao listar medidas corporais: ${error.message}`);
  }

  return (data ?? []).map(converterParaMedida);
}

export async function criarMedida(
  userId: string,
  input: SalvarMedidaInput
): Promise<MedidaCorporal> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("medidas_corporais")
    .insert({
      user_id: userId,
      data: input.data,
      peso_kg: input.pesoKg,
      circ_abdominal_umbigo_cm: input.circAbdominalUmbigoCm,
      circ_abdominal_estomago_cm: input.circAbdominalEstomagoCm,
      circ_peitoral_cm: input.circPeitoralCm,
      circ_biceps_direito_cm: input.circBicepsDireitoCm,
      circ_biceps_esquerdo_cm: input.circBicepsEsquerdoCm,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Falha ao criar medida corporal: ${error.message}`);
  }

  return converterParaMedida(data);
}

export async function atualizarMedida(
  medidaId: string,
  input: SalvarMedidaInput
): Promise<MedidaCorporal> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("medidas_corporais")
    .update({
      data: input.data,
      peso_kg: input.pesoKg,
      circ_abdominal_umbigo_cm: input.circAbdominalUmbigoCm,
      circ_abdominal_estomago_cm: input.circAbdominalEstomagoCm,
      circ_peitoral_cm: input.circPeitoralCm,
      circ_biceps_direito_cm: input.circBicepsDireitoCm,
      circ_biceps_esquerdo_cm: input.circBicepsEsquerdoCm,
    })
    .eq("id", medidaId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Falha ao atualizar medida corporal: ${error.message}`);
  }

  return converterParaMedida(data);
}

export async function excluirMedida(medidaId: string): Promise<void> {
  const supabase = criarSupabaseClient();
  const { error } = await supabase.from("medidas_corporais").delete().eq("id", medidaId);

  if (error) {
    throw new Error(`Falha ao excluir medida corporal: ${error.message}`);
  }
}
