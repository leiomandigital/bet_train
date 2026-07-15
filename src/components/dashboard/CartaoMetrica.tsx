export function CartaoMetrica({
  rotulo,
  valor,
  icone,
}: {
  rotulo: string;
  valor: string;
  icone?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
        {icone && <span aria-hidden>{icone}</span>}
        <span>{rotulo}</span>
      </div>
      <p className="mt-1.5 text-xl font-bold text-zinc-100">{valor}</p>
    </div>
  );
}
