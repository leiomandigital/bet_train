"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useTemplateVisualizacao } from "@/hooks/useTemplateVisualizacao";
import { Cartao } from "@/components/ui/Cartao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Carregando } from "@/components/ui/Carregando";
import { formatarIntervalo } from "@/utils/formatters";
import type { TreinoTemplateExercicio } from "@/types/treinoTemplate.types";

type Bloco = TreinoTemplateExercicio[];

function agruparEmBlocos(exercicios: TreinoTemplateExercicio[]): Bloco[] {
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

export default function PaginaVisualizarTreino({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const router = useRouter();
  const { template, carregando, erro } = useTemplateVisualizacao(templateId);

  if (carregando) return <Carregando />;
  if (!template) return <MensagemErro mensagem={erro ?? "Treino não encontrado."} />;

  const blocos = agruparEmBlocos(template.exercicios);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-zinc-200">
          ←
        </button>
        <h1 className="text-lg font-bold text-zinc-100">{template.nome}</h1>
      </div>

      <p className="text-xs text-zinc-500">
        Visualização — o peso de cada série é definido na hora de executar o treino.
      </p>

      <MensagemErro mensagem={erro} />

      <div className="flex flex-col gap-3">
        {blocos.map((bloco) => (
          <Cartao key={bloco[0].id} className="flex flex-col gap-3">
            <p className="text-sm font-medium text-zinc-100">
              {bloco.map((exercicio) => exercicio.exercicioNome).join(" + ")}
            </p>

            {bloco.map((exercicio) => (
              <div key={exercicio.id} className="rounded-lg bg-zinc-800/50 px-3 py-2 text-xs text-zinc-300">
                {bloco.length > 1 && (
                  <p className="font-medium text-zinc-100">{exercicio.exercicioNome}</p>
                )}
                <p className="text-zinc-500">{exercicio.categoriaNome}</p>
                <p className="mt-1 text-zinc-400">
                  {exercicio.series}x{exercicio.repeticoes} ·{" "}
                  {formatarIntervalo(exercicio.intervaloSegundos)}
                </p>
              </div>
            ))}
          </Cartao>
        ))}
      </div>
    </div>
  );
}
