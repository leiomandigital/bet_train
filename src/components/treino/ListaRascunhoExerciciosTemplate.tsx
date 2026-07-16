"use client";

import { Cartao } from "@/components/ui/Cartao";
import { formatarIntervalo } from "@/utils/formatters";
import type { ItemTemplateRascunho } from "@/types/treinoTemplate.types";

export function ListaRascunhoExerciciosTemplate({
  itens,
  aoRemover,
  aoAlternarEncadeamento,
}: {
  itens: ItemTemplateRascunho[];
  aoRemover: (indice: number) => void;
  aoAlternarEncadeamento: (indice: number) => void;
}) {
  if (itens.length === 0) {
    return <p className="text-sm text-zinc-500">Nenhum exercício adicionado ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {itens.map((item, indice) => (
        <div key={`${item.exercicioId}-${indice}`} className="flex flex-col gap-1">
          <Cartao className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">{item.exercicioNome}</p>
              <p className="text-xs text-zinc-500">{item.categoriaNome}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {item.series}x{item.repeticoes} · {formatarIntervalo(item.intervaloSegundos)}
              </p>
            </div>
            <button
              onClick={() => aoRemover(indice)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remover
            </button>
          </Cartao>

          {indice < itens.length - 1 && (
            <button
              onClick={() => aoAlternarEncadeamento(indice)}
              className={`self-start rounded-full border px-2.5 py-1 text-xs ${
                item.encadeadoComProximo
                  ? "border-emerald-600 bg-emerald-950/60 text-emerald-300"
                  : "border-zinc-700 text-zinc-500"
              }`}
            >
              ⛓️ {item.encadeadoComProximo ? "Encadeado com o próximo" : "Encadear com o próximo"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
