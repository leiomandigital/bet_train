"use client";

import { useState } from "react";
import { Campo } from "@/components/ui/Campo";
import { Botao } from "@/components/ui/Botao";
import { MensagemErro } from "@/components/ui/MensagemErro";
import { dataDeHoje } from "@/utils/formatters";
import type { MedidaCorporal, SalvarMedidaInput } from "@/types/medidas.types";

interface FormularioMedidaProps {
  medidaInicial?: MedidaCorporal;
  aoSalvar: (input: SalvarMedidaInput) => Promise<boolean>;
  aoCancelar?: () => void;
  erro: string | null;
}

export function FormularioMedida({
  medidaInicial,
  aoSalvar,
  aoCancelar,
  erro,
}: FormularioMedidaProps) {
  const [data, setData] = useState(medidaInicial?.data ?? dataDeHoje());
  const [pesoKg, setPesoKg] = useState(medidaInicial?.pesoKg?.toString() ?? "");
  const [umbigo, setUmbigo] = useState(medidaInicial?.circAbdominalUmbigoCm?.toString() ?? "");
  const [estomago, setEstomago] = useState(medidaInicial?.circAbdominalEstomagoCm?.toString() ?? "");
  const [peitoral, setPeitoral] = useState(medidaInicial?.circPeitoralCm?.toString() ?? "");
  const [bicepsDireito, setBicepsDireito] = useState(
    medidaInicial?.circBicepsDireitoCm?.toString() ?? ""
  );
  const [bicepsEsquerdo, setBicepsEsquerdo] = useState(
    medidaInicial?.circBicepsEsquerdoCm?.toString() ?? ""
  );
  const [salvando, setSalvando] = useState(false);

  async function lidarComSalvar() {
    setSalvando(true);
    const ok = await aoSalvar({
      data,
      pesoKg: Number(pesoKg),
      circAbdominalUmbigoCm: umbigo ? Number(umbigo) : null,
      circAbdominalEstomagoCm: estomago ? Number(estomago) : null,
      circPeitoralCm: peitoral ? Number(peitoral) : null,
      circBicepsDireitoCm: bicepsDireito ? Number(bicepsDireito) : null,
      circBicepsEsquerdoCm: bicepsEsquerdo ? Number(bicepsEsquerdo) : null,
    });
    setSalvando(false);
    if (ok && !medidaInicial) {
      setPesoKg("");
      setUmbigo("");
      setEstomago("");
      setPeitoral("");
      setBicepsDireito("");
      setBicepsEsquerdo("");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Campo rotulo="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
      <Campo
        rotulo="Peso (kg)"
        type="number"
        step="0.1"
        value={pesoKg}
        onChange={(e) => setPesoKg(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Campo
          rotulo="Abdômen (umbigo, cm)"
          type="number"
          step="0.1"
          value={umbigo}
          onChange={(e) => setUmbigo(e.target.value)}
        />
        <Campo
          rotulo="Abdômen (estômago, cm)"
          type="number"
          step="0.1"
          value={estomago}
          onChange={(e) => setEstomago(e.target.value)}
        />
      </div>
      <Campo
        rotulo="Peitoral (cm)"
        type="number"
        step="0.1"
        value={peitoral}
        onChange={(e) => setPeitoral(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Campo
          rotulo="Bíceps direito (cm)"
          type="number"
          step="0.1"
          value={bicepsDireito}
          onChange={(e) => setBicepsDireito(e.target.value)}
        />
        <Campo
          rotulo="Bíceps esquerdo (cm)"
          type="number"
          step="0.1"
          value={bicepsEsquerdo}
          onChange={(e) => setBicepsEsquerdo(e.target.value)}
        />
      </div>

      <MensagemErro mensagem={erro} />

      <div className="flex gap-3">
        {aoCancelar && (
          <Botao variante="secundario" onClick={aoCancelar}>
            Cancelar
          </Botao>
        )}
        <Botao carregando={salvando} onClick={lidarComSalvar}>
          Salvar medidas
        </Botao>
      </div>
    </div>
  );
}
