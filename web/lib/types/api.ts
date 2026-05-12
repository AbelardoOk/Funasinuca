// Enums
export type TipoUsuario = 'CLIENTE' | 'FUNCIONARIO' | 'ADMINISTRADOR';
export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'CANCELADO';
export type StatusMesa = 'DISPONIVEL' | 'RESERVADA' | 'INDISPONIVEL' | 'ATRASADA';

// Modelos
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  tipo: TipoUsuario;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Mesa {
  id: string;
  numero: number;
  status: StatusMesa;
  ativa: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Reserva {
  id: string;
  usuarioId: string;
  mesaId: string;
  horarioInicio: string;
  horarioFim: string;
  statusPagamento: StatusPagamento;
  presencaConfirmada: boolean;
  gatewayTransacaoId: string | null;
  criadoEm: string;
  atualizadoEm: string;
  usuario?: Pick<Usuario, 'id' | 'nome' | 'email'>;
  mesa?: Pick<Mesa, 'id' | 'numero' | 'status'>;
}

// Respostas da API
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Payloads de requisição
export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  cpf?: string;
  email: string;
  senha: string;
}

export interface CreateReservaPayload {
  mesaId: string;
  horarioInicio: string;
}

export interface UpdateReservaPayload {
  statusPagamento?: StatusPagamento;
  gatewayTransacaoId?: string;
  horarioInicio?: string;
}

export interface UpdateUsuarioPayload {
  nome?: string;
  email?: string;
  tipo?: TipoUsuario;
}

export interface UpdateMesaPayload {
  numero?: number;
  status?: StatusMesa;
  ativa?: boolean;
}

export interface CreateMesaPayload {
  numero: number;
}

export interface RelatorioReserva {
  periodo: { dataInicio: string; dataFim: string };
  totais: {
    total: number;
    pagas: number;
    canceladas: number;
    pendentes: number;
  };
  usoPorMesa: Record<number, number>;
  porDia: Record<string, number>;
  reservas: Reserva[];
}
