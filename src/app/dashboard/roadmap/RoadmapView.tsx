"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Map,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Trash2,
  Edit2,
  ChevronDown,
  Sparkles,
  TrendingUp,
  X,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  getOrCreateRoadmapAction,
  toggleTaskCompleteAction,
  createRoadmapTaskAction,
  updateRoadmapTaskAction,
  deleteRoadmapTaskAction,
} from "@/app/actions/roadmapActions";

interface AnalysisOption {
  id: string;
  startupName: string;
  overallScore: number;
}

interface TaskItem {
  id: string;
  phase: string;
  title: string;
  description: string;
  priority: string;
  effort: string;
  impact: string;
  completed: boolean;
  createdAt: string;
}

export function RoadmapView({ analyses }: { analyses: AnalysisOption[] }) {
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>(
    analyses.length > 0 ? analyses[0].id : ""
  );
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Add / Edit
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPriority, setFormPriority] = useState("High");
  const [formEffort, setFormEffort] = useState("1 week");
  const [formImpact, setFormImpact] = useState("High");

  const currentAnalysis = analyses.find((a) => a.id === selectedAnalysisId) || analyses[0];

  useEffect(() => {
    async function loadRoadmap() {
      if (!selectedAnalysisId) return;
      setLoading(true);
      const res = await getOrCreateRoadmapAction(selectedAnalysisId);
      if (res && res.tasks) {
        setTasks(res.tasks);
      }
      setLoading(false);
    }

    loadRoadmap();
  }, [selectedAnalysisId]);

  async function handleToggleComplete(task: TaskItem) {
    const nextState = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextState } : t))
    );
    await toggleTaskCompleteAction(task.id, nextState, selectedAnalysisId);
  }

  async function handleCreateTask(phase: string) {
    if (!formTitle.trim()) return;
    const res = await createRoadmapTaskAction({
      analysisId: selectedAnalysisId,
      phase,
      title: formTitle,
      description: formDesc,
      priority: formPriority,
      effort: formEffort,
      impact: formImpact,
    });

    if (res && res.success) {
      const updated = await getOrCreateRoadmapAction(selectedAnalysisId);
      if (updated && updated.tasks) setTasks(updated.tasks);
      setIsAdding(null);
      resetForm();
    }
  }

  async function handleUpdateTask() {
    if (!editingTask || !formTitle.trim()) return;
    const res = await updateRoadmapTaskAction(
      editingTask.id,
      {
        title: formTitle,
        description: formDesc,
        priority: formPriority,
        effort: formEffort,
        impact: formImpact,
      },
      selectedAnalysisId
    );

    if (res && res.success) {
      const updated = await getOrCreateRoadmapAction(selectedAnalysisId);
      if (updated && updated.tasks) setTasks(updated.tasks);
      setEditingTask(null);
      resetForm();
    }
  }

  async function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await deleteRoadmapTaskAction(taskId, selectedAnalysisId);
  }

  function resetForm() {
    setFormTitle("");
    setFormDesc("");
    setFormPriority("High");
    setFormEffort("1 week");
    setFormImpact("High");
  }

  function openEditModal(task: TaskItem) {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormEffort(task.effort);
    setFormImpact(task.impact);
  }

  // Extract dynamic phases from the tasks array
  const dynamicPhases = Array.from(new Set(tasks.map((t) => t.phase)));
  const phaseList =
    dynamicPhases.length > 0
      ? dynamicPhases
      : [
          "Phase 1 — Demand & Location Validation",
          "Phase 2 — Business Setup & Compliance",
          "Phase 3 — Opening & Initial Operations",
          "Phase 4 — Unit Economics & Operational Optimization",
          "Phase 5 — Expansion",
        ];

  // Calculate Progress Stats
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const remainingCount = totalCount - completedCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <Map className="w-3.5 h-3.5 text-purple-600" />
              <span>Actionable Execution Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Execution Roadmap
            </h1>
            <p className="text-xs text-slate-500">
              Receive a personalized execution roadmap tailored to your specific venture type and operating model.
            </p>
          </div>

          {/* Startup Selector */}
          {analyses.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Business:</span>
              <div className="relative">
                <select
                  value={selectedAnalysisId}
                  onChange={(e) => setSelectedAnalysisId(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                >
                  {analyses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.startupName} ({a.overallScore}/100)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {analyses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-200">
            <Map className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Roadmap Available</h3>
            <p className="text-xs text-slate-500">
              Run your first analysis to generate a customized execution roadmap.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              Analyze Idea Now
            </Link>
          </div>
        ) : (
          <>
            {/* Progress Bar & Metric Summary */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Overall Execution Progress
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {completedCount} of {totalCount} tasks completed for {currentAnalysis?.startupName}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                    Completed: {completedCount}
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                    Remaining: {remainingCount}
                  </span>
                  <span className="text-sm font-extrabold text-purple-700">{progressPercent}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Dynamic Phases Timeline Container */}
            <div className="space-y-8">
              {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Loading customized execution roadmap...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-4">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900">No Tasks In Roadmap Yet</h3>
                  <p className="text-xs text-slate-500">
                    Click below to add custom execution tasks for {currentAnalysis?.startupName}.
                  </p>
                  <button
                    onClick={() => {
                      setIsAdding(phaseList[0]);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Initial Task
                  </button>
                </div>
              ) : (
                phaseList.map((phaseName, phaseIndex) => {
                  const phaseTasks = tasks.filter((t) => t.phase === phaseName);
                  const phaseCompleted = phaseTasks.filter((t) => t.completed).length;

                  return (
                    <div
                      key={phaseName}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0"
                    >
                      {/* Phase Header */}
                      <div className="p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                            {phaseIndex + 1}
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">{phaseName}</h3>
                            <p className="text-xs text-slate-500">
                              {phaseCompleted} of {phaseTasks.length} tasks completed
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setIsAdding(phaseName);
                            resetForm();
                          }}
                          className="px-3.5 py-2 bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Custom Task
                        </button>
                      </div>

                      {/* Task Cards Container */}
                      <div className="p-6 space-y-3">
                        {phaseTasks.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">No tasks in this phase yet.</p>
                        ) : (
                          phaseTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                                task.completed
                                  ? "bg-slate-50/60 border-slate-200/60 text-slate-400"
                                  : "bg-white border-slate-200 shadow-2xs hover:border-purple-200"
                              }`}
                            >
                              <div className="flex items-start gap-3.5 flex-1">
                                {/* Completion Checkbox */}
                                <button
                                  onClick={() => handleToggleComplete(task)}
                                  className="mt-0.5 shrink-0 transition-transform active:scale-95"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-slate-300 hover:text-purple-600 transition-colors" />
                                  )}
                                </button>

                                <div className="space-y-1">
                                  <h4
                                    className={`text-sm font-bold leading-snug ${
                                      task.completed ? "line-through text-slate-400" : "text-slate-900"
                                    }`}
                                  >
                                    {task.title}
                                  </h4>
                                  <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>

                                  {/* Badges */}
                                  <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[10px] font-bold">
                                    <span
                                      className={`px-2 py-0.5 rounded uppercase ${
                                        task.priority === "High"
                                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                                          : task.priority === "Medium"
                                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                                          : "bg-slate-100 text-slate-600 border border-slate-200"
                                      }`}
                                    >
                                      {task.priority} Priority
                                    </span>

                                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> Effort: {task.effort}
                                    </span>

                                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                      <Zap className="w-3 h-3 text-purple-600" /> Impact: {task.impact}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => openEditModal(task)}
                                  className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {(isAdding || editingTask) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTask ? "Edit Roadmap Task" : `Add Task to ${isAdding}`}
              </h3>
              <button
                onClick={() => {
                  setIsAdding(null);
                  setEditingTask(null);
                  resetForm();
                }}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Confirm location footfall count"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  placeholder="Details and validation objectives for this task..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Est. Effort
                  </label>
                  <input
                    type="text"
                    value={formEffort}
                    onChange={(e) => setFormEffort(e.target.value)}
                    placeholder="e.g. 1 week"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Impact
                  </label>
                  <select
                    value={formImpact}
                    onChange={(e) => setFormImpact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(null);
                  setEditingTask(null);
                  resetForm();
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (editingTask) handleUpdateTask();
                  else if (isAdding) handleCreateTask(isAdding);
                }}
                disabled={!formTitle.trim()}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-md"
              >
                {editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
