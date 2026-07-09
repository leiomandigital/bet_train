import { criarSupabaseClient } from "./supabaseClient";
import type { AtualizarPerfilInput, Perfil } from "@/types/perfil.types";

interface PerfilRow {
  id: string;
  nome: string | null;
  telefone: string | null;
  data_nascimento: string | null;
  altura_cm: number | null;
  created_at: string;
  updated_at: string;
}

function converterParaPerfil(linha: PerfilRow): Perfil {
  return {
    id: linha.id,
    nome: linha.nome,
    telefone: linha.telefone,
    dataNascimento: linha.data_nascimento,
    alturaCm: linha.altura_cm,
    createdAt: linha.created_at,
    updatedAt: linha.updated_at,
  };
}

export async function buscarPerfil(userId: string): Promise<Perfil | null> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Falha ao buscar perfil: ${error.message}`);
  }

  return data ? converterParaPerfil(data) : null;
}

export async function atualizarPerfil(
  userId: string,
  input: AtualizarPerfilInput
): Promise<Perfil> {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      nome: input.nome,
      telefone: input.telefone,
      data_nascimento: input.dataNascimento,
      altura_cm: input.alturaCm,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Falha ao atualizar perfil: ${error.message}`);
  }

  return converterParaPerfil(data);
}
