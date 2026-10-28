import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect, useRef, memo } from "react";
import {
  Plus,
  Search,
  Calendar,
  Lock,
  Unlock,
  Shield,
  Smile,
  Zap,
  Sparkles,
  Heart,
  BookOpen,
  Sun,
  Moon,
  Compass,
  Repeat,
  Tag,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Edit2,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Share2,
  SlidersHorizontal,
  Archive,
  RotateCcw,
  Eye,
  EyeOff,
  Clock,
  MoreVertical,
  HelpCircle,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, PillTag } from "@/components/kit";
import { JournalEditPage } from "@/components/journal/JournalEditPage";
import { JournalCard } from "@/components/journal/JournalCard";
import { PinEntryModal } from "@/components/journal/PinEntryModal";
import { WeeklyResetStudio } from "@/components/journal/reset/WeeklyResetStudio";
import { BarakahJarView } from "@/components/journal/jar/BarakahJarView";
import { WeekInBloomView } from "@/components/journal/bloom/WeekInBloomView";
import { WheelOfBecomingView } from "@/components/journal/wheel/WheelOfBecomingView";
import { FutureMeCapsuleView } from "@/components/journal/capsule/FutureMeCapsuleView";
import {
  useApp,
  type JournalEntry,
  type JournalTemplateId,
  type MoodKey,
  type EnergyLevel,
  type JournalAttachment,
  todayKey,
} from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type JournalSearchParams = {
  tab?: string;
  week?: string;
  month?: string;
};

export const Route = createFileRoute("/journal")({
  validateSearch: (search: Record<string, unknown>): JournalSearchParams => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    week: typeof search.week === "string" ? search.week : undefined,
    month: typeof search.month === "string" ? search.month : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My Journal — AYXA Planner Pro" },
      {
        name: "description",
        content: "A quiet, private writing space for daily reflections, gratitude, and healing.",
      },
    ],
  }),
  component: JournalPage,
});

// Curated Daily Reflection Prompts Library
const DAILY_REFLECTION_PROMPTS = [
  {
    id: "p1",
    textEn: "What is taking up the most space in your heart today?",
    textAr: "ما الذي يشغل أكبر مساحة في قلبك اليوم؟",
  },
  {
    id: "p2",
    textEn: "What is one small blessing you noticed today that made you feel peaceful?",
    textAr: "ما النعمة الصغيرة التي لاحظتها اليوم وأشعرتكِ بالسكينة؟",
  },
  {
    id: "p3",
    textEn:
      "If you could whisper something kind and reassuring to yourself right now, what would it be?",
    textAr: "لو أمكنكِ أن تهمسي لنفسكِ بكلمة لطيفة ومطمئنة الآن، ماذا ستقولين؟",
  },
  {
    id: "p4",
    textEn: "What expectation or pressure can you gently let go of this evening?",
    textAr: "ما التوقع أو الضغط الذي يمكنكِ التخلي عنه برفق هذا المساء؟",
  },
  {
    id: "p5",
    textEn: "What is a moment recently where you felt proud of how you handled yourself?",
    textAr: "ما الموقف الأخير الذي شعرتِ فيه بالفخر بطريقة تعاملكِ مع نفسكِ؟",
  },
  {
    id: "p6",
    textEn:
      "What does your body and mind need most right now: rest, movement, connection, or silence?",
    textAr: "ما أكثر ما يحتاجه جسدكِ وعقلكِ الآن: راحة، حركة، تواصل، أم صمت؟",
  },
  {
    id: "p7",
    textEn: "What is one intention you want to carry with you into tomorrow?",
    textAr: "ما النية الواضحة التي ترغبين في اصطحابها معكِ إلى يوم الغد؟",
  },
];

