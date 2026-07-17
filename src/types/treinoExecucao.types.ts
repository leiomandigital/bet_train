export interface TreinoSerie {
  id: string;
  execucaoExercicioId: string;
  numeroSerie: number;
  repeticoes: number;
  pesoKg: number | null;
  concluida: boolean;
}

export interface TreinoExecucaoExercicio {
  id: string;
  execucaoId: string;
  exercicioId: string;
  exercicioNome: string;
  categoriaNome: string;
  intervaloSegundos: number;
  ordem: number;
  encadeadoComProximo: boolean;
  series: TreinoSerie[];
}

export interface TreinoExecucao {
  id: string;
  atribuicaoId: string | null;
  templateId: string | null;
  templateNome: string;
  userId: string;
  iniciadoEm: string;
  concluidoEm: string | null;
  duracaoTotalSegundos: number | null;
  exercicios: TreinoExecucaoExercicio[];
}

export interface AtualizarSerieInput {
  repeticoes: number;
  pesoKg: number | null;
  concluida: boolean;
}
