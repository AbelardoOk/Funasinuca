import {
  ApiResponse,
  CreateReservaPayload,
  Mesa,
  RelatorioReserva,
  Reserva,
  StatusPagamento,
  UpdateReservaPayload,
} from '../types/api';
import { apiFetch } from './apiClient';

export const reservaService = {
  criarPagamento: (id: string, token: string) =>
    apiFetch<ApiResponse<{ preferenceId: string; sandboxInitPoint: string }>>(
      `/reservas/${id}/pagamento`,
      {
        method: 'POST',
        token,
        cache: 'no-store',
      },
    ),

  // Disponibilidade — qualquer autenticado
  getDisponibilidade: (horarioInicio: string, token: string) =>
    apiFetch<ApiResponse<(Mesa & { disponivel: boolean })[]>>('/reservas/disponibilidade', {
      method: 'GET',
      params: { horarioInicio },
      token,
      cache: 'no-store',
    }),

  // Minhas reservas — cliente autenticado
  getMinhas: (token: string, params?: { status?: StatusPagamento }) =>
    apiFetch<ApiResponse<Reserva[]>>('/reservas/minhas', {
      method: 'GET',
      params,
      token,
      cache: 'no-store',
    }),

  // Todas as reservas — funcionário
  getAll: (token: string, params?: { mesaId?: string; status?: StatusPagamento; data?: string }) =>
    apiFetch<ApiResponse<Reserva[]>>('/reservas', {
      method: 'GET',
      params,
      token,
      next: { revalidate: 30 },
    }),

  // Relatório — admin
  getRelatorio: (dataInicio: string, dataFim: string, token: string) =>
    apiFetch<ApiResponse<RelatorioReserva>>('/reservas/relatorio', {
      method: 'GET',
      params: { dataInicio, dataFim },
      token,
      cache: 'no-store',
    }),

  // Criar reserva — autenticado
  create: (data: CreateReservaPayload, token: string) =>
    apiFetch<ApiResponse<Reserva>>('/reservas', {
      method: 'POST',
      data,
      token,
    }),

  // Confirmar presença — funcionário
  confirmarPresenca: (id: string, token: string) =>
    apiFetch<ApiResponse<Reserva>>(`/reservas/${id}/confirmar-presenca`, {
      method: 'POST',
      token,
      cache: 'no-store',
    }),

  // Cancelar — autenticado
  cancelar: (id: string, token: string) =>
    apiFetch<ApiResponse<{ reserva: Reserva; reembolso: boolean; mensagem: string }>>(
      `/reservas/${id}/cancelar`,
      {
        method: 'PATCH',
        token,
        cache: 'no-store',
      },
    ),

  // Atualizar — funcionário
  update: (id: string, data: UpdateReservaPayload, token: string) =>
    apiFetch<ApiResponse<Reserva>>(`/reservas/${id}`, {
      method: 'PATCH',
      data,
      token,
      cache: 'no-store',
    }),
};
