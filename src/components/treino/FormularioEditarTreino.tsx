"use client";

import { useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { Selecao } from "@/components/ui/Selecao";
import { Botao } from "@/components/ui/Botao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { FormularioAdicionarExercicio } from "@/components/treino/FormularioAdicionarExercicio";
import { ListaRascunhoExercicios } from "@/components/treino/ListaRascunhoExercicios";
import { EQUIPAMENTOS_AQUECIMENTO } from "@/types/treino.types";
import type { AtualizarTreinoInput, ItemTreinoRascunho, Treino } from "@/types/treino.types";

export function FormularioEditarTreino({
  treino,
  aoSalvar,
  aoCancelar,
  erro,
}: {
  treino: Treino;
  aoSalvar: (input: AtualizarTreinoInput) => Promise<boolean>;
  aoCancelar: () => void;
  erro: string | null;
}) {
  const [data, setData] = useState(treino.data);
  const [aquecimentoEquipamento, setAquecimentoEquipamento] = useState(
    treino.aquecimentoEquipamento ?? ""
  );
  const [aquecimentoMinutos, setAquecimentoMinutos] = useState(
    treino.aquecimentoMinutos?.toString() ?? ""
  );
  const [itens, setItens] = useState<ItemTreinoRascunho[]>(
    treino.exercicios.map((item) => ({
      exercicioId: item.exercicioId,
      exercicioNome: item.exercicioNome,
      categoriaNome: item.categoriaNome,
      series: item.series,
      repeticoes: item.repeticoes,
      pesoKg: item.pesoKg,
      intervaloSegundos: item.intervaloSegundos,
    }))
  );
  const [salvando, setSalvando] = useState(false);

  function adicionarItem(item: ItemTreinoRascunho) {
    setItens((atual) => [...atual, item]);
  }

  function removerItem(indice: number) {
    setItens((atual) => atual.filter((_, i) => i !== indice));
  }

  async function lidarComSalvar() {
    setSalvando(true);
    const ok = await aoSalvar({
      data,
      aquecimentoEquipamento: aquecimentoEquipamento || null,
      aquecimentoMinutos: aquecimentoMinutos ? Number(aquecimentoMinutos) : null,
      itens,
    });
    setSalvando(false);
    if (ok) aoCancelar();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-emerald-800 bg-zinc-900/60 p-4">
      <h3 className="text-sm font-semibold text-zinc-100">Editando treino</h3>

      <Campo rotulo="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />

      <Selecao
        rotulo="Equipamento de aquecimento"
        placeholder="Nenhum"
        opcoes={EQUIPAMENTOS_AQUECIMENTO.map((equipamento) => ({
          valor: equipamento,
          rotulo: equipamento,
        }))}
        value={aquecimentoEquipamento}
        onChange={(e) => setAquecimentoEquipamento(e.target.value)}
      />
      <Campo
        rotulo="Minutos de aquecimento"
        type="number"
        value={aquecimentoMinutos}
        onChange={(e) => setAquecimentoMinutos(e.target.value)}
      />

      <FormularioAdicionarExercicio aoAdicionar={adicionarItem} />

      <ListaRascunhoExercicios itens={itens} aoRemover={removerItem} />

      <MensagemErro mensagem={erro} />

      <div className="flex gap-3">
        <Botao variante="secundario" onClick={aoCancelar}>
          Cancelar
        </Botao>
        <Botao carregando={salvando} onClick={lidarComSalvar}>
          Salvar alterações
        </Botao>
      </div>
    </div>
  );
}
