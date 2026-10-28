import { useState, memo } from "react";
import {
  Play, CheckCircle2, Circle, Plus, Trash2, Edit2, BookOpen,
  Zap, FileText, Link2, Clock, X, Layers
} from "lucide-react";
import {
  useApp, type LearningItem, type LearningModule,
  type LearningLesson, type LearningNote, type LearningResource
} from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { ProgressBar } from "@/components/kit";
import { cn } from "@/lib/utils";

interface LearningItemDetailModalProps {
  item: LearningItem | null;
  open: boolean;
  onClose: () => void;
  onEdit: (item: LearningItem) => void;
  onStartFocus: (item: LearningItem) => void;
}

export const LearningItemDetailModal = memo(function LearningItemDetailModal({
  item, open, onClose, onEdit, onStartFocus,
}: LearningItemDetailModalProps) {
  const {
    state, toggleLearningLesson, addLearningLesson, removeLearningLesson,
    addLearningModule, removeLearningModule, addLearningResource, removeLearningResource,
    addLearningNote, removeLearningNote, completeLearningItem, archiveLearningItem,
    removeLearningItem, addFlashcardDeck
  } = useApp();
  const { t, lang, dir } = useLang();
  const isAr = lang === "ar";

  const [activeTab, setActiveTab] = useState<"overview" | "content" | "notes" | "decks" | "activity">("overview");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [showAddModule, setShowAddModule] = useState(false);
  const [newNoteBody, setNewNoteBody] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [newResTitle, setNewResTitle] = useState("");
  const [newResUrl, setNewResUrl] = useState("");
  const [showAddResource, setShowAddResource] = useState(false);

  if (!open || !item) return null;

  const modules = (state.learningModules || []).filter((m) => m.learningItemId === item.id);
  const lessons = (state.learningLessons || []).filter((l) => l.learningItemId === item.id);
  const notes = (state.learningNotes || []).filter((n) => n.learningItemId === item.id);
  const resources = (state.learningResources || []).filter((r) => r.learningItemId === item.id);
  const decks = (state.flashcardDecks || []).filter(
    (d) => d.learningItemId === item.id || d.subject?.toLowerCase() === item.title.toLowerCase()
  );

  const studySessions = (state.focusSessions || []).filter(
    (s) => s.status === "completed" && (s.sourceId === item.id || s.sourceLabelSnapshot?.toLowerCase() === item.title.toLowerCase())
  );
  const totalFocusSeconds = studySessions.reduce((acc, s) => acc + (s.actualFocusSeconds || 0), 0);
  const totalFocusMins = Math.round(totalFocusSeconds / 60);
  const completedLessonsCount = lessons.filter((l) => l.status === "completed").length;

  return (
    <div className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl bg-canvas rounded-t-3xl sm:rounded-3xl border border-border/80 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden" dir={dir}>
        
        {/* Header */}
        <div className="p-5 border-b border-border/60 bg-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shrink-0 shadow-xs"
              style={{ background: item.color + "25", border: `1.5px solid ${item.color}50` }}>
              {item.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-ghost border border-border/40 text-ink-light">
                  {t(`type${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`)}
                </span>
                <span className={cn(
                  "text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border",
                  item.status === "completed" ? "bg-mint/15 text-islamic border-mint/40"
                  : item.status === "paused" ? "bg-gold/15 text-gold border-gold/40"
                  : item.status === "archived" ? "bg-ghost text-ink-light border-border/60"
                  : "bg-hotpink/15 text-hotpink border-hotpink/30"
                )}>
                  {t(`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink truncate mt-0.5 font-sans font-bold">{item.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={() => onStartFocus(item)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl grad-theme text-white text-xs font-bold shadow-rose active:scale-95 transition-all">
              <Play size={13} className="fill-white" />
              <span>{t("studyNow")}</span>
            </button>
            <button onClick={() => onEdit(item)}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-ghost hover:bg-muted text-ink-light transition-colors" title="Edit">
              <Edit2 size={15} />
            </button>
            <button onClick={onClose}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-ghost hover:bg-muted text-ink-light transition-colors" title="Close">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-border/60 bg-ghost/40 px-4 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: Layers },
            { id: "content", label: isAr ? "الوحدات والدروس" : "Lessons", icon: BookOpen },
            { id: "notes", label: isAr ? "الملاحظات والمصادر" : "Notes & Links", icon: FileText },
            { id: "decks", label: isAr ? "البطاقات" : "Flashcards", icon: Zap },
            { id: "activity", label: isAr ? "سجل الجلسات" : "Activity", icon: Clock },
          ].map((tb) => {
            const Icon = tb.icon;
            const active = activeTab === tb.id;
            return (
              <button key={tb.id} onClick={() => setActiveTab(tb.id as any)}
                className={cn(
                  "flex items-center gap-1.5 py-3 px-3 text-xs font-bold whitespace-nowrap transition-all border-b-2",
                  active ? "border-hotpink text-hotpink font-extrabold" : "border-transparent text-ink-light hover:text-ink"
                )}>
                <Icon size={14} />
                <span>{tb.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-card p-4 border border-border/60 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-light">{isAr ? "التقدم العام" : "Overall Progress"}</span>
                  <span className="text-sm font-extrabold font-mono text-hotpink">{item.progress}%</span>
                </div>
                <ProgressBar value={item.progress} />
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
                  <div className="p-2 rounded-xl bg-ghost/50">
                    <p className="text-[10px] text-ink-light font-bold">{isAr ? "وقت التركيز" : "Focus Time"}</p>
                    <p className="text-sm font-black text-ink font-mono mt-0.5">{totalFocusMins}m</p>
                  </div>
                  <div className="p-2 rounded-xl bg-ghost/50">
                    <p className="text-[10px] text-ink-light font-bold">{isAr ? "الهدف الأسبوعي" : "Weekly Target"}</p>
                    <p className="text-sm font-black text-ink font-mono mt-0.5">{item.weeklyTargetMinutes || 180}m</p>
                  </div>
                  <div className="p-2 rounded-xl bg-ghost/50">
                    <p className="text-[10px] text-ink-light font-bold">{isAr ? "الدروس" : "Lessons"}</p>
                    <p className="text-sm font-black text-ink font-mono mt-0.5">{completedLessonsCount}/{lessons.length || item.totalLessons || 0}</p>
                  </div>
                </div>
              </div>

              {item.description && (
                <div className="rounded-2xl bg-card p-4 border border-border/60">
                  <p className="text-xs font-bold text-ink-light mb-1.5">{isAr ? "الوصف" : "Description"}</p>
                  <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">{item.description}</p>
                </div>
              )}

              <div className="flex gap-2">
                {item.status !== "completed" && (
                  <button onClick={() => completeLearningItem(item.id)}
                    className="flex-1 py-2.5 rounded-xl bg-mint/15 text-islamic border border-mint/40 text-xs font-bold active:scale-95 transition-all">
                    ✓ {isAr ? "تحديد كمكتمل" : "Mark as Completed"}
                  </button>
                )}
                {item.status !== "archived" && (
                  <button onClick={() => archiveLearningItem(item.id)}
                    className="flex-1 py-2.5 rounded-xl bg-ghost text-ink-light border border-border/60 text-xs font-bold active:scale-95 transition-all">
                    {isAr ? "أرشفة" : "Archive"}
                  </button>
                )}
                <button onClick={() => {
                    if (window.confirm(isAr ? "هل أنتِ متأكدة من حذف هذا العنصر؟" : "Are you sure you want to delete this learning item?")) {
                      removeLearningItem(item.id);
                      onClose();
                    }
                  }}
                  className="p-2.5 rounded-xl bg-danger/10 text-danger border border-danger/30 text-xs font-bold active:scale-95 transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-light">
                  {completedLessonsCount} / {lessons.length} {isAr ? "دروس مكتملة" : "lessons completed"}
                </span>
                <button onClick={() => setShowAddModule(true)}
                  className="text-xs font-bold text-hotpink px-2.5 py-1 rounded-lg bg-hotpink/10 hover:bg-hotpink/20 transition-all flex items-center gap-1">
                  <Plus size={12} /> {isAr ? "وحدة" : "Module"}
                </button>
              </div>

              {showAddModule && (
                <div className="p-3 rounded-2xl bg-card border border-hotpink/40 space-y-2">
                  <p className="text-[11px] font-bold text-hotpink">{isAr ? "إضافة وحدة جديدة" : "New Module"}</p>
                  <div className="flex gap-2">
                    <input value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)}
                      placeholder={isAr ? "اسم الوحدة..." : "Module title..."}
                      className="flex-1 rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40" />
                    <button onClick={() => {
                        if (!newModuleTitle.trim()) return;
                        addLearningModule({ learningItemId: item.id, title: newModuleTitle.trim() });
                        setNewModuleTitle(""); setShowAddModule(false);
                      }}
                      className="px-3 py-1.5 rounded-xl grad-theme text-white text-xs font-bold active:scale-95">
                      {isAr ? "إضافة" : "Add"}
                    </button>
                    <button onClick={() => setShowAddModule(false)} className="px-2 py-1.5 rounded-xl bg-ghost text-ink-light text-xs">✕</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {modules.map((mod) => (
                  <div key={mod.id} className="rounded-2xl bg-card border border-border/60 overflow-hidden">
                    <div className="p-3 bg-ghost/40 flex items-center justify-between border-b border-border/40">
                      <span className="text-xs font-bold text-ink font-sans font-bold">{mod.title}</span>
                      <button onClick={() => removeLearningModule(mod.id)} className="text-danger opacity-40 hover:opacity-100">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="p-2 space-y-1">
                      {lessons.filter((l) => l.moduleId === mod.id).map((l) => (
                        <div key={l.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-ghost/30">
                          <button onClick={() => toggleLearningLesson(l.id)} className="flex items-center gap-2.5 text-left min-w-0 flex-1">
                            {l.status === "completed" ? <CheckCircle2 size={16} className="text-islamic shrink-0" /> : <Circle size={16} className="text-ink-light shrink-0" />}
                            <span className={cn("text-xs font-medium truncate", l.status === "completed" ? "line-through text-ink-light" : "text-ink")}>{l.title}</span>
                          </button>
                          <button onClick={() => removeLearningLesson(l.id)} className="text-danger opacity-40 hover:opacity-100 p-1">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {lessons.filter((l) => !l.moduleId).length > 0 && (
                  <div className="rounded-2xl bg-card border border-border/60 p-2 space-y-1">
                    {lessons.filter((l) => !l.moduleId).map((l) => (
                      <div key={l.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-ghost/30">
                        <button onClick={() => toggleLearningLesson(l.id)} className="flex items-center gap-2.5 text-left min-w-0 flex-1">
                          {l.status === "completed" ? <CheckCircle2 size={16} className="text-islamic shrink-0" /> : <Circle size={16} className="text-ink-light shrink-0" />}
                          <span className={cn("text-xs font-medium truncate", l.status === "completed" ? "line-through text-ink-light" : "text-ink")}>{l.title}</span>
                        </button>
                        <button onClick={() => removeLearningLesson(l.id)} className="text-danger opacity-40 hover:opacity-100 p-1">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <input value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newLessonTitle.trim()) {
                      addLearningLesson({ learningItemId: item.id, title: newLessonTitle.trim() });
                      setNewLessonTitle("");
                    }
                  }}
                  placeholder={isAr ? "+ أضيفي درسًا جديدًا..." : "+ Add a new lesson..."}
                  className="flex-1 rounded-xl bg-ghost px-3.5 py-2 text-xs text-ink outline-none border border-border/40 focus:border-hotpink/50" />
                <button onClick={() => {
                    if (!newLessonTitle.trim()) return;
                    addLearningLesson({ learningItemId: item.id, title: newLessonTitle.trim() });
                    setNewLessonTitle("");
                  }}
                  className="px-4 py-2 rounded-xl grad-theme text-white text-xs font-bold active:scale-95">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-ink-light">{isAr ? "روابط ومصادر" : "Web Links & Resources"}</span>
                  <button onClick={() => setShowAddResource(true)} className="text-[11px] font-bold text-hotpink flex items-center gap-1">
                    <Plus size={12} /> {isAr ? "إضافة رابط" : "Add Link"}
                  </button>
                </div>
                {showAddResource && (
                  <div className="p-3 rounded-2xl bg-card border border-hotpink/40 space-y-2 mb-3">
                    <input value={newResTitle} onChange={(e) => setNewResTitle(e.target.value)} placeholder={isAr ? "عنوان المصدر..." : "Resource title..."} className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40" />
                    <input value={newResUrl} onChange={(e) => setNewResUrl(e.target.value)} placeholder="https://..." className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowAddResource(false)} className="px-3 py-1 rounded-lg bg-ghost text-xs text-ink-light">{isAr ? "إلغاء" : "Cancel"}</button>
                      <button onClick={() => {
                          if (!newResTitle.trim()) return;
                          addLearningResource({ learningItemId: item.id, title: newResTitle.trim(), externalUrl: newResUrl.trim(), type: "link" });
                          setNewResTitle(""); setNewResUrl(""); setShowAddResource(false);
                        }} className="px-3 py-1 rounded-lg grad-theme text-white text-xs font-bold">{isAr ? "حفظ" : "Save"}</button>
                    </div>
                  </div>
                )}
                {resources.map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/40 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link2 size={13} className="text-hotpink shrink-0" />
                      <span className="text-xs font-bold text-ink truncate">{res.title}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {res.externalUrl && (
                        <a href={res.externalUrl} target="_blank" rel="noreferrer" className="text-[11px] text-hotpink font-bold hover:underline px-2">{isAr ? "فتح" : "Open"}</a>
                      )}
                      <button onClick={() => removeLearningResource(res.id)} className="text-danger opacity-40 hover:opacity-100 p-1"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-ink-light">{isAr ? "الملاحظات والملخصات" : "Notes & Summaries"}</span>
                  <button onClick={() => setShowAddNote(true)} className="text-[11px] font-bold text-hotpink flex items-center gap-1">
                    <Plus size={12} /> {isAr ? "إضافة ملاحظة" : "Add Note"}
                  </button>
                </div>
                {showAddNote && (
                  <div className="p-3 rounded-2xl bg-card border border-hotpink/40 space-y-2 mb-3">
                    <input value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder={isAr ? "عنوان الملاحظة..." : "Note title..."} className="w-full rounded-xl bg-ghost px-3 py-1.5 text-xs text-ink outline-none border border-border/40" />
                    <textarea value={newNoteBody} onChange={(e) => setNewNoteBody(e.target.value)} placeholder={isAr ? "اكتبي الملاحظة هنا..." : "Write your note here..."} rows={3} className="w-full rounded-xl bg-ghost px-3 py-2 text-xs text-ink outline-none border border-border/40 resize-none" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setShowAddNote(false)} className="px-3 py-1 rounded-lg bg-ghost text-xs text-ink-light">{isAr ? "إلغاء" : "Cancel"}</button>
                      <button onClick={() => {
                          if (!newNoteBody.trim()) return;
                          addLearningNote({ learningItemId: item.id, title: newNoteTitle.trim() || undefined, body: newNoteBody.trim() });
                          setNewNoteTitle(""); setNewNoteBody(""); setShowAddNote(false);
                        }} className="px-3 py-1 rounded-lg grad-theme text-white text-xs font-bold">{isAr ? "حفظ" : "Save"}</button>
                    </div>
                  </div>
                )}
                {notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-2xl bg-card border border-border/40 space-y-1 mb-2">
                    {n.title && <p className="text-xs font-bold text-ink">{n.title}</p>}
                    <p className="text-xs text-ink-light whitespace-pre-wrap leading-relaxed">{n.body}</p>
                    <div className="flex justify-end pt-1">
                      <button onClick={() => removeLearningNote(n.id)} className="text-danger opacity-40 hover:opacity-100 p-1"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "decks" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-light">{decks.length} {isAr ? "مجموعات مرتبطة" : "linked decks"}</span>
                <button onClick={() => {
                    addFlashcardDeck({ learningItemId: item.id, subject: item.title, name: `${item.title} Review`, emoji: "🃏", color: item.color });
                  }} className="text-xs font-bold text-hotpink px-2.5 py-1 rounded-lg bg-hotpink/10 hover:bg-hotpink/20 transition-all flex items-center gap-1">
                  <Plus size={12} /> {isAr ? "إنشاء مجموعة" : "New Deck"}
                </button>
              </div>
              {decks.map((d) => (
                <div key={d.id} className="p-3.5 rounded-2xl bg-card border border-border/60 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{d.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink truncate">{d.name}</p>
                      <p className="text-[11px] text-ink-light">{d.cards.length} cards</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-card border border-border/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-ink">{isAr ? "إجمالي ساعات التركيز" : "Total Focus Time"}</p>
                  <p className="text-[11px] text-ink-light">{studySessions.length} sessions logged</p>
                </div>
                <span className="text-lg font-black font-mono text-hotpink">{totalFocusMins}m</span>
              </div>
              {studySessions.slice(0, 10).map((sess) => (
                <div key={sess.id} className="p-3 rounded-xl bg-card border border-border/40 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-ink">{sess.localDate}</p>
                    <p className="text-[11px] text-ink-light">{sess.mode === "pomodoro" ? "Pomodoro" : "Stopwatch"}</p>
                  </div>
                  <span className="font-mono font-bold text-hotpink">{Math.round((sess.actualFocusSeconds || 0) / 60)}m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
