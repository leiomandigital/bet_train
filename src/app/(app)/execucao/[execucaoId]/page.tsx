"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ExecucaoTreino } from "@/components/treino/ExecucaoTreino";

export default function PaginaExecucaoTreino({
  params,
}: {
  params: Promise<{ execucaoId: string }>;
}) {
  const { execucaoId } = use(params);
  const router = useRouter();

  return (
    <ExecucaoTreino execucaoId={execucaoId} aoConcluir={() => router.push("/meus-treinos")} />
  );
}
