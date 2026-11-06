import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStudy } from '../context/StudyContext';
import { Award, Zap, Sparkles, CheckCircle2, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStudy();

  const getIcon = (type: string) => {
    switch (type) {
      case 'level':
        return <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-indigo-400" />;
      case 'xp':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'quest':
        return <CheckCircle2 className="w-5 h-5 text-sky-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'level':
        return 'border-amber-500/40 bg-amber-500/10';
      case 'achievement':
        return 'border-indigo-500/40 bg-indigo-500/10';
      case 'xp':
        return 'border-emerald-500/40 bg-emerald-500/10';
      case 'quest':
        return 'border-sky-500/40 bg-sky-500/10';
      default:
        return 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-lg ${getBorderColor(
              toast.type
            )}`}
          >
            <div className="mt-0.5 shrink-0">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {toast.title}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
