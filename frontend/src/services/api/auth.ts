import { apiFetch } from './client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

// Mock storage for dev fallback
const MOCK_USER: User = {
  id: 'user_001',
  name: 'Sam Student',
  email: 'student@example.com',
  role: 'student',
};

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      return await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch {
      // Mock response for offline/dev before backend is live
      const mockResponse: AuthResponse = {
        access_token: 'mock_token_123',
        token_type: 'bearer',
        user: {
          id: 'user_' + Date.now(),
          name: data.name,
          email: data.email,
          role: data.role,
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', mockResponse.access_token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
      }
      return mockResponse;
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch {
      const mockResponse: AuthResponse = {
        access_token: 'mock_token_123',
        token_type: 'bearer',
        user: MOCK_USER,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', mockResponse.access_token);
        localStorage.setItem('user', JSON.stringify(mockResponse.user));
      }
      return mockResponse;
    }
  },

  async getMe(): Promise<User> {
    try {
      return await apiFetch<User>('/me');
    } catch {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) return JSON.parse(stored);
      }
      return MOCK_USER;
    }
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },
};
