export interface CategoriaExercicio {
  id: string;
  nome: string;
  ordem: number;
}

export interface Exercicio {
  id: string;
  categoriaId: string;
  nome: string;
  padrao: boolean;
  criadoPor: string | null;
  createdAt: string;
}

export interface CriarExercicioCustomizadoInput {
  categoriaId: string;
  nome: string;
}
