"use client";

import { useState } from "react";
import Link from "next/link";
import { usePerfil } from "@/hooks/usePerfil";
import { useTreinoTemplates } from "@/hooks/useTreinoTemplates";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Carregando } from "@/components/ui/Carregando";
import { FormularioAdicionarExercicioTemplate } from "@/components/treino/FormularioAdicionarExercicioTemplate";
import { ListaRascunhoExerciciosTemplate } from "@/components/treino/ListaRascunhoExerciciosTemplate";
import { OrdenarAtribuicoesUsuario } from "@/components/treino/OrdenarAtribuicoesUsuario";
import type { ItemTemplateRascunho, TreinoTemplate } from "@/types/treinoTemplate.types";

export default function PaginaAdminTreinos() {
  const { perfil, carregando: carregandoPerfil } = usePerfil();

  if (carregandoPerfil) return <Carregando />;
  if (perfil?.role !== "admin") {
    return (
      <p className="text-sm text-zinc-400">
        Esta área é exclusiva para administradores.
      </p>
    );
  }

  return <ConteudoAdminTreinos />;
}

function ConteudoAdminTreinos() {
  const { templates, usuarios, carregando, erro, criar, atribuir, remover } = useTreinoTemplates();

  const [nome, setNome] = useState("");
  const [itens, setItens] = useState<ItemTemplateRascunho[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function adicionarItem(item: ItemTemplateRascunho) {
    setItens((atual) => [...atual, item]);
    setSucesso(false);
  }

  function removerItem(indice: number) {
    setItens((atual) => atual.filter((_, i) => i !== indice));
  }

  function duplicarTemplate(template: TreinoTemplate) {
    setNome(`${template.nome} (cópia)`);
    setItens(
      template.exercicios.map((item) => ({
        exercicioId: item.exercicioId,
        exercicioNome: item.exercicioNome,
        categoriaNome: item.categoriaNome,
        series: item.series,
        repeticoes: item.repeticoes,
        intervaloSegundos: item.intervaloSegundos,
      }))
    );
    setSucesso(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function lidarComCriar() {
    setSalvando(true);
    setSucesso(false);
    const ok = await criar({
      nome,
      aquecimentoEquipamento: null,
      aquecimentoMinutos: null,
      itens,
    });
    setSalvando(false);
    if (ok) {
      setNome("");
      setItens([]);
      setSucesso(true);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-100">Treinos modelo</h1>
        <Link href="/meus-treinos" className="text-xs text-emerald-400 hover:text-emerald-300">
          Ver meus treinos atribuídos →
        </Link>
      </div>

      <Campo rotulo="Nome do treino" value={nome} onChange={(evento) => setNome(evento.target.value)} />

      <FormularioAdicionarExercicioTemplate aoAdicionar={adicionarItem} />

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-zinc-200">Exercícios do treino</h3>
        <ListaRascunhoExerciciosTemplate itens={itens} aoRemover={removerItem} />
      </div>

      <MensagemErro mensagem={erro} />
      {sucesso && (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950/60 px-3 py-2.5 text-sm text-emerald-300">
          Treino modelo criado com sucesso!
        </p>
      )}

      <Botao carregando={salvando} onClick={lidarComCriar}>
        Criar treino modelo
      </Botao>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-zinc-200">Meus treinos modelo</h3>
        {carregando ? (
          <Carregando />
        ) : templates.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum treino modelo criado ainda.</p>
        ) : (
          templates.map((template) => (
            <CartaoTemplate
              key={template.id}
              template={template}
              usuarios={usuarios}
              aoAtribuir={atribuir}
              aoExcluir={remover}
              aoDuplicar={duplicarTemplate}
            />
          ))
        )}
      </div>

      {usuarios.length > 0 && <OrdenarAtribuicoesUsuario usuarios={usuarios} />}
    </div>
  );
}

function CartaoTemplate({
  template,
  usuarios,
  aoAtribuir,
  aoExcluir,
  aoDuplicar,
}: {
  template: TreinoTemplate;
  usuarios: { id: string; nome: string | null }[];
  aoAtribuir: (templateId: string, userIds: string[]) => Promise<boolean>;
  aoExcluir: (templateId: string) => Promise<boolean>;
  aoDuplicar: (template: TreinoTemplate) => void;
}) {
  const { id: templateId, nome, exercicios } = template;
  const quantidadeExercicios = exercicios.length;
  const [userIdsSelecionados, setUserIdsSelecionados] = useState<string[]>([]);
  const [atribuindo, setAtribuindo] = useState(false);
  const [sucessoAtribuicao, setSucessoAtribuicao] = useState(false);

  function alternarUsuario(userId: string) {
    setUserIdsSelecionados((atual) =>
      atual.includes(userId) ? atual.filter((id) => id !== userId) : [...atual, userId]
    );
    setSucessoAtribuicao(false);
  }

  async function lidarComAtribuir() {
    setAtribuindo(true);
    const ok = await aoAtribuir(templateId, userIdsSelecionados);
    setAtribuindo(false);
    if (ok) {
      setUserIdsSelecionados([]);
      setSucessoAtribuicao(true);
    }
  }

  return (
    <Cartao className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-100">{nome}</p>
          <p className="text-xs text-zinc-500">{quantidadeExercicios} exercício(s)</p>
        </div>
        <div className="flex gap-3 text-xs">
          <button
            onClick={() => aoDuplicar(template)}
            className="text-blue-400 hover:text-blue-300"
          >
            Duplicar
          </button>
          <button
            onClick={() => aoExcluir(templateId)}
            className="text-red-400 hover:text-red-300"
          >
            Excluir
          </button>
        </div>
      </div>

      {usuarios.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-zinc-400">Atribuir a</span>
          <div className="flex flex-wrap gap-2">
            {usuarios.map((usuarioItem) => {
              const selecionado = userIdsSelecionados.includes(usuarioItem.id);
              return (
                <button
                  key={usuarioItem.id}
                  onClick={() => alternarUsuario(usuarioItem.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    selecionado
                      ? "border-emerald-600 bg-emerald-950/60 text-emerald-300"
                      : "border-zinc-700 text-zinc-400"
                  }`}
                >
                  {usuarioItem.nome ?? "Sem nome"}
                </button>
              );
            })}
          </div>
          <Botao
            variante="secundario"
            carregando={atribuindo}
            disabled={userIdsSelecionados.length === 0}
            onClick={lidarComAtribuir}
          >
            Atribuir treino
          </Botao>
          {sucessoAtribuicao && (
            <p className="text-xs text-emerald-400">Treino atribuído com sucesso!</p>
          )}
        </div>
      )}
    </Cartao>
  );
}
