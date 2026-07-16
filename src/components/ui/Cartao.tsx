import type { MouseEventHandler, ReactNode } from "react";

export function Cartao({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 ${className}`}
    >
      {children}
    </div>
  );
}
