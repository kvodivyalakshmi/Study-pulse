import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Subject,
  AcademicGoal,
  AcademicTask,
  StudySession,
  DailyQuest,
  Achievement,
  UserGamificationState,
  CompanionPersona,
  LessonStatus,
  TaskStatus,
  DailyTip,
  MotivationalQuote,
} from '../types';
import {
  loadFromStorage,
  saveToStorage,
  STORAGE_KEYS,
  INITIAL_SUBJECTS,
  INITIAL_GOALS,
  INITIAL_TASKS,
  INITIAL_SESSIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_DAILY_QUESTS,
  INITIAL_GAMIFICATION,
  getXpForNextLevel,
} from '../utils/storage';
import { ambientAudio } from '../utils/ambientAudio';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'xp' | 'level' | 'achievement' | 'quest' | 'info';
}

interface StudyContextType {
  subjects: Subject[];
  goals: AcademicGoal[];
  tasks: AcademicTask[];
  sessions: StudySession[];
  achievements: Achievement[];
  dailyQuests: DailyQuest[];
  gamification: UserGamificationState;
  darkMode: boolean;
  activeTab: string;
  companionModalOpen: boolean;
  toasts: NotificationToast[];
  dailyQuote: MotivationalQuote;
  dailyTips: DailyTip[];

  // Actions
  setActiveTab: (tab: string) => void;
  setCompanionModalOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  dismissToast: (id: string) => void;
  addToast: (toast: Omit<NotificationToast, 'id'>) => void;

  // Subjects & Lessons
  addSubject: (name: string, color: string, examDate?: string) => void;
  deleteSubject: (id: string) => void;
  addModuleToSubject: (subjectId: string, title: string) => void;
  addLessonToModule: (subjectId: string, moduleId: string, lessonTitle: string, difficulty: 'Easy' | 'Medium' | 'Hard', estimatedMinutes: number) => void;
  updateLessonStatus: (subjectId: string, moduleId: string, lessonId: string, status: LessonStatus) => void;
  updateLessonNotes: (subjectId: string, moduleId: string, lessonId: string, notes: string) => void;
  applyGeneratedSyllabus: (subjectId: string, modules: any[]) => void;

  // Goals
  addGoal: (goal: Omit<AcademicGoal, 'id' | 'completedHours' | 'isCompleted' | 'createdAt'>) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  addGoalMilestone: (goalId: string, title: string, targetDate: string) => void;
  deleteGoal: (goalId: string) => void;

