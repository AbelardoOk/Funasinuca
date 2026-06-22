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
        // O Rust exige um argumento com o nome exato "payload"
        payload: { email, senha },
      },
    ),

  register: (nome: string, cpf: string, email: string, senha: string) =>
    apiFetch<ApiResponse<{ token: string; userName: string; cpf: string }>>(
      'register_command', 
      {
        // O Rust exige um argumento com o nome exato "payload"
        payload: { nome, cpf, email, senha },
      }
    ),

  validate: (token: string) =>
    apiFetch<ApiResponse<{ ok: boolean; userId: string }>>('validate_command', {
      token, // O Rust exige um argumento chamado "token"
    }),

  getAll: async () => {
    try {
      const token = getToken();
      return await apiFetch<ApiResponse<Usuario[]>>('get_usuarios_command', { token });
    } catch (error) {
      console.error('get_usuarios_command:', error);
      return { ok: false, message: 'Erro ao buscar usuários.', data: [] };
    }
  },

  update: async (id: string, payload: UpdateUsuarioPayload) => {
    const token = getToken();
    
    // O Rust exige: id, payload e token soltos na raiz do objeto
    return await apiFetch<any>('update_usuario_command', { 
      id: id, 
      payload: payload, 
      token: token 
    });
  },

  delete: async (id: string) => {
    const token = getToken();
    
    // O Rust exige: id e token
    return await apiFetch<any>('delete_usuario_command', { 
      id: id, 
      token: token 
    });
  },
};

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