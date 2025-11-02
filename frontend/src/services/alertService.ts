import { api } from './api';

export interface BloodAlert {
  id: string;
  bloodType: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  hospital: string;
  message: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'fulfilled' | 'expired';
}

export interface AlertSubscription {
  id: string;
  userId: string;
  bloodTypes: string[];
  radius: number; // en km
  notificationEnabled: boolean;
}

class AlertService {
  async getActiveAlerts(
    latitude?: number,
    longitude?: number,
    radius?: number
  ): Promise<BloodAlert[]> {
    // TODO: Connecter à votre backend
    // const params = new URLSearchParams();
    // if (latitude) params.append('lat', latitude.toString());
    // if (longitude) params.append('lng', longitude.toString());
    // if (radius) params.append('radius', radius.toString());
    // const response = await api.get<BloodAlert[]>(`/alerts?${params}`);
    // return response.data;

    // VERSION DÉMO
    const now = new Date();
    return [
      {
        id: '1',
        bloodType: 'O-',
        urgency: 'critical',
        location: {
          latitude: latitude || 48.8566,
          longitude: longitude || 2.3522,
          address: 'Hôpital Central, Paris',
        },
        hospital: 'Hôpital Central',
        message: 'Besoin urgent de sang O- pour une opération',
        createdAt: new Date(now.getTime() - 3600000),
        expiresAt: new Date(now.getTime() + 7200000),
        status: 'active',
      },
      {
        id: '2',
        bloodType: 'A+',
        urgency: 'high',
        location: {
          latitude: latitude ? latitude + 0.05 : 48.9066,
          longitude: longitude ? longitude + 0.05 : 2.4022,
          address: 'Clinique du Nord, Paris',
        },
        hospital: 'Clinique du Nord',
        message: 'Stock faible en A+',
        createdAt: new Date(now.getTime() - 1800000),
        expiresAt: new Date(now.getTime() + 14400000),
        status: 'active',
      },
    ];
  }

  async createAlert(alert: Omit<BloodAlert, 'id' | 'createdAt' | 'status'>): Promise<BloodAlert> {
    // TODO: Connecter à votre backend
    // const response = await api.post<BloodAlert>('/alerts', alert);
    // return response.data;

    // VERSION DÉMO
    return {
      id: Date.now().toString(),
      ...alert,
      createdAt: new Date(),
      status: 'active',
    };
  }

  async getMySubscriptions(): Promise<AlertSubscription> {
    // TODO: Connecter à votre backend
    // const response = await api.get<AlertSubscription>('/alerts/subscriptions');
    // return response.data;

    // VERSION DÉMO
    return {
      id: '1',
      userId: '1',
      bloodTypes: ['A+', 'A-'],
      radius: 10,
      notificationEnabled: true,
    };
  }

  async updateSubscription(subscription: Partial<AlertSubscription>): Promise<AlertSubscription> {
    // TODO: Connecter à votre backend
    // const response = await api.put<AlertSubscription>('/alerts/subscriptions', subscription);
    // return response.data;

    // VERSION DÉMO
    const current = await this.getMySubscriptions();
    return {
      ...current,
      ...subscription,
    };
  }

  async respondToAlert(alertId: string, response: 'accept' | 'decline'): Promise<void> {
    // TODO: Connecter à votre backend
    // await api.post(`/alerts/${alertId}/respond`, { response });

    // VERSION DÉMO
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const alertService = new AlertService();
