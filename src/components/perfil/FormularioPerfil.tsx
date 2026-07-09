"use client";

import { useEffect, useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import type { AtualizarPerfilInput, Perfil } from "@/types/perfil.types";

export function FormularioPerfil({
  perfil,
  aoSalvar,
  erro,
}: {
  perfil: Perfil | null;
  aoSalvar: (input: AtualizarPerfilInput) => Promise<boolean>;
  erro: string | null;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [alturaCm, setAlturaCm] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (perfil) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza formulário com dado carregado do perfil
      setNome(perfil.nome ?? "");
      setTelefone(perfil.telefone ?? "");
      setDataNascimento(perfil.dataNascimento ?? "");
      setAlturaCm(perfil.alturaCm?.toString() ?? "");
    }
  }, [perfil]);

  async function lidarComSalvar() {
    setSalvando(true);
    setSucesso(false);
    const ok = await aoSalvar({
      nome,
      telefone,
      dataNascimento,
      alturaCm: Number(alturaCm),
    });
    setSalvando(false);
    setSucesso(ok);
  }

  return (
    <div className="flex flex-col gap-3">
      <Campo rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
      <Campo
        rotulo="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="(00) 00000-0000"
      />
      <Campo
        rotulo="Data de nascimento"
        type="date"
        value={dataNascimento}
        onChange={(e) => setDataNascimento(e.target.value)}
      />
      <Campo
        rotulo="Altura (cm)"
        type="number"
        step="0.1"
        value={alturaCm}
        onChange={(e) => setAlturaCm(e.target.value)}
      />

      <MensagemErro mensagem={erro} />
      {sucesso && (
        <p className="rounded-lg border border-emerald-800 bg-emerald-950/60 px-3 py-2.5 text-sm text-emerald-300">
          Perfil atualizado com sucesso!
        </p>
      )}

      <Botao carregando={salvando} onClick={lidarComSalvar}>
        Salvar dados pessoais
      </Botao>
    </div>
  );
}
