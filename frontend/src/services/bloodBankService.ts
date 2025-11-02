import { api } from './api';

export interface BloodStock {
  bloodType: string;
  quantity: number;
  unit: 'ml' | 'units';
  lastUpdated: Date;
}

export interface BloodRequest {
  id: string;
  bloodType: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requesterName: string;
  hospital: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
}

export interface DonationAppointment {
  id: string;
  donorName: string;
  bloodType: string;
  date: Date;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location: string;
}

export interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  };
  stock: BloodStock[];
}

class BloodBankService {
  async getStock(): Promise<BloodStock[]> {
    // TODO: Connecter à votre backend
    // const response = await api.get<BloodStock[]>('/blood-bank/stock');
    // return response.data;

    // VERSION DÉMO
    return [
      { bloodType: 'A+', quantity: 45, unit: 'units', lastUpdated: new Date() },
      { bloodType: 'A-', quantity: 12, unit: 'units', lastUpdated: new Date() },
      { bloodType: 'B+', quantity: 32, unit: 'units', lastUpdated: new Date() },
      { bloodType: 'B-', quantity: 8, unit: 'units', lastUpdated: new Date() },
      { bloodType: 'O+', quantity: 56, unit: 'units', lastUpdated: new Date() },
      { bloodType: 'O-', quantity: 15, unit: 'units', lastUpdated: new Date() },
      { bloodType: 'AB+', quantity: 18, unit: 'units', lastUpdated: new Date() },
      { bloodType: 'AB-', quantity: 5, unit: 'units', lastUpdated: new Date() },
    ];
  }

  async getRequests(): Promise<BloodRequest[]> {
    // TODO: Connecter à votre backend
    // const response = await api.get<BloodRequest[]>('/blood-bank/requests');
    // return response.data;

    // VERSION DÉMO
    return [
      {
        id: '1',
        bloodType: 'O-',
        quantity: 2,
        urgency: 'critical',
        requesterName: 'Dr. Martin',
        hospital: 'Hôpital Central',
        requestDate: new Date(),
        status: 'pending',
      },
      {
        id: '2',
        bloodType: 'A+',
        quantity: 3,
        urgency: 'high',
        requesterName: 'Dr. Dubois',
        hospital: 'Clinique du Nord',
        requestDate: new Date(Date.now() - 3600000),
        status: 'approved',
      },
    ];
  }

  async getAppointments(): Promise<DonationAppointment[]> {
    // TODO: Connecter à votre backend
    // const response = await api.get<DonationAppointment[]>('/blood-bank/appointments');
    // return response.data;

    // VERSION DÉMO
    return [
      {
        id: '1',
        donorName: 'Jean Dupont',
        bloodType: 'A+',
        date: new Date(Date.now() + 86400000),
        time: '10:00',
        status: 'scheduled',
        location: 'Centre de Don Principal',
      },
      {
        id: '2',
        donorName: 'Marie Laurent',
        bloodType: 'O+',
        date: new Date(Date.now() + 86400000),
        time: '14:30',
        status: 'scheduled',
        location: 'Centre de Don Principal',
      },
    ];
  }

  async getNearbyBloodBanks(latitude: number, longitude: number): Promise<BloodBank[]> {
    // TODO: Connecter à votre backend
    // const response = await api.get<BloodBank[]>(`/blood-bank/nearby?lat=${latitude}&lng=${longitude}`);
    // return response.data;

    // VERSION DÉMO
    return [
      {
        id: '1',
        name: 'Centre de Transfusion Principal',
        address: '123 Rue de la Santé',
        phone: '+33 1 23 45 67 89',
        location: { latitude: latitude + 0.01, longitude: longitude + 0.01 },
        stock: await this.getStock(),
      },
    ];
  }

  async requestBlood(request: Omit<BloodRequest, 'id' | 'requestDate' | 'status'>): Promise<BloodRequest> {
    // TODO: Connecter à votre backend
    // const response = await api.post<BloodRequest>('/blood-bank/request', request);
    // return response.data;

    // VERSION DÉMO
    return {
      id: Date.now().toString(),
      ...request,
      requestDate: new Date(),
      status: 'pending',
    };
  }

  async scheduleAppointment(
    appointment: Omit<DonationAppointment, 'id' | 'status'>
  ): Promise<DonationAppointment> {
    // TODO: Connecter à votre backend
    // const response = await api.post<DonationAppointment>('/blood-bank/appointment', appointment);
    // return response.data;

    // VERSION DÉMO
    return {
      id: Date.now().toString(),
      ...appointment,
      status: 'scheduled',
    };
  }
}

export const bloodBankService = new BloodBankService();
