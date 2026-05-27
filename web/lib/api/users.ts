import { ApiResponse, TipoUsuario, UpdateUsuarioPayload, Usuario } from '../types/api';
import { apiFetch } from './apiClient';

export const userService = {
  getAll: (token: string) =>
    apiFetch<ApiResponse<Usuario[]>>('/usuarios', {
      next: { revalidate: 3600 },
      method: 'GET',
      token,
    }),

  update: (id: string, data: UpdateUsuarioPayload, token: string) =>
    apiFetch<ApiResponse<Usuario>>(`/usuarios/${id}`, {
      cache: 'no-store',
      method: 'PATCH',
      data,
      token,
    }),

  delete: (id: string, token: string) =>
    apiFetch<ApiResponse<Usuario>>(`/usuarios/${id}`, {
      cache: 'no-store',
      method: 'DELETE',
      token,
    }),

  login: (email: string, senha: string) =>
    apiFetch<ApiResponse<{ token: string; userRole: TipoUsuario }>>('/usuarios/login', {
      method: 'POST',
      data: { email, senha },
    }),

  register: (nome: string, cpf: string, email: string, senha: string) =>
    apiFetch<ApiResponse<{ token: string; userName: string; cpf: string }>>('/usuarios/register', {
      method: 'POST',
      data: { nome, cpf, email, senha },
    }),

  validate: (token: string) =>
    apiFetch<ApiResponse<{ ok: boolean; userId: string }>>('/usuarios/validate', {
      method: 'GET',
      token,
      cache: 'no-store',
    }),
};
