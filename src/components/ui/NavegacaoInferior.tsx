"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/dashboard", rotulo: "Dashboard", icone: "📊" },
  { href: "/treino", rotulo: "Treino", icone: "🏋️" },
  { href: "/historico", rotulo: "Histórico", icone: "📜" },
  { href: "/perfil", rotulo: "Perfil", icone: "👤" },
];

export function NavegacaoInferior() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
      {ITENS.map((item) => {
        const ativo = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs ${
              ativo ? "text-emerald-400" : "text-zinc-500"
            }`}
          >
            <span className="text-lg leading-none">{item.icone}</span>
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
