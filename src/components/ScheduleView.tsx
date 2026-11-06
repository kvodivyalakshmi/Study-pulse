import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { RecommendedBlock } from '../types';
import {
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  Brain,
  Lightbulb,
  ArrowRight,
  Zap,
  Sliders,
  Plus,
} from 'lucide-react';

export const ScheduleView: React.FC = () => {
  const { subjects, goals, addTask, setActiveTab, addToast } = useStudy();

  const [availableHours, setAvailableHours] = useState<number>(3);
  const [preferredTime, setPreferredTime] = useState<string>('Morning');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [recommendedBlocks, setRecommendedBlocks] = useState<RecommendedBlock[]>([
    {
      timeBlock: '09:00 - 10:15 (75m)',
      subject: subjects[0]?.name || 'Primary Subject',
      activity: 'Deep Focus: Non-Linear Structures & Tree Traversals',
      technique: 'Pomodoro (3x 25m Focus + 5m Breaks)',
      rationale:
        'Cognitive energy is highest in your selected morning block. Tackling high-difficulty topics first prevents mental fatigue.',
    },
    {
      timeBlock: '10:30 - 11:15 (45m)',
      subject: subjects[1]?.name || subjects[0]?.name || 'Secondary Subject',
      activity: 'Active Recall & Stereochemistry Practice Problem Set',
      technique: 'Self-Testing / Feynman Explanation',
      rationale:
        'Switching to a different domain (interleaving) primes long-term recall and strengthens cross-topic neural retrieval.',
    },
    {
      timeBlock: '11:20 - 11:45 (25m)',
      subject: 'Review & Microeconomics',
      activity: 'Flashcard Drills & Milestone Invariant Check',
      technique: 'Spaced Retrieval Practice',
      rationale:
        'A quick closing retrieval block locks in newly consolidated concepts before daily cognitive load peaks.',
    },
  ]);

  const [strategyAdvice, setStrategyAdvice] = useState<string>(
    'Prioritize hard analytical concepts early, interleave subjects, and enforce strict 5-minute screen-free breaks between study blocks.'
  );

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/schedule/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjects.map((s) => ({
            name: s.name,
            examDate: s.targetExamDate,
            masteredCount: s.modules.reduce(
              (acc, m) => acc + m.lessons.filter((l) => l.status === 'mastered').length,
              0
            ),
          })),
          availableHoursDaily: availableHours,
          targetGoals: goals.filter((g) => !g.isCompleted).map((g) => g.title),
          preferredTimeOfDay: preferredTime,
        }),
      });

      const data = await res.json();
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendedBlocks(data.recommendations);
        if (data.strategyAdvice) setStrategyAdvice(data.strategyAdvice);
        addToast({
          title: 'Schedule Generated!',
          message: `Personalized study timetable generated for ${availableHours} hours.`,
          type: 'quest',
        });
      }
    } catch (e) {
      console.error(e);
      addToast({
        title: 'Notice',
        message: 'Loaded balanced study timetable.',
        type: 'info',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyToPlanner = () => {
    const today = new Date().toISOString().split('T')[0];
    recommendedBlocks.forEach((block) => {
      // Find matching subject if possible
      const matchedSubj = subjects.find(
        (s) => s.name.toLowerCase().includes(block.subject.toLowerCase()) || block.subject.toLowerCase().includes(s.name.toLowerCase())
      );

      addTask({
        title: `[Schedule] ${block.activity}`,
        subjectId: matchedSubj?.id,
        dueDate: today,
        estimatedMinutes: 45,
        priority: 'high',
        status: 'todo',
        notes: `Technique: ${block.technique}. ${block.rationale}`,
      });
    });

    addToast({
      title: 'Added to Planner!',
      message: `${recommendedBlocks.length} schedule blocks added to your Action Planner.`,
      type: 'achievement',
    });
    setActiveTab('goals');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            Personalized Study Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Intelligent timetable recommendations balancing exam deadlines, syllabus difficulty, and peak energy windows.
          </p>
        </div>

        <button
          onClick={handleApplyToPlanner}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Apply to Action Planner</span>
        </button>
      </div>

      {/* Configuration Control Panel */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-indigo-500" />
          <span>Schedule Preferences & Time Budget</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Available Hours */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Daily Study Hours Budget: <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{availableHours} hrs</span>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={availableHours}
              onChange={(e) => setAvailableHours(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 hr</span>
              <span>3 hrs</span>
              <span>5 hrs</span>
              <span>8 hrs</span>
            </div>
          </div>

          {/* Peak Energy Time */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Peak Focus Window
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Morning">Morning Focus (08:00 - 12:00)</option>
              <option value="Afternoon">Afternoon Flow (13:00 - 17:00)</option>
              <option value="Evening">Evening Sprint (18:00 - 22:00)</option>
              <option value="Night Owl">Night Owl (22:00 - 02:00)</option>
            </select>
          </div>

          {/* Generate Button */}
          <div className="flex items-end">
            <button
              onClick={handleGenerateSchedule}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white shadow-xs transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Calculating Optimal Timetable...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Recommended Schedule</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Strategy Advice Banner */}
      {strategyAdvice && (
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 flex items-start gap-3">
          <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            <span className="font-bold">Study Companion Strategy Advice: </span>
            {strategyAdvice}
          </div>
        </div>
      )}

      {/* Recommended Schedule Timeline Cards */}
      <div className="space-y-3.5">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Today's Recommended Study Blocks ({recommendedBlocks.length})
        </h3>

        <div className="space-y-3">
          {recommendedBlocks.map((block, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-400 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  0{idx + 1}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {block.timeBlock}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {block.subject}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {block.activity}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      Technique: {block.technique}
                    </span>
                    <span>·</span>
                    <span className="italic">{block.rationale}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('timer')}
                className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Start Block</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
