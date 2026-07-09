import { criarSupabaseClient } from "./supabaseClient";

export async function entrarComGoogle(): Promise<void> {
  const supabase = criarSupabaseClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(`Falha ao iniciar login com Google: ${error.message}`);
  }
}

export async function sair(): Promise<void> {
  const supabase = criarSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Falha ao sair da conta: ${error.message}`);
  }
}

export async function buscarUsuarioLogado() {
  const supabase = criarSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Falha ao buscar usuário logado: ${error.message}`);
  }

  return data.user;
}