// Pre-built Guided Journaling Templates
const TEMPLATES: {
  id: JournalTemplateId;
  titleEn: string;
  titleAr: string;
  icon: any;
  descEn: string;
  descAr: string;
  color: string;
  starterEn: string;
  starterAr: string;
}[] = [
  {
    id: "free",
    titleEn: "Free Write",
    titleAr: "كتابة حرة",
    icon: Sparkles,
    descEn: "Empty page to pour your mind and heart freely.",
    descAr: "صفحة نقية لتدوين أفكاركِ ومشاعركِ بكل راحة.",
    color: "from-pink-500/20 to-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-200",
    starterEn: "",
    starterAr: "",
  },
  {
    id: "gratitude",
    titleEn: "3 Graces (Gratitude)",
    titleAr: "امتنان النعم الثلاث",
    icon: Heart,
    descEn: "Notice and honor 3 meaningful blessings today.",
    descAr: "تأمل 3 نعم جميلة لامست قلبكِ بلطف اليوم.",
    color: "from-amber-500/20 to-pink-500/20 text-amber-700 dark:text-amber-300 border-amber-200",
    starterEn:
      "1. Today I am deeply grateful for:\n\n2. A small detail that brought me comfort:\n\n3. Someone whose presence made a difference:\n",
    starterAr:
      "1. ممتنة من أعماق قلبي اليوم لـ:\n\n2. تفصيلة صغيرة وهبتني شعوراً بالسكينة:\n\n3. شخص أحدث فرقاً في يومي:\n",
  },
  {
    id: "morning",
    titleEn: "Morning Intention",
    titleAr: "نية وإشراقة الصباح",
    icon: Sun,
    descEn: "Start your day with clarity, focus, and peace.",
    descAr: "ابدئي يومكِ بصفاء ذهني ونية واعية مطمئنة.",
    color:
      "from-orange-500/20 to-amber-500/20 text-orange-700 dark:text-orange-300 border-orange-200",
    starterEn:
      "• My primary intention for today is:\n\n• What will make today feel meaningful:\n\n• An affirmation I choose to believe today:\n",
    starterAr:
      "• نيتي الواضحة والأساسية لليوم هي:\n\n• ما سيجعل يومي ملهماً ومثمراً:\n\n• توكيد إيجابي أختاره وأصدقه اليوم:\n",
  },
  {
    id: "evening",
    titleEn: "Evening Wind Down",
    titleAr: "تأمل وهدوء المساء",
    icon: Moon,
    descEn: "Unload worries, reflect on wins, and rest gently.",
    descAr: "تفريغ شحنات التوتر، مراجعة الإنجازات، واستقبال النوم بسلام.",
    color:
      "from-indigo-500/20 to-purple-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200",
    starterEn:
      "• What went surprisingly well today:\n\n• Something I choose to release before sleeping:\n\n• A quiet hope for tomorrow:\n",
    starterAr:
      "• أكثر ما سار بشكل جميل وغير متوقع اليوم:\n\n• ثقل أو توتر أقرر التخلي عنه قبل النوم:\n\n• أمنية طيبة أحملها ليوم الغد:\n",
  },
  {
    id: "brain_dump",
    titleEn: "Clarity Brain Dump",
    titleAr: "تفريغ الذهن والوضوح",
    icon: Zap,
    descEn: "Clear mental clutter into organized focus.",
    descAr: "تحويل الفوضى الذهنية إلى خطوات واضحة ومريحة.",
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-200",
    starterEn:
      "• What's currently overwhelming or loud in my thoughts:\n\n• What is actually in my control right now:\n\n• The single next easiest step I can take:\n",
    starterAr:
      "• ما يشغل بالي ويزاحم أفكاري حالياً:\n\n• ما هو تحت سيطرتي الفردية فعلاً الآن:\n\n• أسهل خطوة قادمة أستطيع اتخاذها:\n",
  },
  {
    id: "deen_reflection",
    titleEn: "Deen & Quran Reflection",
    titleAr: "تدبر ونور إيماني",
    icon: BookOpen,
    descEn: "Reflect upon an Ayah, Hadith, or spiritual state.",
    descAr: "تدبر آية كريمة، حديث شريف، أو حالة إيمانية قريبة من الروح.",
    color:
      "from-emerald-500/20 to-teal-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200",
    starterEn:
      "• An Ayah or thought that touched my soul:\n\n• How I can live by this meaning in my daily life:\n\n• A heartfelt Du'a from my heart:\n",
    starterAr:
      "• آية أو معنى إيماني لامس وجداني اليوم:\n\n• كيف أستحضر هذا المعنى في سلوكي ويومي:\n\n• دعاء صادق أرفعه من قلبي:\n",
  },
  {
    id: "self_love",
    titleEn: "Gentle Self-Care & Love",
    titleAr: "رعاية الذات ولطفها",
    icon: Compass,
    descEn: "Practice self-compassion and emotional kindness.",
    descAr: "ممارسة التعاطف مع الذات والحديث اللطيف مع النفس.",
    color: "from-pink-500/20 to-purple-500/20 text-pink-700 dark:text-pink-300 border-pink-200",
    starterEn:
      "• What I need to hear and accept most today:\n\n• A way I will take gentle care of my body and soul today:\n\n• I forgive myself for:\n",
    starterAr:
      "• ما أحتاج لسماعه وقبوله برفق اليوم:\n\n• طريقة لطيفة سأعتني بها بجسدي وروحي اليوم:\n\n• أسامح نفسي بكل حب على:\n",
  },
  {
    id: "barakah_jar",
    titleEn: "Barakah Jar 🤍",
    titleAr: "جرّة النِّعم 🤍",
    icon: Heart,
    descEn: "Little blessings, lovingly remembered.",
    descAr: "نِعَم صغيرة تستحق أن نتذكّرها.",
    color:
      "from-pink-400/20 via-rose-300/20 to-purple-400/20 text-rose-700 dark:text-rose-300 border-rose-300",
    starterEn: "",
    starterAr: "",
  },
  {
    id: "week_in_bloom",
    titleEn: "My Week in Bloom 🌷",
    titleAr: "أسبوعي يزهر 🌷",
    icon: Sparkles,
    descEn: "A few moments worth keeping.",
    descAr: "لحظات من أسبوعكِ تستحق أن تبقى.",
    color:
      "from-rose-400/20 via-pink-300/20 to-purple-400/20 text-pink-700 dark:text-pink-300 border-pink-300",
    starterEn: "",
    starterAr: "",
  },
  {
    id: "weekly",
    titleEn: "Weekly Reset",
    titleAr: "مراجعة الأسبوع",
    icon: Sparkles,
    descEn: "Gentle weekly pause to reflect & reset.",
    descAr: "وقفة هادئة لتراجعي أسبوعكِ وتستعدي للقادم.",
    color:
      "from-pink-500/20 via-purple-500/20 to-amber-500/20 text-purple-700 dark:text-purple-300 border-purple-200",
    starterEn: "",
    starterAr: "",
  },
  {
    id: "wheel_of_becoming",
    titleEn: "Wheel of Becoming 🌸",
    titleAr: "دائرة التوازن 🌸",
    icon: Sparkles,
    descEn: "Notice what needs a little care this month.",
    descAr: "تأمّلي ما يحتاج منكِ بعض الاهتمام هذا الشهر.",
    color:
      "from-rose-400/20 via-pink-300/20 to-purple-400/20 text-rose-700 dark:text-rose-300 border-rose-300",
    starterEn: "",
    starterAr: "",
  },
  {
    id: "future_me",
    titleEn: "Dear Future Me 💌",
    titleAr: "إلى نفسي في المستقبل 💌",
    icon: Mail,
    descEn: "Seal a heartfelt letter to open in the future.",
    descAr: "اكتبي رسالة دافئة واختميها لتُفتح في موعد قادم.",
    color:
      "from-amber-400/20 via-pink-300/20 to-purple-400/20 text-purple-700 dark:text-purple-300 border-amber-300",
    starterEn: "",
    starterAr: "",
  },
];

