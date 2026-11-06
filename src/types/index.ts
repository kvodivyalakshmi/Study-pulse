export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type LessonStatus = 'not_started' | 'in_progress' | 'mastered';
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Lesson {
  id: string;
  title: string;
  status: LessonStatus;
  difficulty: Difficulty;
  estimatedMinutes: number;
  notes?: string;
  lastStudiedDate?: string; // YYYY-MM-DD
  revisionCount: number;
}

export interface SyllabusModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Subject {
  id: string;
  name: string;
  color: string; // e.g. 'indigo', 'emerald', 'amber', 'rose', 'cyan'
  iconName?: string;
  modules: SyllabusModule[];
  targetExamDate?: string;
  instructor?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
}

export interface AcademicGoal {
  id: string;
  title: string;
  subjectId?: string;
  targetDate: string;
  targetScoreOrGrade?: string;
  targetStudyHours: number;
  completedHours: number;
  category: 'Exam Preparation' | 'Syllabus Mastery' | 'Grade Target' | 'Skill Building' | 'Habit Building';
  milestones: GoalMilestone[];
  isCompleted: boolean;
  createdAt: string;
}

export interface AcademicTask {
  id: string;
  title: string;
  subjectId?: string;
  dueDate: string;
  estimatedMinutes: number;
  priority: Priority;
  status: TaskStatus;
  notes?: string;
  linkedLessonId?: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  lessonId?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
  focusRating: number; // 1-5
  notes?: string;
  xpEarned: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  type: 'pomodoro' | 'lesson_master' | 'task_finish' | 'mentor_chat';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  badgeLevel: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
}

export interface RecommendedBlock {
  timeBlock: string;
  subject: string;
  activity: string;
  technique: string;
  rationale: string;
}

export interface StudySchedulePlan {
  date: string;
  availableHours: number;
  preferredTimeOfDay: string;
  blocks: RecommendedBlock[];
  strategyAdvice: string;
}

export interface DailyTip {
  subject: string;
  title: string;
  description: string;
}

export interface MotivationalQuote {
  text: string;
  author: string;
}

export type CompanionPersona = 'Sage' | 'Nova' | 'Aria' | 'Orion';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'companion';
  text: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface QuizSessionResult {
  topic: string;
  subjectName?: string;
  lessonId?: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  date: string;
}

export interface UserGamificationState {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
  unlockedThemes: string[];
  activeTheme: string;
  selectedPersona: CompanionPersona;
}
