"use client";

import { useDashboard } from "@/hooks/useDashboard";
import { Carregando } from "@/components/ui/Carregando";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Cartao } from "@/components/ui/Cartao";
import { CartaoMetrica } from "@/components/dashboard/CartaoMetrica";
import { GraficoEvolucaoPeso } from "@/components/dashboard/GraficoEvolucaoPeso";
import { GraficoEvolucaoMedidas } from "@/components/dashboard/GraficoEvolucaoMedidas";
import { GraficoEvolucaoPesoPorCategoria } from "@/components/dashboard/GraficoEvolucaoPesoPorCategoria";
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
    categoriasComHistoricoPeso,
    evolucaoPesoPorCategoria,
    distribuicaoPorCategoria,
  } = useDashboard();

  if (carregando) return <Carregando />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-zinc-100">Dashboard</h1>
      <MensagemErro mensagem={erro} />

      <div className="grid grid-cols-2 gap-3">
        <CartaoMetrica icone="🏋️" rotulo="Treinos no mês" valor={String(totalTreinosNoMes)} />
        <CartaoMetrica
          icone="⚖️"
          rotulo="Peso atual vs. inicial"
          valor={
            pesoAtual !== null && pesoInicial !== null
              ? `${formatarPeso(pesoAtual)} / ${formatarPeso(pesoInicial)}`
              : "-"
          }
        />
        <CartaoMetrica
          icone="📅"
          rotulo="Dias desde o último treino"
          valor={diasDesdeUltimoTreino !== null ? String(diasDesdeUltimoTreino) : "-"}
        />
        <CartaoMetrica
          icone="✅"
          rotulo="Exercícios realizados"
          valor={String(totalExerciciosRealizados)}
        />
      </div>

      <Cartao>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">
          Evolução de peso por categoria
          <span className="ml-1 font-normal text-zinc-500">(últimos 90 dias)</span>
        </h2>
        <GraficoEvolucaoPesoPorCategoria
          categorias={categoriasComHistoricoPeso}
          evolucaoPorCategoria={evolucaoPesoPorCategoria}
        />
      </Cartao>

      <Cartao>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Evolução do peso corporal</h2>
        <GraficoEvolucaoPeso dados={evolucaoPeso} />
      </Cartao>

      <Cartao>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Evolução das medidas corporais</h2>
        <GraficoEvolucaoMedidas dados={evolucaoMedidas} />
      </Cartao>

      <Cartao>
        <h2 className="mb-2 text-sm font-semibold text-zinc-200">Distribuição por grupo muscular</h2>
        <GraficoDistribuicaoCategorias dados={distribuicaoPorCategoria} />
      </Cartao>
    </div>
  );
}
