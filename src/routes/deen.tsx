import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Moon,
  Sun,
  CheckCircle2,
  Circle,
  RotateCcw,
  ChevronRight,
  Plus,
  Heart,
  Calendar,
  Check,
  Clock,
  Bookmark,
  Shield,
  Search,
  HandHeart,
  Compass,
  ArrowLeft,
  ArrowRight,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Vibrate,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Share2,
  Copy,
  ExternalLink,
  Info
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, GlassCard, SectionHeader, PillTag, ProgressBar } from "@/components/kit";
import { DhikrReaderModal } from "@/components/DhikrReaderModal";
import { FULL_ATHKAR_COLLECTION, DhikrItem } from "@/lib/athkarData";
import { ALL_114_SURAHS, QuranSurah } from "@/lib/quranData";
import {
  calculatePrayerTimes,
  GLOBAL_CITIES,
  CALCULATION_METHODS,
  formatPrayerTime,
  formatRemainingTime,
  getHijriDate,
  getPrayerDisplayName,
  PrayerTimeResult,
} from "@/lib/prayerTimes";
import { useLang } from "@/lib/i18n";
import { useApp, todayKey, SadaqahEntry, GoodDeedItem } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deen")({
  head: () => ({
    meta: [
      { title: "My Deen 🌙 — AYXA Planner Pro" },
      { name: "description", content: "Your gentle space for Quran reading, prayer times, Athkar, digital Tasbih, Sadaqah, and Good Deeds." }
    ],
  }),
  component: DeenPage,
});

type DeenTab = "today" | "quran" | "athkar" | "prayers" | "tasbih" | "sadaqah" | "deeds";

