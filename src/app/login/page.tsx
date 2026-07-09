"use client";

import { useAuth } from "@/hooks/useAuth";
import { Botao } from "@/components/ui/Botao";
import { MensagemErro } from "@/components/ui/MensagemErro";

export default function PaginaLogin() {
  const { entrarComGoogle, erro, carregando } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-4xl">🏋️</span>
        <h1 className="text-2xl font-bold text-zinc-100">Bet Train</h1>
        <p className="text-sm text-zinc-400">Seu diário de treino e medidas corporais.</p>
      </div>

      <div className="w-full max-w-xs">
        <Botao
          variante="secundario"
          disabled={carregando}
          onClick={() => entrarComGoogle()}
          className="flex items-center justify-center gap-2"
        >
          <span aria-hidden>🔐</span>
          Entrar com Google
        </Botao>
        <div className="mt-3">
          <MensagemErro mensagem={erro} />
        </div>
      </div>
    </div>
  );
}
