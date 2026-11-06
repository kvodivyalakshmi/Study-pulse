import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { getXpForNextLevel, getLevelTitle } from '../utils/storage';
import {
  Flame,
  Zap,
  Clock,
  Sparkles,
  Moon,
  Sun,
  BookOpen,
  Target,
  Calendar,
  Award,
  LayoutDashboard,
  Menu,
  X,
  Bot,
  RotateCcw,
  Brain,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    gamification,
    darkMode,
    toggleDarkMode,
    setCompanionModalOpen,
    resetToSampleData,
  } = useStudy();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const xpNeeded = getXpForNextLevel(gamification.level);
  const xpPercent = Math.min(100, Math.round((gamification.xp / xpNeeded) * 100));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'syllabus', label: 'Syllabus & Lessons', icon: BookOpen },
    { id: 'quiz', label: 'Quiz & Q&A', icon: Brain },
    { id: 'goals', label: 'Goals & Planner', icon: Target },
    { id: 'schedule', label: 'AI Schedule', icon: Calendar },
    { id: 'timer', label: 'Focus Timer', icon: Clock },
    { id: 'rewards', label: 'Rewards & Badges', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform border border-indigo-400/30">
                <img
                  src="/src/assets/images/studypulse_bot_logo_1792993919278.jpg"
                  alt="StudyPulse Bot"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  StudyPulse
                </span>
                <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Study Buddy & Guide
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Status Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              title={`${gamification.streakDays} Day Study Streak`}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40"
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span>{gamification.streakDays}d Streak</span>
            </div>

            {/* Level & XP Mini Bar */}
            <div
              onClick={() => setActiveTab('rewards')}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indigo-400 transition-colors"
              title={`${gamification.xp} / ${xpNeeded} XP to Level ${gamification.level + 1}`}
            >
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
                <span>Lvl {gamification.level}</span>
              </div>
              <div className="w-16 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                {xpPercent}%
              </span>
            </div>

            {/* Launch Study Companion Mentor */}
            <button
              onClick={() => setCompanionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 text-white hover:from-indigo-500 hover:to-sky-400 shadow-sm transition-all active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Ask {gamification.selectedPersona}</span>
              <span className="sm:hidden">AI</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Sample data reset helper */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Reset Sample Curriculum & Records"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 text-xs text-slate-500">
              <span>{getLevelTitle(gamification.level)}</span>
              <span>
                {gamification.xp} / {xpNeeded} XP
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation modal for sample data reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Demo Curriculum?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              This will restore sample syllabus tracks, demo goals, and completed sessions for testing.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToSampleData();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
