"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { Carregando } from "@/components/ui/Carregando";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Cartao } from "@/components/ui/Cartao";
import { CartaoMetrica } from "@/components/dashboard/CartaoMetrica";
import { GraficoEvolucaoPeso } from "@/components/dashboard/GraficoEvolucaoPeso";
import { GraficoEvolucaoMedidas } from "@/components/dashboard/GraficoEvolucaoMedidas";
import { GraficoFrequenciaTreinos } from "@/components/dashboard/GraficoFrequenciaTreinos";
import { GraficoDistribuicaoCategorias } from "@/components/dashboard/GraficoDistribuicaoCategorias";
import { formatarPeso } from "@/utils/formatters";

export default function PaginaDashboard() {
  const {
    carregando,
    erro,
    totalTreinosNoMes,
    pesoAtual,
    pesoInicial,
    diasDesdeUltimoTreino,
    totalExerciciosRealizados,
    evolucaoPeso,
    evolucaoMedidas,
    frequenciaSemanal,
    distribuicaoPorCategoria,
  } = useDashboard();

  if (carregando) return <Carregando />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-zinc-100">Dashboard</h1>
      <MensagemErro mensagem={erro} />

      <div className="grid grid-cols-2 gap-3">
        <CartaoMetrica rotulo="Treinos no mês" valor={String(totalTreinosNoMes)} />
        <CartaoMetrica
          rotulo="Peso atual vs. inicial"
          valor={
            pesoAtual !== null && pesoInicial !== null
              ? `${formatarPeso(pesoAtual)} / ${formatarPeso(pesoInicial)}`
              : "-"
          }
        />
        <CartaoMetrica
          rotulo="Dias desde o último treino"
          valor={diasDesdeUltimoTreino !== null ? String(diasDesdeUltimoTreino) : "-"}
        />
        <CartaoMetrica rotulo="Exercícios realizados" valor={String(totalExerciciosRealizados)} />
      </div>

      <Cartao>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Evolução do peso</h2>
        <GraficoEvolucaoPeso dados={evolucaoPeso} />
      </Cartao>

      <Cartao>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Evolução das medidas corporais</h2>
        <GraficoEvolucaoMedidas dados={evolucaoMedidas} />
      </Cartao>

      <Cartao>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Frequência de treinos por semana</h2>
        <GraficoFrequenciaTreinos dados={frequenciaSemanal} />
      </Cartao>

      <Cartao>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Distribuição por grupo muscular</h2>
        <GraficoDistribuicaoCategorias dados={distribuicaoPorCategoria} />
      </Cartao>
    </div>
  );
}
