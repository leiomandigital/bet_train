export function campoObrigatorioPreenchido(valor: string | number | null | undefined): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  return !Number.isNaN(valor);
}

export function validarPerfil(input: {
  nome: string;
  telefone: string;
  dataNascimento: string;
  alturaCm: number;
}): string | null {
  if (!campoObrigatorioPreenchido(input.nome)) return "Informe o nome.";
  if (!campoObrigatorioPreenchido(input.telefone)) return "Informe o telefone.";
  if (!campoObrigatorioPreenchido(input.dataNascimento)) return "Informe a data de nascimento.";
  if (!campoObrigatorioPreenchido(input.alturaCm) || input.alturaCm <= 0) {
    return "Informe uma altura válida.";
  }
  return null;
}

export function validarMedida(input: {
  data: string;
  pesoKg: number;
}): string | null {
  if (!campoObrigatorioPreenchido(input.data)) return "Informe a data da medição.";
  if (!campoObrigatorioPreenchido(input.pesoKg) || input.pesoKg <= 0) {
    return "Informe um peso válido.";
  }
  return null;
}

export function validarItemTreino(input: {
  exercicioId: string;
  series: number;
  repeticoes: number;
  pesoKg: string;
  intervaloSegundos: number;
}): string | null {
  if (!campoObrigatorioPreenchido(input.exercicioId)) return "Selecione um exercício.";
  if (!campoObrigatorioPreenchido(input.series) || input.series <= 0) {
    return "Informe o número de séries.";
  }
  if (!campoObrigatorioPreenchido(input.repeticoes) || input.repeticoes <= 0) {
    return "Informe o número de repetições.";
  }
  if (!campoObrigatorioPreenchido(input.pesoKg)) return "Informe o peso utilizado.";
  if (!campoObrigatorioPreenchido(input.intervaloSegundos) || input.intervaloSegundos < 0) {
    return "Informe o intervalo entre séries.";
  }
  return null;
}

export function validarTreino(input: { data: string; itensCount: number }): string | null {
  if (!campoObrigatorioPreenchido(input.data)) return "Informe a data do treino.";
  if (input.itensCount === 0) return "Adicione ao menos um exercício ao treino.";
  return null;
}
