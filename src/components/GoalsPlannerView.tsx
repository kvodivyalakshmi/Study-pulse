import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { AcademicGoal, AcademicTask, Priority, TaskStatus } from '../types';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  Trash2,
  Sparkles,
  Trophy,
  ArrowRight,
  Filter,
  CheckSquare,
} from 'lucide-react';

export const GoalsPlannerView: React.FC = () => {
  const {
    goals,
    tasks,
    subjects,
    addGoal,
    toggleGoalMilestone,
    addGoalMilestone,
    deleteGoal,
    addTask,
    updateTaskStatus,
    deleteTask,
    setActiveTab,
    setCompanionModalOpen,
  } = useStudy();

  // Modals
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedGoalForMilestone, setSelectedGoalForMilestone] = useState<string | null>(null);

  // New Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalSubjectId, setGoalSubjectId] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalTargetScore, setGoalTargetScore] = useState('');
  const [goalTargetHours, setGoalTargetHours] = useState(20);
  const [goalCategory, setGoalCategory] = useState<AcademicGoal['category']>('Exam Preparation');

  // Milestone Form
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');

  // New Task Form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEstMins, setTaskEstMins] = useState(30);
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskNotes, setTaskNotes] = useState('');

  // Task filter
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>('all');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    addGoal({
      title: goalTitle.trim(),
      subjectId: goalSubjectId || undefined,
      targetDate: goalTargetDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      targetScoreOrGrade: goalTargetScore || 'Mastery',
      targetStudyHours: goalTargetHours,
      category: goalCategory,
      milestones: [
        {
          id: `m-${Date.now()}-1`,
          title: 'Review all core syllabus definitions and notes',
          targetDate: goalTargetDate,
          completed: false,
        },
      ],
    });

    setGoalTitle('');
    setGoalTargetScore('');
    setShowAddGoalModal(false);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !selectedGoalForMilestone) return;

    addGoalMilestone(
      selectedGoalForMilestone,
      newMilestoneTitle.trim(),
      newMilestoneDate || new Date().toISOString().split('T')[0]
    );

    setNewMilestoneTitle('');
    setSelectedGoalForMilestone(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      subjectId: taskSubjectId || undefined,
      dueDate: taskDueDate || new Date().toISOString().split('T')[0],
      estimatedMinutes: taskEstMins,
      priority: taskPriority,
      status: 'todo',
      notes: taskNotes,
    });

    setTaskTitle('');
    setTaskNotes('');
    setShowAddTaskModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter !== 'all' && t.status !== taskFilter) return false;
    if (taskPriorityFilter !== 'all' && t.priority !== taskPriorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-500" />
            Academic Goals & Action Planner
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define high-stakes academic objectives, track milestone hours, and execute daily study tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Goal</span>
          </button>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Action Item</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Academic Goals */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Assigned Goals ({goals.length})</span>
          </h3>
          <span className="text-xs text-slate-500">
            {goals.filter((g) => g.isCompleted).length} of {goals.length} Achieved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const subject = subjects.find((s) => s.id === goal.subjectId);
            const completedMilestones = goal.milestones.filter((m) => m.completed).length;
            const milestonePercent =
              goal.milestones.length > 0
                ? Math.round((completedMilestones / goal.milestones.length) * 100)
                : 0;

            const hourPercent = Math.min(
              100,
              Math.round((goal.completedHours / goal.targetStudyHours) * 100)
            );

            return (
              <div
                key={goal.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  goal.isCompleted
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div>
                  {/* Top metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {goal.category}
                    </span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                    {goal.title}
                  </h4>

                  {subject && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Subject: {subject.name}
                    </div>
                  )}

                  {/* Target details */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                    {goal.targetScoreOrGrade && (
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        Target: {goal.targetScoreOrGrade}
                      </span>
                    )}
                    <span>·</span>
                    <span>Due: {goal.targetDate}</span>
                  </div>

                  {/* Study Hours Progress */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Study Hours Progress</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {goal.completedHours} / {goal.targetStudyHours} hrs
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${hourPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones list */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Milestones ({completedMilestones}/{goal.milestones.length})
                      </span>
                      <button
                        onClick={() => setSelectedGoalForMilestone(goal.id)}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        + Milestone
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {goal.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => toggleGoalMilestone(goal.id, m.id)}
                          className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs cursor-pointer transition-colors"
                        >
                          {m.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span
                            className={`min-w-0 truncate ${
                              m.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom completion button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {milestonePercent}% Milestones
                  </span>
                  <button
                    onClick={() => setActiveTab('timer')}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>Log Focus Time</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Academic Action Planner (Tasks) */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-500" />
              <span>Academic Action Planner & Tasks</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Break syllabus revisions into discrete actionable tasks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              {(['all', 'todo', 'in_progress', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTaskFilter(tab)}
                  className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                    taskFilter === tab
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'in_progress' ? 'In Progress' : tab}
                </button>
              ))}
            </div>

            {/* Priority Filter */}
            <select
              value={taskPriorityFilter}
              onChange={(e) => setTaskPriorityFilter(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No tasks found for the current filter.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId);
              const isDone = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-75'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() =>
                        updateTaskStatus(
                          task.id,
                          isDone ? 'todo' : 'completed'
                        )
                      }
                      className="shrink-0 transition-transform active:scale-95"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : task.status === 'in_progress' ? (
                        <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 hover:text-indigo-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isDone
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {subject && (
                          <>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {subject.name}
                            </span>
                            <span>·</span>
                          </>
                        )}
                        <span>{task.estimatedMinutes} mins</span>
                        <span>·</span>
                        <span>Due {task.dueDate}</span>
                        <span>·</span>
                        <span
                          className={`font-semibold uppercase ${
                            task.priority === 'high'
                              ? 'text-rose-600 dark:text-rose-400'
                              : task.priority === 'medium'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                          "{task.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isDone && (
                      <button
                        onClick={() => {
                          updateTaskStatus(
                            task.id,
                            task.status === 'in_progress' ? 'todo' : 'in_progress'
                          );
                        }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                          task.status === 'in_progress'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {task.status === 'in_progress' ? 'In Progress' : 'Start'}
                      </button>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* MODAL: Assign Goal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assign Academic Goal
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Set a target exam score, syllabus mastery objective, or habit target.
            </p>

            <form onSubmit={handleCreateGoal} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Score 90%+ in Organic Chemistry Final"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Related Subject
                  </label>
                  <select
                    value={goalSubjectId}
                    onChange={(e) => setGoalSubjectId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">General / All Subjects</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Exam Preparation">Exam Preparation</option>
                    <option value="Syllabus Mastery">Syllabus Mastery</option>
                    <option value="Grade Target">Grade Target</option>
                    <option value="Habit Building">Habit Building</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Score / Grade
                  </label>
                  <input
                    type="text"
                    value={goalTargetScore}
                    onChange={(e) => setGoalTargetScore(e.target.value)}
                    placeholder="e.g. 95% (A+) or Top 5%"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Study Hours
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={goalTargetHours}
                    onChange={(e) => setGoalTargetHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Assign Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Milestone */}
      {selectedGoalForMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Goal Milestone
            </h3>
            <form onSubmit={handleCreateMilestone} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Milestone Description
                </label>
                <input
                  type="text"
                  required
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="e.g. Finish 100 practice problems"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedGoalForMilestone(null)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Action Planner Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Action Plan Task
            </h3>
            <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Solve 5 Graph Traversal Coding Drills"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={taskSubjectId}
                    onChange={(e) => setTaskSubjectId(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">General</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-2.5 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="240"
                    step="5"
                    value={taskEstMins}
                    onChange={(e) => setTaskEstMins(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Strategy Details (Optional)
                </label>
                <textarea
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Focus on edge cases and write down algorithmic invariants..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
