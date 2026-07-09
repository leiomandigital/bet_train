"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTreinos } from "@/hooks/useTreinos";
import { Campo } from "@/components/ui/Campo";
import { Selecao } from "@/components/ui/Selecao";
import { Botao } from "@/components/ui/Botao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Carregando } from "@/components/ui/Carregando";
import { FormularioAdicionarExercicio } from "@/components/treino/FormularioAdicionarExercicio";
import { ListaRascunhoExercicios } from "@/components/treino/ListaRascunhoExercicios";
import { EQUIPAMENTOS_AQUECIMENTO } from "@/types/treino.types";
import type { ItemTreinoRascunho } from "@/types/treino.types";
import { dataDeHoje, formatarDataBr } from "@/utils/formatters";

export default function PaginaTreino() {
  return (
    <Suspense fallback={<Carregando />}>
      <ConteudoTreino />
    </Suspense>
  );
}

function ConteudoTreino() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const treinoIdParaRepetir = searchParams.get("repetir");

  const { treinos, finalizarTreino, erro } = useTreinos();

  const [data, setData] = useState(dataDeHoje());
  const [aquecimentoEquipamento, setAquecimentoEquipamento] = useState("");
  const [aquecimentoMinutos, setAquecimentoMinutos] = useState("");
  const [itens, setItens] = useState<ItemTreinoRascunho[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [treinoRepetidoData, setTreinoRepetidoData] = useState<string | null>(null);
  const [jaPreencheuRepeticao, setJaPreencheuRepeticao] = useState(false);

  useEffect(() => {
    if (!treinoIdParaRepetir || jaPreencheuRepeticao || treinos.length === 0) return;

    const treinoOriginal = treinos.find((treino) => treino.id === treinoIdParaRepetir);
    if (treinoOriginal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pré-preenche rascunho a partir do treino selecionado no histórico
      setAquecimentoEquipamento(treinoOriginal.aquecimentoEquipamento ?? "");
      setAquecimentoMinutos(treinoOriginal.aquecimentoMinutos?.toString() ?? "");
      setItens(
        treinoOriginal.exercicios.map((item) => ({
          exercicioId: item.exercicioId,
          exercicioNome: item.exercicioNome,
          categoriaNome: item.categoriaNome,
          series: item.series,
          repeticoes: item.repeticoes,
          pesoKg: item.pesoKg,
          intervaloSegundos: item.intervaloSegundos,
        }))
      );
      setTreinoRepetidoData(treinoOriginal.data);
    }
    setJaPreencheuRepeticao(true);
  }, [treinoIdParaRepetir, treinos, jaPreencheuRepeticao]);

  function adicionarItem(item: ItemTreinoRascunho) {
    setItens((atual) => [...atual, item]);
    setSucesso(false);
  }

  function removerItem(indice: number) {
    setItens((atual) => atual.filter((_, i) => i !== indice));
  }

  function editarItem(indice: number, itemAtualizado: ItemTreinoRascunho) {
    setItens((atual) => atual.map((item, i) => (i === indice ? itemAtualizado : item)));
  }

  function limparRepeticao() {
    setTreinoRepetidoData(null);
    router.replace("/treino");
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
      if (treinoRepetidoData) limparRepeticao();
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-zinc-100">Novo treino</h1>

      {treinoRepetidoData && (
        <div className="flex items-center justify-between rounded-lg border border-blue-800 bg-blue-950/60 px-3 py-2.5 text-sm text-blue-300">
          <span>Repetindo treino de {formatarDataBr(treinoRepetidoData)}</span>
          <button onClick={limparRepeticao} className="text-xs underline">
            Limpar
          </button>
        </div>
      )}

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
        <ListaRascunhoExercicios itens={itens} aoRemover={removerItem} aoEditar={editarItem} />
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
