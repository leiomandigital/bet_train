import { Cartao } from "@/components/ui/Cartao";
import { formatarIntervalo } from "@/utils/formatters";
import type { ItemTreinoRascunho } from "@/types/treino.types";

export function ListaRascunhoExercicios({
  itens,
  aoRemover,
}: {
  itens: ItemTreinoRascunho[];
  aoRemover: (indice: number) => void;
}) {
  if (itens.length === 0) {
    return <p className="text-sm text-zinc-500">Nenhum exercício adicionado ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {itens.map((item, indice) => (
        <Cartao key={`${item.exercicioId}-${indice}`} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-100">{item.exercicioNome}</p>
            <p className="text-xs text-zinc-500">{item.categoriaNome}</p>
            <p className="mt-1 text-xs text-zinc-400">
              {item.series}x{item.repeticoes} · {item.pesoKg}kg · {formatarIntervalo(item.intervaloSegundos)}
            </p>
          </div>
          <button
            onClick={() => aoRemover(indice)}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Remover
          </button>
        </Cartao>
      ))}
    </div>
  );
}