const TASBIH_PRESETS = [
  { phraseAr: "سُبْحَانَ اللَّهِ", phraseEn: "SubhanAllah", target: 33, icon: "✨" },
  { phraseAr: "الْحَمْدُ لِلَّهِ", phraseEn: "Alhamdulillah", target: 33, icon: "🤲" },
  { phraseAr: "اللَّهُ أَكْبَرُ", phraseEn: "Allahu Akbar", target: 34, icon: "👑" },
  { phraseAr: "لَا إِلَٰهَ إِلَّا اللَّهُ", phraseEn: "La ilaha illallah", target: 100, icon: "💫" },
  { phraseAr: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", phraseEn: "Astaghfirullah wa Atubu Ilayh", target: 100, icon: "🕊️" },
  { phraseAr: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", phraseEn: "Allahumma Salli 'ala Muhammad", target: 100, icon: "🌸" },
];

const SADAQAH_CATEGORIES = [
  { id: "water", nameEn: "Water Relief", nameAr: "سقيا ماء وبئر", icon: "💧" },
  { id: "food", nameEn: "Feeding the Hungry", nameAr: "إطعام مسكين وجائع", icon: "🍞" },
  { id: "orphan", nameEn: "Orphan Support", nameAr: "كفالة يتيم ومساعدة طفل", icon: "👶" },
  { id: "mosque", nameEn: "Mosque & Quran", nameAr: "عمارة مسجد ومصاحف", icon: "🕌" },
  { id: "education", nameEn: "Student & Knowledge", nameAr: "طالب علم وتعليم", icon: "📚" },
  { id: "general", nameEn: "General Charity", nameAr: "صدقة عامة وجبر خواطر", icon: "🤍" },
];

const WISDOM_HADITHS = [
  {
    textAr: "«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ»",
    textEn: "The most beloved deeds to Allah are those done regularly, even if small.",
    source: "صحيح البخاري ومسلم",
  },
  {
    textAr: "«عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ»",
    textEn: "How wonderful is the affair of the believer, for all of it is good.",
    source: "صحيح مسلم",
  },
  {
    textAr: "«إِنَّ اللَّهَ يَرْفَعُ بِهَذَا الكِتَابِ أَقْوَامًا»",
    textEn: "Indeed, Allah elevates by this Quran nations.",
    source: "صحيح مسلم",
  },
  {
    textAr: "«كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ»",
    textEn: "Two words are light on the tongue, heavy in the balance: SubhanAllahi wa bihamdihi, SubhanAllahil-'Azim.",
    source: "صحيح البخاري ومسلم",
  }
];

export function DeenPage() {
  const { lang, dir, t } = useLang();
  const isAr = lang === "ar";
  const navigate = useNavigate();

  const {
    state,
    togglePrayerLog,
    logQuranProgress,
    undoLatestQuranProgress,
    updateQuranGoal,
    setSurahStatus,
    addSadaqahEntry,
    removeSadaqahEntry,
    toggleGoodDeedLog,
    addCustomGoodDeed,
    removeGoodDeed,
    updateDeenSettings,
    toggleTrackingPause,
    updateActiveTasbih,
    addXP,
  } = useApp();

  const today = todayKey();
  const settings = state.deenSettings || {
    locationMode: "manual" as const,
    manualCityId: "casablanca",
    latitude: 33.5731,
    longitude: -7.5898,
    calculationMethod: "MuslimWorldLeague",
    asrMadhab: "shafi" as const,
    hijriDayAdjustment: 0,
    trackingPaused: false,
    hapticsEnabled: true,
    tasbihSoundEnabled: false,
    showTransliteration: true,
    showTranslation: true,
    notificationsEnabled: false,
  };

  const isPaused = Boolean(settings.trackingPaused);

  // Active Tab
  const [activeTab, setActiveTab] = useState<DeenTab>("today");

  // Settings Modal
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Dhikr Reader Modal
  const [dhikrModalOpen, setDhikrModalOpen] = useState(false);
  const [selectedDhikrId, setSelectedDhikrId] = useState<string | undefined>(undefined);
  const [selectedDhikrCat, setSelectedDhikrCat] = useState<"morning" | "evening" | "sleep" | "postPrayer" | "ruqyah">("morning");

  // Athkar Section Category filter
  const [athkarFilter, setAthkarFilter] = useState<"all" | "morning" | "evening" | "sleep" | "postPrayer" | "ruqyah">("morning");

  // Surah Tracker Search & Filters
  const [surahSearch, setSurahSearch] = useState("");
  const [surahCategoryFilter, setSurahCategoryFilter] = useState<"all" | "fav" | "amma" | "makki" | "madani">("all");

  // Quran Goal Edit Modal
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState<number>(state.quranGoal?.dailyTarget || 4);

  // Khatmah Planner State
  const [khatmahDays, setKhatmahDays] = useState<number>(30);
  const [khatmahPlanResult, setKhatmahPlanResult] = useState<{ dailyPages: number; targetDate: string } | null>(null);

  // Sadaqah Modal
  const [sadaqahModalOpen, setSadaqahModalOpen] = useState(false);
  const [sadaqahAmount, setSadaqahAmount] = useState("");
  const [sadaqahCat, setSadaqahCat] = useState(SADAQAH_CATEGORIES[0].nameAr);
  const [sadaqahNote, setSadaqahNote] = useState("");
  const [sadaqahIsAnon, setSadaqahIsAnon] = useState(false);

  // Good Deed Custom Modal
  const [customDeedModalOpen, setCustomDeedModalOpen] = useState(false);
  const [customDeedTextAr, setCustomDeedTextAr] = useState("");
  const [customDeedTextEn, setCustomDeedTextEn] = useState("");

  // Prayer times computation
  const selectedCity = useMemo(() => {
    return GLOBAL_CITIES.find((c) => c.id === settings.manualCityId) || GLOBAL_CITIES[0];
  }, [settings.manualCityId]);

  const prayerCoords = useMemo(() => {
    if (settings.locationMode === "gps") {
      return { lat: settings.latitude, lng: settings.longitude };
    }
    return { lat: selectedCity.latitude, lng: selectedCity.longitude };
  }, [settings.locationMode, settings.latitude, settings.longitude, selectedCity]);

  const prayerResult: PrayerTimeResult = useMemo(() => {
    return calculatePrayerTimes(
      prayerCoords.lat,
      prayerCoords.lng,
      new Date(),
      settings.calculationMethod,
      settings.asrMadhab
    );
  }, [prayerCoords, settings.calculationMethod, settings.asrMadhab]);

  const hijriString = useMemo(() => {
    return getHijriDate(new Date(), settings.hijriDayAdjustment, isAr);
  }, [settings.hijriDayAdjustment, isAr]);

  // Today's Quran Progress calculation
  const todayQuranEvents = useMemo(() => {
    return (state.quranHistory || []).filter((e) => e.localDate === today);
  }, [state.quranHistory, today]);

  const todayQuranAmount = useMemo(() => {
    return todayQuranEvents.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [todayQuranEvents]);

  const quranDailyGoal = state.quranGoal?.dailyTarget || 4;
  const quranProgressPct = Math.min(100, Math.round((todayQuranAmount / quranDailyGoal) * 100));

  // Prayer checklist keys
  const OBLIGATORY_PRAYERS = [
    { key: "Fajr", nameEn: "Fajr", nameAr: "الفجر", time: prayerResult.fajr, icon: "🌅" },
    { key: "Dhuhr", nameEn: "Dhuhr", nameAr: "الظهر", time: prayerResult.dhuhr, icon: "☀️" },
    { key: "Asr", nameEn: "Asr", nameAr: "العصر", time: prayerResult.asr, icon: "🌤️" },
    { key: "Maghrib", nameEn: "Maghrib", nameAr: "المغرب", time: prayerResult.maghrib, icon: "🌇" },
    { key: "Isha", nameEn: "Isha", nameAr: "العشاء", time: prayerResult.isha, icon: "🌙" },
  ];

  const NAWAFIL_PRAYERS = [
    { key: "Duha", nameEn: "Duha", nameAr: "صلاة الضحى", icon: "✨" },
    { key: "Tahajjud", nameEn: "Tahajjud & Witr", nameAr: "قيام الليل والوتر", icon: "🌌" },
  ];

  const completedObligatoryCount = useMemo(() => {
    return OBLIGATORY_PRAYERS.filter((p) => state.prayerLogs?.[`${today}_${p.key}`]?.logged).length;
  }, [OBLIGATORY_PRAYERS, state.prayerLogs, today]);

  // Surah completion stats
  const completedSurahsCount = useMemo(() => {
    return Object.values(state.surahProgress || {}).filter((s) => s.status === "completed").length;
  }, [state.surahProgress]);

  // Filtered Surahs for 114 Surah Tracker
  const filteredSurahs = useMemo(() => {
    return ALL_114_SURAHS.filter((s) => {
      const matchesSearch =
        surahSearch.trim() === "" ||
        s.id.toString() === surahSearch.trim() ||
        s.nameAr.includes(surahSearch.trim()) ||
        s.nameEn.toLowerCase().includes(surahSearch.toLowerCase().trim()) ||
        s.nameTranslationEn.toLowerCase().includes(surahSearch.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (surahCategoryFilter === "fav") return s.isCuratedFavorite;
      if (surahCategoryFilter === "amma") return s.juzNumber === 30;
      if (surahCategoryFilter === "makki") return s.type === "مكّية";
      if (surahCategoryFilter === "madani") return s.type === "مدنية";
      return true;
    });
  }, [surahSearch, surahCategoryFilter]);

  // Athkar List
  const displayAthkarList = useMemo(() => {
    if (athkarFilter === "all") return FULL_ATHKAR_COLLECTION;
    return FULL_ATHKAR_COLLECTION.filter((a) => a.category === athkarFilter);
  }, [athkarFilter]);

  // Tasbih interaction
  const activeTasbih = state.activeTasbih || {
    phraseAr: "سُبْحَانَ اللَّهِ",
    phraseEn: "SubhanAllah",
    count: 0,
    target: 33,
    isCustom: false,
  };

  const handleTasbihTap = useCallback(() => {
    const nextCount = activeTasbih.count + 1;
    if (settings.hapticsEnabled && typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
    if (nextCount >= activeTasbih.target) {
      if (settings.hapticsEnabled && typeof window !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
      updateActiveTasbih({ count: 0 });
      addXP(10);
    } else {
      updateActiveTasbih({ count: nextCount });
    }
  }, [activeTasbih, settings.hapticsEnabled, updateActiveTasbih, addXP]);

  const handleTasbihReset = useCallback(() => {
    if (window.confirm(isAr ? "هل تريدين تصفير عداد التسبيح الحالي؟" : "Reset current Tasbih count to 0?")) {
      updateActiveTasbih({ count: 0 });
    }
  }, [isAr, updateActiveTasbih]);

  // Khatmah calculation
  const handleCalculateKhatmah = useCallback(() => {
    const totalPages = 604;
    const days = Math.max(1, khatmahDays);
    const dailyPages = Math.ceil(totalPages / days);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    setKhatmahPlanResult({
      dailyPages,
      targetDate: targetDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", { month: "short", day: "numeric", year: "numeric" }),
    });
  }, [khatmahDays, isAr]);

  return (
    <MobileShell>
      <Screen>
        {/* ── 1. Compact Mosque Header ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-900 via-teal-950 to-zinc-950 text-white p-5 shadow-emerald border border-emerald-500/20 mb-4">
          {/* Subtle geometric & light accent */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gold/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top Bar: Back button, Title, Settings */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
            <button
              onClick={() => navigate({ to: "/more" })}
              className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all backdrop-blur-md"
              aria-label={isAr ? "الرجوع للاستكشاف" : "Back to Explore"}
            >
              {dir === "rtl" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center justify-center gap-1.5 font-serif">
                <span>{t("myDeenTitle")}</span>
              </h1>
              <p className="text-[11px] text-emerald-200/80 line-clamp-1">
                {t("myDeenSubtitle")}
              </p>
            </div>

            <button
              onClick={() => setSettingsOpen(true)}
              className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-all backdrop-blur-md"
              aria-label={isAr ? "إعدادات مواقيت الصلاة" : "Prayer Settings"}
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Info Summary Strip: Hijri Date & Next Prayer */}
          <div className="relative z-10 grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[12px]">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
              <Calendar className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-emerald-300/80 font-medium">{isAr ? "التقويم الهجري" : "Hijri Date"}</span>
                <span className="font-bold text-white tracking-wide truncate">{hijriString}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
              <Clock className="w-4 h-4 text-gold shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-gold/80 font-medium">{isAr ? "الصلاة القادمة" : "Next Prayer"}</span>
                <span className="font-bold text-white tracking-wide truncate">
                  {getPrayerDisplayName(prayerResult.nextPrayer, isAr)} · {formatRemainingTime(prayerResult.timeForNextPrayer, isAr)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Horizontal Section Navigation Tabs ───────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
          {[
            { id: "today", label: isAr ? "اليوم" : "Today", icon: Sparkles },
            { id: "quran", label: isAr ? "القرآن والورد" : "Quran & Wird", icon: BookOpen },
            { id: "athkar", label: isAr ? "الأذكار" : "Athkar", icon: Sun },
            { id: "prayers", label: isAr ? "الصلوات" : "Prayers", icon: Clock },
            { id: "tasbih", label: isAr ? "التسبيح" : "Tasbih", icon: RotateCcw },
            { id: "sadaqah", label: isAr ? "الصدقة" : "Sadaqah", icon: HandHeart },
            { id: "deeds", label: isAr ? "الأعمال الصالحة" : "Good Deeds", icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DeenTab)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold shrink-0 transition-all active:scale-95 border",
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20"
                    : "bg-card text-ink-light border-border/60 hover:bg-muted/60"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-emerald-500")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Gentle Tracking Pause Banner */}
        {isPaused && (
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Moon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-[13px] font-bold text-emerald-900 dark:text-emerald-100">
                  {isAr ? "متابعة العبادات متوقفة مؤقتًا برفق" : "Worship tracking is paused gently"}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  {isAr ? "راحة مباركة وسكينة تامة." : "Rest peacefully without missed records."}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleTrackingPause(false)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shrink-0 transition-all"
            >
              {isAr ? "استئناف" : "Resume"}
            </button>
          </div>
        )}

        {/* ── 3. TAB 1: TODAY DASHBOARD ───────────────────────────────────────── */}
        {activeTab === "today" && (
          <div className="space-y-4 pb-8">
            {/* Gentle Day Header */}
            <div className="flex items-center justify-between px-1">
              <p className="text-[13px] font-bold text-ink-light flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>{t("gentleDayMessage")}</span>
              </p>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {completedObligatoryCount}/5 {isAr ? "صلوات" : "Prayers"}
              </span>
            </div>

            {/* Prayers Quick Summary Grid */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-ink flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? "صلوات اليوم المفروضة" : "Today's Obligatory Prayers"}</span>
                </span>
                <button
                  onClick={() => setActiveTab("prayers")}
                  className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                >
                  <span>{isAr ? "التفاصيل" : "View all"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {OBLIGATORY_PRAYERS.map((p) => {
                  const log = state.prayerLogs?.[`${today}_${p.key}`];
                  const isDone = Boolean(log?.logged);
                  return (
                    <button
                      key={p.key}
                      onClick={() => togglePrayerLog(today, p.key)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-xl border transition-all active:scale-95",
                        isDone
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                          : "bg-muted/40 border-border/60 text-ink-light hover:bg-muted/70"
                      )}
                    >
                      <span className="text-base mb-1">{p.icon}</span>
                      <span className="text-[11px] font-bold line-clamp-1">{isAr ? p.nameAr : p.nameEn}</span>
                      <span className="text-[9px] text-ink-light mt-0.5">{formatPrayerTime(p.time)}</span>
                      <div className="mt-1.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Circle className="w-4 h-4 text-ink-light/40" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quran Goal Quick Progress */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-ink">{isAr ? "ورد القرآن الكريم لليوم" : "Today's Quran Goal"}</p>
                    <p className="text-[11px] text-ink-light">
                      {todayQuranAmount} / {quranDailyGoal} {isAr ? "صفحات" : "pages"} ({quranProgressPct}%)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("quran")}
                  className="text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  {isAr ? "متابعة الورد" : "Open Quran"}
                </button>
              </div>

              <ProgressBar value={quranProgressPct} barClass="bg-emerald-500" />

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => logQuranProgress(today, 1)}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[12px] font-bold border border-emerald-200 dark:border-emerald-800 transition-all active:scale-95"
                >
                  +1 {isAr ? "صفحة" : "page"}
                </button>
                <button
                  onClick={() => logQuranProgress(today, 5)}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[12px] font-bold border border-emerald-200 dark:border-emerald-800 transition-all active:scale-95"
                >
                  +5 {isAr ? "صفحات" : "pages"}
                </button>
                {todayQuranAmount > 0 && (
                  <button
                    onClick={() => undoLatestQuranProgress()}
                    className="px-3 py-1.5 rounded-xl bg-muted text-ink-light hover:text-ink text-[12px] font-semibold border border-border/60 transition-all active:scale-95"
                    title={isAr ? "تراجع عن آخر إضافة" : "Undo latest addition"}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Time-Appropriate Athkar Launcher Card */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-emerald flex items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                  {isAr ? "قارئ الأذكار الهادئ" : "Gentle Dhikr Reader"}
                </span>
                <p className="text-[14px] font-bold">{isAr ? "أذكار الصباح والمساء والسكينة" : "Morning & Evening Remembrances"}</p>
                <p className="text-[11px] text-emerald-100/80">{isAr ? "أذكار موثّقة مع الترجمة والعداد الصوتي" : "Verified Athkar with translations and counter"}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedDhikrCat("morning");
                  setDhikrModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-[12px] hover:bg-emerald-50 transition-all shrink-0 active:scale-95 shadow-md"
              >
                {isAr ? "ابدئي الآن" : "Start"}
              </button>
            </div>

            {/* Daily Good Deed Card */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-ink flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>{isAr ? "عمل صالح لليوم" : "Daily Good Deed"}</span>
                </span>
                <button
                  onClick={() => setActiveTab("deeds")}
                  className="text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  {isAr ? "عرض القائمة" : "View all"}
                </button>
              </div>

              {(state.goodDeeds || []).slice(0, 2).map((deed) => {
                const isDone = Boolean(state.goodDeedLogs?.[`${today}_${deed.id}`]);
                return (
                  <div
                    key={deed.id}
                    onClick={() => toggleGoodDeedLog(today, deed.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all active:scale-95",
                      isDone
                        ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-100"
                        : "bg-muted/30 border-border/60 text-ink hover:bg-muted/60"
                    )}
                  >
                    <span className="text-[12px] font-semibold line-clamp-1">
                      {isAr ? deed.titleAr || deed.titleEn : deed.titleEn}
                    </span>
                    <button className="text-rose-500">
                      {isDone ? <CheckCircle2 className="w-4 h-4 fill-rose-100 dark:fill-rose-950" /> : <Circle className="w-4 h-4 text-ink-light/40" />}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Prophetic Wisdom Quote */}
            <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 p-4 text-center space-y-1.5">
              <p className="text-[13px] font-serif text-emerald-950 dark:text-emerald-100 font-bold leading-relaxed">
                {isAr ? WISDOM_HADITHS[0].textAr : WISDOM_HADITHS[0].textEn}
              </p>
              <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-medium">
                {WISDOM_HADITHS[0].source}
              </p>
            </div>
          </div>
        )}

        {/* ── 4. TAB 2: QURAN & WIRD (WITH 114 SURAHS) ───────────────────────── */}
        {activeTab === "quran" && (
          <div className="space-y-4 pb-8">
            {/* Daily Goal & Reading Controls Card */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink">{isAr ? "الورد اليومي للقرآن" : "Daily Quran Wird"}</h3>
                  <p className="text-[11px] text-ink-light">
                    {todayQuranAmount} / {quranDailyGoal} {isAr ? "صفحات اليوم" : "pages read today"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setGoalInput(quranDailyGoal);
                    setEditGoalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-muted text-ink text-[11px] font-bold border border-border/60 hover:bg-muted/80 transition-all flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isAr ? "تعديل الهدف" : "Edit Target"}</span>
                </button>
              </div>

              <ProgressBar value={quranProgressPct} barClass="bg-emerald-500" />

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => logQuranProgress(today, 1)}
                  className="py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-[12px] font-bold border border-emerald-300/60 dark:border-emerald-800 transition-all active:scale-95"
                >
                  +1 {isAr ? "صفحة" : "page"}
                </button>
                <button
                  onClick={() => logQuranProgress(today, 5)}
                  className="py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-[12px] font-bold border border-emerald-300/60 dark:border-emerald-800 transition-all active:scale-95"
                >
                  +5 {isAr ? "صفحات" : "pages"}
                </button>
                <button
                  onClick={() => logQuranProgress(today, 10)}
                  className="py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-[12px] font-bold border border-emerald-300/60 dark:border-emerald-800 transition-all active:scale-95"
                >
                  +10 {isAr ? "صفحات" : "pages"}
                </button>
              </div>

              {todayQuranAmount > 0 && (
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-emerald-600 font-semibold">✓ {isAr ? "تم تسجيل القراءة اليوم" : "Reading recorded today"}</span>
                  <button
                    onClick={() => undoLatestQuranProgress()}
                    className="text-ink-light hover:text-ink flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isAr ? "تراجع" : "Undo"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Deterministic Khatmah Calculator Card */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-gold" />
                <h4 className="text-[13px] font-bold text-ink">{isAr ? "مخطط الختمة المباركة" : "Khatmah Completion Planner"}</h4>
              </div>
              <p className="text-[11px] text-ink-light">
                {isAr ? "حددي عدد الأيام لحساب مقدار القراءة اليومية بدقة (المصحف: 604 صفحات):" : "Choose target days to calculate deterministic daily reading (604 pages total):"}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="365"
                  value={khatmahDays}
                  onChange={(e) => setKhatmahDays(parseInt(e.target.value) || 30)}
                  className="w-24 px-3 py-1.5 rounded-xl border border-border text-center font-bold text-sm bg-background text-ink"
                />
                <span className="text-[12px] text-ink-light">{isAr ? "يومًا" : "days"}</span>
                <button
                  onClick={handleCalculateKhatmah}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] transition-all"
                >
                  {isAr ? "حساب الخطة" : "Calculate"}
                </button>
              </div>
              {khatmahPlanResult && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-[12px] text-emerald-900 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800">
                  <p className="font-bold">
                    {isAr
                      ? `📖 ورد الختمة: ${khatmahPlanResult.dailyPages} صفحة يومياً للختم في ${khatmahPlanResult.targetDate}`
                      : `📖 Target: ${khatmahPlanResult.dailyPages} pages/day to complete by ${khatmahPlanResult.targetDate}`}
                  </p>
                </div>
              )}
            </div>

            {/* Complete 114 Surahs Tracker Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-bold text-ink">{isAr ? "متابع سور القرآن الكريم (114 سورة)" : "Quran Surahs Tracker (114 Surahs)"}</h4>
                  <p className="text-[11px] text-ink-light">
                    {completedSurahsCount} / 114 {isAr ? "سورة مقروءة ومكتملة" : "Surahs completed"}
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-ink-light absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isAr ? "ابحثي باسم السورة أو رقمها..." : "Search surah by name or number..."}
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-card border border-border/60 text-ink text-[12px] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: "all", label: isAr ? "الكل (114)" : "All (114)" },
                  { id: "fav", label: isAr ? "السور الفاضلة" : "Recommended" },
                  { id: "amma", label: isAr ? "جزء عمّ" : "Juz Amma" },
                  { id: "makki", label: isAr ? "مكّية" : "Meccan" },
                  { id: "madani", label: isAr ? "مدنية" : "Medinan" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSurahCategoryFilter(f.id as any)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all border",
                      surahCategoryFilter === f.id
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-muted/50 text-ink-light border-border/60 hover:bg-muted"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Surah List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredSurahs.map((surah) => {
                  const status = state.surahProgress?.[surah.id]?.status || "not_started";
                  return (
                    <div
                      key={surah.id}
                      className={cn(
                        "rounded-xl border p-3 flex items-center justify-between gap-2 transition-all",
                        status === "completed"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                          : status === "reading"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100"
                          : "bg-card border-border/60 text-ink"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[11px] shrink-0 font-mono">
                          {surah.id}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold truncate font-serif">{surah.nameAr}</p>
                          <p className="text-[10px] text-ink-light truncate">
                            {surah.nameEn} · {surah.versesCount} {isAr ? "آية" : "ayat"} · {surah.type} · {isAr ? `جزء ${surah.juzNumber}` : `Juz ${surah.juzNumber}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => setSurahStatus(surah.id, status === "completed" ? "not_started" : "completed")}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all active:scale-95",
                            status === "completed"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-muted text-ink-light border-border hover:bg-emerald-50"
                          )}
                        >
                          {status === "completed" ? (isAr ? "✓ تم" : "✓ Done") : (isAr ? "قراءة" : "Read")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. TAB 3: ATHKAR SECTION ────────────────────────────────────────── */}
        {activeTab === "athkar" && (
          <div className="space-y-4 pb-8">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: "morning", label: isAr ? "أذكار الصباح" : "Morning" },
                { id: "evening", label: isAr ? "أذكار المساء" : "Evening" },
                { id: "sleep", label: isAr ? "أذكار النوم" : "Sleep" },
                { id: "postPrayer", label: isAr ? "بعد الصلاة" : "Post-Prayer" },
                { id: "ruqyah", label: isAr ? "الرقية والتحصين" : "Ruqyah" },
                { id: "all", label: isAr ? "جميع الأذكار" : "All" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAthkarFilter(c.id as any)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-[12px] font-bold shrink-0 transition-all border",
                    athkarFilter === c.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-card text-ink-light border-border/60 hover:bg-muted"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Open Reader Modal Button */}
            <button
              onClick={() => {
                setSelectedDhikrCat(athkarFilter === "all" ? "morning" : athkarFilter);
                setDhikrModalOpen(true);
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-emerald flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? "فتح قارئ الأذكار الهادئ التفاعلي" : "Launch Interactive Dhikr Reader"}</span>
            </button>

            {/* Athkar Cards List */}
            <div className="space-y-3">
              {displayAthkarList.map((dhikr) => (
                <div
                  key={dhikr.id}
                  className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-emerald-800 dark:text-emerald-300 font-serif">
                      {dhikr.titleAr}
                    </span>
                    <span className="text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {dhikr.count}x
                    </span>
                  </div>

                  <p className="text-[14px] font-serif leading-relaxed text-ink dark:text-emerald-50 bg-muted/20 p-3 rounded-xl border border-border/30">
                    {dhikr.textAr}
                  </p>

                  {settings.showTranslation && (
                    <p className="text-[12px] text-ink-light italic">
                      "{dhikr.textEn}"
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40 text-ink-light">
                    <span className="truncate">📚 {dhikr.source}</span>
                    <button
                      onClick={() => {
                        setSelectedDhikrId(dhikr.id);
                        setSelectedDhikrCat(dhikr.category);
                        setDhikrModalOpen(true);
                      }}
                      className="text-emerald-600 font-bold hover:underline shrink-0"
                    >
                      {isAr ? "قراءة منفردة" : "Read"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. TAB 4: PRAYERS SECTION ───────────────────────────────────────── */}
        {activeTab === "prayers" && (
          <div className="space-y-4 pb-8">
            {/* Header info & Calculation location */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink">{isAr ? "مواقيت الصلاة الفلكية" : "Astronomical Prayer Times"}</h3>
                  <p className="text-[11px] text-ink-light">
                    📍 {selectedCity.nameAr} ({settings.calculationMethod})
                  </p>
                </div>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-muted text-ink text-[11px] font-bold border border-border/60 hover:bg-muted/80 transition-all flex items-center gap-1"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? "تغيير المدينة" : "Change City"}</span>
                </button>
              </div>

              {/* 5 Obligatory Prayers List */}
              <div className="space-y-2">
                {OBLIGATORY_PRAYERS.map((p) => {
                  const logKey = `${today}_${p.key}`;
                  const log = state.prayerLogs?.[logKey];
                  const isDone = Boolean(log?.logged);
                  return (
                    <div
                      key={p.key}
                      className={cn(
                        "rounded-xl border p-3 flex items-center justify-between gap-3 transition-all",
                        isDone
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                          : "bg-muted/30 border-border/60 text-ink"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.icon}</span>
                        <div>
                          <p className="text-[13px] font-bold">{isAr ? p.nameAr : p.nameEn}</p>
                          <p className="text-[11px] text-ink-light font-mono font-medium">{formatPrayerTime(p.time)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePrayerLog(today, p.key)}
                          className={cn(
                            "px-3.5 py-1.5 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all active:scale-95 border",
                            isDone
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-card text-ink-light border-border hover:bg-muted"
                          )}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : null}
                          <span>{isDone ? (isAr ? "تمت" : "Logged") : (isAr ? "تسجيل" : "Log")}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sunnah & Nawafil Optional Prayers */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm space-y-3">
              <h4 className="text-[13px] font-bold text-ink">{isAr ? "السنن والنوافل المباركة (تطوع)" : "Voluntary Sunnah & Nawafil"}</h4>
              <div className="space-y-2">
                {NAWAFIL_PRAYERS.map((p) => {
                  const logKey = `${today}_${p.key}`;
                  const log = state.prayerLogs?.[logKey];
                  const isDone = Boolean(log?.logged);
                  return (
                    <div
                      key={p.key}
                      onClick={() => togglePrayerLog(today, p.key)}
                      className={cn(
                        "rounded-xl border p-3 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-98",
                        isDone
                          ? "bg-gold/10 border-gold/30 text-amber-900 dark:text-amber-100"
                          : "bg-muted/20 border-border/60 text-ink"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{p.icon}</span>
                        <span className="text-[12px] font-bold">{isAr ? p.nameAr : p.nameEn}</span>
                      </div>
                      <button className="text-gold">
                        {isDone ? <CheckCircle2 className="w-4 h-4 fill-amber-100 dark:fill-amber-950" /> : <Circle className="w-4 h-4 text-ink-light/40" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Qibla Compass Card */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-ink">{isAr ? "اتجاه القبلة الشريفة" : "Qibla Direction"}</p>
                  <p className="text-[11px] text-ink-light">{isAr ? `زاوية القبلة: ${prayerResult.qiblaBearing}° نحو مكة المكرمة` : `Bearing: ${prayerResult.qiblaBearing}° towards Makkah`}</p>
                </div>
              </div>
              <span className="font-mono font-bold text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {prayerResult.qiblaBearing}°
              </span>
            </div>
          </div>
        )}

        {/* ── 7. TAB 5: DIGITAL TASBIH ────────────────────────────────────────── */}
        {activeTab === "tasbih" && (
          <div className="space-y-4 pb-8 text-center">
            {/* Presets Horizontal Selector */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {TASBIH_PRESETS.map((preset) => (
                <button
                  key={preset.phraseAr}
                  onClick={() =>
                    updateActiveTasbih({
                      phraseAr: preset.phraseAr,
                      phraseEn: preset.phraseEn,
                      target: preset.target,
                      count: 0,
                      isCustom: false,
                    })
                  }
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[12px] font-bold shrink-0 transition-all border",
                    activeTasbih.phraseAr === preset.phraseAr
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20"
                      : "bg-card text-ink border-border/60 hover:bg-muted"
                  )}
                >
                  <span className="font-serif">{preset.phraseAr}</span> ({preset.target})
                </button>
              ))}
            </div>

            {/* Main Interactive Tasbih Bead Ring */}
            <div className="rounded-3xl bg-gradient-to-b from-card via-card to-muted/40 border border-border/60 p-6 shadow-rose flex flex-col items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-serif text-emerald-900 dark:text-emerald-100">
                  {activeTasbih.phraseAr}
                </h3>
                <p className="text-[12px] text-ink-light">{activeTasbih.phraseEn}</p>
              </div>

              {/* Big Touch Counter Ring */}
              <button
                onClick={handleTasbihTap}
                className="w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-xl shadow-emerald-600/30 flex flex-col items-center justify-center transition-all active:scale-90 border-4 border-white/40 select-none cursor-pointer"
                aria-label={isAr ? "تسبيح" : "Count Tasbih"}
              >
                <span className="text-5xl font-extrabold font-mono tracking-tight">{activeTasbih.count}</span>
                <span className="text-[11px] text-emerald-100 font-semibold mt-1">
                  / {activeTasbih.target}
                </span>
                <span className="text-[10px] text-emerald-200 mt-2 bg-black/20 px-3 py-0.5 rounded-full">
                  {isAr ? "المسي للزيادة" : "Tap to count"}
                </span>
              </button>

              {/* Controls: Reset, Sound, Haptic */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTasbihReset}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-ink text-[12px] font-bold border border-border/60 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAr ? "تصفير" : "Reset"}</span>
                </button>

                <button
                  onClick={() =>
                    updateDeenSettings({ hapticsEnabled: !settings.hapticsEnabled })
                  }
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-[12px] font-bold border flex items-center gap-1.5 transition-all",
                    settings.hapticsEnabled
                      ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                      : "bg-muted text-ink-light border-border"
                  )}
                >
                  <Vibrate className="w-3.5 h-3.5" />
                  <span>{settings.hapticsEnabled ? (isAr ? "الاهتزاز مفعل" : "Haptic On") : (isAr ? "معطل" : "Haptic Off")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 8. TAB 6: SADAQAH (PRIVATE VOLUNTARY CHARITY) ────────────────────── */}
        {activeTab === "sadaqah" && (
          <div className="space-y-4 pb-8">
            {/* Header & Add Entry */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink">{isAr ? "سجل الصدقات الخاص" : "Private Sadaqah Log"}</h3>
                <p className="text-[11px] text-ink-light">
                  {isAr ? "بينكِ وبين الله — سرية تمامًا ولا تشارك أبداً." : "Private tracking between you and Allah."}
                </p>
              </div>
              <button
                onClick={() => setSadaqahModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? "تسجيل صدقة" : "Log Sadaqah"}</span>
              </button>
            </div>

            {/* List of Sadaqah entries */}
            {state.sadaqahLogs && state.sadaqahLogs.length > 0 ? (
              <div className="space-y-2.5">
                {state.sadaqahLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl bg-card border border-border/60 p-3.5 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-[13px] font-bold text-ink flex items-center gap-1.5">
                        <span>{entry.category}</span>
                      </p>
                      {entry.privateNote && (
                        <p className="text-[11px] text-ink-light italic line-clamp-1">"{entry.privateNote}"</p>
                      )}
                      <p className="text-[10px] text-ink-light font-mono">{entry.localDate}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!entry.isAnonymous && entry.amount !== undefined && (
                        <span className="font-bold text-[13px] text-emerald-600 font-mono bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {entry.amount} {entry.currency}
                        </span>
                      )}
                      <button
                        onClick={() => removeSadaqahEntry(entry.id)}
                        className="text-ink-light hover:text-rose-500 p-1 transition-all"
                        aria-label="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-card border border-border/60 p-8 text-center space-y-2">
                <HandHeart className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-[14px] font-bold text-ink">{t("emptySadaqahLog")}</p>
                <p className="text-[11px] text-ink-light">
                  {isAr ? "سجلي صدقاتكِ وأعمال الإحسان الخاصة للمتابعة الشخصية." : "Track voluntary charity privately."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── 9. TAB 7: GOOD DEEDS & SUNNAHS ──────────────────────────────────── */}
        {activeTab === "deeds" && (
          <div className="space-y-4 pb-8">
            {/* Header & Add Custom Deed */}
            <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink">{isAr ? "الأعمال الصالحة والسنن" : "Daily Good Deeds"}</h3>
                <p className="text-[11px] text-ink-light">
                  {isAr ? "أحب الأعمال إلى الله أدومها وإن قلّت." : "Small deeds done with consistency."}
                </p>
              </div>
              <button
                onClick={() => setCustomDeedModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[12px] shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? "إضافة عمل" : "Add Deed"}</span>
              </button>
            </div>

            {/* Good Deeds List */}
            <div className="space-y-2.5">
              {(state.goodDeeds || []).map((deed) => {
                const isDone = Boolean(state.goodDeedLogs?.[`${today}_${deed.id}`]);
                return (
                  <div
                    key={deed.id}
                    className={cn(
                      "rounded-xl border p-3.5 flex items-center justify-between gap-3 transition-all",
                      isDone
                        ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                        : "bg-card border-border/60"
                    )}
                  >
                    <div
                      onClick={() => toggleGoodDeedLog(today, deed.id)}
                      className="flex-1 cursor-pointer"
                    >
                      <p className={cn("text-[13px] font-bold", isDone ? "text-rose-900 dark:text-rose-100" : "text-ink")}>
                        {isAr ? deed.titleAr || deed.titleEn : deed.titleEn}
                      </p>
                      <span className="text-[10px] text-ink-light uppercase tracking-wider font-semibold">
                        {deed.category || "General"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleGoodDeedLog(today, deed.id)}
                        className="text-rose-500 p-1"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 fill-rose-100 dark:fill-rose-950" />
                        ) : (
                          <Circle className="w-5 h-5 text-ink-light/40" />
                        )}
                      </button>
                      {deed.isCustom && (
                        <button
                          onClick={() => removeGoodDeed(deed.id)}
                          className="text-ink-light hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MODALS ──────────────────────────────────────────────────────────── */}

        {/* 1. Dhikr Reader Modal (Unified with Athkar Engine) */}
        <DhikrReaderModal
          isOpen={dhikrModalOpen}
          initialDhikrId={selectedDhikrId}
          initialCategory={selectedDhikrCat}
          onClose={() => setDhikrModalOpen(false)}
        />

        {/* 2. Deen & Prayer Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border p-5 pb-[calc(env(safe-area-inset-bottom,16px)+20px)] sm:pb-5 space-y-4 max-h-[85vh] overflow-y-auto overscroll-contain">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h3 className="text-base font-bold text-ink">{t("deenSettingsTitle")}</h3>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-ink-light hover:text-ink text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Manual City Selector */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-ink">{isAr ? "المدينة وموقع الحساب" : "Select City"}</label>
                <select
                  value={settings.manualCityId}
                  onChange={(e) => updateDeenSettings({ manualCityId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-muted border border-border text-ink text-sm font-medium focus:outline-none"
                >
                  {GLOBAL_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isAr ? `${c.nameAr} (${c.countryAr})` : `${c.nameEn} (${c.countryEn})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Calculation Method */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-ink">{isAr ? "طريقة الحساب الفلكي" : "Calculation Method"}</label>
                <select
                  value={settings.calculationMethod}
                  onChange={(e) => updateDeenSettings({ calculationMethod: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-muted border border-border text-ink text-sm font-medium focus:outline-none"
                >
                  {CALCULATION_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {isAr ? m.nameAr : m.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asr Juristic Method */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-ink">{isAr ? "مذهب صلاة العصر" : "Asr Calculation Method"}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateDeenSettings({ asrMadhab: "shafi" })}
                    className={cn(
                      "p-2.5 rounded-xl border text-center text-[12px] font-bold transition-all",
                      settings.asrMadhab === "shafi"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-muted text-ink-light border-border"
                    )}
                  >
                    {isAr ? "الجمهور (الشافعي/المالكي)" : "Standard (Shafi/Maliki)"}
                  </button>
                  <button
                    onClick={() => updateDeenSettings({ asrMadhab: "hanafi" })}
                    className={cn(
                      "p-2.5 rounded-xl border text-center text-[12px] font-bold transition-all",
                      settings.asrMadhab === "hanafi"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-muted text-ink-light border-border"
                    )}
                  >
                    {isAr ? "المذهب الحنفي" : "Hanafi"}
                  </button>
                </div>
              </div>

              {/* Hijri Adjustment */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-ink">
                  {isAr ? `تعديل اليوم الهجري: (${settings.hijriDayAdjustment > 0 ? "+" : ""}${settings.hijriDayAdjustment} يوم)` : `Hijri Day Offset: (${settings.hijriDayAdjustment})`}
                </label>
                <div className="flex items-center gap-2">
                  {[-2, -1, 0, 1, 2].map((offset) => (
                    <button
                      key={offset}
                      onClick={() => updateDeenSettings({ hijriDayAdjustment: offset })}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg border text-xs font-bold font-mono transition-all",
                        settings.hijriDayAdjustment === offset
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-muted text-ink-light border-border"
                      )}
                    >
                      {offset > 0 ? `+${offset}` : offset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gentle Tracking Pause Toggle */}
              <div className="pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-ink">{isAr ? "إيقاف متابعة العبادات مؤقتًا" : "Pause Worship Tracking"}</p>
                    <p className="text-[11px] text-ink-light">{isAr ? "أوقفي التذكيرات والسلاسل بلطف." : "Pause reminders and streaks gently."}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.trackingPaused}
                    onChange={(e) => toggleTrackingPause(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded"
                  />
                </div>
              </div>

              <button
                onClick={() => setSettingsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
              >
                {isAr ? "حفظ وإغلاق" : "Save & Close"}
              </button>
            </div>
          </div>
        )}

        {/* 3. Edit Quran Goal Modal */}
        {editGoalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-fade-in">
            <div className="bg-card w-full max-w-sm rounded-3xl border border-border p-5 space-y-4 max-h-[85vh] overflow-y-auto overscroll-contain">
              <h3 className="text-base font-bold text-ink">{isAr ? "تحديد ورد القرآن اليومي" : "Set Daily Quran Target"}</h3>
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink-light">{isAr ? "عدد الصفحات المستهدفة يوميًا" : "Target Pages per Day"}</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={goalInput}
                  onChange={(e) => setGoalInput(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-border bg-background text-ink font-bold text-center text-lg"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditGoalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-muted text-ink font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={() => {
                    updateQuranGoal(goalInput);
                    setEditGoalOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  {isAr ? "حفظ" : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Log Sadaqah Modal */}
        {sadaqahModalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-fade-in">
            <div className="bg-card w-full max-w-sm rounded-3xl border border-border p-5 space-y-3 max-h-[85vh] overflow-y-auto overscroll-contain">
              <h3 className="text-base font-bold text-ink">{isAr ? "تسجيل صدقة خاصة" : "Log Voluntary Sadaqah"}</h3>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-light">{isAr ? "المبلغ (اختياري)" : "Amount (Optional)"}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={sadaqahAmount}
                  onChange={(e) => setSadaqahAmount(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border bg-background text-ink font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-light">{isAr ? "النوع والتصنيف" : "Category"}</label>
                <select
                  value={sadaqahCat}
                  onChange={(e) => setSadaqahCat(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border bg-background text-ink text-xs font-bold"
                >
                  {SADAQAH_CATEGORIES.map((c) => (
                    <option key={c.id} value={isAr ? c.nameAr : c.nameEn}>
                      {c.icon} {isAr ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-light">{isAr ? "ملاحظة خاصة (اختياري)" : "Private Note"}</label>
                <input
                  type="text"
                  placeholder={isAr ? "مثال: إطعام مسكين" : "e.g., Feed a family"}
                  value={sadaqahNote}
                  onChange={(e) => setSadaqahNote(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border bg-background text-ink text-xs"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-bold text-ink">{isAr ? "إخفاء المبلغ في السجل" : "Anonymous Entry"}</span>
                <input
                  type="checkbox"
                  checked={sadaqahIsAnon}
                  onChange={(e) => setSadaqahIsAnon(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSadaqahModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-muted text-ink font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={() => {
                    addSadaqahEntry({
                      localDate: today,
                      amount: sadaqahAmount ? parseFloat(sadaqahAmount) : undefined,
                      currency: state.prefs?.currency || "MAD",
                      category: sadaqahCat,
                      privateNote: sadaqahNote,
                      isAnonymous: sadaqahIsAnon,
                    });
                    setSadaqahModalOpen(false);
                    setSadaqahAmount("");
                    setSadaqahNote("");
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  {isAr ? "تسجيل" : "Log"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Custom Good Deed Modal */}
        {customDeedModalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] animate-fade-in">
            <div className="bg-card w-full max-w-sm rounded-3xl border border-border p-5 space-y-3 max-h-[85vh] overflow-y-auto overscroll-contain">
              <h3 className="text-base font-bold text-ink">{isAr ? "إضافة عمل صالح مخصص" : "Add Custom Good Deed"}</h3>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-light">{isAr ? "الاسم بالعربية" : "Title in Arabic"}</label>
                <input
                  type="text"
                  placeholder="مثال: سقي نباتات المنزل"
                  value={customDeedTextAr}
                  onChange={(e) => setCustomDeedTextAr(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border bg-background text-ink text-xs font-serif"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink-light">{isAr ? "الاسم بالإنجليزية (اختياري)" : "Title in English (Optional)"}</label>
                <input
                  type="text"
                  placeholder="e.g., Water the plants"
                  value={customDeedTextEn}
                  onChange={(e) => setCustomDeedTextEn(e.target.value)}
                  className="w-full p-2 rounded-xl border border-border bg-background text-ink text-xs"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setCustomDeedModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-muted text-ink font-bold text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={() => {
                    if (customDeedTextAr.trim() || customDeedTextEn.trim()) {
                      addCustomGoodDeed(customDeedTextEn.trim() || customDeedTextAr.trim(), customDeedTextAr.trim() || customDeedTextEn.trim());
                      setCustomDeedModalOpen(false);
                      setCustomDeedTextAr("");
                      setCustomDeedTextEn("");
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  {isAr ? "إضافة" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Screen>
    </MobileShell>
  );
}
