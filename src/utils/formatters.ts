export function formatarDataBr(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function formatarDataParaInput(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function dataDeHoje(): string {
  return formatarDataParaInput(new Date());
}

export function formatarPeso(pesoKg: number): string {
  return `${pesoKg.toFixed(1)} kg`;
}

export function formatarCentimetros(valor: number | null): string {
  if (valor === null) return "-";
  return `${valor.toFixed(1)} cm`;
}

export function formatarIntervalo(segundos: number): string {
  if (segundos < 60) return `${segundos}s`;
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto === 0 ? `${minutos}min` : `${minutos}min ${resto}s`;
}

export function diasDesde(dataIso: string): number {
  const dataAlvo = new Date(`${dataIso}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diffMs = hoje.getTime() - dataAlvo.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
