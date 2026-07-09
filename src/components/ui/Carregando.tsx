export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-zinc-400">
      {texto}
    </div>
  );
}
