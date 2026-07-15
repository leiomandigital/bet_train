export type StatusAtribuicao = "pendente" | "em_andamento" | "concluido";

export interface TreinoAtribuicao {
  id: string;
  templateId: string;
  templateNome: string;
  userId: string;
  atribuidoPor: string;
  status: StatusAtribuicao;
  iniciadoEm: string | null;
  concluidoEm: string | null;
  duracaoTotalSegundos: number | null;
  createdAt: string;
}
