"use client";

import { useEffect, useState } from "react";
import { useExercicios } from "@/hooks/useExercicios";
import { Selecao } from "@/components/ui/Selecao";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import type { ItemTemplateRascunho } from "@/types/treinoTemplate.types";

const NOVO_EXERCICIO = "__novo__";

export function FormularioAdicionarExercicioTemplate({
  aoAdicionar,
}: {
  aoAdicionar: (item: ItemTemplateRascunho) => void;
}) {
  const {
    categorias,
    exerciciosPorCategoria,
    erro,
    carregarExerciciosDaCategoria,
    adicionarExercicioCustomizado,
  } = useExercicios();

  const [categoriaId, setCategoriaId] = useState("");
  const [exercicioId, setExercicioId] = useState("");
  const [nomeNovoExercicio, setNomeNovoExercicio] = useState("");
  const [series, setSeries] = useState("");
  const [repeticoes, setRepeticoes] = useState("");
  const [intervaloSegundos, setIntervaloSegundos] = useState("");
  const [erroLocal, setErroLocal] = useState<string | null>(null);

  useEffect(() => {
    if (categoriaId) {
      carregarExerciciosDaCategoria(categoriaId);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reseta seleção ao trocar de categoria
      setExercicioId("");
    }
  }, [categoriaId, carregarExerciciosDaCategoria]);

  const exerciciosDaCategoria = exerciciosPorCategoria[categoriaId] ?? [];
  const categoriaSelecionada = categorias.find((categoria) => categoria.id === categoriaId);

  async function lidarComAdicionar() {
    setErroLocal(null);

    let exercicioIdFinal = exercicioId;
    let exercicioNomeFinal = exerciciosDaCategoria.find((e) => e.id === exercicioId)?.nome ?? "";

    if (exercicioId === NOVO_EXERCICIO) {
      if (!nomeNovoExercicio.trim()) {
        setErroLocal("Informe o nome do novo exercício.");
        return;
      }
      const criado = await adicionarExercicioCustomizado(categoriaId, nomeNovoExercicio);
      if (!criado) return;
      exercicioIdFinal = criado.id;
      exercicioNomeFinal = criado.nome;
    }

    if (!exercicioIdFinal) {
      setErroLocal("Selecione um exercício.");
      return;
    }
    if (!series || Number(series) <= 0) {
      setErroLocal("Informe o número de séries.");
      return;
    }
    if (!repeticoes || Number(repeticoes) <= 0) {
      setErroLocal("Informe o número de repetições.");
      return;
    }
    if (!intervaloSegundos || Number(intervaloSegundos) < 0) {
      setErroLocal("Informe o intervalo entre séries.");
      return;
    }

    aoAdicionar({
      exercicioId: exercicioIdFinal,
      exercicioNome: exercicioNomeFinal,
      categoriaNome: categoriaSelecionada?.nome ?? "",
      series: Number(series),
      repeticoes: Number(repeticoes),
      intervaloSegundos: Number(intervaloSegundos),
      encadeadoComProximo: false,
    });

    setExercicioId("");
    setNomeNovoExercicio("");
    setSeries("");
    setRepeticoes("");
    setIntervaloSegundos("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-semibold text-zinc-200">Adicionar exercício</h3>

      <Selecao
        rotulo="Categoria"
        placeholder="Selecione a categoria"
        opcoes={categorias.map((categoria) => ({ valor: categoria.id, rotulo: categoria.nome }))}
        value={categoriaId}
        onChange={(evento) => setCategoriaId(evento.target.value)}
      />

      {categoriaId && (
        <Selecao
          rotulo="Exercício"
          placeholder="Selecione o exercício"
          opcoes={[
            ...exerciciosDaCategoria.map((exercicio) => ({
              valor: exercicio.id,
              rotulo: exercicio.nome,
            })),
            { valor: NOVO_EXERCICIO, rotulo: "+ Criar exercício customizado" },
          ]}
          value={exercicioId}
          onChange={(evento) => setExercicioId(evento.target.value)}
        />
      )}

      {exercicioId === NOVO_EXERCICIO && (
        <Campo
          rotulo="Nome do novo exercício"
          value={nomeNovoExercicio}
          onChange={(evento) => setNomeNovoExercicio(evento.target.value)}
          placeholder="Ex: Supino guilhotina"
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Campo
          rotulo="Séries"
          type="number"
          inputMode="numeric"
          value={series}
          onChange={(evento) => setSeries(evento.target.value)}
        />
        <Campo
          rotulo="Repetições"
          type="number"
          inputMode="numeric"
          value={repeticoes}
          onChange={(evento) => setRepeticoes(evento.target.value)}
        />
      </div>

      <Campo
        rotulo="Intervalo (s)"
        type="number"
        inputMode="numeric"
        value={intervaloSegundos}
        onChange={(evento) => setIntervaloSegundos(evento.target.value)}
      />

      <MensagemErro mensagem={erroLocal ?? erro} />

      <Botao type="button" variante="secundario" onClick={lidarComAdicionar}>
        Adicionar ao treino modelo
      </Botao>
    </div>
  );
}
