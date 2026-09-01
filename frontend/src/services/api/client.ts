import { ApiError } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiRequestError extends Error {
  code: ApiError['code'];
  constructor(message: string, code: ApiError['code']) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: { error?: ApiError } = {};
    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parse error if response body is not JSON
    }

    const message = errorData.error?.message || 'Something went wrong. Please try again.';
    const code = errorData.error?.code || 'SERVER_ERROR';
    throw new ApiRequestError(message, code);
  }

  return response.json() as Promise<T>;
}
