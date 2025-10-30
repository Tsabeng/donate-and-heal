import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'donor' | 'doctor' | 'blood-bank';
  bloodType?: string;
  phone?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  userType: 'donor' | 'doctor' | 'blood-bank';
  bloodType?: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // TODO: Connecter à votre backend
    // const response = await api.post<AuthResponse>('/auth/login', credentials);
    // api.setToken(response.data.token);
    // return response.data;

    // VERSION DÉMO
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const demoUser: User = {
      id: '1',
      email: credentials.email,
      name: 'Utilisateur Démo',
      userType: credentials.userType as 'donor' | 'doctor' | 'blood-bank',
      bloodType: credentials.userType === 'donor' ? 'A+' : undefined,
    };

    const token = 'demo-token-' + Date.now();
    api.setToken(token);
    
    return { user: demoUser, token };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    // TODO: Connecter à votre backend
    // const response = await api.post<AuthResponse>('/auth/register', data);
    // api.setToken(response.data.token);
    // return response.data;

    // VERSION DÉMO
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const demoUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      userType: data.userType,
      bloodType: data.bloodType,
      phone: data.phone,
    };

    const token = 'demo-token-' + Date.now();
    api.setToken(token);
    
    return { user: demoUser, token };
  }

  async logout(): Promise<void> {
    // TODO: Connecter à votre backend
    // await api.post('/auth/logout');
    
    api.setToken(null);
  }

  async getCurrentUser(): Promise<User | null> {
    const token = api.getToken();
    if (!token) return null;

    // TODO: Connecter à votre backend
    // const response = await api.get<User>('/auth/me');
    // return response.data;

    // VERSION DÉMO - Retourner un utilisateur démo
    return {
      id: '1',
      email: 'demo@bloodlink.com',
      name: 'Utilisateur Démo',
      userType: 'donor',
      bloodType: 'A+',
    };
  }

  async forgotPassword(email: string): Promise<void> {
    // TODO: Connecter à votre backend
    // await api.post('/auth/forgot-password', { email });

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async resetPassword(token: string, password: string): Promise<void> {
    // TODO: Connecter à votre backend
    // await api.post('/auth/reset-password', { token, password });

    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const authService = new AuthService();
