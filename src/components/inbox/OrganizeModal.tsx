import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  CheckCircle,
  ArrowRight,
  ListTodo,
  Target,
  BookHeart,
  Briefcase,
  Compass,
  GraduationCap,
  ShoppingBag,
  Link as LinkIcon,
  AlertTriangle,
  Lock,
  Calendar,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import {
  type BrainDumpItem,
  type DestinationType,
  type BrainDumpDestinationRef,
  findPotentialDuplicates,
} from "@/lib/brainDumpEngine";

interface OrganizeModalProps {
  isOpen: boolean;
  item: BrainDumpItem | null;
  onClose: () => void;
  onOrganized: (item: BrainDumpItem, destination: BrainDumpDestinationRef) => void;
}

export function OrganizeModal({
  isOpen,
  item,
  onClose,
  onOrganized,
}: OrganizeModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";
  const {
    state,
    addTask,
    addGoal,
    addJournal,
    addBusinessProject,
    createTravelTrip,
    addLearningNote,
    addSomedayWish,
    organizeBrainDumpItem,
  } = useApp();

  // Determine smart default destination from item label
  const initialDestinationType: DestinationType = useMemo(() => {
    if (!item) return "task";
    switch (item.label) {
      case "task":
        return "task";
      case "goal":
        return "goal";
      case "journal":
        return "journal";
      case "project":
        return "business_project";
      case "travel":
        return "travel_trip";
      case "learning":
        return "learning_note";
      case "shopping":
        return "shopping_task";
      default:
        return "task";
    }
  }, [item]);

  const [destinationType, setDestinationType] = useState<DestinationType>(initialDestinationType);
  const [proposedTitle, setProposedTitle] = useState("");
  const [proposedContent, setProposedContent] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [targetDate, setTargetDate] = useState("");
  const [removeInboxCopy, setRemoveInboxCopy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLinkingExisting, setIsLinkingExisting] = useState(false);
  const [existingSearchQuery, setExistingSearchQuery] = useState("");
  const [selectedExistingRecord, setSelectedExistingRecord] = useState<{
    type: DestinationType;
    id: string;
    title: string;
  } | null>(null);

  // Initialize form fields when item changes
  useEffect(() => {
    if (item) {
      const firstLine = item.title || item.content.split("\n")[0].slice(0, 80);
      setProposedTitle(firstLine);
      setProposedContent(item.content);
      setDestinationType(initialDestinationType);
      setRemoveInboxCopy(false);
      setIsLinkingExisting(false);
      setSelectedExistingRecord(null);
    }
  }, [item, initialDestinationType]);

  // Check potential duplicates
  const potentialDuplicates = useMemo(() => {
    if (!item || !proposedTitle) return [];
    return findPotentialDuplicates(proposedTitle, state);
  }, [proposedTitle, state, item]);

  // Destination Options list
  const destinationOptions = [
    {
      type: "task" as DestinationType,
      labelEn: "Task",
      labelAr: "مهمة",
      descEn: "Add to your central Tasks list",
      descAr: "إضافة إلى قائمة المهام اليومية",
      icon: ListTodo,
      color: "text-teal-600 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800",
    },
    {
      type: "goal" as DestinationType,
      labelEn: "Goal",
      labelAr: "هدف",
      descEn: "Add to Goals & Ambitions",
      descAr: "إضافة إلى الأهداف والمشاريع الكبرى",
      icon: Target,
      color: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800",
    },
    {
      type: "journal" as DestinationType,
      labelEn: "Journal",
      labelAr: "يوميات",
      descEn: "Record in your Daily Journal",
      descAr: "تدوين في مفكرتكِ الشخصية",
      icon: BookHeart,
      color: "text-pink-600 bg-pink-50 border-pink-200 dark:bg-pink-950/40 dark:border-pink-800",
    },
    {
      type: "business_project" as DestinationType,
      labelEn: "Business Project",
      labelAr: "مشروع عمل",
      descEn: "Create in Business workspace",
      descAr: "إنشاء مشروع في مساحة الأعمال",
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
    },
    {
      type: "travel_trip" as DestinationType,
      labelEn: "Travel Trip",
      labelAr: "رحلة سفر",
      descEn: "Add to Travel planner",
      descAr: "إضافة وجهة في مخطط السفر",
      icon: Compass,
      color: "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800",
    },
    {
      type: "learning_note" as DestinationType,
      labelEn: "Learning Note",
      labelAr: "ملاحظة تعلم",
      descEn: "Save to Learning Hub",
      descAr: "حفظ في مساحة التعلم والدراسة",
      icon: GraduationCap,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800",
    },
    {
      type: "shopping_task" as DestinationType,
      labelEn: "Shopping Item",
      labelAr: "قائمة المشتريات",
      descEn: "Unscheduled Home shopping task",
      descAr: "مهمة مشتريات شخصية غير مجدولة",
      icon: ShoppingBag,
      color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800",
    },
    {
      type: "someday_wish" as DestinationType,
      labelEn: "Someday Wish 🌱",
      labelAr: "أمنية قادمة 🌱",
      descEn: "Plant in Someday Garden without deadlines",
      descAr: "ازرعيها كأمنية في حديقة الأمنيات دون قيود المواعيد",
      icon: Sparkles,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
    },
  ];

  const handleCreateAndOrganize = useCallback(async () => {
    if (!item || isSubmitting) return;
    setIsSubmitting(true);

    try {
      let destinationRef: BrainDumpDestinationRef | null = null;

      if (isLinkingExisting && selectedExistingRecord) {
        destinationRef = {
          type: selectedExistingRecord.type,
          id: selectedExistingRecord.id,
          title: selectedExistingRecord.title,
          createdAt: new Date().toISOString(),
        };
      } else {
        const finalTitle = proposedTitle.trim() || item.content.slice(0, 60);
        const finalBody = proposedContent.trim() || item.content;

        switch (destinationType) {
          case "task": {
            const taskId = `task-${Date.now()}`;
            addTask({
              id: taskId,
              title: finalTitle,
              details: finalBody,
              tag: category,
              priority,
              dueDate: targetDate || undefined,
              done: false,
            });
            destinationRef = {
              type: "task",
              id: taskId,
              title: finalTitle,
              createdAt: new Date().toISOString(),
            };
            break;
          }

          case "shopping_task": {
            const shoppingId = `shop-${Date.now()}`;
            addTask({
              id: shoppingId,
              title: finalTitle,
              details: finalBody,
              tag: "Personal",
              priority: "low",
              done: false,
            });
            destinationRef = {
              type: "shopping_task",
              id: shoppingId,
              title: finalTitle,
              createdAt: new Date().toISOString(),
            };
            break;
          }

          case "goal": {
            const goalId = `goal-${Date.now()}`;
            addGoal({
              id: goalId,
              title: finalTitle,
              description: finalBody,
              category,
              targetDate: targetDate || undefined,
              status: "active",
              progress: 0,
            });
            destinationRef = {
              type: "goal",
              id: goalId,
              title: finalTitle,
              createdAt: new Date().toISOString(),
            };
            break;
          }

          case "journal": {
            const isJournalLocked = Boolean(state.journalSettings?.journalLockEnabled);
            const journalId = addJournal({
              title: finalTitle,
              body: finalBody,
              mood: "calm",
              date: targetDate || new Date().toISOString().split("T")[0],
              tags: [category],
              isLocked: isJournalLocked,
            });
            destinationRef = {
              type: "journal",
              id: journalId,
              title: isJournalLocked
                ? (isAr ? "تدوينة يوميات محمية 🔒" : "Protected Journal Entry 🔒")
                : finalTitle,
              createdAt: new Date().toISOString(),
              isProtected: isJournalLocked,
            };
            break;
          }

          case "business_project": {
            const projectId = addBusinessProject({
              title: finalTitle,
              description: finalBody,
              status: "planned",
              agreedAmountMinor: 0,
              currency: (state.prefs as any)?.currency || "MAD",
              progressMethod: "manual",
              progressPercentage: 0,
            });
            destinationRef = {
              type: "business_project",
              id: projectId,
              title: finalTitle,
              createdAt: new Date().toISOString(),
            };
            break;
          }

          case "travel_trip": {
            const tripId = createTravelTrip({
              title: finalTitle,
              primaryCity: finalTitle,
              notes: finalBody,
              status: "wishlist",
              startDate: targetDate || "",
              endDate: targetDate || "",
              travelerCount: 1,
              primaryCurrency: (state.prefs as any)?.currency || "MAD",
              estimatedBudgetMinor: 0,
            });
            destinationRef = {
              type: "travel_trip",
              id: tripId,
              title: finalTitle,
              createdAt: new Date().toISOString(),
            };
            break;
          }

          case "learning_note": {
            const noteId = addLearningNote({
              learningItemId: (state.learningItems?.[0]?.id) || "general",
              title: finalTitle,
              body: finalBody,
              date: targetDate || new Date().toISOString().split("T")[0],
              category: "General",
            });
            destinationRef = {
              type: "learning_note",
              id: noteId,
              title: finalTitle,
              createdAt: new Date().toISOString(),
            };
            break;
          }

          case "someday_wish": {
            const wishId = addSomedayWish({
              title: finalTitle,
              description: finalBody,
              category,
              destinationRefs: [
                {
                  type: "inbox",
                  id: item.id,
                  title: item.title || finalTitle,
                  createdAt: new Date().toISOString(),
                },
              ],
            });
            destinationRef = {
              type: "someday_wish",
              id: wishId,
              title: finalTitle,
              createdAt: new Date().toISOString(),
            };
            break;
          }
        }
      }

      if (destinationRef) {
        organizeBrainDumpItem(item.id, destinationRef, removeInboxCopy);
        onOrganized(item, destinationRef);
        onClose();
      }
    } catch (err) {
      console.error("Organization failed", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    item,
    isSubmitting,
    isLinkingExisting,
    selectedExistingRecord,
    proposedTitle,
    proposedContent,
    destinationType,
    category,
    priority,
    targetDate,
    addTask,
    addGoal,
    addJournal,
    state.journalSettings?.journalLockEnabled,
    state.prefs,
    isAr,
    addBusinessProject,
    createTravelTrip,
    addLearningNote,
    organizeBrainDumpItem,
    removeInboxCopy,
    onOrganized,
    onClose,
  ]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-[#FFF8FA] dark:bg-card border border-pink-200 dark:border-pink-900/60 p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-pink-100 dark:border-pink-900/40">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-900/50 text-[#FF1493]">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2b1727] dark:text-pink-100">
                {t("organizeThoughtTitle")}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {t("organizeThoughtSub")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:text-stone-700 hover:bg-pink-100/60 dark:hover:bg-pink-900/40 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode toggle: Create New vs Link to Existing */}
        <div className="flex rounded-xl bg-pink-100/50 dark:bg-pink-950/40 p-1 border border-pink-200/50">
          <button
            type="button"
            onClick={() => setIsLinkingExisting(false)}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
              !isLinkingExisting
                ? "bg-white dark:bg-card text-[#FF1493] shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isAr ? "إنشاء وجهة جديدة" : "Create New Record"}
          </button>
          <button
            type="button"
            onClick={() => setIsLinkingExisting(true)}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
              isLinkingExisting
                ? "bg-white dark:bg-card text-[#FF1493] shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isAr ? "ربط بسجل موجود" : "Link to Existing"}
          </button>
        </div>

        {/* Potential Duplicates Warning */}
        {potentialDuplicates.length > 0 && !isLinkingExisting && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-800 space-y-1.5 text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle size={14} className="text-amber-600" />
              <span>{isAr ? "سجلات مشابهة موجودة مسبقًا:" : "Possible similar records found:"}</span>
            </div>
            <div className="space-y-1 pl-4">
              {potentialDuplicates.map((dup) => (
                <div key={dup.id} className="flex items-center justify-between text-[11px]">
                  <span className="font-medium line-clamp-1">
                    • {dup.title} ({dup.type})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLinkingExisting(true);
                      setSelectedExistingRecord(dup);
                    }}
                    className="text-[#FF1493] font-bold hover:underline shrink-0 ml-2"
                  >
                    {isAr ? "ربط بهذا السجل" : "Link instead"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linking existing mode */}
        {isLinkingExisting ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-pink-200 mb-1 block">
                {isAr ? "ابحثي عن السجل للربط معه:" : "Search record to link:"}
              </label>
              <input
                type="text"
                value={existingSearchQuery}
                onChange={(e) => setExistingSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحثي في المهام، الأهداف، المشاريع..." : "Search tasks, goals, projects..."}
                className="w-full rounded-xl bg-white dark:bg-stone-900/60 px-3 py-2 text-xs border border-pink-200 dark:border-pink-900 focus:outline-hidden focus:ring-2 focus:ring-[#FF1493]/30"
              />
            </div>

            {selectedExistingRecord && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 text-teal-800 dark:text-teal-200 text-xs">
                <div>
                  <span className="font-bold">{isAr ? "السجل المحدد:" : "Selected Record:"}</span>
                  <p className="font-medium line-clamp-1">{selectedExistingRecord.title}</p>
                </div>
                <CheckCircle size={16} className="text-teal-600" />
              </div>
            )}
          </div>
        ) : (
          /* Create New Destination Fields */
          <div className="space-y-3">
            {/* Destination Grid */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-pink-200 mb-1.5 block">
                {isAr ? "اختاري الوجهة:" : "Select Destination:"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {destinationOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = destinationType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setDestinationType(opt.type)}
                      className={cn(
                        "flex items-start gap-2 p-2.5 rounded-2xl border text-left transition-all cursor-pointer",
                        isSelected
                          ? "bg-white dark:bg-card border-[#FF1493] ring-2 ring-[#FF1493]/20 shadow-xs"
                          : "bg-white/60 dark:bg-stone-900/40 border-pink-200/60 dark:border-pink-900/40 hover:bg-white"
                      )}
                    >
                      <div className={cn("p-1.5 rounded-xl border shrink-0 mt-0.5", opt.color)}>
                        <Icon size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2b1727] dark:text-pink-100">
                          {isAr ? opt.labelAr : opt.labelEn}
                        </div>
                        <div className="text-[10px] text-muted-foreground line-clamp-1">
                          {isAr ? opt.descAr : opt.descEn}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Proposed Title */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-pink-200 mb-1 block">
                {isAr ? "العنوان المقترح:" : "Proposed Title:"}
              </label>
              <input
                type="text"
                value={proposedTitle}
                onChange={(e) => setProposedTitle(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-stone-900/60 px-3 py-2 text-xs font-semibold text-[#2b1727] dark:text-pink-100 border border-pink-200 dark:border-pink-900 focus:outline-hidden focus:ring-2 focus:ring-[#FF1493]/30"
              />
            </div>

            {/* Editable Proposed Content */}
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-pink-200 mb-1 block">
                {isAr ? "التفاصيل والمحتوى:" : "Details / Content:"}
              </label>
              <textarea
                value={proposedContent}
                onChange={(e) => setProposedContent(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-white dark:bg-stone-900/60 p-2.5 text-xs text-[#2b1727] dark:text-pink-100 border border-pink-200 dark:border-pink-900 focus:outline-hidden focus:ring-2 focus:ring-[#FF1493]/30 resize-none"
              />
            </div>

            {/* Optional Date & Priority (if applicable) */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-pink-200 mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{isAr ? "تاريخ (اختياري):" : "Date (optional):"}</span>
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-stone-900/60 px-2.5 py-1.5 text-xs border border-pink-200 dark:border-pink-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-600 dark:text-pink-200 mb-1 block">
                  {isAr ? "الأولوية:" : "Priority:"}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-xl bg-white dark:bg-stone-900/60 px-2.5 py-1.5 text-xs border border-pink-200 dark:border-pink-900 focus:outline-hidden"
                >
                  <option value="low">{isAr ? "منخفضة" : "Low"}</option>
                  <option value="medium">{isAr ? "متوسطة" : "Medium"}</option>
                  <option value="high">{isAr ? "عالية" : "High"}</option>
                </select>
              </div>
            </div>

            {/* Journal PIN Lock Boundary Notice */}
            {destinationType === "journal" && (
              <div className="rounded-2xl bg-pink-50/80 dark:bg-pink-950/40 p-3 border border-pink-200 dark:border-pink-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-pink-800 dark:text-pink-200">
                  <Lock size={13} className="text-[#FF1493]" />
                  <span>{isAr ? "حماية خصوصية المفكرة" : "Journal Privacy Boundary"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t("journalLockNotice")}
                </p>

                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeInboxCopy}
                    onChange={(e) => setRemoveInboxCopy(e.target.checked)}
                    className="rounded text-[#FF1493] focus:ring-[#FF1493] h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-stone-700 dark:text-pink-200">
                    {t("removeInboxCopyAfterJournal")}
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-pink-100 dark:border-pink-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {t("keepInInbox")}
          </button>

          <button
            type="button"
            disabled={isSubmitting || (isLinkingExisting && !selectedExistingRecord)}
            onClick={handleCreateAndOrganize}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer",
              "bg-gradient-to-r from-[#FF2E93] to-[#FF1493] text-white hover:brightness-105 active:scale-97 shadow-pink-500/25"
            )}
          >
            <CheckCircle size={15} />
            <span>
              {isSubmitting
                ? (isAr ? "جارٍ الحفظ والربط..." : "Creating...")
                : (isAr ? "تأكيد والترتيب" : "Confirm & Organize")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
