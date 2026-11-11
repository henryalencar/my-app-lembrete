export type Prioridade = 'baixa' | 'media' | 'alta';

export type Lembrete = {
  id: string;
  titulo: string;
  nota: string;
  data: string;
  horario: string;
  concluido: boolean;
  diario: boolean;
  criadoEm: string;
  concluidoEm: string | null;
  prioridade: Prioridade;
};