"use client";

import { useState } from "react";
import { useTreinos } from "@/hooks/useTreinos";
import { Campo } from "@/components/ui/Campo";
import { Selecao } from "@/components/ui/Selecao";
import { Botao } from "@/components/ui/Botao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { FormularioAdicionarExercicio } from "@/components/treino/FormularioAdicionarExercicio";
import { ListaRascunhoExercicios } from "@/components/treino/ListaRascunhoExercicios";
import { EQUIPAMENTOS_AQUECIMENTO } from "@/types/treino.types";
import type { ItemTreinoRascunho } from "@/types/treino.types";
import { dataDeHoje } from "@/utils/formatters";

export default function PaginaTreino() {
  const { finalizarTreino, erro } = useTreinos();

  const [data, setData] = useState(dataDeHoje());
  const [aquecimentoEquipamento, setAquecimentoEquipamento] = useState("");
  const [aquecimentoMinutos, setAquecimentoMinutos] = useState("");
  const [itens, setItens] = useState<ItemTreinoRascunho[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function adicionarItem(item: ItemTreinoRascunho) {
    setItens((atual) => [...atual, item]);
    setSucesso(false);
  }

  function removerItem(indice: number) {
    setItens((atual) => atual.filter((_, i) => i !== indice));
  }

  async function lidarComFinalizar() {
    setSalvando(true);
    setSucesso(false);
    const ok = await finalizarTreino({
      data,
      aquecimentoEquipamento: aquecimentoEquipamento || null,
      aquecimentoMinutos: aquecimentoMinutos ? Number(aquecimentoMinutos) : null,
      itens,
    });
    setSalvando(false);
    if (ok) {
      setItens([]);
      setAquecimentoEquipamento("");
      setAquecimentoMinutos("");
      setData(dataDeHoje());
      setSucesso(true);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-zinc-100">Novo treino</h1>

      <Campo
        rotulo="Data"
        type="date"
        value={data}
        onChange={(evento) => setData(evento.target.value)}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <h3 className="text-sm font-semibold text-zinc-200">Aquecimento</h3>
        <Selecao
          rotulo="Equipamento"
          placeholder="Nenhum"
          opcoes={EQUIPAMENTOS_AQUECIMENTO.map((equipamento) => ({
            valor: equipamento,
            rotulo: equipamento,
          }))}
          value={aquecimentoEquipamento}
          onChange={(evento) => setAquecimentoEquipamento(evento.target.value)}
        />
        <Campo
          rotulo="Minutos"
          type="number"
          inputMode="numeric"
          value={aquecimentoMinutos}
          onChange={(evento) => setAquecimentoMinutos(evento.target.value)}
        />
      </div>

      <FormularioAdicionarExercicio aoAdicionar={adicionarItem} />

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-zinc-200">Exercícios da sessão</h3>
        <ListaRascunhoExercicios itens={itens} aoRemover={removerItem} />
      </div>

      <MensagemErro mensagem={erro} />
      {sucesso && (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950/60 px-3 py-2.5 text-sm text-emerald-300">
          Treino salvo com sucesso!
        </p>
      )}

      <Botao carregando={salvando} onClick={lidarComFinalizar}>
        Finalizar treino
      </Botao>
    </div>
  );
}
