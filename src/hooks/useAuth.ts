"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { criarSupabaseClient } from "@/services/supabaseClient";
import { entrarComGoogle, sair } from "@/services/authService";

export function useAuth() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const supabase = criarSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      setUsuario(data.user);
      setCarregando(false);
    });

    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      setUsuario(sessao?.user ?? null);
    });

    return () => {
      assinatura.subscription.unsubscribe();
    };
  }, []);

  const entrarComGoogleAction = useCallback(async () => {
    setErro(null);
    try {
      await entrarComGoogle();
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao entrar com Google.");
    }
  }, []);

  const sairAction = useCallback(async () => {
    setErro(null);
    try {
      await sair();
      setUsuario(null);
    } catch (excecao) {
      setErro(excecao instanceof Error ? excecao.message : "Falha ao sair da conta.");
    }
  }, []);

  return {
    usuario,
    carregando,
    erro,
    entrarComGoogle: entrarComGoogleAction,
    sair: sairAction,
  };
}
