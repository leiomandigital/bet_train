"use client";

import { usePerfil } from "@/hooks/usePerfil";
import { useMedidasCorporais } from "@/hooks/useMedidasCorporais";
import { FormularioPerfil } from "@/components/perfil/FormularioPerfil";
import { FormularioMedida } from "@/components/medidas/FormularioMedida";
import { Carregando } from "@/components/ui/Carregando";

export default function PaginaPerfil() {
  const { perfil, carregando: carregandoPerfil, erro: erroPerfil, salvarPerfil } = usePerfil();
  const { erro: erroMedida, adicionarMedida } = useMedidasCorporais();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="text-lg font-bold text-zinc-100">Dados pessoais</h1>
        {carregandoPerfil ? (
          <Carregando />
        ) : (
          <FormularioPerfil perfil={perfil} aoSalvar={salvarPerfil} erro={erroPerfil} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-zinc-100">Nova medida corporal</h2>
        <FormularioMedida aoSalvar={adicionarMedida} erro={erroMedida} />
      </section>
    </div>
  );
}
