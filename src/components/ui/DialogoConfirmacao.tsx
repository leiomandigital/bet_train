import { Botao } from "./Botao";

interface DialogoConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  aoConfirmar: () => void;
  aoCancelar: () => void;
}

export function DialogoConfirmacao({
  aberto,
  titulo,
  mensagem,
  aoConfirmar,
  aoCancelar,
}: DialogoConfirmacaoProps) {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center">
      <div className="w-full max-w-sm rounded-t-xl border border-zinc-800 bg-zinc-900 p-5 sm:rounded-xl">
        <h2 className="text-base font-semibold text-zinc-100">{titulo}</h2>
        <p className="mt-2 text-sm text-zinc-400">{mensagem}</p>
        <div className="mt-5 flex gap-3">
          <Botao variante="secundario" onClick={aoCancelar}>
            Cancelar
          </Botao>
          <Botao variante="perigo" onClick={aoConfirmar}>
            Excluir
          </Botao>
        </div>
      </div>
    </div>
  );
}
