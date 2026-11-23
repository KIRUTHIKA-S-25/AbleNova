import { User, AuthResponse, LoginRequest, RegisterRequest } from '@/types/user';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/localStorage';

export const DEMO_USER: User = {
  id: 'usr_demo_001',
  name: 'Alex River (Demo)',
  email: 'alex.student@ablenova.local',
  role: 'student',
  created_at: '2026-01-15T00:00:00Z',
};

const TOKEN_STORAGE_KEY = 'ablenova_access_token';
const USER_STORAGE_KEY = 'ablenova_current_user';

export const mockAuthService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Simulate lightweight network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (credentials.email.includes('error')) {
      throw new Error('Invalid email address or password. Please try again.');
    }

    const user: User = {
      id: `usr_${Date.now()}`,
      name: credentials.email.split('@')[0].replace('.', ' '),
      email: credentials.email,
      role: 'student',
      created_at: new Date().toISOString(),
    };

    const response: AuthResponse = {
      access_token: `mock_jwt_token_${Date.now()}`,
      token_type: 'bearer',
      user: credentials.email === DEMO_USER.email ? DEMO_USER : user,
    };

    setStorageItem(TOKEN_STORAGE_KEY, response.access_token);
    setStorageItem(USER_STORAGE_KEY, response.user);

    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (data.email === 'existing@ablenova.local') {
      throw new Error('An account with this email address already exists.');
    }

    const user: User = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role || 'student',
      created_at: new Date().toISOString(),
    };

    const response: AuthResponse = {
      access_token: `mock_jwt_token_${Date.now()}`,
      token_type: 'bearer',
      user,
    };

    setStorageItem(TOKEN_STORAGE_KEY, response.access_token);
    setStorageItem(USER_STORAGE_KEY, response.user);

    return response;
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    return {
      success: true,
      message: `Instructions to reset your password have been sent to ${email}.`,
    };
  },

  async resetPassword(password: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    return {
      success: true,
      message: 'Your password has been updated successfully.',
    };
  },

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      message: `A new verification link has been sent to ${email}.`,
    };
  },

  getCurrentUser(): User | null {
    return getStorageItem<User | null>(USER_STORAGE_KEY, null);
  },

  getAccessToken(): string | null {
    return getStorageItem<string | null>(TOKEN_STORAGE_KEY, null);
  },

  logout(): void {
    removeStorageItem(TOKEN_STORAGE_KEY);
    removeStorageItem(USER_STORAGE_KEY);
  },
};
