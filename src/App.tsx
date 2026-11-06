import React from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar } from './components/Navbar';
import { ToastContainer } from './components/ToastContainer';
import { CompanionModal } from './components/CompanionModal';
import { DashboardView } from './components/DashboardView';
import { SyllabusView } from './components/SyllabusView';
import { GoalsPlannerView } from './components/GoalsPlannerView';
import { ScheduleView } from './components/ScheduleView';
import { FocusTimerView } from './components/FocusTimerView';
import { RewardsView } from './components/RewardsView';
import { QuizView } from './components/QuizView';
import { Bot, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setCompanionModalOpen, gamification } = useStudy();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'syllabus':
        return <SyllabusView />;
      case 'quiz':
        return <QuizView />;
      case 'goals':
        return <GoalsPlannerView />;
      case 'schedule':
        return <ScheduleView />;
      case 'timer':
        return <FocusTimerView />;
      case 'rewards':
        return <RewardsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderActiveView()}
      </main>

      {/* Floating Companion Quick Action Button */}
      <button
        onClick={() => setCompanionModalOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 text-white shadow-xl hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
        aria-label="Open study companion"
      >
        <div className="relative">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold leading-tight flex items-center gap-1">
            Study Buddy <Sparkles className="w-3 h-3 text-amber-300" />
          </span>
          <span className="text-[10px] text-indigo-100 font-medium">
            Ask {gamification.selectedPersona}
          </span>
        </div>
      </button>

      {/* Global Modals and Notifications */}
      <CompanionModal />
      <ToastContainer />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">StudyPulse</span>
            <span>·</span>
            <span>AI Academic Companion & Syllabus Tracker</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Active Recall</span>
            <span>·</span>
            <span>Spaced Repetition</span>
            <span>·</span>
            <span>Pomodoro Flow</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}
