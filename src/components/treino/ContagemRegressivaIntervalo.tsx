"use client";

import { useEffect, useRef, useState } from "react";
import { formatarMMSS } from "@/utils/formatters";
import { tocarAlertaFimIntervalo } from "@/utils/alertaSonoro";

export function ContagemRegressivaIntervalo({ segundosIniciais }: { segundosIniciais: number }) {
  const [restante, setRestante] = useState<number | null>(null);
  const jaAlertouRef = useRef(false);

  useEffect(() => {
    if (restante === null) return;
    if (restante <= 0) {
      if (!jaAlertouRef.current) {
        tocarAlertaFimIntervalo();
        jaAlertouRef.current = true;
      }
      return;
    }
    const timeout = setTimeout(() => setRestante((atual) => (atual ?? 0) - 1), 1000);
    return () => clearTimeout(timeout);
  }, [restante]);

  function iniciar() {
    jaAlertouRef.current = false;
    setRestante(segundosIniciais);
  }

  if (segundosIniciais <= 0) return null;

  if (restante === null) {
    return (
      <button
        onClick={iniciar}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:border-emerald-600 hover:text-emerald-400"
      >
        Iniciar intervalo ({formatarMMSS(segundosIniciais)})
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-mono text-sm font-semibold ${
          restante <= 0 ? "text-emerald-400" : "text-zinc-100"
        }`}
      >
        {formatarMMSS(restante)}
      </span>
      <button onClick={iniciar} className="text-xs text-zinc-500 hover:text-zinc-300">
        Reiniciar
      </button>
    </div>
  );
}
