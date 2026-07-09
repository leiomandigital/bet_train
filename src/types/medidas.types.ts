export interface MedidaCorporal {
  id: string;
  userId: string;
  data: string;
  pesoKg: number;
  circAbdominalUmbigoCm: number | null;
  circAbdominalEstomagoCm: number | null;
  circPeitoralCm: number | null;
  circBicepsDireitoCm: number | null;
  circBicepsEsquerdoCm: number | null;
  createdAt: string;
}

export interface SalvarMedidaInput {
  data: string;
  pesoKg: number;
  circAbdominalUmbigoCm: number | null;
  circAbdominalEstomagoCm: number | null;
  circPeitoralCm: number | null;
  circBicepsDireitoCm: number | null;
  circBicepsEsquerdoCm: number | null;
}
