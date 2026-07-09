import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "perigo";

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  carregando?: boolean;
}

const CLASSES_VARIANTE: Record<Variante, string> = {
  primario: "bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-emerald-800",
  secundario: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:bg-zinc-900",
  perigo: "bg-red-600 text-white hover:bg-red-500 disabled:bg-red-900",
};

export function Botao({
  variante = "primario",
  carregando = false,
  disabled,
  className = "",
  children,
  ...props
}: BotaoProps) {
  return (
    <button
      disabled={disabled || carregando}
      className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${CLASSES_VARIANTE[variante]} ${className}`}
      {...props}
    >
      {carregando ? "Salvando..." : children}
    </button>
  );
}
