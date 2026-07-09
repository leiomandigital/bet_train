"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTreinos } from "@/hooks/useTreinos";
import { useMedidasCorporais } from "@/hooks/useMedidasCorporais";
import { Carregando } from "@/components/ui/Carregando";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { DialogoConfirmacao } from "@/components/ui/DialogoConfirmacao";
import { CartaoTreino } from "@/components/treino/CartaoTreino";
import { FormularioEditarTreino } from "@/components/treino/FormularioEditarTreino";
import { CartaoMedida } from "@/components/medidas/CartaoMedida";
import { FormularioMedida } from "@/components/medidas/FormularioMedida";

type Aba = "treinos" | "medidas";

export default function PaginaHistorico() {
  const router = useRouter();
  const { treinos, carregando: carregandoTreinos, erro: erroTreinos, editarTreino, removerTreino } =
    useTreinos();
  const {
    medidas,
    carregando: carregandoMedidas,
    erro: erroMedidas,
    editarMedida,
    removerMedida,
  } = useMedidasCorporais();

  const [aba, setAba] = useState<Aba>("treinos");
  const [treinoEditandoId, setTreinoEditandoId] = useState<string | null>(null);
  const [treinoExcluindoId, setTreinoExcluindoId] = useState<string | null>(null);
  const [medidaEditandoId, setMedidaEditandoId] = useState<string | null>(null);
  const [medidaExcluindoId, setMedidaExcluindoId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-zinc-100">Histórico</h1>

      <div className="flex gap-2 rounded-lg bg-zinc-900 p-1">
        <button
          onClick={() => setAba("treinos")}
          className={`flex-1 rounded-md py-2 text-sm ${
            aba === "treinos" ? "bg-emerald-600 text-white" : "text-zinc-400"
          }`}
        >
          Treinos
        </button>
        <button
          onClick={() => setAba("medidas")}
          className={`flex-1 rounded-md py-2 text-sm ${
            aba === "medidas" ? "bg-emerald-600 text-white" : "text-zinc-400"
          }`}
        >
          Medidas
        </button>
      </div>

      {aba === "treinos" && (
        <div className="flex flex-col gap-3">
          <MensagemErro mensagem={erroTreinos} />
          {carregandoTreinos ? (
            <Carregando />
          ) : treinos.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum treino lançado ainda.</p>
          ) : (
            treinos.map((treino) =>
              treinoEditandoId === treino.id ? (
                <FormularioEditarTreino
                  key={treino.id}
                  treino={treino}
                  erro={erroTreinos}
                  aoCancelar={() => setTreinoEditandoId(null)}
                  aoSalvar={(input) => editarTreino(treino.id, input)}
                />
              ) : (
                <CartaoTreino
                  key={treino.id}
                  treino={treino}
                  aoEditar={() => setTreinoEditandoId(treino.id)}
                  aoExcluir={() => setTreinoExcluindoId(treino.id)}
                  aoRepetir={() => router.push(`/treino?repetir=${treino.id}`)}
                />
              )
            )
          )}
        </div>
      )}

      {aba === "medidas" && (
        <div className="flex flex-col gap-3">
          <MensagemErro mensagem={erroMedidas} />
          {carregandoMedidas ? (
            <Carregando />
          ) : medidas.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhuma medida lançada ainda.</p>
          ) : (
            medidas.map((medida) =>
              medidaEditandoId === medida.id ? (
                <div
                  key={medida.id}
                  className="rounded-xl border border-emerald-800 bg-zinc-900/60 p-4"
                >
                  <FormularioMedida
                    medidaInicial={medida}
                    erro={erroMedidas}
                    aoCancelar={() => setMedidaEditandoId(null)}
                    aoSalvar={async (input) => {
                      const ok = await editarMedida(medida.id, input);
                      if (ok) setMedidaEditandoId(null);
                      return ok;
                    }}
                  />
                </div>
              ) : (
                <CartaoMedida
                  key={medida.id}
                  medida={medida}
                  aoEditar={() => setMedidaEditandoId(medida.id)}
                  aoExcluir={() => setMedidaExcluindoId(medida.id)}
                />
              )
            )
          )}
        </div>
      )}

      <DialogoConfirmacao
        aberto={treinoExcluindoId !== null}
        titulo="Excluir treino"
        mensagem="Tem certeza que deseja excluir este treino e todos os exercícios lançados nele? Essa ação não pode ser desfeita."
        aoCancelar={() => setTreinoExcluindoId(null)}
        aoConfirmar={async () => {
          if (treinoExcluindoId) await removerTreino(treinoExcluindoId);
          setTreinoExcluindoId(null);
        }}
      />

      <DialogoConfirmacao
        aberto={medidaExcluindoId !== null}
        titulo="Excluir medida"
        mensagem="Tem certeza que deseja excluir este registro de medidas corporais? Essa ação não pode ser desfeita."
        aoCancelar={() => setMedidaExcluindoId(null)}
        aoConfirmar={async () => {
          if (medidaExcluindoId) await removerMedida(medidaExcluindoId);
          setMedidaExcluindoId(null);
        }}
      />
    </div>
  );
}
