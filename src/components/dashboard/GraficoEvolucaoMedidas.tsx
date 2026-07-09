"use client";

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
import { formatarDataBr } from "@/utils/formatters";
import { CORES_CATEGORICAS_DARK, COR_GRADE_DARK, COR_TEXTO_MUTED_DARK, COR_TEXTO_SECUNDARIO_DARK } from "./paleta";
import type { PontoEvolucaoMedidas } from "@/hooks/useDashboard";

export function GraficoEvolucaoMedidas({ dados }: { dados: PontoEvolucaoMedidas[] }) {
  if (dados.length === 0) {
    return <p className="text-sm text-zinc-500">Sem medidas suficientes para exibir o gráfico.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
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
        />
        <Legend wrapperStyle={{ fontSize: 12, color: COR_TEXTO_SECUNDARIO_DARK }} />
        <Line
          type="monotone"
          dataKey="umbigo"
          name="Umbigo (cm)"
          stroke={CORES_CATEGORICAS_DARK[0]}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="peitoral"
          name="Peitoral (cm)"
          stroke={CORES_CATEGORICAS_DARK[1]}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="bicepsDireito"
          name="Bíceps direito (cm)"
          stroke={CORES_CATEGORICAS_DARK[2]}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
