import {
  Subject,
  AcademicGoal,
  AcademicTask,
  StudySession,
  DailyQuest,
  Achievement,
  UserGamificationState,
  DailyTip,
  MotivationalQuote,
} from '../types';

const STORAGE_KEYS = {
  SUBJECTS: 'studypulse_subjects_v1',
  GOALS: 'studypulse_goals_v1',
  TASKS: 'studypulse_tasks_v1',
  SESSIONS: 'studypulse_sessions_v1',
  GAMIFICATION: 'studypulse_gamification_v1',
  ACHIEVEMENTS: 'studypulse_achievements_v1',
  THEME: 'studypulse_theme_v1',
  DAILY_TIPS: 'studypulse_tips_v1',
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-1',
    name: 'Data Structures & Algorithms',
    color: 'indigo',
    targetExamDate: '2026-11-20',
    instructor: 'Prof. Turing',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Foundations & Asymptotics',
        lessons: [
          {
            id: 'les-1',
            title: 'Big-O Analysis & Recurrence Relations',
            status: 'mastered',
            difficulty: 'Medium',
            estimatedMinutes: 60,
            notes: 'Mastered Master Theorem: T(n) = aT(n/b) + f(n)',
            lastStudiedDate: '2026-10-24',
            revisionCount: 2,
          },
          {
            id: 'les-2',
            title: 'Arrays, Dynamic Lists & Pointers',
            status: 'mastered',
            difficulty: 'Easy',
            estimatedMinutes: 45,
            notes: 'Amortized cost analysis of dynamic resizing is O(1).',
            lastStudiedDate: '2026-10-25',
            revisionCount: 1,
          },
        ],
      },
      {
        id: 'mod-2',
        title: 'Module 2: Non-Linear Structures',
        lessons: [
          {
            id: 'les-3',
            title: 'Binary Search Trees & Self-Balancing (AVL / Red-Black)',
            status: 'in_progress',
            difficulty: 'Hard',
            estimatedMinutes: 90,
            notes: 'Need to review double rotations (Left-Right and Right-Left)',
            lastStudiedDate: '2026-10-25',
            revisionCount: 1,
          },
          {
            id: 'les-4',
            title: 'Heaps & Priority Queues',
            status: 'not_started',
            difficulty: 'Medium',
            estimatedMinutes: 60,
            revisionCount: 0,
          },
          {
            id: 'les-5',
            title: 'Graph Traversals (BFS, DFS & Topological Sort)',
            status: 'not_started',
            difficulty: 'Hard',
            estimatedMinutes: 110,
            revisionCount: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'subj-2',
    name: 'Organic Chemistry',
    color: 'emerald',
    targetExamDate: '2026-11-14',
    instructor: 'Dr. Rosalind',
    modules: [
      {
        id: 'mod-3',
        title: 'Unit 1: Stereochemistry & Molecular Geometry',
        lessons: [
          {
            id: 'les-6',
            title: 'Chirality, Enantiomers & R/S Configuration',
            status: 'mastered',
            difficulty: 'Medium',
            estimatedMinutes: 50,
            notes: 'Cahn-Ingold-Prelog priority rules memorized.',
            lastStudiedDate: '2026-10-23',
            revisionCount: 2,
          },
          {
            id: 'les-7',
            title: 'Fischer Projections & Diastereomers',
            status: 'in_progress',
            difficulty: 'Medium',
            estimatedMinutes: 60,
            notes: 'Meso compounds have internal planes of symmetry.',
            lastStudiedDate: '2026-10-25',
            revisionCount: 1,
          },
        ],
      },
      {
        id: 'mod-4',
        title: 'Unit 2: Substitution & Elimination Reactions',
        lessons: [
          {
            id: 'les-8',
            title: 'SN1 vs SN2 Mechanisms & Solvation Effects',
            status: 'not_started',
            difficulty: 'Hard',
            estimatedMinutes: 90,
            revisionCount: 0,
          },
          {
            id: 'les-9',
            title: 'E1 vs E2 Reaction Pathways & Zaitsev Rule',
            status: 'not_started',
            difficulty: 'Hard',
            estimatedMinutes: 80,
            revisionCount: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'subj-3',
    name: 'Microeconomics & Game Theory',
    color: 'amber',
    targetExamDate: '2026-12-05',
    instructor: 'Prof. Nash',
    modules: [
      {
        id: 'mod-5',
        title: 'Part 1: Consumer & Market Equilibrium',
        lessons: [
          {
            id: 'les-10',
            title: 'Marginal Utility & Indifference Curves',
            status: 'mastered',
            difficulty: 'Easy',
            estimatedMinutes: 45,
            notes: 'Tangency condition: MRS = Px/Py',
            lastStudiedDate: '2026-10-22',
            revisionCount: 1,
          },
          {
            id: 'les-11',
            title: 'Nash Equilibrium & Simultaneous Games',
            status: 'in_progress',
            difficulty: 'Medium',
            estimatedMinutes: 65,
            notes: 'Iterated elimination of strictly dominated strategies.',
            lastStudiedDate: '2026-10-24',
            revisionCount: 1,
          },
        ],
      },
    ],
  },
];

export const INITIAL_GOALS: AcademicGoal[] = [
  {
    id: 'goal-1',
    title: 'Achieve 95%+ in Data Structures Midterm',
    subjectId: 'subj-1',
    targetDate: '2026-11-20',
    targetScoreOrGrade: '95% (A+)',
    targetStudyHours: 35,
    completedHours: 18.5,
    category: 'Exam Preparation',
    isCompleted: false,
    createdAt: '2026-10-15',
    milestones: [
      { id: 'm-1', title: 'Master Big-O & Asymptotics', targetDate: '2026-10-20', completed: true },
      { id: 'm-2', title: 'Complete AVL and BST Coding Drills', targetDate: '2026-10-30', completed: false },
      { id: 'm-3', title: 'Solve 15 Graph Traversal Problems', targetDate: '2026-11-10', completed: false },
      { id: 'm-4', title: 'Mock Exam under 80-minute constraint', targetDate: '2026-11-18', completed: false },
    ],
  },
  {
    id: 'goal-2',
    title: 'Complete 100% of Organic Chem Syllabus Units 1 & 2',
    subjectId: 'subj-2',
    targetDate: '2026-11-14',
    targetScoreOrGrade: 'Unit Mastery',
    targetStudyHours: 25,
    completedHours: 12.0,
    category: 'Syllabus Mastery',
    isCompleted: false,
    createdAt: '2026-10-18',
    milestones: [
      { id: 'm-5', title: 'Stereochemistry flashcards 100% active recall', targetDate: '2026-10-28', completed: true },
      { id: 'm-6', title: 'Map all SN1/SN2/E1/E2 reaction condition matrices', targetDate: '2026-11-05', completed: false },
      { id: 'm-7', title: 'Solve Chapter 7 & 8 problem set end-of-book', targetDate: '2026-11-12', completed: false },
    ],
  },
  {
    id: 'goal-3',
    title: 'Build Consistent 20-Hour Weekly Focus Habit',
    targetDate: '2026-11-30',
    targetScoreOrGrade: 'Habit Mastery',
    targetStudyHours: 80,
    completedHours: 46.5,
    category: 'Habit Building',
    isCompleted: false,
    createdAt: '2026-10-01',
    milestones: [
      { id: 'm-8', title: 'Maintain 7-day active study streak', targetDate: '2026-10-28', completed: true },
      { id: 'm-9', title: 'Achieve 14-day study streak', targetDate: '2026-11-08', completed: false },
      { id: 'm-10', title: 'Reach Level 5 Mindful Scholar', targetDate: '2026-11-20', completed: false },
    ],
  },
];

export const INITIAL_TASKS: AcademicTask[] = [
  {
    id: 'task-1',
    title: 'Implement AVL Tree Left-Right Rotation in Code',
    subjectId: 'subj-1',
    dueDate: '2026-10-26',
    estimatedMinutes: 45,
    priority: 'high',
    status: 'in_progress',
    notes: 'Focus on updating balance factors correctly.',
    linkedLessonId: 'les-3',
  },
  {
    id: 'task-2',
    title: 'Fischer Projection to Newman Projection Conversion Practice',
    subjectId: 'subj-2',
    dueDate: '2026-10-27',
    estimatedMinutes: 30,
    priority: 'medium',
    status: 'todo',
    notes: 'Complete exercises 4.12 through 4.20 in textbook.',
    linkedLessonId: 'les-7',
  },
  {
    id: 'task-3',
    title: 'Analyze Cournot Duopoly Reaction Curves',
    subjectId: 'subj-3',
    dueDate: '2026-10-28',
    estimatedMinutes: 40,
    priority: 'low',
    status: 'todo',
    notes: 'Derive best response functions BR1(q2) and BR2(q1).',
    linkedLessonId: 'les-11',
  },
  {
    id: 'task-4',
    title: 'Active Recall Summary on Big-O Invariants',
    subjectId: 'subj-1',
    dueDate: '2026-10-25',
    estimatedMinutes: 25,
    priority: 'medium',
    status: 'completed',
    notes: 'Written down without notes; scored 9/10 on practice quiz.',
    linkedLessonId: 'les-1',
  },
];

export const INITIAL_SESSIONS: StudySession[] = [
  {
    id: 'sess-1',
    subjectId: 'subj-1',
    lessonId: 'les-1',
    durationMinutes: 50,
    date: '2026-10-23',
    timestamp: Date.now() - 2 * 86400000,
    focusRating: 5,
    notes: 'Deep flow session on asymptotic recurrence relations.',
    xpEarned: 100,
  },
  {
    id: 'sess-2',
    subjectId: 'subj-2',
    lessonId: 'les-6',
    durationMinutes: 45,
    date: '2026-10-24',
    timestamp: Date.now() - 86400000,
    focusRating: 4,
    notes: 'Stereochemistry model practice with active recall cards.',
    xpEarned: 90,
  },
  {
    id: 'sess-3',
    subjectId: 'subj-1',
    lessonId: 'les-3',
    durationMinutes: 60,
    date: '2026-10-25',
    timestamp: Date.now() - 3600000,
    focusRating: 5,
    notes: 'AVL tree balance factor deep dive.',
    xpEarned: 120,
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-step',
    title: 'First Step to Mastery',
    description: 'Complete your first focused study session.',
    icon: 'Sparkles',
    unlocked: true,
    unlockedAt: '2026-10-23',
    progress: 1,
    maxProgress: 1,
    badgeLevel: 'Bronze',
  },
  {
    id: 'ach-streak-3',
    title: 'Momentum Ignited',
    description: 'Maintain a 3-day continuous study streak.',
    icon: 'Flame',
    unlocked: true,
    unlockedAt: '2026-10-25',
    progress: 3,
    maxProgress: 3,
    badgeLevel: 'Bronze',
  },
  {
    id: 'ach-streak-7',
    title: 'Unstoppable Habit',
    description: 'Reach a 7-day continuous study streak.',
    icon: 'Zap',
    unlocked: false,
    progress: 3,
    maxProgress: 7,
    badgeLevel: 'Silver',
  },
  {
    id: 'ach-pomodoro-10',
    title: 'Pomodoro Artisan',
    description: 'Complete 10 focused Pomodoro blocks.',
    icon: 'Clock',
    unlocked: false,
    progress: 4,
    maxProgress: 10,
    badgeLevel: 'Silver',
  },
  {
    id: 'ach-master-5',
    title: 'Syllabus Conqueror',
    description: 'Master 5 distinct syllabus lesson topics.',
    icon: 'Award',
    unlocked: false,
    progress: 3,
    maxProgress: 5,
    badgeLevel: 'Silver',
  },
  {
    id: 'ach-hours-25',
    title: 'Deep Work Devotee',
    description: 'Log 25 total hours of focused academic study.',
    icon: 'BookOpen',
    unlocked: false,
    progress: 15.5,
    maxProgress: 25,
    badgeLevel: 'Gold',
  },
  {
    id: 'ach-mentor-chat',
    title: 'Seeker of Wisdom',
    description: 'Consult with your AI Study Companion for advice.',
    icon: 'Bot',
    unlocked: true,
    unlockedAt: '2026-10-24',
    progress: 1,
    maxProgress: 1,
    badgeLevel: 'Bronze',
  },
  {
    id: 'ach-goal-crush',
    title: 'Goal Finisher',
    description: 'Complete 1 major academic goal milestone.',
    icon: 'Trophy',
    unlocked: true,
    unlockedAt: '2026-10-24',
    progress: 1,
    maxProgress: 1,
    badgeLevel: 'Gold',
  },
];

export const INITIAL_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest-1',
    title: 'Focus Sprint',
    description: 'Complete 2 Pomodoro focus blocks today (50 mins total)',
    xpReward: 80,
    targetCount: 2,
    currentCount: 1,
    isCompleted: false,
    type: 'pomodoro',
  },
  {
    id: 'quest-2',
    title: 'Syllabus Advance',
    description: 'Review or master at least 1 lesson in your syllabus',
    xpReward: 100,
    targetCount: 1,
    currentCount: 1,
    isCompleted: true,
    type: 'lesson_master',
  },
  {
    id: 'quest-3',
    title: 'Action Item Dispatch',
    description: 'Complete 1 task from your academic action planner',
    xpReward: 60,
    targetCount: 1,
    currentCount: 1,
    isCompleted: true,
    type: 'task_finish',
  },
  {
    id: 'quest-4',
    title: 'Mentor Consultation',
    description: 'Ask your study companion for a study strategy or tip',
    xpReward: 50,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    type: 'mentor_chat',
  },
];

export const INITIAL_GAMIFICATION: UserGamificationState = {
  xp: 480,
  level: 2,
  streakDays: 3,
  lastActiveDate: '2026-10-25',
  totalStudyMinutes: 155,
  unlockedThemes: ['default', 'cosmic', 'zen_garden'],
  activeTheme: 'default',
  selectedPersona: 'Sage',
};

export const LEVEL_TITLES: Record<number, string> = {
  1: 'Freshman Scholar',
  2: 'Diligent Learner',
  3: 'Focus Apprentice',
  4: 'Syllabus Explorer',
  5: 'Mindful Strategist',
  6: 'Deliberate Thinker',
  7: 'Deep Work Practitioner',
  8: 'Academic Contender',
  9: 'Master of Concepts',
  10: 'Grand Polymath',
};

export function getXpForNextLevel(level: number): number {
  return level * 300;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] || `Level ${level} Scholar`;
}

// Storage operations
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    return JSON.parse(saved);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export { STORAGE_KEYS };
