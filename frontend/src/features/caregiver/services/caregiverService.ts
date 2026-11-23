import { CaregiverDashboardOverview } from '../types/caregiver';

export class CaregiverService {
  static async getDashboardOverview(): Promise<CaregiverDashboardOverview> {
    return {
      learner: {
        studentId: 'student_001',
        name: 'Alex',
        grade: 7,
        currentCourse: 'Python Fundamentals',
        overallProgressPercentage: 72,
        completedLessonsCount: 18,
        totalLessonsCount: 25,
        averageQuizScore: 78,
        currentStreakDays: 5,
        lastActive: 'Today'
      },
      recentActivities: [
        {
          id: 'act-1',
          title: 'Completed Python Variables Quiz',
          timestamp: 'Today',
          statusText: 'Scored 88%',
          badgeType: 'success'
        },
        {
          id: 'act-2',
          title: 'Started For Loops & Repetition',
          timestamp: 'Yesterday',
          statusText: 'In Progress',
          badgeType: 'info'
        },
        {
          id: 'act-3',
          title: 'Completed If Statements & Decisions',
          timestamp: '2 days ago',
          statusText: 'Completed',
          badgeType: 'success'
        }
      ],
      recommendations: [
        {
          id: 'rec-1',
          title: 'Practice Functions Together',
          description: 'Try reviewing the Functions lesson using simple household examples (like a cookie recipe binder!).',
          actionText: 'Review Lesson',
          topicName: 'Functions'
        },
        {
          id: 'rec-2',
          title: 'Celebrate Recent Progress 🎉',
          description: 'Quiz performance has improved over the last three attempts! Acknowledge Alex’s steady consistency.',
          actionText: 'See Progress'
        }
      ],
      strongTopics: ['Variables & Assignments', 'If / Else Conditions'],
      practiceTopics: ['Functions & Parameters', 'Loops']
    };
  }
}
