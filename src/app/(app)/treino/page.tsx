"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePerfil } from "@/hooks/usePerfil";
import { Carregando } from "@/components/ui/Carregando";
import { PainelTreinoAtual } from "@/components/treino/PainelTreinoAtual";

export default function PaginaTreino() {
  const router = useRouter();
  const { perfil, carregando } = usePerfil();

  useEffect(() => {
    if (perfil?.role === "admin") {
      router.replace("/admin/treinos");
    }
  }, [perfil, router]);

  if (carregando || perfil?.role === "admin") return <Carregando />;

  return <PainelTreinoAtual />;
}
