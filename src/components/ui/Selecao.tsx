import type { SelectHTMLAttributes } from "react";

interface OpcaoSelecao {
  valor: string;
  rotulo: string;
}

interface SelecaoProps extends SelectHTMLAttributes<HTMLSelectElement> {
  rotulo: string;
  opcoes: OpcaoSelecao[];
  placeholder?: string;
}

export function Selecao({ rotulo, id, opcoes, placeholder, className = "", ...props }: SelecaoProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-300">{rotulo}</span>
      <select
        id={id}
        className={`rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none focus:border-emerald-500 ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}
