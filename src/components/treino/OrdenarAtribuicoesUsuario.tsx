"use client";

import { useState } from "react";
import { useOrdenarAtribuicoes } from "@/hooks/useOrdenarAtribuicoes";
import { Cartao } from "@/components/ui/Cartao";
import { Selecao } from "@/components/ui/Selecao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { Carregando } from "@/components/ui/Carregando";

export function OrdenarAtribuicoesUsuario({
  usuarios,
}: {
  usuarios: { id: string; nome: string | null }[];
}) {
  const [userId, setUserId] = useState("");
  const { atribuicoes, carregando, erro, mover } = useOrdenarAtribuicoes(userId || null);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-zinc-200">Ordenar ciclo de treinos</h3>

      <Selecao
        rotulo="Usuário"
        placeholder="Selecione um usuário"
        opcoes={usuarios.map((usuarioItem) => ({
          valor: usuarioItem.id,
          rotulo: usuarioItem.nome ?? "Sem nome",
        }))}
        value={userId}
        onChange={(evento) => setUserId(evento.target.value)}
      />

      <MensagemErro mensagem={erro} />

      {userId && carregando && <Carregando />}

      {userId && !carregando && atribuicoes.length === 0 && (
        <p className="text-sm text-zinc-500">Esse usuário não tem treinos atribuídos por você.</p>
      )}

      {userId && !carregando && atribuicoes.length > 0 && (
        <div className="flex flex-col gap-2">
          {atribuicoes.map((atribuicao, indice) => (
            <Cartao key={atribuicao.id} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-100">{indice + 1}. {atribuicao.templateNome}</p>
                <p className="text-xs text-zinc-500 capitalize">{atribuicao.status.replace("_", " ")}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  disabled={indice === 0}
                  onClick={() => mover(indice, -1)}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  disabled={indice === atribuicoes.length - 1}
                  onClick={() => mover(indice, 1)}
                  className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </Cartao>
          ))}
        </div>
      )}
    </div>
  );
}
