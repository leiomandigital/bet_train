export function MensagemErro({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;

  return (
    <div className="rounded-lg border border-red-800 bg-red-950/60 px-3 py-2.5 text-sm text-red-300">
      {mensagem}
    </div>
  );
}
