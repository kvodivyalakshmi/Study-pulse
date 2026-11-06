import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { ambientAudio } from '../utils/ambientAudio';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Star,
  Zap,
} from 'lucide-react';

type TimerMode = 'focus' | 'short_break' | 'long_break';

export const FocusTimerView: React.FC = () => {
  const { subjects, logSession, addToast } = useStudy();

  const [mode, setMode] = useState<TimerMode>('focus');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Subject & Lesson binding
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  // Ambient sound controls
  const [ambientType, setAmbientType] = useState<string>('none');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.35);

  // Completion modal
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [focusRating, setFocusRating] = useState<number>(5);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const allLessons = currentSubject?.modules.flatMap((m) => m.lessons) || [];

  // Timer interval effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      ambientAudio.stop();
      ambientAudio.playChime();

      if (mode === 'focus') {
        setShowCompletionModal(true);
      } else {
        addToast({
          title: 'Break Finished!',
          message: 'Ready to dive back into your next focus block?',
          type: 'info',
        });
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft, mode]);

  // Mode switcher
  const handleModeChange = (newMode: TimerMode, defaultMins: number) => {
    setIsRunning(false);
    setMode(newMode);
    setDurationMinutes(defaultMins);
    setSecondsLeft(defaultMins * 60);
  };

  const handleStartPause = () => {
    if (!isRunning) {
      if (ambientType !== 'none') {
        ambientAudio.play(ambientType as any, ambientVolume);
      }
      setIsRunning(true);
    } else {
      ambientAudio.stop();
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    ambientAudio.stop();
    setSecondsLeft(durationMinutes * 60);
  };

  const handleAmbientChange = (type: string) => {
    setAmbientType(type);
    if (isRunning) {
      if (type === 'none') {
        ambientAudio.stop();
      } else {
        ambientAudio.play(type as any, ambientVolume);
      }
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    ambientAudio.setVolume(vol);
  };

  const handleFinishLogSession = () => {
    if (!selectedSubjectId) return;

    logSession(
      selectedSubjectId,
      selectedLessonId || undefined,
      durationMinutes,
      focusRating,
      sessionNotes
    );

    setShowCompletionModal(false);
    setSessionNotes('');
    handleReset();
  };

  // Minutes and seconds formatting
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const totalSeconds = durationMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-indigo-500" />
          Pomodoro Focus Timer
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Single-task focus sessions linked directly to your active syllabus lessons.
        </p>
      </div>

      {/* Main Timer Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md text-center space-y-6 relative overflow-hidden">
        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => handleModeChange('focus', 25)}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              mode === 'focus'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => handleModeChange('focus', 50)}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              mode === 'focus' && durationMinutes === 50
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            50m Deep Work
          </button>
          <button
            onClick={() => handleModeChange('short_break', 5)}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              mode === 'short_break'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            5m Break
          </button>
          <button
            onClick={() => handleModeChange('long_break', 15)}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              mode === 'long_break'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            15m Long Break
          </button>
        </div>

        {/* Big Circular Clock Display */}
        <div className="py-4">
          <div className="text-6xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono select-none">
            {timeFormatted}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">
            {isRunning ? 'Flow state active · Stay with this problem' : 'Ready to start when you are'}
          </div>

          {/* Progress Line */}
          <div className="w-64 max-w-full mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                mode === 'focus'
                  ? 'bg-gradient-to-r from-indigo-500 to-sky-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleStartPause}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Session</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Linked Subject & Lesson Selector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Active Study Topic Selection</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedLessonId('');
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Specific Syllabus Lesson (Optional)
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">-- General Subject Study --</option>
              {allLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title} ({l.difficulty})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ambient Audio Player */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <span>Procedural Focus Sound Generator</span>
          </div>
          <span className="text-[11px] text-slate-400">Offline Web Audio</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'none', label: 'Off' },
            { id: 'rain', label: '🌧️ Soft Rain' },
            { id: 'binaural', label: '🎧 10Hz Alpha Waves' },
            { id: 'brown_noise', label: '☕ Warm Masking' },
            { id: 'waves', label: '🌊 Ocean Swell' },
          ].map((snd) => (
            <button
              key={snd.id}
              onClick={() => handleAmbientChange(snd.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                ambientType === snd.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {snd.label}
            </button>
          ))}
        </div>

        {ambientType !== 'none' && (
          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs text-slate-500">Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambientVolume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-40 accent-indigo-600"
            />
            <span className="text-xs text-slate-400 font-mono">
              {Math.round(ambientVolume * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* SESSION FINISHED LOG MODAL */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Zap className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Focus Session Completed!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You studied for {durationMinutes} minutes. Rate your cognitive focus to claim bonus XP!
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFocusRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= focusRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {focusRating === 5
                ? 'Deep Flow State (+130% XP)'
                : focusRating >= 4
                ? 'Solid Productive Session (+115% XP)'
                : 'Good Effort (+100% XP)'}
            </div>

            {/* Session Notes */}
            <div className="text-left">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reflection / Notes (Optional)
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="What was the key insight or formula you cracked?"
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-3 py-1.5 text-xs text-slate-500"
              >
                Skip Log
              </button>
              <button
                onClick={handleFinishLogSession}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
              >
                Save & Claim XP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
