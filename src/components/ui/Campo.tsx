import type { InputHTMLAttributes, ReactNode } from "react";

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  filho?: ReactNode;
}

export function Campo({ rotulo, id, filho, className = "", ...props }: CampoProps) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-300">{rotulo}</span>
      {filho ?? (
        <input
          id={id}
          className={`rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-zinc-100 outline-none focus:border-emerald-500 ${className}`}
          {...props}
        />
      )}
    </label>
  );
}
