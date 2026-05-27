import { invoke } from '@tauri-apps/api/core';
import { apiFetch } from '../apiClient';
import { ApiResponse, TipoUsuario, UpdateUsuarioPayload, Usuario } from '../types/api';

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

export const userService = {
  login: (email: string, senha: string) =>
    apiFetch<ApiResponse<{ token: string; userRole: TipoUsuario; userName?: string }>>(
      'login_command',
      {
        email,
        senha,
      },
    ),

  register: (nome: string, cpf: string, email: string, senha: string) =>
    apiFetch<ApiResponse<{ token: string; userName: string; cpf: string }>>('register_command', {
      nome,
      cpf,
      email,
      senha,
    }),

  validate: (token: string) =>
    apiFetch<ApiResponse<{ ok: boolean; userId: string }>>('validate_command', {
      token,
    }),

  getAll: async () => {
    try {
      const token = localStorage.getItem('token') ?? '';
      return await invoke<ApiResponse<Usuario[]>>('get_usuarios_command', { token });
    } catch (error) {
      console.error('get_usuarios_command:', error);
      return { ok: false, message: 'Erro ao buscar usuários.', data: [] };
    }
  },

  update: (id: string, payload: UpdateUsuarioPayload) =>
    apiFetch<ApiResponse<Usuario>>('update_usuario_command', {
      id,
      payload,
      token: getToken(),
    }),

  delete: (id: string) =>
    apiFetch<ApiResponse<Usuario>>('delete_usuario_command', {
      id,
      token: getToken(),
    }),
};

// .
export interface RegisterData {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}

export interface LoginResponseData {
  token: string;
  userRole: TipoUsuario;
  userName?: string;
}
