"use client";

import { useEffect, useState } from "react";
import { formatarMMSS } from "@/utils/formatters";

export function CronometroTotal({
  iniciadoEm,
  parado,
}: {
  iniciadoEm: string;
  parado: boolean;
}) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    if (parado) return;
    const intervalo = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, [parado]);

  const segundosDecorridos = Math.max(0, Math.floor((agora - Date.parse(iniciadoEm)) / 1000));

  return (
    <div className="sticky top-0 z-10 flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/95 px-3 py-2 text-sm backdrop-blur">
      <span className="text-zinc-500">Tempo de treino</span>
      <span className="font-mono font-semibold text-zinc-100">
        {formatarMMSS(segundosDecorridos)}
      </span>
    </div>
  );
}
