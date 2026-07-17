"use client";

import { useState } from "react";
import { Cartao } from "@/components/ui/Cartao";
import { formatarMMSS } from "@/utils/formatters";
import type { TreinoExecucao } from "@/types/treinoExecucao.types";

export function CartaoExecucaoConcluida({
  execucao,
  aoExcluir,
}: {
  execucao: TreinoExecucao;
  aoExcluir: () => void;
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <Cartao className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => setExpandido((atual) => !atual)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-semibold text-zinc-100">
            {expandido ? "▾ " : "▸ "}
            {execucao.templateNome}
          </p>
          {execucao.concluidoEm && (
            <p className="text-xs text-zinc-500">
              {new Date(execucao.concluidoEm).toLocaleDateString("pt-BR")}
              {execucao.duracaoTotalSegundos !== null &&
                ` · Duração ${formatarMMSS(execucao.duracaoTotalSegundos)}`}
            </p>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-3">
          <span className="rounded-full bg-emerald-950/60 px-2 py-0.5 text-xs text-emerald-400">
            Atribuído
          </span>
          <button onClick={aoExcluir} className="text-xs text-red-400 hover:text-red-300">
            Excluir
          </button>
        </div>
      </div>

      {expandido && (
        <div className="flex flex-col gap-2">
          {execucao.exercicios.map((item) => (
            <div key={item.id} className="rounded-lg bg-zinc-800/50 px-3 py-2 text-xs text-zinc-300">
              <span className="font-medium text-zinc-100">{item.exercicioNome}</span>{" "}
              <span className="text-zinc-500">({item.categoriaNome})</span>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-zinc-400">
                {item.series.map((serie) => (
                  <span key={serie.id}>
                    #{serie.numeroSerie}: {serie.repeticoes}x{" "}
                    {serie.pesoKg !== null ? `${serie.pesoKg}kg` : "-"}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Cartao>
  );
}
