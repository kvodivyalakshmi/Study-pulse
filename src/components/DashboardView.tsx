import React from 'react';
import { useStudy } from '../context/StudyContext';
import {
  Flame,
  Zap,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  Award,
  Calendar,
  Play,
  RotateCw,
  Brain,
} from 'lucide-react';
import { getLevelTitle } from '../utils/storage';

export const DashboardView: React.FC = () => {
  const {
    subjects,
    goals,
    tasks,
    sessions,
    gamification,
    dailyQuests,
    dailyQuote,
    dailyTips,
    setActiveTab,
    updateTaskStatus,
    setCompanionModalOpen,
    refreshDailyInspiration,
  } = useStudy();

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.date === today);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayHours = (todayMinutes / 60).toFixed(1);

  // Calculate overall syllabus mastery
  let totalLessons = 0;
  let masteredLessons = 0;
  subjects.forEach((s) => {
    s.modules.forEach((m) => {
      m.lessons.forEach((l) => {
        totalLessons += 1;
        if (l.status === 'mastered') masteredLessons += 1;
      });
    });
  });
  const syllabusMasteryPercent =
    totalLessons > 0 ? Math.round((masteredLessons / totalLessons) * 100) : 0;

  // Active goals count
  const activeGoals = goals.filter((g) => !g.isCompleted);
  // High-priority and today's tasks
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 4);

  // Mock weekly day breakdown for visual report
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayMinutes = [45, 60, 30, 75, 45, 90, todayMinutes || 40];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Welcome & Motivational Quote */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-indigo-700/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              <span>·</span>
              <span>Daily Study Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to learn, {getLevelTitle(gamification.level)}?
            </h1>
            <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed italic">
              "{dailyQuote.text}"
            </p>
            <div className="text-xs text-indigo-300 font-medium">
              — {dailyQuote.author}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 font-semibold text-xs sm:text-sm hover:bg-indigo-50 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-indigo-950" />
              <span>Start Focus Session</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-600 text-white font-medium text-xs sm:text-sm border border-indigo-500/40 transition-colors cursor-pointer"
            >
              <Brain className="w-4 h-4 text-sky-300" />
              <span>Active Quiz & Q&A</span>
            </button>
            <button
              onClick={() => setCompanionModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm border border-indigo-500/40 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask Study Buddy</span>
            </button>
          </div>
        </div>

        {/* Subtle background cover photo & ambient decoration */}
        <img
          src="/src/assets/images/studypulse_bot_banner_1792993900322.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay pointer-events-none"
        />
        <div className="absolute -right-8 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Daily Progress Report Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Today's Focus Time */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Focus Time Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {todayMinutes}m
            </span>
            <span className="text-xs text-slate-500">
              ({todayHours} hrs)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>{todaySessions.length} session{todaySessions.length === 1 ? '' : 's'} logged</span>
          </div>
        </div>

        {/* Metric 2: Syllabus Mastery */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Syllabus Mastery
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {syllabusMasteryPercent}%
            </span>
            <span className="text-xs text-slate-500">
              {masteredLessons} / {totalLessons} topics
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${syllabusMasteryPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Active Goals */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Goals
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {activeGoals.length}
            </span>
            <span className="text-xs text-slate-500">
              in progress
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span>{goals.length - activeGoals.length} completed</span>
          </div>
        </div>

        {/* Metric 4: Study Streak */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Focus Streak
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-rose-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {gamification.streakDays}
            </span>
            <span className="text-xs text-slate-500">days running</span>
          </div>
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
            Next milestone: 7 Days (+100 XP)
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Velocity & Daily Study Quests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Velocity Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Weekly Study Velocity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Daily distribution of focused study minutes
                </p>
              </div>
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>+18% vs last week</span>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-40 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
              {daysOfWeek.map((day, idx) => {
                const mins = dayMinutes[idx];
                const heightPercent = Math.min(100, Math.max(15, (mins / 90) * 100));
                const isCurrent = idx === 6;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-mono">
                      {mins}m
                    </div>
                    <div className="w-full max-w-[28px] bg-slate-100 dark:bg-slate-800 rounded-t-md h-28 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isCurrent
                            ? 'bg-gradient-to-t from-indigo-600 to-sky-400'
                            : 'bg-indigo-300 dark:bg-indigo-900/60 group-hover:bg-indigo-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>Weekly Target: 10 Hours</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              6.5 / 10 Hours Completed
            </span>
          </div>
        </div>

        {/* Daily Study Quests (Gamification) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" /> Daily Quests
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Complete challenges to earn XP
                </p>
              </div>
              <button
                onClick={() => setActiveTab('rewards')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View Badges
              </button>
            </div>

            <div className="space-y-3">
              {dailyQuests.map((quest) => (
                <div
                  key={quest.id}
                  className={`p-3 rounded-xl border transition-all ${
                    quest.isCompleted
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        {quest.isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className={quest.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                          {quest.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {quest.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                      +{quest.xpReward} XP
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      Progress: {quest.currentCount} / {quest.targetCount}
                    </span>
                    {quest.isCompleted && (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Completed!
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500">
              Quests reset nightly at midnight
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Action Planner (Today's Tasks) & Tailored Study Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Priority Action Plan */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                Action Planner (Priority Tasks)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check off items to achieve your goal milestones
              </p>
            </div>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                All clear! No pending tasks right now.
              </div>
            ) : (
              pendingTasks.map((task) => {
                const subject = subjects.find((s) => s.id === task.subjectId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-400 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
                        title="Mark as completed"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {subject && (
                            <>
                              <span className="font-medium text-slate-500 dark:text-slate-400">
                                {subject.name}
                              </span>
                              <span>·</span>
                            </>
                          )}
                          <span>{task.estimatedMinutes}m</span>
                          <span>·</span>
                          <span
                            className={
                              task.priority === 'high'
                                ? 'text-rose-500 font-semibold'
                                : task.priority === 'medium'
                                ? 'text-amber-500 font-medium'
                                : 'text-slate-400'
                            }
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('timer')}
                      className="shrink-0 p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                      title="Focus on this task"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tailored Subject Study Tips */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Tailored Subject Study Tips
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customized cognitive strategies for your active syllabus
                </p>
              </div>
              <button
                onClick={refreshDailyInspiration}
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Refresh tips"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {dailyTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>{tip.subject}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Active Recall</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {tip.title}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need specific topic guidance?</span>
            <button
              onClick={() => setCompanionModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Consult Study Buddy →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
