import { Cartao } from "@/components/ui/Cartao";
import { formatarCentimetros, formatarDataBr, formatarPeso } from "@/utils/formatters";
import type { MedidaCorporal } from "@/types/medidas.types";

export function CartaoMedida({
  medida,
  aoEditar,
  aoExcluir,
}: {
  medida: MedidaCorporal;
  aoEditar: () => void;
  aoExcluir: () => void;
}) {
  return (
    <Cartao className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-100">{formatarDataBr(medida.data)}</p>
          <p className="text-xs text-zinc-400">{formatarPeso(medida.pesoKg)}</p>
        </div>
        <div className="flex gap-3 text-xs">
          <button onClick={aoEditar} className="text-emerald-400 hover:text-emerald-300">
            Editar
          </button>
          <button onClick={aoExcluir} className="text-red-400 hover:text-red-300">
            Excluir
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-zinc-400">
        <span>Umbigo: {formatarCentimetros(medida.circAbdominalUmbigoCm)}</span>
        <span>Estômago: {formatarCentimetros(medida.circAbdominalEstomagoCm)}</span>
        <span>Peitoral: {formatarCentimetros(medida.circPeitoralCm)}</span>
        <span>Bíceps D: {formatarCentimetros(medida.circBicepsDireitoCm)}</span>
        <span>Bíceps E: {formatarCentimetros(medida.circBicepsEsquerdoCm)}</span>
      </div>
    </Cartao>
  );
}
