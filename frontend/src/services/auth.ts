// src/services/auth.ts
import { api } from './api';

export type UserType = 'donor' | 'doctor' | 'blood-bank';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'donor' | 'doctor';
  bloodType?: string;
  phone: string;
  hospital?: string;
  cni?: string;
  licenseNumber?: string;
  location?: any;
  status?: string;
  medicalHistory?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  __v?: number;
}

export interface BloodBank {
  _id: string;
  hospitalName: string;
  email: string;
  phone?: string;
  address?: string;
  location?: any;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: UserType;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  userType: UserType;
  bloodType?: string;
  hospital?: string;
  cni?: string;
  licenseNumber?: string;
}

export interface AuthResponse {
  token?: string;
  message?: string;
  data: {
    user?: User;
    bloodBank?: BloodBank;
  };
  error?: string;
}

class AuthService {
  // === CONNEXION ===
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { userType } = credentials;

    const payload =
      userType === 'blood-bank'
        ? credentials
        : { email: credentials.email, password: credentials.password };

    const endpoint =
      userType === 'blood-bank'
        ? '/api/auth/bloodbank/login'
        : '/api/auth/login';

    try {
      const response = await api.post<AuthResponse>(endpoint, payload);

      // Déstructuration
      const { token, data, message } = response;

      if (!token) {
        throw new Error(message || 'Token manquant');
      }

      const entity = data.user || data.bloodBank;
      if (!entity) {
        throw new Error('Utilisateur non trouvé dans la réponse');
      }

      // Sauvegarde
      api.setToken(token);
      localStorage.setItem('userType', userType);
      localStorage.setItem('user', JSON.stringify(entity));
      localStorage.setItem('token', token);

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur de connexion');
    }
  }

  // === INSCRIPTION ===
  async register(data: RegisterData): Promise<AuthResponse> {
    const { userType } = data;

    const endpoint =
      userType === 'blood-bank'
        ? '/api/auth/bloodbank/register'
        : '/api/auth/register';

    const payload =
      userType === 'blood-bank'
        ? {
            hospitalName: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
          }
        : {
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            role: userType,
            ...(userType === 'donor' && { bloodType: data.bloodType }),
            ...(userType === 'doctor' && {
              hospital: data.hospital,
              cni: data.cni,
              licenseNumber: data.licenseNumber,
            }),
          };

    try {
      const response = await api.post<AuthResponse>(endpoint, payload);
      const { token, data: resData, message } = response;

      if (!token) throw new Error(message || 'Échec de l\'inscription');

      const entity = resData.user || resData.bloodBank;
      if (!entity) throw new Error('Utilisateur non créé');

      api.setToken(token);
      localStorage.setItem('userType', userType);
      localStorage.setItem('user', JSON.stringify(entity));
      localStorage.setItem('token', token);

      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur d\'inscription');
    }
  }

  // === PROFIL ACTUEL ===
  async getCurrentUser(): Promise<User | BloodBank | null> {
    const token = api.getToken();
    const userType = localStorage.getItem('userType') as UserType | null;

    if (!token || !userType) return null;

    const endpoint =
      userType === 'blood-bank'
        ? '/api/auth/bloodbank/profile'
        : '/api/auth/profile';

    try {
      const response = await api.get<AuthResponse>(endpoint);
      const entity = response.data.user || response.data.bloodBank;

      if (entity) {
        localStorage.setItem('user', JSON.stringify(entity));
        return entity;
      }
      return null;
    } catch (error: any) {
      console.error('getCurrentUser error:', error);
      this.logout();
      return null;
    }
  }

  // === DÉCONNEXION ===
  logout() {
    api.setToken(null);
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService();

// DEBUG: expose to console
declare global {
  interface Window {
    authService: typeof authService;
    api: typeof api;
  }
}
if (typeof window !== 'undefined') {
  window.authService = authService;
  window.api = api;
}
