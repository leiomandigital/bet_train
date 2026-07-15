"use client";

import { useMemo, useState } from "react";
import { useMinhasAtribuicoes } from "@/hooks/useMinhasAtribuicoes";
import { Cartao } from "@/components/ui/Cartao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Carregando } from "@/components/ui/Carregando";
import { ExecucaoTreino } from "@/components/treino/ExecucaoTreino";
import type { TreinoAtribuicao } from "@/types/treinoAtribuicao.types";

export function PainelTreinoAtual() {
  const {
    atribuicoes,
    emAndamento,
    execucaoIdAtual,
    proximaPendente,
    carregando,
    erro,
    iniciar,
    recarregar,
  } = useMinhasAtribuicoes();
  const [iniciando, setIniciando] = useState<string | null>(null);

  const atribuicoesOrdenadas = useMemo(
    () => [...atribuicoes].sort((a, b) => a.ordem - b.ordem),
    [atribuicoes]
  );

  async function lidarComIniciar(atribuicaoId: string) {
    setIniciando(atribuicaoId);
    await iniciar(atribuicaoId);
    setIniciando(null);
  }

  if (carregando) return <Carregando />;

  if (emAndamento && execucaoIdAtual) {
    return <ExecucaoTreino execucaoId={execucaoIdAtual} aoConcluir={recarregar} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-zinc-100">Treino</h1>

      <MensagemErro mensagem={erro} />

      {atribuicoesOrdenadas.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum treino atribuído ainda.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {atribuicoesOrdenadas.map((atribuicao) => (
            <CartaoAtribuicao
              key={atribuicao.id}
              atribuicao={atribuicao}
              atual={atribuicao.id === proximaPendente?.id}
              iniciando={iniciando === atribuicao.id}
              aoIniciar={() => lidarComIniciar(atribuicao.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CartaoAtribuicao({
  atribuicao,
  atual,
  iniciando,
  aoIniciar,
}: {
  atribuicao: TreinoAtribuicao;
  atual: boolean;
  iniciando: boolean;
  aoIniciar: () => void;
}) {
  const concluido = atribuicao.status === "concluido";

  return (
    <Cartao
      className={`flex items-center justify-between gap-3 ${
        atual ? "border-emerald-800" : concluido ? "opacity-60" : ""
      }`}
    >
      <div>
        <p className="text-sm font-medium text-zinc-100">{atribuicao.templateNome}</p>
        <p className="text-xs text-zinc-500">
          {concluido ? "Concluído" : atual ? "Atual" : "Aguardando"}
        </p>
      </div>

      {atual && (
        <button
          disabled={iniciando}
          onClick={aoIniciar}
          className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {iniciando ? "Iniciando..." : "Iniciar"}
        </button>
      )}
    </Cartao>
  );
}
