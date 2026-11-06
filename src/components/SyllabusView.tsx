import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Subject, SyllabusModule, Lesson, LessonStatus, Difficulty } from '../types';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Edit3,
  Check,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  HelpCircle,
  Brain,
} from 'lucide-react';

export const SyllabusView: React.FC = () => {
  const {
    subjects,
    addSubject,
    deleteSubject,
    addModuleToSubject,
    addLessonToModule,
    updateLessonStatus,
    updateLessonNotes,
    applyGeneratedSyllabus,
    setActiveTab,
    launchQuiz,
    addToast,
  } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );

  // Modals & form state
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAiSyllabusModal, setShowAiSyllabusModal] = useState(false);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string>('');

  // Add Subject Form
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('indigo');
  const [newSubjDate, setNewSubjDate] = useState('');

  // AI Syllabus Generator Form
  const [aiTopic, setAiTopic] = useState('');
  const [aiExamTarget, setAiExamTarget] = useState('');
  const [aiWeeks, setAiWeeks] = useState(4);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Add Module Form
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Add Lesson Form
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonDiff, setNewLessonDiff] = useState<Difficulty>('Medium');
  const [newLessonMins, setNewLessonMins] = useState(45);

  // Lesson notes state
  const [editingNotesLessonId, setEditingNotesLessonId] = useState<string | null>(null);
  const [notesContent, setNotesContent] = useState('');

  // Filter state
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const currentSubject =
    subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;
    addSubject(newSubjName.trim(), newSubjColor, newSubjDate);
    setNewSubjName('');
    setNewSubjDate('');
    setShowAddSubjectModal(false);
  };

  const handleGenerateAiSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim() || !currentSubject) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/syllabus/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: aiTopic.trim(),
          targetExamOrGrade: aiExamTarget || 'Final exam mastery',
          durationWeeks: aiWeeks,
        }),
      });

      const data = await res.json();
      if (data.modules && Array.isArray(data.modules)) {
        applyGeneratedSyllabus(currentSubject.id, data.modules);
        addToast({
          title: 'Syllabus Generated!',
          message: `Added ${data.modules.length} modules to ${currentSubject.name}`,
          type: 'quest',
        });
        setShowAiSyllabusModal(false);
        setAiTopic('');
      }
    } catch (err) {
      console.error(err);
      addToast({
        title: 'Notice',
        message: 'Loaded foundational modules for your study track.',
        type: 'info',
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim() || !currentSubject) return;
    addModuleToSubject(currentSubject.id, newModuleTitle.trim());
    setNewModuleTitle('');
    setShowAddModuleModal(false);
  };

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !currentSubject || !targetModuleId) return;
    addLessonToModule(
      currentSubject.id,
      targetModuleId,
      newLessonTitle.trim(),
      newLessonDiff,
      newLessonMins
    );
    setNewLessonTitle('');
    setNewLessonMins(45);
    setShowAddLessonModal(false);
  };

  const openNotesModal = (lesson: Lesson) => {
    setEditingNotesLessonId(lesson.id);
    setNotesContent(lesson.notes || '');
  };

  const saveNotes = (moduleId: string) => {
    if (!currentSubject || !editingNotesLessonId) return;
    updateLessonNotes(currentSubject.id, moduleId, editingNotesLessonId, notesContent);
    setEditingNotesLessonId(null);
    addToast({ title: 'Notes Saved', message: 'Lesson study notes updated.', type: 'info' });
  };

  if (subjects.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <BookOpen className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          No Syllabus Tracks Yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Start by adding your first subject or curriculum outline to track lessons and goals.
        </p>
        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
        >
          Add First Subject
        </button>
      </div>
    );
  }

  // Calculate stats for current subject
  let subjectTotalLessons = 0;
  let subjectMasteredLessons = 0;
  let subjectEstimatedMinutes = 0;

  currentSubject.modules.forEach((m) => {
    m.lessons.forEach((l) => {
      subjectTotalLessons += 1;
      if (l.status === 'mastered') subjectMasteredLessons += 1;
      subjectEstimatedMinutes += l.estimatedMinutes;
    });
  });

  const subjectMasteryPercent =
    subjectTotalLessons > 0
      ? Math.round((subjectMasteredLessons / subjectTotalLessons) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Subject Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Syllabus & Lesson Tracker
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Structure your course outlines, monitor topic mastery, and log study notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAiTopic(currentSubject?.name || '');
              setShowAiSyllabusModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Generate with AI</span>
          </button>
          <button
            onClick={() => setShowAddSubjectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Subject</span>
          </button>
        </div>
      </div>

      {/* Subject Horizontal Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80 dark:border-slate-800">
        {subjects.map((sub) => {
          const isSelected = sub.id === currentSubject?.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{sub.name}</span>
              {sub.targetExamDate && (
                <span className="text-[10px] opacity-80 font-mono">
                  (Exam: {sub.targetExamDate})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Subject Banner & Progress Bar */}
      {currentSubject && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
              <span>Course Curriculum</span>
              {currentSubject.targetExamDate && (
                <>
                  <span>·</span>
                  <span className="text-slate-500 font-normal">
                    Target Exam: {currentSubject.targetExamDate}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentSubject.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentSubject.modules.length} units · {subjectTotalLessons} lessons ·{' '}
              {Math.round(subjectEstimatedMinutes / 60)} estimated study hours
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {subjectMasteryPercent}%
              </span>
              <span className="text-xs text-slate-500">
                ({subjectMasteredLessons}/{subjectTotalLessons} mastered)
              </span>
            </div>
            <div className="w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${subjectMasteryPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="mastered">Mastered</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddModuleModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Module / Unit</span>
        </button>
      </div>

      {/* Modules & Lessons List */}
      <div className="space-y-4">
        {currentSubject?.modules.map((module, mIdx) => {
          const filteredLessons = module.lessons.filter((l) => {
            if (statusFilter !== 'all' && l.status !== statusFilter) return false;
            if (difficultyFilter !== 'all' && l.difficulty !== difficultyFilter) return false;
            return true;
          });

          return (
            <div
              key={module.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs"
            >
              {/* Module Header */}
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {module.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {module.lessons.length} lessons ·{' '}
                    {module.lessons.filter((l) => l.status === 'mastered').length} mastered
                  </p>
                </div>

                <button
                  onClick={() => {
                    setTargetModuleId(module.id);
                    setShowAddLessonModal(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lesson</span>
                </button>
              </div>

              {/* Lessons within Module */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredLessons.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No lessons in this module matching your filter.
                  </div>
                ) : (
                  filteredLessons.map((lesson) => {
                    const isNotesOpen = editingNotesLessonId === lesson.id;
                    return (
                      <div
                        key={lesson.id}
                        className="p-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Mastery Status Toggle */}
                            <button
                              onClick={() => {
                                const nextStatus: LessonStatus =
                                  lesson.status === 'not_started'
                                    ? 'in_progress'
                                    : lesson.status === 'in_progress'
                                    ? 'mastered'
                                    : 'not_started';
                                updateLessonStatus(
                                  currentSubject.id,
                                  module.id,
                                  lesson.id,
                                  nextStatus
                                );
                              }}
                              className="shrink-0 transition-transform active:scale-95"
                              title={`Current status: ${lesson.status}. Click to advance.`}
                            >
                              {lesson.status === 'mastered' ? (
                                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                                  <Check className="w-4 h-4" />
                                </div>
                              ) : lesson.status === 'in_progress' ? (
                                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 border border-amber-500/50 flex items-center justify-center text-[10px] font-bold">
                                  ...
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px]">
                                  ○
                                </div>
                              )}
                            </button>

                            <div className="min-w-0">
                              <div
                                className={`text-xs sm:text-sm font-semibold ${
                                  lesson.status === 'mastered'
                                    ? 'text-slate-600 dark:text-slate-400'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {lesson.title}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                <span
                                  className={
                                    lesson.difficulty === 'Hard'
                                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                      : lesson.difficulty === 'Medium'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-emerald-600 dark:text-emerald-400'
                                  }
                                >
                                  {lesson.difficulty}
                                </span>
                                <span>·</span>
                                <span>{lesson.estimatedMinutes} mins</span>
                                {lesson.revisionCount > 0 && (
                                  <>
                                    <span>·</span>
                                    <span>{lesson.revisionCount} revisions</span>
                                  </>
                                )}
                                {lesson.lastStudiedDate && (
                                  <>
                                    <span>·</span>
                                    <span>Last reviewed: {lesson.lastStudiedDate}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Controls */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openNotesModal(lesson)}
                              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                                lesson.notes
                                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                              }`}
                              title="Lesson Study Notes & Formulas"
                            >
                              <FileText className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                {lesson.notes ? 'Notes' : '+ Note'}
                              </span>
                            </button>

                            <button
                              onClick={() => launchQuiz(lesson.title, currentSubject.name, lesson.id)}
                              className="p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                              title="Start Active Recall Quiz on this lesson"
                            >
                              <Brain className="w-4 h-4" />
                              <span className="hidden sm:inline">Quiz Me</span>
                            </button>

                            <button
                              onClick={() => setActiveTab('timer')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              title="Study this topic in Focus Timer"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Notes Box (if open) */}
                        {isNotesOpen && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-900/60 animate-in fade-in">
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              Study Notes, Key Formulas & Active Recall Prompts:
                            </label>
                            <textarea
                              value={notesContent}
                              onChange={(e) => setNotesContent(e.target.value)}
                              placeholder="Write key mnemonics, definitions, or problems you got wrong..."
                              rows={3}
                              className="w-full p-2.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingNotesLessonId(null)}
                                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveNotes(module.id)}
                                className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                              >
                                Save Notes
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Add Subject */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Syllabus Track
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new course, topic, or academic subject.
            </p>

            <form onSubmit={handleCreateSubject} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Course Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="e.g. Cognitive Psychology, Macroeconomics, AP Physics"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Exam / Completion Date (Optional)
                </label>
                <input
                  type="date"
                  value={newSubjDate}
                  onChange={(e) => setNewSubjDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AI Syllabus Generator */}
      {showAiSyllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Generate Syllabus with AI
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Enter the course topic or textbook name. Your Study Buddy will construct structured units and lessons with estimated study hours.
            </p>

            <form onSubmit={handleGenerateAiSyllabus} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Topic / Subject Outline
                </label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Linear Algebra, Cellular Biology, World War II History"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Goal or Target Exam (Optional)
                </label>
                <input
                  type="text"
                  value={aiExamTarget}
                  onChange={(e) => setAiExamTarget(e.target.value)}
                  placeholder="e.g. Midterm A+ grade, AP Exam, College Final"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Duration: {aiWeeks} Weeks
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={aiWeeks}
                  onChange={(e) => setAiWeeks(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  disabled={isGeneratingAi}
                  onClick={() => setShowAiSyllabusModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAi}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isGeneratingAi ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Modules...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Construct Syllabus</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Module */}
      {showAddModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Syllabus Module / Unit
            </h3>
            <form onSubmit={handleCreateModule} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  required
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Advanced Thermodynamics"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Add Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Lesson */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Lesson to Module
            </h3>
            <form onSubmit={handleCreateLesson} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Lesson / Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g. Carnot Cycle & Entropy Calculation"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newLessonDiff}
                    onChange={(e) => setNewLessonDiff(e.target.value as Difficulty)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    step="5"
                    value={newLessonMins}
                    onChange={(e) => setNewLessonMins(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
