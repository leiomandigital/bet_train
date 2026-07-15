"use client";

import { useState } from "react";
import { useExecucaoTreino } from "@/hooks/useExecucaoTreino";
import { Cartao } from "@/components/ui/Cartao";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Carregando } from "@/components/ui/Carregando";
import { CronometroTotal } from "@/components/treino/CronometroTotal";
import { ContagemRegressivaIntervalo } from "@/components/treino/ContagemRegressivaIntervalo";
import type { TreinoSerie } from "@/types/treinoExecucao.types";

export function ExecucaoTreino({
  execucaoId,
  aoConcluir,
}: {
  execucaoId: string;
  aoConcluir?: () => void;
}) {
  const { execucao, carregando, erro, salvarSerie, concluir } = useExecucaoTreino(execucaoId);
  const [concluindo, setConcluindo] = useState(false);

  async function lidarComConcluir() {
    setConcluindo(true);
    const ok = await concluir();
    setConcluindo(false);
    if (ok) aoConcluir?.();
  }

  if (carregando) return <Carregando />;
  if (!execucao) return <MensagemErro mensagem={erro ?? "Treino não encontrado."} />;

  const jaConcluido = execucao.concluidoEm !== null;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <h1 className="text-lg font-bold text-zinc-100">Executando treino</h1>

      <CronometroTotal iniciadoEm={execucao.iniciadoEm} parado={jaConcluido} />

      <MensagemErro mensagem={erro} />

      <div className="flex flex-col gap-3">
        {execucao.exercicios.map((exercicio) => (
          <Cartao key={exercicio.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-100">
                  {exercicio.exercicioNome}
                </p>
                <p className="text-xs text-zinc-500">{exercicio.categoriaNome}</p>
              </div>
              {!jaConcluido && (
                <ContagemRegressivaIntervalo segundosIniciais={exercicio.intervaloSegundos} />
              )}
            </div>

            <div className="flex flex-col gap-2">
              {exercicio.series.map((serie) => (
                <LinhaSerie
                  key={serie.id}
                  serie={serie}
                  desabilitado={jaConcluido}
                  aoSalvar={(input) => salvarSerie(serie.id, input)}
                />
              ))}
            </div>
          </Cartao>
        ))}
      </div>

      {jaConcluido ? (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950/60 px-3 py-2.5 text-sm text-emerald-300">
          Treino concluído!
        </p>
      ) : (
        <Botao carregando={concluindo} onClick={lidarComConcluir}>
          Concluir treino
        </Botao>
      )}
    </div>
  );
}

function LinhaSerie({
  serie,
  desabilitado,
  aoSalvar,
}: {
  serie: TreinoSerie;
  desabilitado: boolean;
  aoSalvar: (input: { repeticoes: number; pesoKg: number | null; concluida: boolean }) => void;
}) {
  const [repeticoes, setRepeticoes] = useState(serie.repeticoes.toString());
  const [pesoKg, setPesoKg] = useState(serie.pesoKg?.toString() ?? "");
  const [concluida, setConcluida] = useState(serie.concluida);

  function salvar(alteracoes: Partial<{ repeticoes: string; pesoKg: string; concluida: boolean }>) {
    const novoRepeticoes = alteracoes.repeticoes ?? repeticoes;
    const novoPesoKg = alteracoes.pesoKg ?? pesoKg;
    const novaConcluida = alteracoes.concluida ?? concluida;

    aoSalvar({
      repeticoes: Number(novoRepeticoes) || 0,
      pesoKg: novoPesoKg.trim() ? Number(novoPesoKg) : null,
      concluida: novaConcluida,
    });
  }

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2">
      <span className="w-5 shrink-0 text-xs text-zinc-500">#{serie.numeroSerie}</span>

      <div className="min-w-0 flex-1">
        <Campo
          rotulo=""
          type="number"
          inputMode="numeric"
          value={repeticoes}
          disabled={desabilitado}
          onChange={(evento) => setRepeticoes(evento.target.value)}
          onBlur={() => salvar({})}
          className="w-full !py-1.5 text-center"
          placeholder="Reps"
        />
      </div>
      <div className="min-w-0 flex-1">
        <Campo
          rotulo=""
          type="number"
          inputMode="decimal"
          value={pesoKg}
          disabled={desabilitado}
          onChange={(evento) => setPesoKg(evento.target.value)}
          onBlur={() => salvar({})}
          className="w-full !py-1.5 text-center"
          placeholder="Kg"
        />
      </div>
      <input
        type="checkbox"
        checked={concluida}
        disabled={desabilitado}
        onChange={(evento) => {
          setConcluida(evento.target.checked);
          salvar({ concluida: evento.target.checked });
        }}
        className="h-4 w-4 shrink-0 accent-emerald-500"
      />
    </div>
  );
}
