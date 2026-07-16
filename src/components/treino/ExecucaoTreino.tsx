"use client";

import { useEffect, useState } from "react";
import { useExecucaoTreino } from "@/hooks/useExecucaoTreino";
import { Cartao } from "@/components/ui/Cartao";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Carregando } from "@/components/ui/Carregando";
import { CronometroTotal } from "@/components/treino/CronometroTotal";
import { ContagemRegressivaIntervalo } from "@/components/treino/ContagemRegressivaIntervalo";
import type { TreinoExecucaoExercicio, TreinoSerie } from "@/types/treinoExecucao.types";

type Bloco = TreinoExecucaoExercicio[];

function agruparEmBlocos(exercicios: TreinoExecucaoExercicio[]): Bloco[] {
  const blocos: Bloco[] = [];
  let atual: Bloco = [];
  for (const exercicio of exercicios) {
    atual.push(exercicio);
    if (!exercicio.encadeadoComProximo) {
      blocos.push(atual);
      atual = [];
    }
  }
  if (atual.length > 0) blocos.push(atual);
  return blocos;
}

function blocoCompleto(bloco: Bloco): boolean {
  return bloco.every((exercicio) => exercicio.series.every((serie) => serie.concluida));
}

const NENHUM_ABERTO = -1;

export function ExecucaoTreino({
  execucaoId,
  aoConcluir,
}: {
  execucaoId: string;
  aoConcluir?: () => void;
}) {
  const { execucao, carregando, erro, salvarSerie, concluir } = useExecucaoTreino(execucaoId);
  const [concluindo, setConcluindo] = useState(false);
  const [overrideIndex, setOverrideIndex] = useState<number | null>(null);

  const blocos = execucao ? agruparEmBlocos(execucao.exercicios) : [];
  const primeiroIncompletoIndex = blocos.findIndex((bloco) => !blocoCompleto(bloco));
  const efetivoIndex = overrideIndex !== null ? overrideIndex : primeiroIncompletoIndex;

  useEffect(() => {
    if (overrideIndex === null || overrideIndex === NENHUM_ABERTO) return;
    const bloco = blocos[overrideIndex];
    if (bloco && blocoCompleto(bloco)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- avança pro próximo bloco assim que o atual é concluído
      setOverrideIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reavalia a cada atualização de execucao (após salvar série), não quando overrideIndex muda
  }, [execucao]);

  async function lidarComConcluir() {
    setConcluindo(true);
    const ok = await concluir();
    setConcluindo(false);
    if (ok) aoConcluir?.();
  }

  function alternarBloco(indice: number) {
    setOverrideIndex(efetivoIndex === indice ? NENHUM_ABERTO : indice);
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
        {blocos.map((bloco, indice) => {
          const completo = blocoCompleto(bloco);
          const aberto = jaConcluido || indice === efetivoIndex;
          const nomeBloco = bloco.map((exercicio) => exercicio.exercicioNome).join(" + ");

          if (!aberto) {
            return (
              <button
                key={bloco[0].id}
                onClick={() => alternarBloco(indice)}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left"
              >
                <span className={`text-sm ${completo ? "text-zinc-500 line-through" : "text-zinc-100"}`}>
                  {completo && "✓ "}
                  {nomeBloco}
                </span>
                <span className="text-zinc-500">▾</span>
              </button>
            );
          }

          return (
            <Cartao key={bloco[0].id} className="flex flex-col gap-3">
              <button
                onClick={() => !jaConcluido && alternarBloco(indice)}
                className="flex items-center justify-between gap-2 text-left"
              >
                <span className="min-w-0 truncate text-sm font-medium text-zinc-100">
                  {completo && "✓ "}
                  {nomeBloco}
                </span>
                {!jaConcluido && <span className="shrink-0 text-zinc-500">▴</span>}
              </button>

              {bloco.map((exercicio) => (
                <div key={exercicio.id} className="flex flex-col gap-2">
                  {bloco.length > 1 && (
                    <p className="text-xs font-medium text-zinc-300">{exercicio.exercicioNome}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-zinc-500">{exercicio.categoriaNome}</p>
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
                </div>
              ))}
            </Cartao>
          );
        })}
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
