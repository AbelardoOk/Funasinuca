import { ApiResponse, CreateMesaPayload, Mesa, StatusMesa, UpdateMesaPayload } from '../types/api';
import { apiFetch } from './apiClient';

export const mesaService = {
  getAll: (token: string, params?: { status?: StatusMesa; ativa?: string; numero?: string }) =>
    apiFetch<ApiResponse<Mesa[]>>('/mesas', {
      method: 'GET',
      params,
      token,
      next: { revalidate: 60 },
    }),

  create: (data: CreateMesaPayload, token: string) =>
    apiFetch<ApiResponse<Mesa>>('/mesas', {
      method: 'POST',
      data,
      token,
    }),

  update: (id: string, data: UpdateMesaPayload, token: string) =>
    apiFetch<ApiResponse<Mesa>>(`/mesas/${id}`, {
      method: 'PATCH',
      data,
      token,
      cache: 'no-store',
    }),

  delete: (id: string, token: string) =>
    apiFetch<ApiResponse<Mesa>>(`/mesas/${id}`, {
      method: 'DELETE',
      token,
      cache: 'no-store',
    }),
};
