import type { FarmerProfile } from '../types';

const STORAGE_KEY = 'illai_scan_farmer_profile';
const ALL_FARMERS_KEY = 'illai_scan_all_farmers';

// Helper to generate a unique, official-looking Farmer ID
export function generateFarmerId(state: string, name?: string): string {
  const stateCodeMap: Record<string, string> = {
    'Tamil Nadu': 'TN',
    'Andhra Pradesh': 'AP',
    'Telangana': 'TS',
    'Karnataka': 'KA',
    'Kerala': 'KL',
    'Maharashtra': 'MH',
    'Uttar Pradesh': 'UP',
    'Punjab': 'PB',
    'Haryana': 'HR',
    'Gujarat': 'GJ',
    'Madhya Pradesh': 'MP',
    'Bihar': 'BR',
    'West Bengal': 'WB',
    'Rajasthan': 'RJ',
    'Odisha': 'OD'
  };

  const code = stateCodeMap[state] || 'IN';
  const prefix = name ? name.trim().charAt(0).toUpperCase() : '';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${code}-FARM-${prefix ? prefix + '-' : ''}${randomNum}`;
}

export class AuthService {
  private currentFarmer: FarmerProfile | null = null;
  private listeners: Array<(farmer: FarmerProfile | null) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.currentFarmer = JSON.parse(data);
      }
    } catch {
      this.currentFarmer = null;
    }
  }

  public getCurrentFarmer(): FarmerProfile | null {
    return this.currentFarmer;
  }

  public isAuthenticated(): boolean {
    return this.currentFarmer !== null;
  }

  public register(params: {
    name: string;
    phone: string;
    state: string;
    district?: string;
    primaryCrop?: string;
  }): FarmerProfile {
    const farmerId = generateFarmerId(params.state, params.name);
    const newProfile: FarmerProfile = {
      farmerId,
      name: params.name.trim(),
      phone: params.phone.trim(),
      state: params.state.trim(),
      district: params.district?.trim() || '',
      primaryCrop: params.primaryCrop || 'Banana',
      createdAt: Date.now()
    };

    // Save current active farmer
    this.currentFarmer = newProfile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));

    // Save in directory of all farmers on this device
    try {
      const existingAll = this.getAllRegisteredFarmers();
      const filtered = existingAll.filter(f => f.farmerId !== farmerId && f.phone !== newProfile.phone);
      filtered.push(newProfile);
      localStorage.setItem(ALL_FARMERS_KEY, JSON.stringify(filtered));
    } catch {
      // ignore storage error
    }

    this.notify();
    return newProfile;
  }

  public loginWithFarmerId(farmerId: string): FarmerProfile | null {
    const trimmed = farmerId.trim().toUpperCase();
    const all = this.getAllRegisteredFarmers();
    const found = all.find(f => f.farmerId.toUpperCase() === trimmed || f.phone === trimmed);

    if (found) {
      this.currentFarmer = found;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      this.notify();
      return found;
    }

    return null;
  }

  public loginAsGuest(name: string = 'Kisan Mitra'): FarmerProfile {
    return this.register({
      name,
      phone: '9876543210',
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      primaryCrop: 'Banana'
    });
  }

  public logout(): void {
    this.currentFarmer = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  public getAllRegisteredFarmers(): FarmerProfile[] {
    try {
      const raw = localStorage.getItem(ALL_FARMERS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }

    if (this.currentFarmer) {
      return [this.currentFarmer];
    }
    return [];
  }

  public subscribe(cb: (farmer: FarmerProfile | null) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentFarmer));
  }
}

export const authService = new AuthService();
