import { invoke } from '@tauri-apps/api/core';
import {
  ApiResponse,
  CancelarData,
  CreateReservaPayload,
  MesaDisponivel,
  PagamentoData,
  ReservaData,
  StatusPagamento,
  UpdateReservaPayload,
} from '../types/api';

// ─── Helper ──────────────────────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const reservasService = {
  // Todas as reservas — funcionário
  listarTodas: async (filters?: {
    mesaId?: string;
    status?: StatusPagamento;
    data?: string;
  }): Promise<ApiResponse<ReservaData[]>> => {
    try {
      return await invoke<ApiResponse<ReservaData[]>>('get_reservas_command', {
        token: getToken(),
        mesa_id: filters?.mesaId ?? null,
        status: filters?.status ?? null,
        data: filters?.data ?? null,
      });
    } catch (error) {
      console.error('get_reservas_command:', error);
      return { ok: false, message: 'Erro ao buscar reservas.', data: [] };
    }
  },

  // Minhas reservas — cliente
  listarMinhas: async (status?: StatusPagamento): Promise<ApiResponse<ReservaData[]>> => {
    try {
      return await invoke<ApiResponse<ReservaData[]>>('get_minhas_reservas_command', {
        token: getToken(),
        status: status ?? null,
      });
    } catch (error) {
      console.error('get_minhas_reservas_command:', error);
      return { ok: false, message: 'Erro ao buscar suas reservas.', data: [] };
    }
  },

  // Disponibilidade de mesas — autenticado
  getDisponibilidade: async (horarioInicio: string): Promise<ApiResponse<MesaDisponivel[]>> => {
    try {
      return await invoke<ApiResponse<MesaDisponivel[]>>('get_disponibilidade_command', {
        horario_inicio: horarioInicio,
        token: getToken(),
      });
    } catch (error) {
      console.error('get_disponibilidade_command:', error);
      return { ok: false, message: 'Erro ao buscar disponibilidade.', data: [] };
    }
  },

  // Relatório — admin
  getRelatorio: async (dataInicio: string, dataFim: string): Promise<ApiResponse<unknown>> => {
    try {
      return await invoke<ApiResponse<unknown>>('get_relatorio_command', {
        data_inicio: dataInicio,
        data_fim: dataFim,
        token: getToken(),
      });
    } catch (error) {
      console.error('get_relatorio_command:', error);
      return { ok: false, message: 'Erro ao buscar relatório.', data: null };
    }
  },

  // Criar reserva — autenticado
  criar: async (payload: CreateReservaPayload): Promise<ApiResponse<ReservaData>> => {
    try {
      return await invoke<ApiResponse<ReservaData>>('create_reserva_command', {
        payload,
        token: getToken(),
      });
    } catch (error) {
      console.error('create_reserva_command:', error);
      return { ok: false, message: 'Erro ao criar reserva.', data: null };
    }
  },

  // Iniciar pagamento — autenticado
  criarPagamento: async (id: string): Promise<ApiResponse<PagamentoData>> => {
    try {
      return await invoke<ApiResponse<PagamentoData>>('criar_pagamento_command', {
        id,
        token: getToken(),
      });
    } catch (error) {
      console.error('criar_pagamento_command:', error);
      return { ok: false, message: 'Erro ao iniciar pagamento.', data: null };
    }
  },

  // Confirmar presença — funcionário
  confirmarPresenca: async (id: string): Promise<ApiResponse<ReservaData>> => {
    try {
      return await invoke<ApiResponse<ReservaData>>('confirmar_presenca_command', {
        id,
        token: getToken(),
      });
    } catch (error) {
      console.error('confirmar_presenca_command:', error);
      return { ok: false, message: 'Erro ao confirmar presença.', data: null };
    }
  },

  // Cancelar reserva — autenticado
  cancelar: async (id: string): Promise<ApiResponse<CancelarData>> => {
    try {
      return await invoke<ApiResponse<CancelarData>>('cancelar_reserva_command', {
        id,
        token: getToken(),
      });
    } catch (error) {
      console.error('cancelar_reserva_command:', error);
      return { ok: false, message: 'Erro ao cancelar reserva.', data: null };
    }
  },

  // Atualizar reserva — funcionário
  atualizar: async (
    id: string,
    payload: UpdateReservaPayload,
  ): Promise<ApiResponse<ReservaData>> => {
    try {
      return await invoke<ApiResponse<ReservaData>>('update_reserva_command', {
        id,
        payload,
        token: getToken(),
      });
    } catch (error) {
      console.error('update_reserva_command:', error);
      return { ok: false, message: 'Erro ao atualizar reserva.', data: null };
    }
  },
};
