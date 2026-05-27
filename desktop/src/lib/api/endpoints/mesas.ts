import { invoke } from '@tauri-apps/api/core';
import { ApiResponse, CreateMesaPayload, Mesa, StatusMesa, UpdateMesaPayload } from '../types/api';

// ─── Helper ──────────────────────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const mesasService = {
  /**
   * Lista todas as mesas do sistema aplicando filtros opcionais.
   * Acessível por funcionários e administradores.
   */
  listarTodas: async (filters?: {
    status?: StatusMesa;
    ativa?: string;
    numero?: string;
  }): Promise<ApiResponse<Mesa[]>> => {
    try {
      return await invoke<ApiResponse<Mesa[]>>('get_mesas_command', {
        token: getToken(),
        status: filters?.status ?? null,
        ativa: filters?.ativa ?? null,
        numero: filters?.numero ?? null,
      });
    } catch (error) {
      console.error('get_mesas_command:', error);
      return { ok: false, message: 'Erro ao buscar lista de mesas.', data: [] };
    }
  },

  /**
   * Cria e registra uma nova mesa no banco de dados.
   * Acessível apenas por administradores.
   */
  criar: async (payload: CreateMesaPayload): Promise<ApiResponse<Mesa>> => {
    try {
      return await invoke<ApiResponse<Mesa>>('create_mesa_command', {
        payload,
        token: getToken(),
      });
    } catch (error) {
      console.error('create_mesa_command:', error);
      return { ok: false, message: 'Erro ao cadastrar nova mesa.', data: null };
    }
  },

  /**
   * Atualiza os dados ou o estado de ativação de uma mesa existente.
   * Acessível por funcionários e administradores.
   */
  atualizar: async (id: string, payload: UpdateMesaPayload): Promise<ApiResponse<Mesa>> => {
    try {
      return await invoke<ApiResponse<Mesa>>('update_mesa_command', {
        id,
        payload,
        token: getToken(),
      });
    } catch (error) {
      console.error('update_mesa_command:', error);
      return { ok: false, message: 'Erro ao atualizar dados da mesa.', data: null };
    }
  },

  /**
   * Remove uma mesa do sistema com base em seu ID único.
   * Acessível apenas por administradores.
   */
  excluir: async (id: string): Promise<ApiResponse<Mesa>> => {
    try {
      return await invoke<ApiResponse<Mesa>>('delete_mesa_command', {
        id,
        token: getToken(),
      });
    } catch (error) {
      console.error('delete_mesa_command:', error);
      return { ok: false, message: 'Erro ao excluir a mesa selecionada.', data: null };
    }
  },
};
