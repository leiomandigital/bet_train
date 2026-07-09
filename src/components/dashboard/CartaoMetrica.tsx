export function CartaoMetrica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xs text-zinc-500">{rotulo}</p>
      <p className="mt-1 text-xl font-bold text-zinc-100">{valor}</p>
    </div>
  );
}
