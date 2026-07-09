export const EQUIPAMENTOS_AQUECIMENTO = [
  "Esteira",
  "Bicicleta ergométrica",
  "Elíptico",
  "Escada",
  "Remo",
  "Outro",
] as const;

export type EquipamentoAquecimento = (typeof EQUIPAMENTOS_AQUECIMENTO)[number];

export interface TreinoExercicio {
  id: string;
  treinoId: string;
  exercicioId: string;
  exercicioNome: string;
  categoriaNome: string;
  series: number;
  repeticoes: number;
  pesoKg: string;
  intervaloSegundos: number;
  ordem: number;
}

export interface Treino {
  id: string;
  userId: string;
  data: string;
  aquecimentoEquipamento: string | null;
  aquecimentoMinutos: number | null;
  createdAt: string;
  exercicios: TreinoExercicio[];
}

export interface ItemTreinoRascunho {
  exercicioId: string;
  exercicioNome: string;
  categoriaNome: string;
  series: number;
  repeticoes: number;
  pesoKg: string;
  intervaloSegundos: number;
}

export interface CriarTreinoInput {
  data: string;
  aquecimentoEquipamento: string | null;
  aquecimentoMinutos: number | null;
  itens: ItemTreinoRascunho[];
}

export interface AtualizarTreinoInput {
  data: string;
  aquecimentoEquipamento: string | null;
  aquecimentoMinutos: number | null;
  itens: ItemTreinoRascunho[];
}
