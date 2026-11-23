import { create } from 'zustand';

export type UserRoleView = 'student' | 'teacher' | 'caregiver';

export interface UiState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  activeRoleView: UserRoleView;
  activeModalId: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setActiveRoleView: (role: UserRoleView) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  activeRoleView: 'student',
  activeModalId: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setActiveRoleView: (activeRoleView) => set({ activeRoleView }),
  openModal: (modalId) => set({ activeModalId: modalId }),
  closeModal: () => set({ activeModalId: null }),
}));
