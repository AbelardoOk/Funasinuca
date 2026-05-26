import { apiFetch } from '../apiClient';
import { ApiResponse, Usuario, TipoUsuario } from '../types/api'; 

export const userService = {
  login: (email: string, senha: string) =>
    apiFetch<ApiResponse<{ token: string; userRole: TipoUsuario; userName?: string }>>('login_command', {
      email, 
      senha 
    }),

  getAll: () =>
    apiFetch<ApiResponse<Usuario[]>>('get_all_users_command'),

  register: (nome: string, cpf: string, email: string, senha: string) =>
    apiFetch<ApiResponse<{ token: string; userName: string; cpf: string }>>('register_command', {
      nome, cpf, email, senha
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