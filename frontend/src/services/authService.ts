import { apiClient } from './apiClient'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  role: 'user' | 'admin'
  photoDataUrl?: string
  createdAt?: string
}

export interface AuthResponse {
  user: AuthUser
  token: string
}

export const authService = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    photoDataUrl?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    localStorage.setItem('cricketverse-token', response.data.token)
    return response.data;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('cricketverse-token', response.data.token)
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('cricketverse-token')
  },

  getProfile: async (): Promise<{ user: AuthUser }> => {
    const response = await apiClient.get<{ user: AuthUser }>('/auth/profile');
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.put('/auth/password', { currentPassword, newPassword });
    return response.data;
  },
};

export const logOut = async () => {
  localStorage.removeItem('cricketverse-token')
  localStorage.removeItem('token');
};