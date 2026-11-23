import { create } from 'zustand';
import { User, LoginRequest, RegisterRequest } from '@/types/user';
import { mockAuthService, DEMO_USER } from '@/features/auth/services/mockAuthService';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  resetPassword: (password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  initAuthFromStorage: () => void;
  loginAsDemoUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuthFromStorage: () => {
    const user = mockAuthService.getCurrentUser();
    const token = mockAuthService.getAccessToken();
    if (user && token) {
      set({ user, isAuthenticated: true, error: null });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mockAuthService.login(credentials);
      set({ user: response.user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please check your credentials.';
      set({ error: message, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await mockAuthService.register(data);
      set({ user: response.user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      set({ error: message, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  requestPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const res = await mockAuthService.requestPasswordReset(email);
      set({ isLoading: false, error: null });
      return res.message;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to request password reset.';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  resetPassword: async (password) => {
    set({ isLoading: true, error: null });
    try {
      await mockAuthService.resetPassword(password);
      set({ isLoading: false, error: null });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset password.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    mockAuthService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),

  loginAsDemoUser: () => {
    set({ user: DEMO_USER, isAuthenticated: true, error: null, isLoading: false });
    mockAuthService.login({ email: DEMO_USER.email, password: 'Password123!' });
  },
}));
