import {
  LearnerSummary,
  LearnerDetail,
  TeacherDashboardOverview,
  AssignmentItem,
  ClassOverview
} from '../types/teacher';

export const MOCK_LEARNERS: LearnerDetail[] = [
  {
    studentId: 'student_001',
    name: 'Ananya Sharma',
    currentCourse: 'Python Fundamentals',
    courseId: 'python-basics',
    progressPercentage: 82,
    recentQuizScore: 88,
    lastActive: 'Today',
    status: 'active',
    primarySubject: 'Python Coding',
    grade: 7,
    completedLessonsCount: 18,
    totalLessonsCount: 25,
    currentStreakDays: 5,
    topicMasteries: [
      { topicId: 'variables', topicName: 'Variables', percentage: 90, statusLabel: 'Strong' },
      { topicId: 'conditions', topicName: 'Conditions', percentage: 82, statusLabel: 'Good Progress' },
      { topicId: 'loops', topicName: 'Loops', percentage: 68, statusLabel: 'Developing' },
      { topicId: 'functions', topicName: 'Functions', percentage: 54, statusLabel: 'Practice More' }
    ],
    areasNeedingSupport: [
      {
        topicName: 'Functions',
        recentScore: 54,
        suggestion: 'Consider providing additional visual examples or guided practice for parameters.'
      }
    ],
    recentActivities: [
      { id: 'a1', title: 'Completed Python Variables Quiz (88%)', timestamp: '2 hours ago', type: 'quiz' },
      { id: 'a2', title: 'Started For Loops & Repetition', timestamp: 'Yesterday', type: 'lesson' }
    ]
  },
  {
    studentId: 'student_002',
    name: 'Rahul Verma',
    currentCourse: 'Python Fundamentals',
    courseId: 'python-basics',
    progressPercentage: 61,
    recentQuizScore: 64,
    lastActive: 'Yesterday',
    status: 'needs_support',
    primarySubject: 'Python Coding',
    grade: 7,
    completedLessonsCount: 12,
    totalLessonsCount: 25,
    currentStreakDays: 2,
    topicMasteries: [
      { topicId: 'variables', topicName: 'Variables', percentage: 75, statusLabel: 'Good Progress' },
      { topicId: 'conditions', topicName: 'Conditions', percentage: 58, statusLabel: 'Practice More' },
      { topicId: 'loops', topicName: 'Loops', percentage: 48, statusLabel: 'Practice More' }
    ],
    areasNeedingSupport: [
      {
        topicName: 'Loops & Repetition',
        recentScore: 48,
        suggestion: 'Student has made repeated mistakes in recent attempts. Recommend reviewing concept cards.'
      }
    ],
    recentActivities: [
      { id: 'a3', title: 'Submitted Decision Practice (64%)', timestamp: 'Yesterday', type: 'quiz' }
    ]
  },
  {
    studentId: 'student_003',
    name: 'Sofia Patel',
    currentCourse: 'Web Basics (HTML & CSS)',
    courseId: 'web-basics',
    progressPercentage: 90,
    recentQuizScore: 95,
    lastActive: 'Today',
    status: 'active',
    primarySubject: 'Web Dev',
    grade: 8,
    completedLessonsCount: 22,
    totalLessonsCount: 25,
    currentStreakDays: 8,
    topicMasteries: [
      { topicId: 'html', topicName: 'HTML Tags', percentage: 95, statusLabel: 'Strong' },
      { topicId: 'css', topicName: 'CSS Styling', percentage: 88, statusLabel: 'Strong' }
    ],
    areasNeedingSupport: [],
    recentActivities: [
      { id: 'a4', title: 'Completed HTML Structure Quiz (95%)', timestamp: 'Today', type: 'quiz' }
    ]
  },
  {
    studentId: 'student_004',
    name: 'Ethan Miller',
    currentCourse: 'Database & SQL Basics',
    courseId: 'database-basics',
    progressPercentage: 45,
    recentQuizScore: 50,
    lastActive: '3 days ago',
    status: 'needs_support',
    primarySubject: 'Data Science',
    grade: 8,
    completedLessonsCount: 9,
    totalLessonsCount: 25,
    currentStreakDays: 0,
    topicMasteries: [
      { topicId: 'queries', topicName: 'SQL Select Statements', percentage: 50, statusLabel: 'Practice More' }
    ],
    areasNeedingSupport: [
      {
        topicName: 'SQL Select Queries',
        recentScore: 50,
        suggestion: 'Provide step-by-step query building activity.'
      }
    ],
    recentActivities: [
      { id: 'a5', title: 'Completed Intro SQL Lesson', timestamp: '3 days ago', type: 'lesson' }
    ]
  }
];

