"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLancamentoRetroativo } from "@/hooks/useLancamentoRetroativo";
import { Selecao } from "@/components/ui/Selecao";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Carregando } from "@/components/ui/Carregando";
import { dataDeHoje } from "@/utils/formatters";
import type { TreinoAtribuicao } from "@/types/treinoAtribuicao.types";
import type { ItemRetroativo } from "@/services/treinoAtribuicaoService";

interface SerieForm {
  repeticoes: string;
  pesoKg: string;
}

interface ExercicioForm {
  incluido: boolean;
  series: SerieForm[];
}

export default function PaginaLancarTreinoPassado() {
  const router = useRouter();
  const {
    atribuicoes,
    exerciciosDoTemplate,
    carregandoAtribuicoes,
    carregandoExercicios,
    erro,
    carregarExercicios,
    salvar,
  } = useLancamentoRetroativo();

  const [atribuicaoId, setAtribuicaoId] = useState("");
  const [data, setData] = useState(dataDeHoje());
  const [form, setForm] = useState<Record<string, ExercicioForm>>({});
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const atribuicaoSelecionada = atribuicoes.find((item) => item.id === atribuicaoId) ?? null;

  useEffect(() => {
    if (!atribuicaoSelecionada) return;
    carregarExercicios(atribuicaoSelecionada);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reseta o aviso de sucesso ao trocar de treino
    setSucesso(false);
  }, [atribuicaoSelecionada, carregarExercicios]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- inicializa o formulário quando os exercícios do template carregam
    setForm(
      Object.fromEntries(
        exerciciosDoTemplate.map((item) => [
          item.exercicioId,
          {
            incluido: true,
            series: Array.from({ length: item.series }, () => ({
              repeticoes: String(item.repeticoes),
              pesoKg: "",
            })),
          },
        ])
      )
    );
  }, [exerciciosDoTemplate]);

  function alternarIncluido(exercicioId: string) {
    setForm((atual) => ({
      ...atual,
      [exercicioId]: { ...atual[exercicioId], incluido: !atual[exercicioId].incluido },
    }));
  }

  function atualizarSerie(exercicioId: string, indice: number, campo: keyof SerieForm, valor: string) {
    setForm((atual) => ({
      ...atual,
      [exercicioId]: {
        ...atual[exercicioId],
        series: atual[exercicioId].series.map((serie, i) =>
          i === indice ? { ...serie, [campo]: valor } : serie
        ),
      },
    }));
  }

  async function lidarComSalvar() {
    if (!atribuicaoSelecionada) return;

    const itens: ItemRetroativo[] = exerciciosDoTemplate
      .filter((item) => form[item.exercicioId]?.incluido)
      .map((item) => ({
        exercicioId: item.exercicioId,
        intervaloSegundos: item.intervaloSegundos,
        series: form[item.exercicioId].series.map((serie, indice) => ({
          numeroSerie: indice + 1,
          repeticoes: Number(serie.repeticoes) || 0,
          pesoKg: serie.pesoKg.trim() ? Number(serie.pesoKg) : null,
        })),
      }));

    setSalvando(true);
    setSucesso(false);
    const ok = await salvar(atribuicaoSelecionada, data, itens);
    setSalvando(false);
    if (ok) {
      setSucesso(true);
      setTimeout(() => router.push("/historico"), 1200);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-bold text-zinc-100">Lançar treino do passado</h1>

      {carregandoAtribuicoes ? (
        <Carregando />
      ) : (
        <Selecao
          rotulo="Treino"
          placeholder="Selecione um treino atribuído"
          opcoes={atribuicoes.map((atribuicao: TreinoAtribuicao) => ({
            valor: atribuicao.id,
            rotulo: atribuicao.templateNome,
          }))}
          value={atribuicaoId}
          onChange={(evento) => setAtribuicaoId(evento.target.value)}
        />
      )}

      {atribuicaoSelecionada && (
        <>
          <Campo
            rotulo="Data em que o treino foi feito"
            type="date"
            max={dataDeHoje()}
            value={data}
            onChange={(evento) => setData(evento.target.value)}
          />

          <MensagemErro mensagem={erro} />

          {carregandoExercicios ? (
            <Carregando />
          ) : (
            <div className="flex flex-col gap-3">
              {exerciciosDoTemplate.map((item) => {
                const estado = form[item.exercicioId];
                if (!estado) return null;

                return (
                  <Cartao key={item.exercicioId} className="flex flex-col gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={estado.incluido}
                        onChange={() => alternarIncluido(item.exercicioId)}
                        className="h-4 w-4 accent-emerald-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-zinc-100">{item.exercicioNome}</p>
                        <p className="text-xs text-zinc-500">{item.categoriaNome}</p>
                      </div>
                    </label>

                    {estado.incluido && (
                      <div className="flex flex-col gap-2">
                        {estado.series.map((serie, indice) => (
                          <div
                            key={indice}
                            className="flex min-w-0 items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2"
                          >
                            <span className="w-5 shrink-0 text-xs text-zinc-500">#{indice + 1}</span>
                            <div className="min-w-0 flex-1">
                              <Campo
                                rotulo=""
                                type="number"
                                inputMode="numeric"
                                value={serie.repeticoes}
                                onChange={(evento) =>
                                  atualizarSerie(item.exercicioId, indice, "repeticoes", evento.target.value)
                                }
                                className="w-full !py-1.5 text-center"
                                placeholder="Reps"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Campo
                                rotulo=""
                                type="number"
                                inputMode="decimal"
                                value={serie.pesoKg}
                                onChange={(evento) =>
                                  atualizarSerie(item.exercicioId, indice, "pesoKg", evento.target.value)
                                }
                                className="w-full !py-1.5 text-center"
                                placeholder="Kg"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Cartao>
                );
              })}
            </div>
          )}

          {sucesso && (
            <p className="rounded-lg border border-emerald-800 bg-emerald-950/60 px-3 py-2.5 text-sm text-emerald-300">
              Treino lançado com sucesso!
            </p>
          )}

          <Botao carregando={salvando} onClick={lidarComSalvar}>
            Salvar treino lançado
          </Botao>
        </>
      )}
    </div>
  );
}
