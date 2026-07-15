"use client";

import { useState } from "react";
import {
  CartesianGrid,
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
import type { ExercicioComHistorico, PontoEvolucaoPesoExercicio } from "@/hooks/useDashboard";

export function GraficoEvolucaoPesoExercicio({
  exercicios,
  evolucaoPorExercicio,
}: {
  exercicios: ExercicioComHistorico[];
  evolucaoPorExercicio: Map<string, PontoEvolucaoPesoExercicio[]>;
}) {
  const [exercicioId, setExercicioId] = useState(exercicios[0]?.id ?? "");

  if (exercicios.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Conclua treinos atribuídos com peso registrado para ver a evolução por exercício.
      </p>
    );
  }

  const dados = evolucaoPorExercicio.get(exercicioId) ?? [];

  return (
    <div className="flex flex-col gap-3">
      <Selecao
        rotulo="Exercício"
        opcoes={exercicios.map((exercicio) => ({ valor: exercicio.id, rotulo: exercicio.nome }))}
        value={exercicioId}
        onChange={(evento) => setExercicioId(evento.target.value)}
      />

      {dados.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Ainda não há peso registrado suficiente para esse exercício.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
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
              formatter={(valor) => [`${Number(valor).toFixed(1)} kg`, "Peso máximo"]}
            />
            <Line
              type="monotone"
              dataKey="pesoKg"
              stroke={CORES_CATEGORICAS_DARK[0]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
