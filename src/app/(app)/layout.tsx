"use client";

import { useAuth } from "@/hooks/useAuth";
import { NavegacaoInferior } from "@/components/ui/NavegacaoInferior";

export default function LayoutApp({ children }: { children: React.ReactNode }) {
  const { usuario, sair } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <span className="text-sm font-semibold text-zinc-100">Bet Train</span>
        {usuario && (
          <button
            onClick={() => sair()}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            Sair
          </button>
        )}
      </header>
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-4">{children}</main>
      <NavegacaoInferior />
    </div>
  );
}
