export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data: T | null;
  error?: string;
}

export type TipoUsuario = 'CLIENTE' | 'FUNCIONARIO' | 'ADMINISTRADOR';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: TipoUsuario;
}

export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'CANCELADO';

export interface ReservaData {
  id: string;
  horarioInicio: string;
  horarioFim: string;
  statusPagamento: StatusPagamento;
  mesa: { numero: number };
  usuario: { nome: string };
}

export interface CreateReservaPayload {
  mesa_id: string;
  horario_inicio: string;
  horario_fim: string;
  numero_pessoas: number;
}

export interface UpdateReservaPayload {
  horario_inicio?: string;
  horario_fim?: string;
  numero_pessoas?: number;
  status?: string;
}

export interface MesaDisponivel {
  id: string;
  numero: number;
  disponivel: boolean;
}

export interface PagamentoData {
  preferenceId: string;
  sandboxInitPoint: string;
}

export interface CancelarData {
  reserva: ReservaData;
  reembolso: boolean;
  mensagem: string;
}
