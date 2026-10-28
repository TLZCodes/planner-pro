import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  X,
  Star,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen } from "@/components/kit";
import { TaskCard } from "@/components/tasks/TaskCard";
import {
  useApp,
  type Task,
  todayKey,
  getTomorrowKey,
  DEFAULT_TASK_CATEGORIES,
} from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — AYXA Planner Pro" },
      {
        name: "description",
        content: "Organize your daily tasks, Top-3 priorities, scheduled hours, and productivity filters.",
      },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const {
    state,
    addTask,
    editTask,
    removeTask,
    toggleTask,
    toggleTopThree,
    startFocusSession,
  } = useApp();
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const navigate = useNavigate();

  // Navigation & View States
  const [activeDateTab, setActiveDateTab] = useState<"today" | "upcoming" | "all" | "completed">("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [completedCollapsed, setCompletedCollapsed] = useState(true);

  // Minimal Inline Editor State
  const [inlineEditorOpen, setInlineEditorOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskTag, setTaskTag] = useState("Work");
  const [taskDueDate, setTaskDueDate] = useState(todayKey());
  const [taskOptionalTime, setTaskOptionalTime] = useState("");
  const [taskIsTopThree, setTaskIsTopThree] = useState(false);
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");

  const todayStr = todayKey();
  const tomorrowStr = getTomorrowKey();

  const customCategories = state.customCategories || [];
  const allCategories = useMemo(() => {
    const defaultList = DEFAULT_TASK_CATEGORIES.map((c) => ({
      id: c.id,
      labelEn: c.labelEn,
      labelAr: c.labelAr,
      emoji: c.emoji,
      bg: c.bg,
    }));
    const customList = customCategories.map((name) => ({
      id: name,
      labelEn: name,
      labelAr: name,
      emoji: "🌸",
      bg: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800",
    }));
    return [...defaultList, ...customList];
  }, [customCategories]);

  const handleOpenCreate = () => {
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskTag("Work");
    setTaskDueDate(todayKey());
    setTaskOptionalTime("");
    setTaskIsTopThree(false);
    setTaskPriority("medium");
    setInlineEditorOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskTag(task.tag || "Work");
    setTaskDueDate(task.dueDate || todayKey());
    setTaskOptionalTime(task.optionalTime || "");
    setTaskIsTopThree(Boolean(task.isTopThree));
    setTaskPriority(task.priority || "medium");
    setInlineEditorOpen(true);
  };

  const handleSaveInline = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTaskId) {
      editTask(editingTaskId, {
        title: taskTitle.trim(),
        tag: taskTag,
        dueDate: taskDueDate,
        optionalTime: taskOptionalTime.trim() || undefined,
        priority: taskPriority,
        isTopThree: taskIsTopThree,
      });
    } else {
      addTask({
        title: taskTitle.trim(),
        tag: taskTag,
        dueDate: taskDueDate,
        optionalTime: taskOptionalTime.trim() || undefined,
        priority: taskPriority,
        isTopThree: taskIsTopThree,
        done: false,
      });
    }

    setInlineEditorOpen(false);
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskOptionalTime("");
  };

  const handleCancelInline = () => {
    setInlineEditorOpen(false);
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskOptionalTime("");
  };

  // Filter Tasks by search query and category
  const filteredTasks = useMemo(() => {
    return state.tasks.filter((task) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchTag = (task.tag || "").toLowerCase().includes(query);
        if (!matchTitle && !matchTag) return false;
      }

      if (selectedTag !== "All" && task.tag !== selectedTag) {
        return false;
      }

      return true;
    });
  }, [state.tasks, searchQuery, selectedTag]);

  // Today Grouping:
  // Each task appears strictly once in the Today view:
  // 1. Top 3 (uncompleted, isTopThree, max 3)
  // 2. Scheduled (uncompleted, not top 3, has optionalTime)
  // 3. Anytime (uncompleted, not top 3, no optionalTime)
  // 4. Completed (done tasks, collapsed by default)
  const todayGroups = useMemo(() => {
    const todayCandidateTasks = filteredTasks.filter((t) => {
      const taskDate = t.dueDate || todayStr;
      return taskDate <= todayStr;
    });

    const top3: Task[] = [];
    const scheduled: Task[] = [];
    const anytime: Task[] = [];
    const completed: Task[] = [];

    todayCandidateTasks.forEach((t) => {
      if (t.done) {
        completed.push(t);
      } else if (t.isTopThree && top3.length < 3) {
        top3.push(t);
      } else if (t.optionalTime) {
        scheduled.push(t);
      } else {
        anytime.push(t);
      }
    });

    scheduled.sort((a, b) => (a.optionalTime || "").localeCompare(b.optionalTime || ""));

    return { top3, scheduled, anytime, completed };
  }, [filteredTasks, todayStr]);

  // Upcoming Tasks: uncompleted, due after today
  const upcomingTasks = useMemo(() => {
    return filteredTasks
      .filter((t) => !t.done && (t.dueDate || todayStr) > todayStr)
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  }, [filteredTasks, todayStr]);

  // All Tasks:
  const allTasksList = useMemo(() => {
    return filteredTasks;
  }, [filteredTasks]);

  // Completed Tasks across the app:
  const allCompletedTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.done);
  }, [filteredTasks]);

  const handleStartFocus = (t: Task) => {
    startFocusSession({
      mode: "pomodoro",
      sourceType: "task",
      sourceId: t.id,
      sourceLabelSnapshot: t.title,
      plannedFocusSeconds: 25 * 60,
    });
    navigate({ to: "/focus" });
  };

  return (
    <MobileShell>
      <Screen className="tasks-page pb-36 min-h-screen bg-canvas text-ink font-sans">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border/60 px-4 pt-4 pb-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] font-extrabold text-ink tracking-tight flex items-center gap-1.5 truncate">
                <span>{isAr ? "مهامي ✨" : "My Tasks ✨"}</span>
              </h1>
              <p className="text-[11px] font-semibold text-ink-light truncate">
                {isAr ? "نظّمي أولوياتكِ وأنجزي بإنتاجية وراحة" : "Organize your focus & achieve with ease"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/ai"
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border border-pink-200/90 dark:border-pink-800/60 bg-pink-50/70 dark:bg-pink-950/40 text-hotpink hover:shadow-rose transition-all active:scale-95"
                title={isAr ? "تنظيم وتخطيط بالذكاء الاصطناعي ✨" : "AI Planner Assistant ✨"}
                aria-label={isAr ? "مساعد التخطيط الذكي" : "AI Planner Assistant"}
              >
                <Sparkles size={16} />
              </Link>

              <button
                type="button"
                onClick={() => setSearchOpen((prev) => !prev)}
                className={cn(
                  "cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-95",
                  searchOpen || searchQuery ? "bg-hotpink/10 border-hotpink text-hotpink" : "bg-surface border-border/80 text-ink-light"
                )}
                aria-label="Search"
              >
                <Search size={16} />
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="cursor-pointer inline-flex items-center gap-1 rounded-full grad-theme px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition-all"
              >
                <Plus size={15} />
                <span>{isAr ? "مهمة جديدة" : "New Task"}</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-surface border border-border px-3.5 py-2 text-xs">
              <Search size={14} className="text-ink-light" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحثي في المهام والتصنيفات..." : "Search tasks or tags..."}
                className="w-full bg-transparent font-bold text-ink outline-none"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-ink-light">
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Date Filter Tabs */}
          <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "today", label: isAr ? "اليوم" : "Today" },
              { id: "upcoming", label: isAr ? "القادمة" : "Upcoming" },
              { id: "all", label: isAr ? "الكل" : "All" },
              {
                id: "completed",
                label: isAr
                  ? `المكتملة (${allCompletedTasks.length})`
                  : `Completed (${allCompletedTasks.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDateTab(tab.id as any)}
                className={cn(
                  "cursor-pointer shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                  activeDateTab === tab.id
                    ? "grad-theme text-white shadow-xs"
                    : "bg-surface border border-border/80 text-ink-light hover:text-ink"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Main Content Body */}
        <main className="px-4 pt-4 space-y-4 max-w-xl mx-auto w-full">

          {/* 1. TODAY TAB: strictly partitioned into Top 3, Scheduled, Anytime, Completed (collapsed) */}
          {activeDateTab === "today" && (
            <>
              {/* Top 3 Section */}
              {todayGroups.top3.length > 0 && (
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-amber-500 fill-amber-500" />
                      <h2 className="text-xs font-extrabold text-ink uppercase tracking-wider">
                        {isAr ? "أولويات اليوم الكبرى (Top 3) ⭐" : "Top 3 Focus ⭐"}
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      {todayGroups.top3.length}/3
                    </span>
                  </div>

                  <div className="space-y-2">
                    {todayGroups.top3.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        allCategories={allCategories}
                        isAr={isAr}
                        onToggle={() => toggleTask(t.id)}
                        onEdit={() => handleOpenEdit(t)}
                        onToggleTopThree={() => toggleTopThree(t.id)}
                        onDelete={() => removeTask(t.id)}
                        onMoveTomorrow={() => editTask(t.id, { dueDate: tomorrowStr })}
                        onFocus={() => handleStartFocus(t)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Scheduled Section (Timed tasks not in Top 3) */}
              {todayGroups.scheduled.length > 0 && (
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-hotpink" />
                      <h2 className="text-xs font-extrabold text-ink uppercase tracking-wider">
                        {isAr ? "المهام المجدولة ⏰" : "Scheduled Tasks ⏰"}
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-ink-light">
                      {todayGroups.scheduled.length} {isAr ? "مهمة" : "tasks"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {todayGroups.scheduled.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        allCategories={allCategories}
                        isAr={isAr}
                        onToggle={() => toggleTask(t.id)}
                        onEdit={() => handleOpenEdit(t)}
                        onToggleTopThree={() => toggleTopThree(t.id)}
                        onDelete={() => removeTask(t.id)}
                        onMoveTomorrow={() => editTask(t.id, { dueDate: tomorrowStr })}
                        onFocus={() => handleStartFocus(t)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Anytime Section (Untimed tasks not in Top 3) */}
              {todayGroups.anytime.length > 0 && (
                <section className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-xs font-extrabold text-ink uppercase tracking-wider">
                      {isAr ? "في أي وقت اليوم 🌸" : "Anytime Tasks 🌸"}
                    </h2>
                    <span className="text-[11px] font-bold text-ink-light">
                      {todayGroups.anytime.length} {isAr ? "مهمة" : "tasks"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {todayGroups.anytime.map((t) => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        allCategories={allCategories}
                        isAr={isAr}
                        onToggle={() => toggleTask(t.id)}
                        onEdit={() => handleOpenEdit(t)}
                        onToggleTopThree={() => toggleTopThree(t.id)}
                        onDelete={() => removeTask(t.id)}
                        onMoveTomorrow={() => editTask(t.id, { dueDate: tomorrowStr })}
                        onFocus={() => handleStartFocus(t)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty state when no pending tasks for Today */}
              {todayGroups.top3.length === 0 &&
                todayGroups.scheduled.length === 0 &&
                todayGroups.anytime.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-2">
                    <p className="text-xs font-bold text-ink-light">
                      {todayGroups.completed.length > 0
                        ? isAr
                          ? "أنجزتِ جميع مهام اليوم بنجاح! رائع 🌸"
                          : "All tasks completed for today! Amazing work 🌸"
                        : isAr
                        ? "لا توجد مهام مسجلة لليوم 🌸"
                        : "No tasks planned for today 🌸"}
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition-all"
                    >
                      <Plus size={14} />
                      <span>{isAr ? "+ إضافة مهمة جديدة" : "+ Add New Task"}</span>
                    </button>
                  </div>
                )}

              {/* Completed Section for Today (collapsed by default) */}
              {todayGroups.completed.length > 0 && (
                <section className="space-y-2.5 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setCompletedCollapsed((prev) => !prev)}
                    className="cursor-pointer flex items-center justify-between w-full px-1 text-xs font-extrabold text-ink-light hover:text-ink transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      <span>
                        {isAr
                          ? `المهام المكتملة (${todayGroups.completed.length})`
                          : `Completed (${todayGroups.completed.length})`}
                      </span>
                    </div>
                    {completedCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                  </button>

                  {!completedCollapsed && (
                    <div className="space-y-2 opacity-85">
                      {todayGroups.completed.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          allCategories={allCategories}
                          isAr={isAr}
                          onToggle={() => toggleTask(t.id)}
                          onEdit={() => handleOpenEdit(t)}
                          onToggleTopThree={() => toggleTopThree(t.id)}
                          onDelete={() => removeTask(t.id)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {/* 2. UPCOMING TAB */}
          {activeDateTab === "upcoming" && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-extrabold text-ink uppercase tracking-wider">
                  {isAr ? "المهام القادمة 📅" : "Upcoming Tasks 📅"}
                </h2>
                <span className="text-[11px] font-bold text-ink-light">
                  {upcomingTasks.length} {isAr ? "مهمة" : "tasks"}
                </span>
              </div>

              {upcomingTasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-2">
                  <p className="text-xs font-bold text-ink-light">
                    {isAr ? "لا توجد مهام قادمة مجدولة 🌸" : "No upcoming tasks scheduled 🌸"}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                    <span>{isAr ? "+ جدولة مهمة قادمة" : "+ Schedule Task"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      allCategories={allCategories}
                      isAr={isAr}
                      onToggle={() => toggleTask(t.id)}
                      onEdit={() => handleOpenEdit(t)}
                      onToggleTopThree={() => toggleTopThree(t.id)}
                      onDelete={() => removeTask(t.id)}
                      onFocus={() => handleStartFocus(t)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 3. ALL TAB */}
          {activeDateTab === "all" && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-extrabold text-ink uppercase tracking-wider">
                  {isAr ? "جميع المهام 📋" : "All Tasks 📋"}
                </h2>
                <span className="text-[11px] font-bold text-ink-light">
                  {allTasksList.length} {isAr ? "مهمة" : "tasks"}
                </span>
              </div>

              {allTasksList.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-2">
                  <p className="text-xs font-bold text-ink-light">
                    {isAr ? "لا توجد أي مهام حالياً 🌸" : "No tasks found 🌸"}
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full grad-theme px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 active:scale-95 transition-all"
                  >
                    <Plus size={14} />
                    <span>{isAr ? "+ إضافة مهمة" : "+ Add Task"}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {allTasksList.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      allCategories={allCategories}
                      isAr={isAr}
                      onToggle={() => toggleTask(t.id)}
                      onEdit={() => handleOpenEdit(t)}
                      onToggleTopThree={() => toggleTopThree(t.id)}
                      onDelete={() => removeTask(t.id)}
                      onFocus={() => handleStartFocus(t)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 4. COMPLETED TAB */}
          {activeDateTab === "completed" && (
            <section className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-extrabold text-ink uppercase tracking-wider">
                  {isAr ? "المهام المكتملة ✨" : "Completed Tasks ✨"}
                </h2>
                <span className="text-[11px] font-bold text-ink-light">
                  {allCompletedTasks.length} {isAr ? "مكتملة" : "done"}
                </span>
              </div>

              {allCompletedTasks.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 p-8 text-center bg-card/40">
                  <p className="text-xs font-bold text-ink-light">
                    {isAr ? "لم تكتمل أي مهام بعد. يمكنكِ البدء بإنجاز مهام اليوم! 🌸" : "No completed tasks yet. Ready to start achieving today! 🌸"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {allCompletedTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      allCategories={allCategories}
                      isAr={isAr}
                      onToggle={() => toggleTask(t.id)}
                      onEdit={() => handleOpenEdit(t)}
                      onToggleTopThree={() => toggleTopThree(t.id)}
                      onDelete={() => removeTask(t.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        {/* Task Creation & Editing Modal */}
        {inlineEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div
              className="w-full max-w-md rounded-3xl bg-card border border-border p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto overscroll-contain"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                  <span>{editingTaskId ? (isAr ? "تعديل المهمة ✏️" : "Edit Task ✏️") : (isAr ? "مهمة جديدة ✨" : "New Task ✨")}</span>
                </h3>
                <button
                  type="button"
                  onClick={handleCancelInline}
                  className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-light hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Task Title Form */}
              <form onSubmit={handleSaveInline} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-ink-light uppercase tracking-wider">
                    {isAr ? "عنوان المهمة" : "Task Title"}
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder={isAr ? "مثال: مراجعة مشروع التخرج، شراء مستلزمات..." : "e.g., Review project draft, buy groceries..."}
                    className="w-full rounded-2xl bg-surface border border-border px-3.5 py-2.5 text-sm font-bold text-ink outline-none focus:border-hotpink transition-all"
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-ink-light uppercase tracking-wider">
                    {isAr ? "التصنيف" : "Category"}
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {allCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setTaskTag(cat.id)}
                        className={cn(
                          "cursor-pointer inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border transition-all",
                          taskTag === cat.id
                            ? "grad-theme text-white border-transparent shadow-xs"
                            : "bg-surface border-border/70 text-ink-light hover:text-ink"
                        )}
                      >
                        <span>{cat.emoji}</span>
                        <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date & Optional Scheduled Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-ink-light uppercase tracking-wider">
                      {isAr ? "تاريخ الاستحقاق" : "Due Date"}
                    </label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full rounded-2xl bg-surface border border-border px-3 py-2 text-xs font-bold text-ink outline-none focus:border-hotpink"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-ink-light uppercase tracking-wider">
                      {isAr ? "الوقت المجدول (اختياري)" : "Time (Optional)"}
                    </label>
                    <input
                      type="time"
                      value={taskOptionalTime}
                      onChange={(e) => setTaskOptionalTime(e.target.value)}
                      className="w-full rounded-2xl bg-surface border border-border px-3 py-2 text-xs font-bold text-ink outline-none focus:border-hotpink"
                    />
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-ink-light uppercase tracking-wider">
                    {isAr ? "الأولوية" : "Priority"}
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full rounded-2xl bg-surface border border-border px-3 py-2 text-xs font-bold text-ink outline-none focus:border-hotpink cursor-pointer"
                  >
                    <option value="low">{isAr ? "منخفضة" : "Low"}</option>
                    <option value="medium">{isAr ? "متوسطة" : "Medium"}</option>
                    <option value="high">{isAr ? "عالية 🔥" : "High 🔥"}</option>
                  </select>
                </div>

                {/* Top 3 Toggle */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-surface border border-border/70">
                  <div className="flex items-center gap-2">
                    <Star size={16} className={taskIsTopThree ? "text-amber-500 fill-amber-500" : "text-ink-light"} />
                    <span className="text-xs font-bold text-ink">
                      {isAr ? "تعيين كأولوية كبرى لليوم (Top 3)" : "Set as Top 3 Priority for Today"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={taskIsTopThree}
                    onChange={(e) => setTaskIsTopThree(e.target.checked)}
                    className="h-4 w-4 rounded accent-pink-500 cursor-pointer"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelInline}
                    className="cursor-pointer flex-1 rounded-2xl bg-surface border border-border/80 py-2.5 text-xs font-bold text-ink-light hover:text-ink transition-all"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={!taskTitle.trim()}
                    className="cursor-pointer flex-1 rounded-2xl grad-theme py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 transition-all disabled:opacity-50"
                  >
                    {editingTaskId ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إضافة المهمة" : "Add Task")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Screen>
    </MobileShell>
  );
}
