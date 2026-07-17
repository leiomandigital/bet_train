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
import { FormularioAdicionarExercicioTemplate } from "@/components/treino/FormularioAdicionarExercicioTemplate";
import { dataDeHoje } from "@/utils/formatters";
import type { ItemRetroativo } from "@/services/treinoAtribuicaoService";
import type { ItemTemplateRascunho } from "@/types/treinoTemplate.types";

const PERSONALIZADO = "personalizado";

interface SerieForm {
  repeticoes: string;
  pesoKg: string;
}

interface ItemLancamentoForm {
  exercicioId: string;
  exercicioNome: string;
  categoriaNome: string;
  intervaloSegundos: number;
  series: SerieForm[];
}

export default function PaginaLancarTreinoPassado() {
  const router = useRouter();
  const {
    atribuicoes,
    carregandoAtribuicoes,
    carregandoExercicios,
    erro,
    carregarExerciciosDoTemplate,
    salvar,
  } = useLancamentoRetroativo();

  const [selecaoId, setSelecaoId] = useState("");
  const [data, setData] = useState(dataDeHoje());
  const [itensForm, setItensForm] = useState<ItemLancamentoForm[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const atribuicaoSelecionada = atribuicoes.find((item) => item.id === selecaoId) ?? null;
  const personalizadoSelecionado = selecaoId === PERSONALIZADO;

  useEffect(() => {
    if (!atribuicaoSelecionada) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reseta o aviso de sucesso ao trocar de treino
    setSucesso(false);
    carregarExerciciosDoTemplate(atribuicaoSelecionada.templateId ?? "").then((itensTemplate) => {
      setItensForm(
        itensTemplate.map((item) => ({
          exercicioId: item.exercicioId,
          exercicioNome: item.exercicioNome,
          categoriaNome: item.categoriaNome,
          intervaloSegundos: item.intervaloSegundos,
          series: Array.from({ length: item.series }, () => ({
            repeticoes: String(item.repeticoes),
            pesoKg: "",
          })),
        }))
      );
    });
  }, [atribuicaoSelecionada, carregarExerciciosDoTemplate]);

  useEffect(() => {
    if (!personalizadoSelecionado) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- limpa o rascunho ao trocar pro modo personalizado
    setItensForm([]);
    setSucesso(false);
  }, [personalizadoSelecionado]);

  function adicionarExercicio(item: ItemTemplateRascunho) {
    setItensForm((atual) => [
      ...atual,
      {
        exercicioId: item.exercicioId,
        exercicioNome: item.exercicioNome,
        categoriaNome: item.categoriaNome,
        intervaloSegundos: item.intervaloSegundos,
        series: Array.from({ length: item.series }, () => ({
          repeticoes: String(item.repeticoes),
          pesoKg: "",
        })),
      },
    ]);
    setSucesso(false);
  }

  function removerExercicio(indice: number) {
    setItensForm((atual) => atual.filter((_, i) => i !== indice));
  }

  function atualizarSerie(indiceExercicio: number, indiceSerie: number, campo: keyof SerieForm, valor: string) {
    setItensForm((atual) =>
      atual.map((item, i) =>
        i === indiceExercicio
          ? {
              ...item,
              series: item.series.map((serie, j) =>
                j === indiceSerie ? { ...serie, [campo]: valor } : serie
              ),
            }
          : item
      )
    );
  }

  async function lidarComSalvar() {
    const itens: ItemRetroativo[] = itensForm.map((item) => ({
      exercicioId: item.exercicioId,
      intervaloSegundos: item.intervaloSegundos,
      series: item.series.map((serie, indice) => ({
        numeroSerie: indice + 1,
        repeticoes: Number(serie.repeticoes) || 0,
        pesoKg: serie.pesoKg.trim() ? Number(serie.pesoKg) : null,
      })),
    }));

    setSalvando(true);
    setSucesso(false);
    const ok = await salvar(
      personalizadoSelecionado ? null : atribuicaoSelecionada?.id ?? null,
      personalizadoSelecionado ? null : atribuicaoSelecionada?.templateId ?? null,
      data,
      itens
    );
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
          opcoes={[
            ...atribuicoes.map((atribuicao) => ({
              valor: atribuicao.id,
              rotulo: atribuicao.templateNome,
            })),
            { valor: PERSONALIZADO, rotulo: "✏️ Treino personalizado (customizado)" },
          ]}
          value={selecaoId}
          onChange={(evento) => setSelecaoId(evento.target.value)}
        />
      )}

      {selecaoId && (
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
              {itensForm.map((item, indiceExercicio) => (
                <Cartao key={`${item.exercicioId}-${indiceExercicio}`} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-zinc-100">{item.exercicioNome}</p>
                      <p className="text-xs text-zinc-500">{item.categoriaNome}</p>
                    </div>
                    <button
                      onClick={() => removerExercicio(indiceExercicio)}
                      className="shrink-0 text-xs text-red-400 hover:text-red-300"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {item.series.map((serie, indiceSerie) => (
                      <div
                        key={indiceSerie}
                        className="flex min-w-0 items-center gap-2 rounded-lg bg-zinc-800/50 px-3 py-2"
                      >
                        <span className="w-5 shrink-0 text-xs text-zinc-500">#{indiceSerie + 1}</span>
                        <div className="min-w-0 flex-1">
                          <Campo
                            rotulo=""
                            type="number"
                            inputMode="numeric"
                            value={serie.repeticoes}
                            onChange={(evento) =>
                              atualizarSerie(indiceExercicio, indiceSerie, "repeticoes", evento.target.value)
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
                              atualizarSerie(indiceExercicio, indiceSerie, "pesoKg", evento.target.value)
                            }
                            className="w-full !py-1.5 text-center"
                            placeholder="Kg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Cartao>
              ))}

              {itensForm.length === 0 && (
                <p className="text-sm text-zinc-500">Nenhum exercício adicionado ainda.</p>
              )}
            </div>
          )}

          <FormularioAdicionarExercicioTemplate aoAdicionar={adicionarExercicio} />

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