  // Tasks
  addTask: (task: Omit<AcademicTask, 'id'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;

  // Active Quiz State & Launch
  activeQuizTopic: string | null;
  activeQuizSubject: string | null;
  activeQuizLessonId: string | null;
  launchQuiz: (topic: string, subjectName?: string, lessonId?: string) => void;
  completeQuiz: (score: number, total: number, topic: string, lessonId?: string, subjectId?: string) => void;

  // Study Sessions & Gamification
  logSession: (subjectId: string, lessonId: string | undefined, durationMinutes: number, focusRating: number, notes?: string) => void;
  addXp: (amount: number, reason: string) => void;
  changePersona: (persona: CompanionPersona) => void;
  refreshDailyInspiration: () => Promise<void>;
  resetToSampleData: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadFromStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS)
  );
  const [goals, setGoals] = useState<AcademicGoal[]>(() =>
    loadFromStorage(STORAGE_KEYS.GOALS, INITIAL_GOALS)
  );
  const [tasks, setTasks] = useState<AcademicTask[]>(() =>
    loadFromStorage(STORAGE_KEYS.TASKS, INITIAL_TASKS)
  );
  const [sessions, setSessions] = useState<StudySession[]>(() =>
    loadFromStorage(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS)
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    loadFromStorage(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS)
  );
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() =>
    loadFromStorage('studypulse_quests_v1', INITIAL_DAILY_QUESTS)
  );
  const [gamification, setGamification] = useState<UserGamificationState>(() =>
    loadFromStorage(STORAGE_KEYS.GAMIFICATION, INITIAL_GAMIFICATION)
  );

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [companionModalOpen, setCompanionModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // Active Quiz Target
  const [activeQuizTopic, setActiveQuizTopic] = useState<string | null>(null);
  const [activeQuizSubject, setActiveQuizSubject] = useState<string | null>(null);
  const [activeQuizLessonId, setActiveQuizLessonId] = useState<string | null>(null);

  const [dailyQuote, setDailyQuote] = useState<MotivationalQuote>({
    text: 'Continuous effort—not strength or intelligence—is the key to unlocking our potential.',
    author: 'Winston Churchill',
  });
  const [dailyTips, setDailyTips] = useState<DailyTip[]>([
    {
      subject: 'Data Structures & Algorithms',
      title: 'Dry-Run Invariants on Paper',
      description: 'Trace pointers and edge cases (empty tree, 1 node) manually before coding.',
    },
    {
      subject: 'Organic Chemistry',
      title: 'Mechanism Electron Flow',
      description: 'Always track curved arrows from high electron density (nucleophile) to low density (electrophile).',
    },
    {
      subject: 'Microeconomics',
      title: 'Marginal Rule Verification',
      description: 'Optimal choice is strictly where Marginal Benefit equals Marginal Cost.',
    },
  ]);

  // Sync to local storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
  }, [subjects]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GOALS, goals);
  }, [goals]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
  }, [sessions]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }, [achievements]);

  useEffect(() => {
    saveToStorage('studypulse_quests_v1', dailyQuests);
  }, [dailyQuests]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GAMIFICATION, gamification);
  }, [gamification]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [darkMode]);

  // Fetch daily tips & quote
  const refreshDailyInspiration = async () => {
    try {
      const res = await fetch('/api/tips/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: subjects.map((s) => s.name) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.quote) setDailyQuote(data.quote);
        if (data.tips && Array.isArray(data.tips)) setDailyTips(data.tips);
      }
    } catch (e) {
      console.warn('Could not fetch daily inspiration:', e);
    }
  };

  useEffect(() => {
    refreshDailyInspiration();
  }, []);

  const addToast = (toast: Omit<NotificationToast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const addXp = (amount: number, reason: string) => {
    setGamification((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let needed = getXpForNextLevel(newLevel);

      while (newXp >= needed) {
        newXp -= needed;
        newLevel += 1;
        needed = getXpForNextLevel(newLevel);
        addToast({
          title: 'LEVEL UP!',
          message: `Congratulations! You ascended to Level ${newLevel}!`,
          type: 'level',
        });
      }

      addToast({
        title: `+${amount} XP`,
        message: reason,
        type: 'xp',
      });

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  const changePersona = (persona: CompanionPersona) => {
    setGamification((prev) => ({ ...prev, selectedPersona: persona }));
    addToast({
      title: `Companion Changed`,
      message: `Your active Study Companion is now ${persona}.`,
      type: 'info',
    });
  };

  // Check achievements against current stats
  const evaluateAchievements = (
    currentSessions: StudySession[],
    currentStreak: number,
    currentSubjects: Subject[]
  ) => {
    const totalMinutes = currentSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const totalHours = totalMinutes / 60;
    const masteredLessonsCount = currentSubjects.reduce((acc, s) => {
      return (
        acc +
        s.modules.reduce((mAcc, m) => {
          return mAcc + m.lessons.filter((l) => l.status === 'mastered').length;
        }, 0)
      );
    }, 0);

    setAchievements((prev) =>
      prev.map((ach) => {
        let updatedProgress = ach.progress;
        let shouldUnlock = ach.unlocked;

        if (ach.id === 'ach-first-step') {
          updatedProgress = currentSessions.length > 0 ? 1 : 0;
          if (updatedProgress >= 1 && !ach.unlocked) shouldUnlock = true;
        } else if (ach.id === 'ach-streak-3') {
          updatedProgress = Math.min(3, currentStreak);
          if (updatedProgress >= 3 && !ach.unlocked) shouldUnlock = true;
        } else if (ach.id === 'ach-streak-7') {
          updatedProgress = Math.min(7, currentStreak);
          if (updatedProgress >= 7 && !ach.unlocked) shouldUnlock = true;
        } else if (ach.id === 'ach-pomodoro-10') {
          updatedProgress = Math.min(10, currentSessions.length);
          if (updatedProgress >= 10 && !ach.unlocked) shouldUnlock = true;
        } else if (ach.id === 'ach-master-5') {
          updatedProgress = Math.min(5, masteredLessonsCount);
          if (updatedProgress >= 5 && !ach.unlocked) shouldUnlock = true;
        } else if (ach.id === 'ach-hours-25') {
          updatedProgress = Math.min(25, Number(totalHours.toFixed(1)));
          if (updatedProgress >= 25 && !ach.unlocked) shouldUnlock = true;
        }

        if (shouldUnlock && !ach.unlocked) {
          addToast({
            title: 'Badge Unlocked!',
            message: `You earned the "${ach.title}" achievement!`,
            type: 'achievement',
          });
          return {
            ...ach,
            progress: updatedProgress,
            unlocked: true,
            unlockedAt: new Date().toISOString().split('T')[0],
          };
        }

        return { ...ach, progress: updatedProgress };
      })
    );
  };

  // SUBJECT ACTIONS
  const addSubject = (name: string, color: string, examDate?: string) => {
    const newSubject: Subject = {
      id: `subj-${Date.now()}`,
      name,
      color,
      targetExamDate: examDate,
      modules: [
        {
          id: `mod-${Date.now()}-1`,
          title: 'Unit 1: Overview & Fundamentals',
          lessons: [],
        },
      ],
    };
    setSubjects((prev) => [...prev, newSubject]);
    addXp(40, `Created new syllabus track: ${name}`);
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    addToast({ title: 'Subject Removed', message: 'Syllabus track was removed.', type: 'info' });
  };

  const addModuleToSubject = (subjectId: string, title: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          modules: [
            ...s.modules,
            {
              id: `mod-${Date.now()}`,
              title,
              lessons: [],
            },
          ],
        };
      })
    );
  };

  const addLessonToModule = (
    subjectId: string,
    moduleId: string,
    lessonTitle: string,
    difficulty: 'Easy' | 'Medium' | 'Hard',
    estimatedMinutes: number
  ) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          modules: s.modules.map((m) => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              lessons: [
                ...m.lessons,
                {
                  id: `les-${Date.now()}`,
                  title: lessonTitle,
                  status: 'not_started',
                  difficulty,
                  estimatedMinutes,
                  revisionCount: 0,
                },
              ],
            };
          }),
        };
      })
    );
    addXp(20, `Added syllabus lesson: ${lessonTitle}`);
  };

  const updateLessonStatus = (
    subjectId: string,
    moduleId: string,
    lessonId: string,
    status: LessonStatus
  ) => {
    let gainedMastery = false;
    setSubjects((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          modules: s.modules.map((m) => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              lessons: m.lessons.map((l) => {
                if (l.id !== lessonId) return l;
                if (status === 'mastered' && l.status !== 'mastered') {
                  gainedMastery = true;
                }
                return {
                  ...l,
                  status,
                  lastStudiedDate: new Date().toISOString().split('T')[0],
                  revisionCount: status === 'mastered' ? l.revisionCount + 1 : l.revisionCount,
                };
              }),
            };
          }),
        };
      });
      evaluateAchievements(sessions, gamification.streakDays, updated);
      return updated;
    });

    if (gainedMastery) {
      addXp(80, 'Mastered syllabus lesson!');
      // Update daily quests
      setDailyQuests((prev) =>
        prev.map((q) => {
          if (q.type === 'lesson_master' && !q.isCompleted) {
            const nextCount = q.currentCount + 1;
            const completed = nextCount >= q.targetCount;
            if (completed) {
              addToast({
                title: 'Daily Quest Completed!',
                message: `"${q.title}" finished (+${q.xpReward} XP)`,
                type: 'quest',
              });
              addXp(q.xpReward, `Completed daily quest: ${q.title}`);
            }
            return { ...q, currentCount: nextCount, isCompleted: completed };
          }
          return q;
        })
      );
    }
  };

  const updateLessonNotes = (
    subjectId: string,
    moduleId: string,
    lessonId: string,
    notes: string
  ) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          modules: s.modules.map((m) => {
            if (m.id !== moduleId) return m;
            return {
              ...m,
              lessons: m.lessons.map((l) => {
                if (l.id !== lessonId) return l;
                return { ...l, notes };
              }),
            };
          }),
        };
      })
    );
  };

  const applyGeneratedSyllabus = (subjectId: string, generatedModules: any[]) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const newModules = generatedModules.map((gm: any, idx: number) => ({
          id: `mod-gen-${Date.now()}-${idx}`,
          title: gm.title || `Unit ${idx + 1}`,
          lessons: (gm.topics || []).map((t: string, tIdx: number) => ({
            id: `les-gen-${Date.now()}-${idx}-${tIdx}`,
            title: t,
            status: 'not_started' as LessonStatus,
            difficulty: gm.difficulty || 'Medium',
            estimatedMinutes: Math.round(((gm.estimatedHours || 3) * 60) / (gm.topics?.length || 1)),
            revisionCount: 0,
          })),
        }));
        return {
          ...s,
          modules: [...s.modules, ...newModules],
        };
      })
    );
    addXp(60, 'Generated structured AI syllabus track');
  };

  // GOALS ACTIONS
  const addGoal = (
    newGoalData: Omit<AcademicGoal, 'id' | 'completedHours' | 'isCompleted' | 'createdAt'>
  ) => {
    const newGoal: AcademicGoal = {
      ...newGoalData,
      id: `goal-${Date.now()}`,
      completedHours: 0,
      isCompleted: false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGoals((prev) => [newGoal, ...prev]);
    addXp(50, `Assigned new academic goal: ${newGoal.title}`);
  };

  const toggleGoalMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedMilestones = g.milestones.map((m) => {
          if (m.id !== milestoneId) return m;
          const nextState = !m.completed;
          if (nextState) {
            addXp(40, `Achieved milestone: ${m.title}`);
          }
          return { ...m, completed: nextState };
        });
        const allDone = updatedMilestones.length > 0 && updatedMilestones.every((m) => m.completed);
        if (allDone && !g.isCompleted) {
          addToast({
            title: 'Goal Completed!',
            message: `Outstanding! You achieved "${g.title}"! (+150 XP)`,
            type: 'achievement',
          });
          addXp(150, `Completed goal: ${g.title}`);
        }
        return {
          ...g,
          milestones: updatedMilestones,
          isCompleted: allDone,
        };
      })
    );
  };

  const addGoalMilestone = (goalId: string, title: string, targetDate: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        return {
          ...g,
          milestones: [
            ...g.milestones,
            { id: `m-${Date.now()}`, title, targetDate, completed: false },
          ],
        };
      })
    );
    addXp(15, 'Added goal milestone');
  };

  const deleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  // TASK ACTIONS
  const addTask = (taskData: Omit<AcademicTask, 'id'>) => {
    const newTask: AcademicTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
    addXp(20, `Added planner action: ${newTask.title}`);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    let wasCompleted = false;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        if (status === 'completed' && t.status !== 'completed') {
          wasCompleted = true;
        }
        return { ...t, status };
      })
    );

    if (wasCompleted) {
      addXp(40, 'Completed action plan task');
      // Update daily quests
      setDailyQuests((prev) =>
        prev.map((q) => {
          if (q.type === 'task_finish' && !q.isCompleted) {
            const nextCount = q.currentCount + 1;
            const completed = nextCount >= q.targetCount;
            if (completed) {
              addToast({
                title: 'Daily Quest Completed!',
                message: `"${q.title}" finished (+${q.xpReward} XP)`,
                type: 'quest',
              });
              addXp(q.xpReward, `Completed daily quest: ${q.title}`);
            }
            return { ...q, currentCount: nextCount, isCompleted: completed };
          }
          return q;
        })
      );
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // LOG FOCUS STUDY SESSION
  const logSession = (
    subjectId: string,
    lessonId: string | undefined,
    durationMinutes: number,
    focusRating: number,
    notes?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const earnedXp = Math.round(durationMinutes * 2 * (1 + (focusRating - 3) * 0.15));

    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      subjectId,
      lessonId,
      durationMinutes,
      date: today,
      timestamp: Date.now(),
      focusRating,
      notes,
      xpEarned: earnedXp,
    };

    const nextSessions = [newSession, ...sessions];
    setSessions(nextSessions);

    // Play chime sound
    ambientAudio.playChime();

    // Update goals completed hours for this subject
    setGoals((prev) =>
      prev.map((g) => {
        if (g.subjectId === subjectId) {
          const hoursAdded = durationMinutes / 60;
          return {
            ...g,
            completedHours: Number((g.completedHours + hoursAdded).toFixed(1)),
          };
        }
        return g;
      })
    );

    // Update streak
    setGamification((prev) => {
      let streak = prev.streakDays;
      if (prev.lastActiveDate !== today) {
        // Simple day delta check
        streak += 1;
      }
      return {
        ...prev,
        streakDays: streak,
        lastActiveDate: today,
        totalStudyMinutes: prev.totalStudyMinutes + durationMinutes,
      };
    });

    // Update Pomodoro Daily Quests
    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.type === 'pomodoro' && !q.isCompleted) {
          const nextCount = q.currentCount + 1;
          const completed = nextCount >= q.targetCount;
          if (completed) {
            addToast({
              title: 'Daily Quest Completed!',
              message: `"${q.title}" finished (+${q.xpReward} XP)`,
              type: 'quest',
            });
            addXp(q.xpReward, `Completed daily quest: ${q.title}`);
          }
          return { ...q, currentCount: nextCount, isCompleted: completed };
        }
        return q;
      })
    );

    addXp(earnedXp, `Completed ${durationMinutes}m focus session!`);
    evaluateAchievements(nextSessions, gamification.streakDays, subjects);
  };

  const launchQuiz = (topic: string, subjectName?: string, lessonId?: string) => {
    setActiveQuizTopic(topic);
    setActiveQuizSubject(subjectName || null);
    setActiveQuizLessonId(lessonId || null);
    setActiveTab('quiz');
  };

  const completeQuiz = (
    score: number,
    total: number,
    topic: string,
    lessonId?: string,
    subjectId?: string
  ) => {
    const xpPerCorrect = 30;
    const bonusPerfect = score === total ? 50 : 0;
    const earnedXp = score * xpPerCorrect + bonusPerfect;

    if (earnedXp > 0) {
      addXp(earnedXp, `Completed active recall quiz on "${topic}" (${score}/${total})`);
    }

    ambientAudio.playChime();

    // If score >= 80% and lessonId is present, auto-upgrade to mastered
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    if (percent >= 80 && lessonId && subjectId) {
      const subj = subjects.find((s) => s.id === subjectId);
      const mod = subj?.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
      if (subj && mod) {
        updateLessonStatus(subj.id, mod.id, lessonId, 'mastered');
        addToast({
          title: 'Lesson Mastered!',
          message: `Scored ${percent}%! Automatically upgraded "${topic}" to Mastered in your syllabus.`,
          type: 'achievement',
        });
      }
    }
  };

  const resetToSampleData = () => {
    setSubjects(INITIAL_SUBJECTS);
    setGoals(INITIAL_GOALS);
    setTasks(INITIAL_TASKS);
    setSessions(INITIAL_SESSIONS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setDailyQuests(INITIAL_DAILY_QUESTS);
    setGamification(INITIAL_GAMIFICATION);
    addToast({
      title: 'Reset Completed',
      message: 'Demo curriculum, syllabus, and study records reloaded.',
      type: 'info',
    });
  };

  return (
    <StudyContext.Provider
      value={{
        subjects,
        goals,
        tasks,
        sessions,
        achievements,
        dailyQuests,
        gamification,
        darkMode,
        activeTab,
        companionModalOpen,
        toasts,
        dailyQuote,
        dailyTips,
        activeQuizTopic,
        activeQuizSubject,
        activeQuizLessonId,
        launchQuiz,
        completeQuiz,
        setActiveTab,
        setCompanionModalOpen,
        toggleDarkMode,
        dismissToast,
        addToast,
        addSubject,
        deleteSubject,
        addModuleToSubject,
        addLessonToModule,
        updateLessonStatus,
        updateLessonNotes,
        applyGeneratedSyllabus,
        addGoal,
        toggleGoalMilestone,
        addGoalMilestone,
        deleteGoal,
        addTask,
        updateTaskStatus,
        deleteTask,
        logSession,
        addXp,
        changePersona,
        refreshDailyInspiration,
        resetToSampleData,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