export const MOCK_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-1',
    title: 'Python Functions Practice',
    courseName: 'Python Fundamentals',
    courseId: 'python-basics',
    topicName: 'Functions',
    dueDate: 'Friday',
    targetStudentsCount: 12,
    status: 'active'
  },
  {
    id: 'asg-2',
    title: 'Variables Review & Checkpoint',
    courseName: 'Python Fundamentals',
    courseId: 'python-basics',
    topicName: 'Variables',
    dueDate: 'Completed',
    targetStudentsCount: 24,
    status: 'completed'
  }
];

export class TeacherService {
  static async getDashboardOverview(): Promise<TeacherDashboardOverview> {
    return {
      overviewStats: {
        totalLearners: 24,
        activeLearners: 19,
        averageProgress: 78,
        averageQuizScore: 82,
        needSupportCount: 5
      },
      classOverview: {
        classroomId: 'cls-101',
        className: 'Grade 7 Coding & Logic',
        totalStudents: 24,
        averageProgress: 78,
        averageQuizScore: 82,
        studentsNeedingSupportCount: 5,
        mostChallengingTopic: 'Functions & Parameters',
        mostSuccessfulTopic: 'Variables & Data Types'
      },
      recentLearners: MOCK_LEARNERS,
      insights: [
        {
          id: 'ins-1',
          type: 'alert',
          title: '5 learners need extra practice in Functions',
          description: 'Quiz accuracy for Python Functions dropped below 60%. Consider dispatching a guided review.',
          suggestedActionText: 'Assign Practice',
          suggestedActionUrl: '/teacher/assignments'
        },
        {
          id: 'ins-2',
          type: 'success',
          title: 'Quiz scores improved by 14%',
          description: 'Overall class average in Variables rose to 88% following recent checkpoint exercises.',
          suggestedActionText: 'View Roster',
          suggestedActionUrl: '/teacher/students'
        }
      ],
      recentAssignments: MOCK_ASSIGNMENTS
    };
  }

  static async getLearners(filter?: string, search?: string): Promise<LearnerSummary[]> {
    let result = [...MOCK_LEARNERS];

    if (filter === 'needs_support') {
      result = result.filter(l => l.status === 'needs_support');
    } else if (filter === 'active') {
      result = result.filter(l => l.status === 'active');
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        l => l.name.toLowerCase().includes(q) || l.currentCourse.toLowerCase().includes(q)
      );
    }

    return result;
  }

  static async getLearnerDetail(studentId: string): Promise<LearnerDetail | null> {
    const found = MOCK_LEARNERS.find(l => l.studentId === studentId);
    return found || MOCK_LEARNERS[0];
  }

  static async getAssignments(): Promise<AssignmentItem[]> {
    return [...MOCK_ASSIGNMENTS];
  }

  static async createAssignment(newAsg: Partial<AssignmentItem>): Promise<AssignmentItem> {
    const created: AssignmentItem = {
      id: `asg-${Date.now()}`,
      title: newAsg.title || 'New Practice Assignment',
      courseName: newAsg.courseName || 'Python Fundamentals',
      courseId: newAsg.courseId || 'python-basics',
      topicName: newAsg.topicName || 'General',
      dueDate: newAsg.dueDate || 'Next Week',
      targetStudentsCount: newAsg.targetStudentsCount || 12,
      status: 'active'
    };
    MOCK_ASSIGNMENTS.unshift(created);
    return created;
  }
}
