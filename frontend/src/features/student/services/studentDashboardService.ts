import { StudentDashboardData } from '@/types/studentDashboard';
import { INITIAL_MOCK_STUDENT_DASHBOARD } from '../data/mockStudentDashboard';

export interface DashboardFetchOptions {
  simulatedDelayMs?: number;
  forceError?: boolean;
}

class StudentDashboardService {
  private data: StudentDashboardData = { ...INITIAL_MOCK_STUDENT_DASHBOARD };

  async getDashboardData(options?: DashboardFetchOptions): Promise<StudentDashboardData> {
    const delay = options?.simulatedDelayMs ?? 200;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (options?.forceError) {
          reject(new Error('Unable to load student learning space. Please check connection.'));
          return;
        }
        resolve({ ...this.data });
      }, delay);
    });
  }

  async updateActiveTopicProgress(newProgress: number): Promise<StudentDashboardData> {
    this.data.activeTopicProgress = Math.min(100, Math.max(0, newProgress));
    this.data.progressMetrics.overallProgressPercentage = Math.round(
      (this.data.activeTopicProgress + 72 + 65 + 80) / 4
    );
    return this.getDashboardData();
  }
}

export const studentDashboardService = new StudentDashboardService();
