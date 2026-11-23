import { create } from 'zustand';
import { CaregiverDashboardOverview } from '../types/caregiver';
import { CaregiverService } from '../services/caregiverService';

interface CaregiverStoreState {
  overview: CaregiverDashboardOverview | null;
  isLoading: boolean;
  loadDashboard: () => Promise<void>;
}

export const useCaregiverStore = create<CaregiverStoreState>((set) => ({
  overview: null,
  isLoading: true,

  loadDashboard: async () => {
    set({ isLoading: true });
    const overview = await CaregiverService.getDashboardOverview();
    set({ overview, isLoading: false });
  }
}));