const MOOD_OPTIONS: { id: MoodKey; emoji: string; labelEn: string; labelAr: string }[] = [
  { id: "ecstatic", emoji: "🥰", labelEn: "Loved & Radiating", labelAr: "حب وامتنان عميق" },
  { id: "happy", emoji: "🌸", labelEn: "Peaceful & Blooming", labelAr: "سكينة وازدهار" },
  { id: "calm", emoji: "✨", labelEn: "Serene & Grounded", labelAr: "هدوء واستقرار" },
  { id: "neutral", emoji: "🍃", labelEn: "Gentle Balance", labelAr: "توازن هادئ" },
  { id: "tired", emoji: "🌙", labelEn: "Needing Soft Rest", labelAr: "حاجة للراحة والهدوء" },
  { id: "anxious", emoji: "🌧️", labelEn: "Heavy / Overthinking", labelAr: "ثقل وتفكير زائد" },
  { id: "sad", emoji: "🕊️", labelEn: "Healing & Tender", labelAr: "تعافٍ ورقة مشاعر" },
];

const STICKERS = ["🌸", "✨", "🤍", "🌙", "🕊️", "☕", "📖", "🌷", "🌿", "🦋", "🕯️", "🎀"];

function formatJournalEntriesCount(count: number, isAr: boolean): string {
  if (isAr) {
    if (count === 0) return "لا توجد تدوينات";
    if (count === 1) return "تدوينة واحدة";
    if (count === 2) return "تدوينتان";
    if (count >= 3 && count <= 10) return `${count} تدوينات`;
    return `${count} تدوينة`;
  }
  if (count === 0) return "No entries";
  if (count === 1) return "1 entry";
  return `${count} entries`;
}

function JournalPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const activeMainTab =
    search.tab === "reset"
      ? "reset"
      : search.tab === "jar"
        ? "jar"
        : search.tab === "bloom"
          ? "bloom"
          : search.tab === "wheel"
            ? "wheel"
            : search.tab === "capsule"
              ? "capsule"
              : "journal";
  const {
    state,
    addJournal,
    editJournal,
    removeJournal,
    toggleJournalLock,
    setDailyMood,
    updateJournalSettings,
    addXP,
  } = useApp();

  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const todayStr = todayKey();

  // Search & Filter State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterMood, setFilterMood] = useState<string>("All");
  const [filterTemplate, setFilterTemplate] = useState<string>("All");
  const [filterArchived, setFilterArchived] = useState(false);

  // Calendar Date View State
  const [calendarView, setCalendarView] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayStr);

  // Daily prompt rotation
  const [promptIndex, setPromptIndex] = useState(() => {
    const d = new Date();
    return (d.getDate() + d.getMonth()) % DAILY_REFLECTION_PROMPTS.length;
  });

  // PIN / Privacy Lock State
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [pinEntryModalOpen, setPinEntryModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [unlockedJournal, setUnlockedJournal] = useState(false);
  const [unlockedEntryIds, setUnlockedEntryIds] = useState<Set<string>>(new Set());
  const [pendingOpenEntry, setPendingOpenEntry] = useState<JournalEntry | null>(null);

  // Editor Open State (Isolated to prevent typing lag)
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editorTemplate, setEditorTemplate] = useState<JournalTemplateId>("free");
  const [editorPrompt, setEditorPrompt] = useState("");

  // Menu Dropdown State
  const [menuEntryId, setMenuEntryId] = useState<string | null>(null);

  // Auto focus search
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Scroll active tab into view smoothly
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeMainTab]);

  // Close menus on outside click (only active when a menu is open)
  useEffect(() => {
    if (!menuEntryId) return;
    const handleGlobalClick = () => setMenuEntryId(null);
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [menuEntryId]);

  // Back button dismiss handler
  useEffect(() => {
    if (editorOpen || privacyModalOpen || pinEntryModalOpen || filterOpen) {
      (window as any).__onBackOverlayDismiss = () => {
        if (pinEntryModalOpen) {
          setPinEntryModalOpen(false);
          return true;
        }
        if (privacyModalOpen) {
          setPrivacyModalOpen(false);
          return true;
        }
        if (filterOpen) {
          setFilterOpen(false);
          return true;
        }
        if (editorOpen) {
          setEditorOpen(false);
          setEditingEntry(null);
          return true;
        }
        return false;
      };
    } else {
      (window as any).__onBackOverlayDismiss = null;
    }

    return () => {
      (window as any).__onBackOverlayDismiss = null;
    };
  }, [editorOpen, privacyModalOpen, pinEntryModalOpen, filterOpen]);

  // Daily Mood record for today
  const todayMoodRecord = state.dailyMoods?.[todayStr];
  const activeMoodKey: MoodKey | null = todayMoodRecord?.mood || null;
  const activeEnergy: EnergyLevel = todayMoodRecord?.energy || "medium";

  // Cycle daily prompts
  const currentPrompt = DAILY_REFLECTION_PROMPTS[promptIndex];
  const handleShufflePrompt = () => {
    setPromptIndex((prev) => (prev + 1) % DAILY_REFLECTION_PROMPTS.length);
  };

  // Open Editor with optional template or prompt
  const handleOpenEditor = (
    entryToEdit?: JournalEntry,
    template?: JournalTemplateId,
    prompt?: string,
  ) => {
    if (entryToEdit) {
      if (
        entryToEdit.locked &&
        !unlockedEntryIds.has(entryToEdit.id) &&
        state.journalSettings?.pin
      ) {
        setPendingOpenEntry(entryToEdit);
        setPinInput("");
        setPinError("");
        setPinEntryModalOpen(true);
        return;
      }
      setEditingEntry(entryToEdit);
      setEditorTemplate(entryToEdit.templateId || "free");
      setEditorPrompt(entryToEdit.promptText || "");
    } else {
      setEditingEntry(null);
      setEditorTemplate(template || "free");
      setEditorPrompt(prompt || "");
    }
    setEditorOpen(true);
  };

  // Unlock PIN submission
  const handleVerifyPin = () => {
    if (pinInput === state.journalSettings?.pin) {
      if (pendingOpenEntry) {
        setUnlockedEntryIds((prev) => new Set(prev).add(pendingOpenEntry.id));
        setEditingEntry(pendingOpenEntry);
        setEditorTemplate(pendingOpenEntry.templateId || "free");
        setEditorPrompt(pendingOpenEntry.promptText || "");
        setEditorOpen(true);
        setPendingOpenEntry(null);
      } else {
        setUnlockedJournal(true);
      }
      setPinEntryModalOpen(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError(isAr ? "رمز PIN غير صحيح، حاولي مجدداً" : "Incorrect PIN, please try again.");
    }
  };

  // Filter and Sort Entries
  const filteredEntries = useMemo(() => {
    return (state.journal || []).filter((j) => {
      // Archive filter
      if (!filterArchived && j.archived) return false;
      if (filterArchived && !j.archived) return false;

      // Calendar view filter
      if (calendarView && j.date !== selectedCalendarDate) return false;

      // Mood filter
      if (filterMood !== "All" && j.mood !== filterMood) return false;

      // Template filter
      if (filterTemplate !== "All" && j.templateId !== filterTemplate) {
        return false;
      }

      // Search query filter (only search body if unlocked or unhidden)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (j.title || "").toLowerCase().includes(q);
        const matchTag = (j.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchPrompt = (j.promptText || "").toLowerCase().includes(q);
        const matchBody = !j.locked ? (j.body || "").toLowerCase().includes(q) : false;
        if (!matchTitle && !matchTag && !matchPrompt && !matchBody) {
          return false;
        }
      }

      return true;
    });
  }, [
    state.journal,
    filterArchived,
    calendarView,
    selectedCalendarDate,
    filterMood,
    filterTemplate,
    searchQuery,
  ]);

  // ════════════════════════════════════════════════════════════════════════════
  // ── RENDER ROOT (SINGLE SHELL FOR INSTANT RESPONSIVE BACK NAVIGATION) ──────
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <MobileShell>
      {editorOpen ? (
        <JournalEditPage
          entry={editingEntry}
          defaultTemplate={editorTemplate}
          defaultPrompt={editorPrompt}
          todayMoodRecord={todayMoodRecord}
          isAr={isAr}
          onSave={(payload) => {
            if (editingEntry) {
              editJournal(editingEntry.id, payload);
            } else {
              addJournal(payload as any);
            }
            setEditorOpen(false);
            setEditingEntry(null);
          }}
          onCancel={() => {
            setEditorOpen(false);
            setEditingEntry(null);
          }}
          setDailyMood={setDailyMood}
        />
      ) : (
        <Screen className="journal-page pb-32 sm:pb-36 min-h-screen bg-canvas text-ink font-sans">
          {/* Top Header: Title, Subtitle, Search, Calendar, Lock & + Write */}
          <header className="sticky top-0 z-30 bg-card border-b border-border/60 px-4 pt-4 pb-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[20px] font-black text-ink tracking-tight flex items-center gap-1.5">
                    <span>{isAr ? "يومياتي وتأملاتي ✨" : "My Journal ✨"}</span>
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Lock size={10} className="stroke-[2.5]" />
                    <span>{isAr ? "خاص ومحمي 🔒" : "Private & Protected 🔒"}</span>
                  </span>
                </div>
                <p className="text-[12px] font-semibold text-ink-light mt-0.5 leading-snug">
                  {isAr
                    ? "مساحتكِ الهادئة والآمنة للتدوين والتأمل والامتنان اليومي 🌸"
                    : "Your private, quiet space for daily reflections & gratitude 🌸"}
                </p>
              </div>

              {/* Quick Actions in Header */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSearchOpen((prev) => !prev)}
                  className={cn(
                    "cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-95",
                    searchOpen || searchQuery
                      ? "bg-hotpink/10 border-hotpink text-hotpink"
                      : "bg-surface border-border/80 text-ink-light",
                  )}
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setCalendarView((prev) => !prev)}
                  className={cn(
                    "cursor-pointer flex h-9 w-9 items-center justify-center rounded-full border transition-all active:scale-95",
                    calendarView
                      ? "bg-purple-500/15 border-purple-500 text-purple-600"
                      : "bg-surface border-border/80 text-ink-light",
                  )}
                  aria-label="Calendar view"
                >
                  <Calendar size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacyModalOpen(true)}
                  className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border/80 text-ink-light hover:text-ink active:scale-95 transition-all"
                  aria-label="Privacy Lock"
                >
                  {state.journalSettings?.pin ? (
                    <Lock size={16} className="text-amber-500" />
                  ) : (
                    <Shield size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            {searchOpen && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl border border-hotpink/40 bg-surface px-3 py-2 animate-rise">
                <Search size={16} className="text-hotpink shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? "ابحثي في كلمات يومياتكِ..." : "Search your reflections..."}
                  autoComplete="off"
                  dir="auto"
                  className="w-full bg-transparent text-xs font-bold text-ink outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="cursor-pointer text-ink-light hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Main Tabs Switcher: Horizontally scrollable strip */}
            <div className="relative mt-3 max-w-md mx-auto">
              {/* Subtle edge fade scroll indicators */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 start-0 w-3 bg-gradient-to-r from-card to-transparent z-10 opacity-70"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 end-0 w-3 bg-gradient-to-l from-card to-transparent z-10 opacity-70"
              />

              <div
                ref={tabsContainerRef}
                className="flex items-center gap-1.5 bg-surface/90 p-1 rounded-2xl border border-border/70 overflow-x-auto no-scrollbar scroll-smooth"
                role="tablist"
                aria-label={isAr ? "أقسام اليوميات" : "Journal Sections"}
              >
                {/* Journal Tab */}
                <button
                  ref={activeMainTab === "journal" ? activeTabRef : null}
                  type="button"
                  role="tab"
                  aria-selected={activeMainTab === "journal"}
                  onClick={() => navigate({ to: "/journal", search: {} })}
                  className={cn(
                    "cursor-pointer shrink-0 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hotpink",
                    activeMainTab === "journal"
                      ? "bg-hotpink text-white shadow-rose-xs"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  <BookOpen size={14} aria-hidden="true" />
                  <span>{isAr ? "اليوميات" : "Journal"}</span>
                </button>

                {/* Barakah Jar Tab */}
                <button
                  ref={activeMainTab === "jar" ? activeTabRef : null}
                  type="button"
                  role="tab"
                  aria-selected={activeMainTab === "jar"}
                  onClick={() => navigate({ to: "/journal", search: { tab: "jar" } })}
                  className={cn(
                    "cursor-pointer shrink-0 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hotpink",
                    activeMainTab === "jar"
                      ? "bg-hotpink text-white shadow-rose-xs"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  <Heart size={14} aria-hidden="true" />
                  <span>{isAr ? "جرّة النِّعم" : "Barakah Jar"}</span>
                </button>

                {/* Week in Bloom Tab */}
                <button
                  ref={activeMainTab === "bloom" ? activeTabRef : null}
                  type="button"
                  role="tab"
                  aria-selected={activeMainTab === "bloom"}
                  onClick={() => navigate({ to: "/journal", search: { tab: "bloom" } })}
                  className={cn(
                    "cursor-pointer shrink-0 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hotpink",
                    activeMainTab === "bloom"
                      ? "bg-hotpink text-white shadow-rose-xs"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{isAr ? "أسبوعي يزهر" : "Week in Bloom"}</span>
                </button>

                {/* Weekly Reset Tab */}
                <button
                  ref={activeMainTab === "reset" ? activeTabRef : null}
                  type="button"
                  role="tab"
                  aria-selected={activeMainTab === "reset"}
                  onClick={() => navigate({ to: "/journal", search: { tab: "reset" } })}
                  className={cn(
                    "cursor-pointer shrink-0 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hotpink",
                    activeMainTab === "reset"
                      ? "bg-hotpink text-white shadow-rose-xs"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  <Repeat size={14} aria-hidden="true" />
                  <span>{isAr ? "مراجعة الأسبوع" : "Weekly Reset"}</span>
                </button>

                {/* Wheel of Becoming Tab */}
                <button
                  ref={activeMainTab === "wheel" ? activeTabRef : null}
                  type="button"
                  role="tab"
                  aria-selected={activeMainTab === "wheel"}
                  onClick={() => navigate({ to: "/journal", search: { tab: "wheel" } })}
                  className={cn(
                    "cursor-pointer shrink-0 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hotpink",
                    activeMainTab === "wheel"
                      ? "bg-hotpink text-white shadow-rose-xs"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  <Sun size={14} aria-hidden="true" />
                  <span>{isAr ? "دائرة التوازن" : "Wheel of Becoming"}</span>
                </button>

                {/* Time Capsule Tab */}
                <button
                  ref={activeMainTab === "capsule" ? activeTabRef : null}
                  type="button"
                  role="tab"
                  aria-selected={activeMainTab === "capsule"}
                  onClick={() => navigate({ to: "/journal", search: { tab: "capsule" } })}
                  className={cn(
                    "cursor-pointer shrink-0 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hotpink",
                    activeMainTab === "capsule"
                      ? "bg-hotpink text-white shadow-rose-xs"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  <Mail size={14} aria-hidden="true" />
                  <span>{isAr ? "رسائل المستقبل" : "Time Capsule"}</span>
                </button>
              </div>
            </div>
          </header>

          {activeMainTab === "reset" ? (
            <div className="px-4 py-4">
              {state.journalSettings?.pin && !unlockedJournal ? (
                <div className="rounded-3xl border border-pink-200/80 dark:border-pink-900/50 bg-card p-8 text-center space-y-4 shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <Lock size={26} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-ink">
                      {isAr
                        ? "مساحة مراجعة الأسبوع محمية برمز PIN 🔒"
                        : "Weekly Reset Studio is Protected 🔒"}
                    </h3>
                    <p className="text-xs text-ink-light max-w-xs mx-auto">
                      {isAr
                        ? "أدخلي رمز PIN الخاص بدفتر اليوميات لعرض وتعديل مراجعات وتأملات الأسبوع."
                        : "Please enter your Journal PIN to access your gentle weekly reflections."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingOpenEntry(null);
                      setPinInput("");
                      setPinError("");
                      setPinEntryModalOpen(true);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm active:scale-95"
                  >
                    <Unlock size={14} />
                    <span>{isAr ? "إلغاء القفل برمز PIN" : "Unlock with PIN"}</span>
                  </button>
                </div>
              ) : (
                <WeeklyResetStudio
                  initialWeekStartDate={search.week}
                  onExit={() => navigate({ to: "/journal", search: {} })}
                  onOpenJournalEntry={(entryId) => {
                    const found = state.journal.find((j) => j.id === entryId);
                    if (found) {
                      handleOpenEditor(found);
                    }
                  }}
                />
              )}
            </div>
          ) : activeMainTab === "jar" ? (
            <div className="px-4 py-4">
              {state.journalSettings?.pin && !unlockedJournal ? (
                <div className="rounded-3xl border border-pink-200/80 dark:border-pink-900/50 bg-card p-8 text-center space-y-4 shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <Lock size={26} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-ink">
                      {isAr ? "جرّة النِّعم محمية برمز PIN 🔒" : "Barakah Jar is Protected 🔒"}
                    </h3>
                    <p className="text-xs text-ink-light max-w-xs mx-auto">
                      {isAr
                        ? "أدخلي رمز PIN الخاص بدفتر اليوميات لعرض نعمكِ الخاصة والاطلاع على الجرّة."
                        : "Please enter your Journal PIN to access your private blessings jar."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingOpenEntry(null);
                      setPinInput("");
                      setPinError("");
                      setPinEntryModalOpen(true);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm active:scale-95"
                  >
                    <Unlock size={14} />
                    <span>{isAr ? "إلغاء القفل برمز PIN" : "Unlock with PIN"}</span>
                  </button>
                </div>
              ) : (
                <BarakahJarView
                  onReturnToJournal={() => navigate({ to: "/journal", search: {} })}
                />
              )}
            </div>
          ) : activeMainTab === "bloom" ? (
            <div className="px-4 py-4">
              {state.journalSettings?.pin && !unlockedJournal ? (
                <div className="rounded-3xl border border-pink-200/80 dark:border-pink-900/50 bg-card p-8 text-center space-y-4 shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <Lock size={26} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-ink">
                      {isAr
                        ? "تذكار أسبوعي يزهر محمي برمز PIN 🔒"
                        : "My Week in Bloom is Protected 🔒"}
                    </h3>
                    <p className="text-xs text-ink-light max-w-xs mx-auto">
                      {isAr
                        ? "أدخلي رمز PIN الخاص بدفتر اليوميات لعرض وتعديل تذكارات أسبوعكِ الجميلة."
                        : "Please enter your Journal PIN to access your gentle weekly keepsakes."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingOpenEntry(null);
                      setPinInput("");
                      setPinError("");
                      setPinEntryModalOpen(true);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm active:scale-95"
                  >
                    <Unlock size={14} />
                    <span>{isAr ? "إلغاء القفل برمز PIN" : "Unlock with PIN"}</span>
                  </button>
                </div>
              ) : (
                <WeekInBloomView
                  initialWeekStartDate={search.week}
                  onExit={() => navigate({ to: "/journal", search: {} })}
                  onOpenJournalEntry={(entryId) => {
                    const found = state.journal.find((j) => j.id === entryId);
                    if (found) {
                      handleOpenEditor(found);
                    }
                  }}
                />
              )}
            </div>
          ) : activeMainTab === "wheel" ? (
            <div className="px-4 py-4">
              {state.journalSettings?.pin && !unlockedJournal ? (
                <div className="rounded-3xl border border-pink-200/80 dark:border-pink-900/50 bg-card p-8 text-center space-y-4 shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <Lock size={26} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-ink">
                      {isAr
                        ? "دائرة التوازن محمية برمز PIN 🔒"
                        : "Wheel of Becoming is Protected 🔒"}
                    </h3>
                    <p className="text-xs text-ink-light max-w-xs mx-auto">
                      {isAr
                        ? "أدخلي رمز PIN الخاص بدفتر اليوميات لعرض وتعديل تأملات دائرة التوازن الشهرية."
                        : "Please enter your Journal PIN to access your private monthly Wheel of Becoming reflections."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingOpenEntry(null);
                      setPinInput("");
                      setPinError("");
                      setPinEntryModalOpen(true);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm active:scale-95"
                  >
                    <Unlock size={14} />
                    <span>{isAr ? "إلغاء القفل برمز PIN" : "Unlock with PIN"}</span>
                  </button>
                </div>
              ) : (
                <WheelOfBecomingView
                  initialMonth={search.month}
                  onExit={() => navigate({ to: "/journal", search: {} })}
                  onOpenGoal={(goalId) => navigate({ to: "/goals", search: { goalId } as any })}
                />
              )}
            </div>
          ) : activeMainTab === "capsule" ? (
            <div className="px-4 py-4">
              {state.journalSettings?.pin && !unlockedJournal ? (
                <div className="rounded-3xl border border-pink-200/80 dark:border-pink-900/50 bg-card p-8 text-center space-y-4 shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <Lock size={26} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-ink">
                      {isAr
                        ? "كبسولة رسائل المستقبل محمية برمز PIN 🔒"
                        : "Future Me Time Capsule is Protected 🔒"}
                    </h3>
                    <p className="text-xs text-ink-light max-w-xs mx-auto">
                      {isAr
                        ? "أدخلي رمز PIN الخاص بدفتر اليوميات لعرض وكتابة رسائل كبسولة المستقبل الخاصة."
                        : "Please enter your Journal PIN to access your private Future Me time capsules."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingOpenEntry(null);
                      setPinInput("");
                      setPinError("");
                      setPinEntryModalOpen(true);
                    }}
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-sm active:scale-95"
                  >
                    <Unlock size={14} />
                    <span>{isAr ? "إلغاء القفل برمز PIN" : "Unlock with PIN"}</span>
                  </button>
                </div>
              ) : (
                <FutureMeCapsuleView
                  isAr={isAr}
                  onOpenJournalEditorWithReply={(capsuleId, title) => {
                    handleOpenEditor(
                      undefined,
                      "free",
                      isAr
                        ? `رد على كبسولتي الزمنية: ${title}\n\n`
                        : `Reply to my Time Capsule: ${title}\n\n`,
                    );
                  }}
                />
              )}
            </div>
          ) : (
            <div className="px-4 py-4 space-y-5">
              {/* SECTION 1: DAILY INSPIRATION & MOOD CHECK-IN */}
              <div className="rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-amber-500/10 border border-pink-500/20 p-4 shadow-card space-y-3.5">
                {/* Daily Prompt Carousel Card */}
                <div className="bg-card/90 rounded-2xl p-3.5 border border-pink-200/60 dark:border-pink-900/40 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-black text-hotpink uppercase tracking-wider">
                      <Sparkles size={14} />
                      {isAr ? "تأمل اليوم الملهم" : "Daily Reflection Prompt"}
                    </span>
                    <button
                      type="button"
                      onClick={handleShufflePrompt}
                      className="cursor-pointer text-[11px] font-extrabold text-ink-light hover:text-hotpink flex items-center gap-1"
                    >
                      <Repeat size={12} />
                      <span>{isAr ? "سؤال آخر" : "Shuffle"}</span>
                    </button>
                  </div>
                  <p className="text-sm font-extrabold text-ink leading-relaxed">
                    "{isAr ? currentPrompt.textAr : currentPrompt.textEn}"
                  </p>
                  <div className="mt-2.5 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenEditor(
                          undefined,
                          "free",
                          isAr ? currentPrompt.textAr : currentPrompt.textEn,
                        )
                      }
                      className="cursor-pointer flex items-center gap-1.5 rounded-full grad-theme text-white px-3 py-1 text-xs font-extrabold shadow-rose-sm hover:brightness-105 active:scale-95 transition-all"
                    >
                      <Edit2 size={12} />
                      <span>{isAr ? "إجابة وتدوين" : "Reflect on this"}</span>
                    </button>
                  </div>
                </div>

                {/* Quick Mood & Energy Logger for Today */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-ink-light">
                    <span>{isAr ? "كيف تشعرين اليوم؟ 🌸" : "How does your soul feel today?"}</span>
                    {activeMoodKey ? (
                      (() => {
                        const activeMoodObj =
                          MOOD_OPTIONS.find((m) => m.id === activeMoodKey) || MOOD_OPTIONS[1];
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-hotpink/10 text-hotpink border border-hotpink/20">
                            <span>{activeMoodObj.emoji}</span>
                            <span>{isAr ? activeMoodObj.labelAr : activeMoodObj.labelEn}</span>
                          </span>
                        );
                      })()
                    ) : (
                      <span className="text-[11px] font-semibold text-ink-light/80">
                        {isAr ? "اختاري شعوركِ اليوم 🌸" : "Select today's mood 🌸"}
                      </span>
                    )}
                  </div>

                  {/* Mood Emoji Pills */}
                  <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
                    {MOOD_OPTIONS.map((m) => {
                      const active = Boolean(activeMoodKey && activeMoodKey === m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setDailyMood(todayStr, m.id as any, activeEnergy, "journal");
                          }}
                          title={isAr ? m.labelAr : m.labelEn}
                          className={cn(
                            "cursor-pointer flex flex-col items-center justify-center h-12 w-12 rounded-2xl border transition-all active:scale-90",
                            active
                              ? "bg-hotpink/15 border-hotpink shadow-rose-sm scale-105"
                              : "bg-surface border-border/60 hover:border-hotpink/40",
                          )}
                        >
                          <span className="text-xl leading-none">{m.emoji}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Energy Level Selector (Low / Medium / High) */}
                  <div className="flex items-center justify-between pt-2 border-t border-pink-500/15">
                    <span className="text-xs font-bold text-ink-light flex items-center gap-1">
                      <Zap size={13} className="text-amber-500" />
                      <span>{isAr ? "مستوى الطاقة والنشاط:" : "Energy Level:"}</span>
                    </span>
                    <div className="flex items-center gap-1.5 bg-surface/90 p-1 rounded-2xl border border-border/70">
                      {(
                        [
                          { id: "low", labelEn: "Low 🪫", labelAr: "منخفضة 🪫" },
                          { id: "medium", labelEn: "Medium ⚡", labelAr: "متوسطة ⚡" },
                          { id: "high", labelEn: "High 🚀", labelAr: "عالية 🚀" },
                        ] as const
                      ).map((lvl) => {
                        const active = activeEnergy === lvl.id;
                        return (
                          <button
                            key={lvl.id}
                            type="button"
                            onClick={() => {
                              const moodToSave = activeMoodKey || "happy";
                              setDailyMood(
                                todayStr,
                                moodToSave as any,
                                lvl.id as EnergyLevel,
                                "journal",
                              );
                            }}
                            className={cn(
                              "cursor-pointer px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all",
                              active
                                ? "bg-hotpink text-white shadow-rose-xs scale-105"
                                : "text-ink-light hover:text-ink",
                            )}
                          >
                            {isAr ? lvl.labelAr : lvl.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: GUIDED WRITING TEMPLATES */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-black uppercase tracking-wider text-ink-light flex items-center gap-1.5">
                    <BookOpen size={14} className="text-purple-500" />
                    <span>{isAr ? "قوالب التدوين الموجه 📖" : "Guided Writing Templates"}</span>
                  </h2>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {TEMPLATES.map((tmpl) => {
                    const Icon = tmpl.icon;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          if (tmpl.id === "weekly") {
                            navigate({ to: "/journal", search: { tab: "reset" } });
                          } else if (tmpl.id === "barakah_jar") {
                            navigate({ to: "/journal", search: { tab: "jar" } });
                          } else if (tmpl.id === "week_in_bloom") {
                            navigate({ to: "/journal", search: { tab: "bloom" } });
                          } else if (tmpl.id === "wheel_of_becoming") {
                            navigate({ to: "/journal", search: { tab: "wheel" } });
                          } else if (tmpl.id === "future_me") {
                            navigate({ to: "/journal", search: { tab: "capsule" } });
                          } else {
                            handleOpenEditor(undefined, tmpl.id);
                          }
                        }}
                        className={cn(
                          "cursor-pointer shrink-0 w-[150px] rounded-3xl p-3.5 border bg-gradient-to-br transition-all text-start flex flex-col justify-between h-[125px] active:scale-95 shadow-xs hover:shadow-rose-sm",
                          tmpl.color,
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 dark:bg-card/70 shadow-xs">
                            <Icon size={15} />
                          </div>
                          <Plus size={14} className="opacity-70" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black leading-snug">
                            {isAr ? tmpl.titleAr : tmpl.titleEn}
                          </h3>
                          <p className="text-[9.5px] font-bold opacity-80 line-clamp-1 mt-0.5">
                            {isAr ? tmpl.descAr : tmpl.descEn}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: ENTRIES STREAM */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1 text-xs font-bold text-ink-light">
                  <span>{isAr ? "سجل التدوينات" : "Journal Entries"}</span>
                  <span>{formatJournalEntriesCount(filteredEntries.length, isAr)}</span>
                </div>

                {filteredEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 py-10 px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hotpink/10 text-hotpink mb-2">
                      <Heart size={22} />
                    </div>
                    <p className="text-sm font-extrabold text-ink">
                      {isAr
                        ? "صفحاتكِ نقية وتنتظر أفكاركِ 🌸"
                        : "Your journal is waiting for your thoughts 🌸"}
                    </p>
                    <p className="text-xs font-semibold text-ink-light mt-1 max-w-[240px]">
                      {isAr
                        ? "ابدئي أول تدوينة اليوم وعبري عما يجول في خاطركِ بكل طمأنينة."
                        : "Write your first entry today and let your thoughts breathe peacefully."}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenEditor()}
                      className="cursor-pointer mt-4 flex items-center gap-1.5 rounded-full grad-theme text-white px-5 py-2.5 text-xs font-extrabold shadow-rose-md hover:brightness-110 active:scale-95 transition-all"
                    >
                      <Plus size={16} className="stroke-[3]" />
                      <span>{isAr ? "كتابة تدوينة جديدة ✨" : "Write a new entry ✨"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEntries.map((entry) => {
                      const isLocked =
                        entry.locked &&
                        !unlockedEntryIds.has(entry.id) &&
                        Boolean(state.journalSettings?.pin);
                      const isMenuOpen = menuEntryId === entry.id;

                      return (
                        <div
                          key={entry.id}
                          onClick={() => handleOpenEditor(entry)}
                          className={cn(
                            "group relative rounded-3xl bg-card border p-4 shadow-card hover:shadow-rose-sm transition-all cursor-pointer active:scale-[0.99]",
                            entry.archived ? "opacity-60 border-border/50" : "border-border/80",
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl leading-none">{entry.mood || "🌸"}</span>
                              <div>
                                <span className="text-[11px] font-black text-ink-light">
                                  {entry.date}
                                </span>
                                {entry.time && (
                                  <span className="text-[10px] text-ink-light/70 ml-1">
                                    • {entry.time}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {entry.sticker && <span className="text-base">{entry.sticker}</span>}
                              {entry.locked && (
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                                  <Lock size={12} />
                                </span>
                              )}

                              {/* Menu dropdown */}
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuEntryId(isMenuOpen ? null : entry.id);
                                  }}
                                  className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-light hover:text-ink active:scale-90 transition-all"
                                >
                                  <MoreVertical size={14} />
                                </button>

                                {isMenuOpen && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 rtl:right-auto rtl:left-0 top-8 z-40 w-40 rounded-2xl bg-card border border-border p-1.5 shadow-xl animate-rise space-y-1"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMenuEntryId(null);
                                        handleOpenEditor(entry);
                                      }}
                                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-ink hover:bg-surface text-start"
                                    >
                                      <Edit2 size={13} className="text-hotpink" />
                                      <span>{isAr ? "تعديل التدوينة" : "Edit entry"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMenuEntryId(null);
                                        toggleJournalLock(entry.id);
                                      }}
                                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-ink hover:bg-surface text-start"
                                    >
                                      {entry.locked ? (
                                        <Unlock size={13} className="text-amber-500" />
                                      ) : (
                                        <Lock size={13} className="text-amber-500" />
                                      )}
                                      <span>
                                        {entry.locked
                                          ? isAr
                                            ? "إلغاء القفل"
                                            : "Unlock"
                                          : isAr
                                            ? "قفل التدوينة"
                                            : "Lock"}
                                      </span>
                                    </button>
                                    <div className="border-t border-border/60 my-1" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setMenuEntryId(null);
                                        removeJournal(entry.id);
                                      }}
                                      className="cursor-pointer flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 text-start"
                                    >
                                      <Trash2 size={13} />
                                      <span>{isAr ? "حذف التدوينة" : "Delete"}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div className="mt-2.5">
                            {entry.title && (
                              <h3 className="text-sm font-extrabold text-ink mb-1 line-clamp-1">
                                {entry.title}
                              </h3>
                            )}

                            {isLocked ? (
                              <div className="flex items-center gap-2 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-2xl px-3 border border-amber-200">
                                <Lock size={14} />
                                <span>
                                  {isAr
                                    ? "تدوينة مقفولة ومحمية بـ PIN 🔒 (انقري للفتح)"
                                    : "Locked private reflection 🔒 (Tap to unlock)"}
                                </span>
                              </div>
                            ) : (
                              <p className="text-xs font-medium text-ink-light leading-relaxed line-clamp-3">
                                {entry.body || (isAr ? "تدوينة بدون نص..." : "Empty entry...")}
                              </p>
                            )}
                          </div>

                          {/* Footer Meta: Tags, Attachments, Word Count */}
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[10px] font-bold text-ink-light">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {entry.templateId && entry.templateId !== "free" && (
                                <span className="bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                  {TEMPLATES.find((t) => t.id === entry.templateId)?.titleAr ||
                                    entry.templateId}
                                </span>
                              )}
                              {entry.attachments && entry.attachments.length > 0 && (
                                <span className="flex items-center gap-1 bg-surface px-2 py-0.5 rounded-full border border-border/60">
                                  <ImageIcon size={10} />
                                  <span>{entry.attachments.length}</span>
                                </span>
                              )}
                            </div>

                            {entry.wordCount !== undefined && entry.wordCount > 0 && !isLocked && (
                              <span>
                                {entry.wordCount} {isAr ? "كلمة" : "words"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PRIVACY / PIN SETTINGS MODAL ─────────────────────────────── */}
          {privacyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-rise">
              <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-amber-500" />
                    <h2 className="text-sm font-extrabold text-ink">
                      {isAr ? "إعدادات خصوصية اليوميات 🔒" : "Journal Privacy & PIN 🔒"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrivacyModalOpen(false)}
                    className="cursor-pointer text-ink-light hover:text-ink"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-ink-light">
                    {isAr
                      ? "يمكنكِ تعيين رمز PIN لحماية تدويناتكِ الحساسة ومنع فتحها إلا بإدخال الرمز."
                      : "Set a 4-digit PIN to lock your private journal entries securely."}
                  </p>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-ink-light">
                      {isAr ? "رمز PIN (4 أرقام):" : "PIN Code (4 digits):"}
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      value={state.journalSettings?.pin || ""}
                      onChange={(e) => updateJournalSettings({ pin: e.target.value })}
                      placeholder="••••"
                      autoComplete="off"
                      className="w-full text-center text-xl font-mono tracking-widest rounded-2xl border border-border bg-surface px-4 py-3 text-ink outline-none focus:border-hotpink"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {state.journalSettings?.pin && (
                    <button
                      type="button"
                      onClick={() => {
                        updateJournalSettings({ pin: undefined });
                        setPrivacyModalOpen(false);
                      }}
                      className="cursor-pointer py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                    >
                      {isAr ? "إلغاء الرمز" : "Remove PIN"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPrivacyModalOpen(false)}
                    className="cursor-pointer flex-1 py-2.5 rounded-xl grad-theme text-white text-xs font-bold shadow-rose-md"
                  >
                    {isAr ? "حفظ وإغلاق" : "Save & Close"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pin Entry Modal */}
          <PinEntryModal
            isOpen={pinEntryModalOpen}
            pendingEntry={pendingOpenEntry}
            pinInput={pinInput}
            setPinInput={setPinInput}
            pinError={pinError}
            isAr={isAr}
            onVerify={handleVerifyPin}
            onCancel={() => {
              setPinEntryModalOpen(false);
              setPendingOpenEntry(null);
              setPinInput("");
            }}
          />
        </Screen>
      )}
    </MobileShell>
  );
}
