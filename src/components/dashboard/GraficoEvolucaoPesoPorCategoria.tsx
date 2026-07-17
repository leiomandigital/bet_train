"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Selecao } from "@/components/ui/Selecao";
import { formatarDataBr } from "@/utils/formatters";
import { CORES_CATEGORICAS_DARK, COR_GRADE_DARK, COR_TEXTO_MUTED_DARK } from "./paleta";
import type { ExercicioEvolucaoPeso } from "@/hooks/useDashboard";

type PontoUnificado = { data: string } & Record<string, number | null>;

function unificarPontos(exercicios: ExercicioEvolucaoPeso[]): PontoUnificado[] {
  const porData = new Map<string, PontoUnificado>();

  exercicios.forEach((exercicio) => {
    exercicio.pontos.forEach((ponto) => {
      const linha = (porData.get(ponto.data) ?? ({ data: ponto.data } as PontoUnificado));
      linha[exercicio.exercicioId] = ponto.pesoKg;
      porData.set(ponto.data, linha);
    });
  });

  return Array.from(porData.values()).sort((a, b) => a.data.localeCompare(b.data));
}

export function GraficoEvolucaoPesoPorCategoria({
  categorias,
  evolucaoPorCategoria,
}: {
  categorias: string[];
  evolucaoPorCategoria: Map<string, ExercicioEvolucaoPeso[]>;
}) {
  const [categoria, setCategoria] = useState(categorias[0] ?? "");
  const [ocultos, setOcultos] = useState<Set<string>>(new Set());

  const exercicios = useMemo(
    () => evolucaoPorCategoria.get(categoria) ?? [],
    [evolucaoPorCategoria, categoria]
  );
  const dados = useMemo(() => unificarPontos(exercicios), [exercicios]);

  function alternarVisibilidade(exercicioId: string) {
    setOcultos((atual) => {
      const novo = new Set(atual);
      if (novo.has(exercicioId)) {
        novo.delete(exercicioId);
      } else {
        novo.add(exercicioId);
      }
      return novo;
    });
  }

  if (categorias.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Conclua treinos atribuídos com peso registrado para ver a evolução por categoria.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Selecao
        rotulo="Categoria"
        opcoes={categorias.map((nome) => ({ valor: nome, rotulo: nome }))}
        value={categoria}
        onChange={(evento) => {
          setCategoria(evento.target.value);
          setOcultos(new Set());
        }}
      />

      {dados.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Ainda não há peso registrado nos últimos 90 dias para essa categoria.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke={COR_GRADE_DARK} vertical={false} />
            <XAxis
              dataKey="data"
              tickFormatter={formatarDataBr}
              stroke={COR_TEXTO_MUTED_DARK}
              fontSize={11}
            />
            <YAxis stroke={COR_TEXTO_MUTED_DARK} fontSize={11} width={40} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a19", border: "1px solid #2c2c2a" }}
              labelFormatter={(valor) => formatarDataBr(String(valor))}
              formatter={(valor, nome) => [
                valor === null ? "-" : `${Number(valor).toFixed(1)} kg`,
                exercicios.find((exercicio) => exercicio.exercicioId === nome)?.exercicioNome ?? nome,
              ]}
            />
            <Legend
              onClick={(entrada) => alternarVisibilidade(String(entrada.dataKey))}
              formatter={(valor, entrada) => {
                const exercicioId = String((entrada as { dataKey?: string }).dataKey ?? valor);
                const nome =
                  exercicios.find((exercicio) => exercicio.exercicioId === exercicioId)
                    ?.exercicioNome ?? valor;
                const oculto = ocultos.has(exercicioId);
                return (
                  <span
                    className={`cursor-pointer text-xs ${oculto ? "text-zinc-600 line-through" : "text-zinc-300"}`}
                  >
                    {nome}
                  </span>
                );
              }}
            />
            {exercicios.map((exercicio, indice) => (
              <Line
                key={exercicio.exercicioId}
                type="monotone"
                dataKey={exercicio.exercicioId}
                name={exercicio.exercicioId}
                stroke={CORES_CATEGORICAS_DARK[indice % CORES_CATEGORICAS_DARK.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
                hide={ocultos.has(exercicio.exercicioId)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
