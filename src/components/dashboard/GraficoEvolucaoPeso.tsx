"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatarDataBr } from "@/utils/formatters";
import { CORES_CATEGORICAS_DARK, COR_GRADE_DARK, COR_TEXTO_MUTED_DARK } from "./paleta";
import type { PontoEvolucaoPeso } from "@/hooks/useDashboard";

export function GraficoEvolucaoPeso({ dados }: { dados: PontoEvolucaoPeso[] }) {
  if (dados.length === 0) {
    return <p className="text-sm text-zinc-500">Sem medidas suficientes para exibir o gráfico.</p>;
  }

  return (
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
          formatter={(valor) => [`${Number(valor).toFixed(1)} kg`, "Peso"]}
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
  );
}
