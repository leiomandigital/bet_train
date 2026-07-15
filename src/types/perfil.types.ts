export type PapelUsuario = "admin" | "usuario";

export interface Perfil {
  id: string;
  nome: string | null;
  telefone: string | null;
  dataNascimento: string | null;
  alturaCm: number | null;
  role: PapelUsuario;
  createdAt: string;
  updatedAt: string;
}

export interface AtualizarPerfilInput {
  nome: string;
  telefone: string;
  dataNascimento: string;
  alturaCm: number;
}
