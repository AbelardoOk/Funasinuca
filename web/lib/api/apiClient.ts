const BASE_URL = `${process.env.API_URL}/api`;

interface ApiOptions extends Omit<RequestInit, 'body'> {
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  token?: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
}

export async function apiFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { data, params, token, headers: customHeaders, ...customConfig } = options;

  let queryString = '';
  if (params) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined),
    ) as Record<string, string>;

    const searchParams = new URLSearchParams(cleanParams);
    if (searchParams.toString()) {
      queryString = `?${searchParams.toString()}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method ?? (data ? 'POST' : 'GET'),
    headers,
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}${queryString}`, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || `Erro HTTP: ${response.status}`);
  }

  if (response.status === 204) return {} as T;

  return response.json();
}
