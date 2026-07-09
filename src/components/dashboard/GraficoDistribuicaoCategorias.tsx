"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CORES_CATEGORICAS_DARK, COR_GRADE_DARK, COR_TEXTO_MUTED_DARK } from "./paleta";
import type { PontoDistribuicaoCategoria } from "@/hooks/useDashboard";

export function GraficoDistribuicaoCategorias({
  dados,
}: {
  dados: PontoDistribuicaoCategoria[];
}) {
  if (dados.length === 0) {
    return <p className="text-sm text-zinc-500">Sem exercícios suficientes para exibir o gráfico.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, dados.length * 36)}>
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid stroke={COR_GRADE_DARK} horizontal={false} />
        <XAxis type="number" stroke={COR_TEXTO_MUTED_DARK} fontSize={11} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="categoria"
          stroke={COR_TEXTO_MUTED_DARK}
          fontSize={11}
          width={80}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#1a1a19", border: "1px solid #2c2c2a" }}
          formatter={(valor) => [valor, "Exercícios"]}
        />
        <Bar dataKey="quantidade" radius={[0, 4, 4, 0]}>
          {dados.map((_, indice) => (
            <Cell key={indice} fill={CORES_CATEGORICAS_DARK[indice % CORES_CATEGORICAS_DARK.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
