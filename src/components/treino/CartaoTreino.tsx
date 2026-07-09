import { Cartao } from "@/components/ui/Cartao";
import { formatarDataBr, formatarIntervalo } from "@/utils/formatters";
import type { Treino } from "@/types/treino.types";

export function CartaoTreino({
  treino,
  aoEditar,
  aoExcluir,
  aoRepetir,
}: {
  treino: Treino;
  aoEditar: () => void;
  aoExcluir: () => void;
  aoRepetir: () => void;
}) {
  return (
    <Cartao className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{formatarDataBr(treino.data)}</p>
          {treino.aquecimentoEquipamento && (
            <p className="text-xs text-zinc-500">
              Aquecimento: {treino.aquecimentoEquipamento} · {treino.aquecimentoMinutos}min
            </p>
          )}
        </div>
        <div className="flex gap-3 text-xs">
          <button onClick={aoRepetir} className="text-blue-400 hover:text-blue-300">
            Repetir
          </button>
          <button onClick={aoEditar} className="text-emerald-400 hover:text-emerald-300">
            Editar
          </button>
          <button onClick={aoExcluir} className="text-red-400 hover:text-red-300">
            Excluir
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {treino.exercicios.map((item) => (
          <div key={item.id} className="rounded-lg bg-zinc-800/50 px-3 py-2 text-xs text-zinc-300">
            <span className="font-medium text-zinc-100">{item.exercicioNome}</span>{" "}
            <span className="text-zinc-500">({item.categoriaNome})</span>
            <div className="text-zinc-400">
              {item.series}x{item.repeticoes} · {item.pesoKg}kg ·{" "}
              {formatarIntervalo(item.intervaloSegundos)}
            </div>
          </div>
        ))}
      </div>
    </Cartao>
  );
}
