export interface TreinoTemplateExercicio {
  id: string;
  templateId: string;
  exercicioId: string;
  exercicioNome: string;
  categoriaNome: string;
  series: number;
  repeticoes: number;
  intervaloSegundos: number;
  ordem: number;
}

export interface TreinoTemplate {
  id: string;
  criadoPor: string;
  nome: string;
  aquecimentoEquipamento: string | null;
  aquecimentoMinutos: number | null;
  createdAt: string;
  exercicios: TreinoTemplateExercicio[];
}

export interface ItemTemplateRascunho {
  exercicioId: string;
  exercicioNome: string;
  categoriaNome: string;
  series: number;
  repeticoes: number;
  intervaloSegundos: number;
}

export interface CriarTemplateInput {
  nome: string;
  aquecimentoEquipamento: string | null;
  aquecimentoMinutos: number | null;
  itens: ItemTemplateRascunho[];
}
