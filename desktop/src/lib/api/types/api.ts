
export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  data: T;
  error?: string;
}

export type TipoUsuario = 'CLIENTE' | 'FUNCIONARIO' | 'ADMINISTRADOR';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: TipoUsuario;
}
