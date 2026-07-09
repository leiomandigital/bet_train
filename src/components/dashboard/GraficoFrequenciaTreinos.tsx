"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatarDataBr } from "@/utils/formatters";
import { CORES_CATEGORICAS_DARK, COR_GRADE_DARK, COR_TEXTO_MUTED_DARK } from "./paleta";
import type { PontoFrequenciaTreino } from "@/hooks/useDashboard";

export function GraficoFrequenciaTreinos({ dados }: { dados: PontoFrequenciaTreino[] }) {
  if (dados.length === 0) {
    return <p className="text-sm text-zinc-500">Sem treinos suficientes para exibir o gráfico.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={dados} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={COR_GRADE_DARK} vertical={false} />
        <XAxis
          dataKey="semana"
          tickFormatter={formatarDataBr}
          stroke={COR_TEXTO_MUTED_DARK}
          fontSize={11}
        />
        <YAxis stroke={COR_TEXTO_MUTED_DARK} fontSize={11} width={30} allowDecimals={false} />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a19", border: "1px solid #2c2c2a" }}
          labelFormatter={(valor) => `Semana de ${formatarDataBr(String(valor))}`}
          formatter={(valor) => [valor, "Treinos"]}
        />
        <Bar dataKey="quantidade" fill={CORES_CATEGORICAS_DARK[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
