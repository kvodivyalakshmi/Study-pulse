import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { QuizQuestion, Difficulty } from '../types';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Zap,
  Lightbulb,
  Check,
  Bot,
  Brain,
  Layers,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const QuizView: React.FC = () => {
  const {
    subjects,
    activeQuizTopic,
    activeQuizSubject,
    activeQuizLessonId,
    completeQuiz,
    setActiveTab,
    setCompanionModalOpen,
    gamification,
  } = useStudy();

  // Setup state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [quizMode, setQuizMode] = useState<'mcq' | 'qa'>('mcq');

  // Active quiz session state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [inSession, setInSession] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Q&A mode self-eval state
  const [userWrittenAnswer, setUserWrittenAnswer] = useState<string>('');
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);
  const [qaRatings, setQaRatings] = useState<('easy' | 'good' | 'hard')[]>([]);

  // Result state
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Auto-fill from activeQuizTopic if navigated from Syllabus or Dashboard
  useEffect(() => {
    if (activeQuizTopic) {
      setCustomTopic(activeQuizTopic);
      if (activeQuizSubject) {
        const matched = subjects.find(
          (s) => s.name.toLowerCase() === activeQuizSubject.toLowerCase()
        );
        if (matched) setSelectedSubjectId(matched.id);
      }
      if (activeQuizLessonId) {
        setSelectedLessonId(activeQuizLessonId);
      }
    }
  }, [activeQuizTopic, activeQuizSubject, activeQuizLessonId, subjects]);

  // Session timer
  useEffect(() => {
    let timer: any = null;
    if (inSession && !isFinished) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [inSession, isFinished]);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);
  const currentLessons = currentSubject?.modules.flatMap((m) => m.lessons) || [];

  const effectiveTopic =
    customTopic.trim() ||
    currentLessons.find((l) => l.id === selectedLessonId)?.title ||
    currentSubject?.name ||
    'Data Structures & Algorithms';

  const handleStartQuiz = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          difficulty,
          count: questionCount,
          subjectName: currentSubject?.name,
        }),
      });

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setInSession(true);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setUserAnswers([]);
        setShowHint(false);
        setElapsedSeconds(0);
        setIsFinished(false);
        setUserWrittenAnswer('');
        setShowModelAnswer(false);
        setQaRatings([]);
      }
    } catch (e) {
      console.error('Quiz generate error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => [...prev, idx]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowHint(false);
      setUserWrittenAnswer('');
      setShowModelAnswer(false);
    } else {
      finishQuiz();
    }
  };

  const handleQaRate = (rating: 'easy' | 'good' | 'hard') => {
    setQaRatings((prev) => [...prev, rating]);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setUserWrittenAnswer('');
      setShowModelAnswer(false);
      setShowHint(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);

    let score = 0;
    if (quizMode === 'mcq') {
      questions.forEach((q, i) => {
        if (userAnswers[i] === q.correctIndex) score += 1;
      });
    } else {
      score = qaRatings.filter((r) => r === 'easy' || r === 'good').length;
    }

    completeQuiz(
      score,
      questions.length,
      effectiveTopic,
      selectedLessonId || undefined,
      selectedSubjectId || undefined
    );
  };

  const handleResetSession = () => {
    setInSession(false);
    setIsFinished(false);
    setQuestions([]);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers([]);
    setElapsedSeconds(0);
  };

  // Score stats
  const correctCount =
    quizMode === 'mcq'
      ? questions.reduce(
          (acc, q, i) => (userAnswers[i] === q.correctIndex ? acc + 1 : acc),
          0
        )
      : qaRatings.filter((r) => r === 'easy' || r === 'good').length;

  const scorePercent =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-500" />
            Active Recall Quiz & Q&A
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Self-quiz on any syllabus topic to test your retrieval pathways and earn scholar XP.
          </p>
        </div>

        {inSession && !isFinished && (
          <div className="flex items-center gap-2 text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
            <span>
              Question {currentQuestionIndex + 1}/{questions.length}
            </span>
            <span>·</span>
            <span>
              {Math.floor(elapsedSeconds / 60)}:
              {(elapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* VIEW 1: Quiz Configurator (Before Starting) */}
      {!inSession && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Configure Active Recall Session
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a lesson from your syllabus or type any specific concept.
            </p>
          </div>

          {/* Mode Switcher: MCQ vs Feynman Q&A */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setQuizMode('mcq')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                quizMode === 'mcq'
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                <span>Multiple Choice Quiz</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                4-choice conceptual drill with immediate explanations & misconception checks.
              </p>
            </button>

            <button
              onClick={() => setQuizMode('qa')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                quizMode === 'qa'
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                <span>Feynman Q&A Recall</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Explain in your own words, compare to model solution & self-rate confidence.
              </p>
            </button>
          </div>

          {/* Subject & Lesson Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pick from Your Enrolled Syllabus Tracks:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedLessonId('');
                    setCustomTopic('');
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
                <select
                  value={selectedLessonId}
                  onChange={(e) => {
                    setSelectedLessonId(e.target.value);
                    const l = currentLessons.find((item) => item.id === e.target.value);
                    if (l) setCustomTopic(l.title);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- All Units in Subject --</option>
                  {currentLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.difficulty})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Topic Input */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Or Enter Any Custom Topic / Chapter / Question:</span>
              </div>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Binary Search Tree Balance Factors, SN1 vs SN2 Mechanisms, Consumer Surplus"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Difficulty & Count */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="Easy">Easy (Foundational Recall)</option>
                <option value="Medium">Medium (Application & Models)</option>
                <option value="Hard">Hard (Edge Cases & Exam Traps)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Question Count
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value={3}>3 Questions (Quick Sprint)</option>
                <option value={4}>4 Questions (Balanced Check)</option>
                <option value={6}>6 Questions (Deep Drill)</option>
              </select>
            </div>
          </div>

          {/* Start CTA */}
          <div className="pt-2">
            <button
              onClick={handleStartQuiz}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Synthesizing Concept Questions...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Start Active Recall Session on "{effectiveTopic}"</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: Active Session Runner */}
      {inSession && !isFinished && questions.length > 0 && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            {/* Top metadata */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {effectiveTopic} · {difficulty}
              </span>

              {questions[currentQuestionIndex].hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                </button>
              )}
            </div>

            {/* Hint Box */}
            {showHint && questions[currentQuestionIndex].hint && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
                <span className="font-bold">Mentor Hint: </span>
                {questions[currentQuestionIndex].hint}
              </div>
            )}

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {questions[currentQuestionIndex].question}
            </h3>

            {/* MODE A: Multiple Choice Options */}
            {quizMode === 'mcq' && (
              <div className="space-y-3">
                {questions[currentQuestionIndex].options.map((opt, optIdx) => {
                  const isChosen = selectedOption === optIdx;
                  const isCorrect = optIdx === questions[currentQuestionIndex].correctIndex;

                  let optionStyle =
                    'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 hover:border-indigo-400 text-slate-800 dark:text-slate-200';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold';
                    } else if (isChosen) {
                      optionStyle =
                        'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
                    } else {
                      optionStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${optionStyle} ${
                        !isAnswerSubmitted ? 'cursor-pointer active:scale-99' : ''
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isAnswerSubmitted && isCorrect
                            ? 'bg-emerald-500 text-white'
                            : isAnswerSubmitted && isChosen
                            ? 'bg-rose-500 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* MODE B: Feynman Q&A Open Prompt */}
            {quizMode === 'qa' && (
              <div className="space-y-4">
                {!showModelAnswer ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Explain your reasoning in your own words (or bullet points):
                    </label>
                    <textarea
                      rows={4}
                      value={userWrittenAnswer}
                      onChange={(e) => setUserWrittenAnswer(e.target.value)}
                      placeholder="Write the mechanism, formula, or intuition as if teaching a classmate..."
                      className="w-full p-3 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => setShowModelAnswer(true)}
                      className="mt-3 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Compare with Model Solution
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in">
                    {userWrittenAnswer && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="font-semibold text-slate-500 block mb-1">
                          Your Explanation:
                        </span>
                        <p className="italic text-slate-800 dark:text-slate-200">
                          "{userWrittenAnswer}"
                        </p>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs sm:text-sm text-indigo-950 dark:text-indigo-100">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
                        <Check className="w-4 h-4" />
                        <span>Model Conceptual Answer:</span>
                      </div>
                      <p className="leading-relaxed">
                        {
                          questions[currentQuestionIndex].options[
                            questions[currentQuestionIndex].correctIndex
                          ]
                        }
                      </p>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                        {questions[currentQuestionIndex].explanation}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                        How confident was your retrieval?
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleQaRate('hard')}
                          className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                        >
                          Hard (Need Review)
                        </button>
                        <button
                          onClick={() => handleQaRate('good')}
                          className="flex-1 py-2 text-xs font-semibold rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                        >
                          Good (Understood Core)
                        </button>
                        <button
                          onClick={() => handleQaRate('easy')}
                          className="flex-1 py-2 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                        >
                          Easy (Mastered)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Explanation Box (Revealed after MCQ answer) */}
            {isAnswerSubmitted && quizMode === 'mcq' && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-xs sm:text-sm text-indigo-950 dark:text-indigo-100 animate-in fade-in space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Cognitive Explanation:</span>
                </div>
                <p className="leading-relaxed">
                  {questions[currentQuestionIndex].explanation}
                </p>
              </div>
            )}

            {/* Next Question CTA */}
            {isAnswerSubmitted && quizMode === 'mcq' && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                >
                  <span>
                    {currentQuestionIndex < questions.length - 1
                      ? 'Next Question'
                      : 'Complete Quiz & View Score'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: Scorecard & Session Review */}
      {isFinished && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Active Recall Session Completed
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Score: {correctCount} / {questions.length} ({scorePercent}%)
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Topic: <span className="font-semibold text-slate-700 dark:text-slate-300">{effectiveTopic}</span>
            </p>
          </div>

          {/* XP Badge & Syllabus Mastery Bonus */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 fill-amber-500" />
              <span>+{correctCount * 30 + (correctCount === questions.length ? 50 : 0)} XP Earned</span>
            </div>

            {scorePercent >= 80 && selectedLessonId && (
              <div className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Upgraded to Mastered in Syllabus!</span>
              </div>
            )}
          </div>

          {/* Review of all questions */}
          <div className="text-left space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Questions Breakdown & Memory Anchors:
            </h4>

            <div className="space-y-3">
              {questions.map((q, idx) => {
                const isCorrect = userAnswers[idx] === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {idx + 1}. {q.question}
                      </span>
                      {quizMode === 'mcq' && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </span>
                      )}
                    </div>

                    <div className="text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Correct Answer:{' '}
                      </span>
                      {q.options[q.correctIndex]}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      "{q.explanation}"
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleResetSession}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Quiz Another Topic</span>
            </button>

            <button
              onClick={() => {
                setCompanionModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60"
            >
              <Bot className="w-4 h-4" />
              <span>Ask {gamification.selectedPersona} to Explain Gaps</span>
            </button>

            <button
              onClick={() => setActiveTab('syllabus')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <span>Back to Syllabus</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
