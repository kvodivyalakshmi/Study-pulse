import React from 'react';
import { useStudy } from '../context/StudyContext';
import { getXpForNextLevel, getLevelTitle } from '../utils/storage';
import {
  Award,
  Zap,
  Flame,
  Sparkles,
  Trophy,
  CheckCircle2,
  Clock,
  BookOpen,
  Bot,
  Lightbulb,
  Shield,
  Star,
} from 'lucide-react';

export const RewardsView: React.FC = () => {
  const { gamification, achievements, dailyQuests, dailyTips, dailyQuote, setCompanionModalOpen } =
    useStudy();

  const xpNeeded = getXpForNextLevel(gamification.level);
  const xpPercent = Math.min(100, Math.round((gamification.xp / xpNeeded) * 100));
  const currentTitle = getLevelTitle(gamification.level);
  const nextTitle = getLevelTitle(gamification.level + 1);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-sky-500" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'Bot':
        return <Bot className="w-5 h-5 text-purple-500" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      default:
        return <Award className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          Gamified Rewards & Achievements
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Ascend scholar ranks, unlock academic badges, and claim XP through consistent daily focus.
        </p>
      </div>

      {/* Main Scholar Level Progression Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white border border-indigo-700/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <span>Scholar Progression Rank</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-extrabold tracking-tight">
                Level {gamification.level}: {currentTitle}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-md">
              Earn XP by completing Pomodoros, mastering syllabus topics, and achieving action plan milestones.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="text-xs text-indigo-200">Total XP Banked</div>
              <div className="text-xl font-bold font-mono">
                {gamification.xp + (gamification.level - 1) * 300} XP
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-indigo-800/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-indigo-200">
              Current: {gamification.xp} / {xpNeeded} XP
            </span>
            <span className="font-semibold text-white">
              Next Rank: Level {gamification.level + 1} ({nextTitle})
            </span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-indigo-500/20">
            <div
              className="bg-gradient-to-r from-indigo-400 to-amber-300 h-2 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Daily Quests Summary */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Active Daily Quests</span>
          </h3>
          <span className="text-xs text-slate-500">
            {dailyQuests.filter((q) => q.isCompleted).length} of {dailyQuests.length} Finished
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {dailyQuests.map((quest) => (
            <div
              key={quest.id}
              className={`p-4 rounded-2xl border transition-all ${
                quest.isCompleted
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                  +{quest.xpReward} XP
                </span>
                {quest.isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                {quest.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {quest.description}
              </p>
              <div className="mt-3 text-[10px] text-slate-400 font-medium">
                Progress: {quest.currentCount} / {quest.targetCount}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievement Badges Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-500" />
            <span>Achievement Badges ({unlockedCount}/{achievements.length} Unlocked)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Permanent Record</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((ach) => {
            const progressPercent = Math.min(
              100,
              Math.round((ach.progress / ach.maxProgress) * 100)
            );

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  ach.unlocked
                    ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/50 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 opacity-65'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        ach.unlocked
                          ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {getBadgeIcon(ach.icon)}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        ach.badgeLevel === 'Gold'
                          ? 'text-amber-500'
                          : ach.badgeLevel === 'Silver'
                          ? 'text-slate-400'
                          : 'text-amber-700 dark:text-amber-600'
                      }`}
                    >
                      {ach.badgeLevel}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {ach.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  {ach.unlocked ? (
                    <div className="flex items-center justify-between text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Unlocked</span>
                      <span>{ach.unlockedAt || 'Recently'}</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>
                          {ach.progress} / {ach.maxProgress}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tailored Study Strategy Library */}
      <section className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Subject Study Playbook
            </h3>
          </div>
          <button
            onClick={() => setCompanionModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Ask AI Companion for Deep Strategy
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              The Feynman Technique
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Identify a concept, write down an explanation in plain words as if teaching a 10-year-old. When you encounter jargon or gaps, return to the source notes to pinpoint the conceptual blind spot.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Spaced Active Retrieval
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Never re-read passively. Close the book and write down key theorems, reaction mechanisms, or formulas from memory. Space reviews at 1 day, 3 days, and 7 days.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
              Interleaved Problem Sets
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Mix different question types within the same practice session rather than doing 20 identical problems in a row. It trains cognitive discrimination on exam day.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
