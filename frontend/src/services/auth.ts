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
}

export interface BloodBank {
  _id: string;
  hospitalName: string;
  email: string;
  phone?: string;
  address?: string;
  location?: any;
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
  token: string;
  data: { user: User } | { bloodBank: BloodBank };
}

class AuthService {
  // === CONNEXION ===
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { userType, ...creds } = credentials;
    const endpoint = userType === 'blood-bank' ? '/api/auth/bloodbank/login' : '/api/auth/login';

    try {
      const response = await api.post<AuthResponse>(endpoint, creds);
      const { token } = response.data.data;

      api.setToken(token);
      localStorage.setItem('userType', userType);

      return response.data;
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // === INSCRIPTION ===
  async register(data: RegisterData): Promise<AuthResponse> {
    const { userType, bloodType, ...rest } = data;

    const endpoint = userType === 'blood-bank'
      ? '/api/auth/bloodbank/register'
      : '/api/auth/register';

    const payload = userType === 'blood-bank'
      ? { hospitalName: data.name, ...rest }
      : {
          ...rest,
          role: userType,
          bloodType: userType === 'donor' ? bloodType : undefined,
          hospital: userType === 'doctor' ? data.hospital : undefined,
          cni: userType === 'doctor' ? data.cni : undefined,
          licenseNumber: userType === 'doctor' ? data.licenseNumber : undefined,
        };

    try {
      const response = await api.post<AuthResponse>(endpoint, payload);
      const { token } = response.data;

      api.setToken(token);
      localStorage.setItem('userType', userType);

      return response.data;
    } catch (error: any) {
      const message = this.extractErrorMessage(error);
      throw new Error(message);
    }
  }

  // === PROFIL ===
  async getCurrentUser() {
  const token = api.getToken();
  if (!token) return null;

  const userType = localStorage.getItem('userType') as UserType | null;
  if (!userType) return null;

  const endpoint = userType === 'blood-bank'
    ? '/api/auth/bloodbank/profile'
    : '/api/auth/profile';

  try {
    // Change ici : on ne sait pas si c'est { data: ... } ou direct
    const response = await api.get<any>(endpoint);

    // Normalise la réponse
    const payload = response.data;

    if (payload.user) return payload.user;
    if (payload.bloodBank) return payload.bloodBank;
    if (payload.data?.user) return payload.data.user;
    if (payload.data?.bloodBank) return payload.data.bloodBank;

    return null;
  } catch (error: any) {
    console.error("getCurrentUser error:", error);
    this.logout();
    return null;
  }
}

  // === DÉCONNEXION ===
  async logout() {
    api.setToken(null);
    localStorage.removeItem('userType');
  }

  // === UTILITAIRE : Extraire le vrai message backend ===
  private extractErrorMessage(error: any): string {
    // 1. Message direct
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // 2. Erreurs de validation (express-validator)
    if (error.response?.data?.errors?.[0]?.msg) {
      return error.response.data.errors[0].msg;
    }

    // 3. Message générique
    return error.message || "Erreur inconnue";
  }
}

export const authService = new AuthService();