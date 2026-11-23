import { create } from 'zustand';
import { NetworkStatus, SyncEventType } from '../types/pwa';
import { OfflineStorageService } from '../services/offlineStorageService';
import { SyncService } from '../services/syncService';
import { Lesson } from '@/features/lesson/types/Lesson';

interface PwaStoreState {
  isOnline: boolean;
  syncStatus: NetworkStatus;
  pendingSyncCount: number;
  savedLessonIds: string[];
  isInstallPromptVisible: boolean;
  deferredInstallEvent: unknown | null;
  isSyncModalOpen: boolean;

  // Actions
  setOnlineState: (isOnline: boolean) => void;
  loadSavedLessons: () => Promise<void>;
  saveLessonOffline: (lesson: Lesson) => Promise<boolean>;
  queueOfflineAction: (type: SyncEventType, payload: Record<string, unknown>) => Promise<void>;
  triggerSync: () => Promise<void>;
  setDeferredInstallEvent: (evt: unknown) => void;
  dismissInstallPrompt: () => void;
  setSyncModalOpen: (isOpen: boolean) => void;
  initializePwaStore: () => void;
}

export const usePwaStore = create<PwaStoreState>((set, get) => ({
  isOnline: true,
  syncStatus: 'online',
  pendingSyncCount: 0,
  savedLessonIds: [],
  isInstallPromptVisible: false,
  deferredInstallEvent: null,
  isSyncModalOpen: false,

  initializePwaStore: () => {
    if (typeof window === 'undefined') return;

    const initialOnline = navigator.onLine;
    set({
      isOnline: initialOnline,
      syncStatus: initialOnline ? 'online' : 'offline'
    });

    get().loadSavedLessons();
  },

  setOnlineState: (isOnline) => {
    const prevOnline = get().isOnline;
    set({
      isOnline,
      syncStatus: isOnline ? (get().pendingSyncCount > 0 ? 'syncing' : 'online') : 'offline'
    });

    // If connectivity returned, trigger automatic sync!
    if (!prevOnline && isOnline) {
      get().triggerSync();
    }
  },

  loadSavedLessons: async () => {
    try {
      const pending = await SyncService.getPendingItems();
      set({ pendingSyncCount: pending.length });
    } catch {
      // ignore
    }
  },

  saveLessonOffline: async (lesson) => {
    const success = await OfflineStorageService.saveLesson(lesson);
    if (success) {
      const current = get().savedLessonIds;
      if (!current.includes(lesson.id)) {
        set({ savedLessonIds: [...current, lesson.id] });
      }
    }
    return success;
  },

  queueOfflineAction: async (type, payload) => {
    await SyncService.queueAction(type, payload);
    const pending = await SyncService.getPendingItems();
    set({
      pendingSyncCount: pending.length,
      syncStatus: get().isOnline ? 'syncing' : 'offline'
    });

    if (get().isOnline) {
      get().triggerSync();
    }
  },

  triggerSync: async () => {
    if (!get().isOnline) return;

    set({ syncStatus: 'syncing' });

    try {
      const res = await SyncService.syncPending();
      const pending = await SyncService.getPendingItems();
      set({
        pendingSyncCount: pending.length,
        syncStatus: res.failedCount > 0 ? 'sync_failed' : 'synced'
      });
    } catch {
      set({ syncStatus: 'sync_failed' });
    }
  },

  setDeferredInstallEvent: (evt) => {
    set({ deferredInstallEvent: evt, isInstallPromptVisible: true });
  },

  dismissInstallPrompt: () => {
    set({ isInstallPromptVisible: false, deferredInstallEvent: null });
  },

  setSyncModalOpen: (isSyncModalOpen) => set({ isSyncModalOpen })
}));
