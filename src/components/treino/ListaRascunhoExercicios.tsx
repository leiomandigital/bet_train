"use client";

import { useState } from "react";
import { Cartao } from "@/components/ui/Cartao";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { formatarIntervalo } from "@/utils/formatters";
import type { ItemTreinoRascunho } from "@/types/treino.types";

export function ListaRascunhoExercicios({
  itens,
  aoRemover,
  aoEditar,
}: {
  itens: ItemTreinoRascunho[];
  aoRemover: (indice: number) => void;
  aoEditar: (indice: number, itemAtualizado: ItemTreinoRascunho) => void;
}) {
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);

  if (itens.length === 0) {
    return <p className="text-sm text-zinc-500">Nenhum exercício adicionado ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {itens.map((item, indice) =>
        indiceEditando === indice ? (
          <FormularioEditarItem
            key={`${item.exercicioId}-${indice}`}
            item={item}
            aoSalvar={(itemAtualizado) => {
              aoEditar(indice, itemAtualizado);
              setIndiceEditando(null);
            }}
            aoCancelar={() => setIndiceEditando(null)}
          />
        ) : (
          <Cartao
            key={`${item.exercicioId}-${indice}`}
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-zinc-100">{item.exercicioNome}</p>
              <p className="text-xs text-zinc-500">{item.categoriaNome}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {item.series}x{item.repeticoes} · {item.pesoKg}kg ·{" "}
                {formatarIntervalo(item.intervaloSegundos)}
              </p>
            </div>
            <div className="flex gap-3 text-xs">
              <button
                onClick={() => setIndiceEditando(indice)}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Editar
              </button>
              <button
                onClick={() => aoRemover(indice)}
                className="text-red-400 hover:text-red-300"
              >
                Remover
              </button>
            </div>
          </Cartao>
        )
      )}
    </div>
  );
}

function FormularioEditarItem({
  item,
  aoSalvar,
  aoCancelar,
}: {
  item: ItemTreinoRascunho;
  aoSalvar: (itemAtualizado: ItemTreinoRascunho) => void;
  aoCancelar: () => void;
}) {
  const [series, setSeries] = useState(item.series.toString());
  const [repeticoes, setRepeticoes] = useState(item.repeticoes.toString());
  const [pesoKg, setPesoKg] = useState(item.pesoKg);
  const [intervaloSegundos, setIntervaloSegundos] = useState(item.intervaloSegundos.toString());

  function lidarComSalvar() {
    aoSalvar({
      ...item,
      series: Number(series),
      repeticoes: Number(repeticoes),
      pesoKg: pesoKg.trim(),
      intervaloSegundos: Number(intervaloSegundos),
    });
  }

  return (
    <Cartao className="flex flex-col gap-3 border-emerald-800">
      <div>
        <p className="text-sm font-medium text-zinc-100">{item.exercicioNome}</p>
        <p className="text-xs text-zinc-500">{item.categoriaNome}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo
          rotulo="Séries"
          type="number"
          inputMode="numeric"
          value={series}
          onChange={(evento) => setSeries(evento.target.value)}
        />
        <Campo
          rotulo="Repetições"
          type="number"
          inputMode="numeric"
          value={repeticoes}
          onChange={(evento) => setRepeticoes(evento.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo
          rotulo="Peso (kg)"
          value={pesoKg}
          onChange={(evento) => setPesoKg(evento.target.value)}
        />
        <Campo
          rotulo="Intervalo (s)"
          type="number"
          inputMode="numeric"
          value={intervaloSegundos}
          onChange={(evento) => setIntervaloSegundos(evento.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Botao variante="secundario" onClick={aoCancelar}>
          Cancelar
        </Botao>
        <Botao onClick={lidarComSalvar}>Salvar</Botao>
      </div>
    </Cartao>
  );
}
