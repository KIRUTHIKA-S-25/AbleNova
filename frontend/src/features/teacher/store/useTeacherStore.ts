import { create } from 'zustand';
import {
  LearnerSummary,
  LearnerDetail,
  TeacherDashboardOverview,
  AssignmentItem
} from '../types/teacher';
import { TeacherService } from '../services/teacherService';

interface TeacherStoreState {
  overview: TeacherDashboardOverview | null;
  learners: LearnerSummary[];
  selectedLearner: LearnerDetail | null;
  assignments: AssignmentItem[];
  filter: 'all' | 'active' | 'needs_support';
  searchQuery: string;
  isLoading: boolean;
  isCreateAssignmentOpen: boolean;

  // Actions
  loadDashboard: () => Promise<void>;
  loadLearners: () => Promise<void>;
  loadLearnerDetail: (studentId: string) => Promise<void>;
  setFilter: (filter: 'all' | 'active' | 'needs_support') => void;
  setSearchQuery: (query: string) => void;
  setCreateAssignmentOpen: (isOpen: boolean) => void;
  createAssignment: (data: Partial<AssignmentItem>) => Promise<void>;
}

export const useTeacherStore = create<TeacherStoreState>((set, get) => ({
  overview: null,
  learners: [],
  selectedLearner: null,
  assignments: [],
  filter: 'all',
  searchQuery: '',
  isLoading: true,
  isCreateAssignmentOpen: false,

  loadDashboard: async () => {
    set({ isLoading: true });
    const overview = await TeacherService.getDashboardOverview();
    const learners = await TeacherService.getLearners();
    const assignments = await TeacherService.getAssignments();
    set({ overview, learners, assignments, isLoading: false });
  },

  loadLearners: async () => {
    const { filter, searchQuery } = get();
    const learners = await TeacherService.getLearners(filter, searchQuery);
    set({ learners });
  },

  loadLearnerDetail: async (studentId) => {
    set({ isLoading: true });
    const selectedLearner = await TeacherService.getLearnerDetail(studentId);
    set({ selectedLearner, isLoading: false });
  },

  setFilter: (filter) => {
    set({ filter });
    get().loadLearners();
  },

  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    get().loadLearners();
  },

  setCreateAssignmentOpen: (isCreateAssignmentOpen) => set({ isCreateAssignmentOpen }),

  createAssignment: async (data) => {
    await TeacherService.createAssignment(data);
    const assignments = await TeacherService.getAssignments();
    set({ assignments, isCreateAssignmentOpen: false });
  }
}));
