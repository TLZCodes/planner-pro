import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  RefreshCw,
  Download,
  Upload,
  Check,
  Globe,
  Palette,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Bell,
  Smartphone,
  ArrowLeft,
  Edit3,
  X,
  CheckCircle2,
  Lock,
  Shield,
  Heart,
  HardDrive,
  Eye,
  Sliders,
  HelpCircle,
  Search,
  User,
  LogOut,
  Trash2,
  Copy,
  Clock,
  CheckSquare,
  AlertTriangle,
  Info,
  Layers,
  Sparkle,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { Screen, GlassCard, PillTag, GradientButton } from "@/components/kit";
import {
  useApp,
  THEME_PRESETS,
  SUPPORTED_CURRENCIES,
  COMMON_TIMEZONES,
  isWithinQuietHours,
  buildExportPayload,
  inspectBackupJson,
  calculateStorageMetrics,
  generateDiagnosticsReport,
  type AppTheme,
  type AppearanceMode,
  type TextScale,
  type DateFormatOption,
  type TimeFormatOption,
  type WeekStartDay,
  type DefaultLandingRoute,
  type CompletedTaskVisibility,
  type ExportCategory,
  type BackupInspectionResult,
} from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { playNotificationSound, NOTIFICATION_SOUNDS, type SoundType } from "@/lib/sound";
import { triggerHaptic } from "@/lib/haptics";
import { notifStatus, requestNotifPermission, notifSupported, showNotif } from "@/lib/notify";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات والتفضيلات — AYXA Planner Pro" },
      {
        name: "description",
        content: "مركز التحكم الشامل لتخصيص الثيمات، التنبيهات، الخصوصية، اللغة، والنسخ الاحتياطي.",
      },
    ],
  }),
  component: SettingsPage,
});

function Toggle({
  on,
  onClick,
  disabled = false,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        on ? "grad-theme" : "bg-ghost border border-border/80",
      )}
      aria-label="Toggle"
    >
      <span
        className={cn(
          "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

function Group({
  id,
  title,
  icon,
  badge,
  children,
}: {
  id?: string;
  title: string;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-6 px-4">
      <div className="flex items-center justify-between mb-2">
        <p className="label-xs text-ink-light tracking-wider flex items-center gap-2 font-bold">
          {icon || <span className="h-2 w-2 rounded-full bg-hotpink" />}
          <span>{title}</span>
        </p>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-hotpink border border-pink-200 dark:border-pink-900/60">
            {badge}
          </span>
        )}
      </div>
      <div className="divide-y divide-border/60 overflow-hidden rounded-3xl bg-card shadow-card border border-border/60">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  subtitle,
  icon,
  right,
  onClick,
  destructive = false,
}: {
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4.5 py-3.5 transition-colors",
        onClick && "cursor-pointer hover:bg-surface/50 active:bg-surface",
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        {icon && (
          <span className={cn("shrink-0", destructive ? "text-danger" : "text-ink-light")}>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p
            className={cn(
              "text-[14px] font-bold truncate",
              destructive ? "text-danger" : "text-ink",
            )}
          >
            {label}
          </p>
          {subtitle && (
            <p className="text-[11px] font-medium text-ink-light mt-0.5 leading-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0">
        {right ??
          (onClick ? <ChevronRight size={16} className="text-ink-light rtl:rotate-180" /> : null)}
      </div>
    </div>
  );
}

function SettingsPage() {
  const navigate = useNavigate();
  const { state, setPrefs, updateUser, resetData } = useApp();
  const { t, lang, setLang } = useLang();
  const isAr = lang === "ar";

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSectionFilter, setActiveSectionFilter] = useState<string>("all");

  // Edit Profile modal state
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState(state.user?.name || (isAr ? "الجميلة" : "Beautiful"));
  const [selectedEmoji, setSelectedEmoji] = useState(state.user?.emoji || "🌸");
  const [bioInput, setBioInput] = useState(state.prefs?.userBio || "");

  // Notification Test & Permissions
  const [testToastVisible, setTestToastVisible] = useState(false);
  const [notifPerm, setNotifPerm] = useState<string>(() => notifStatus());

  // Selective Export modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedExportCats, setSelectedExportCats] = useState<ExportCategory[]>([
    "tasks",
    "habits",
    "routines",
    "goals",
    "journal",
    "deen",
    "wellness",
    "finances",
    "business",
    "travel",
    "settings",
  ]);

  // Import Backup inspection modal
  const [importInspectResult, setImportInspectResult] = useState<BackupInspectionResult | null>(
    null,
  );

  // Sign out & Account delete modals
  const [signOutModalOpen, setSignOutModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Diagnostics copy feedback
  const [copiedDiag, setCopiedDiag] = useState(false);
  const [cacheClearFeedback, setCacheClearFeedback] = useState(false);

  // Informational modals (Help, Privacy, Terms)
  const [infoModalType, setInfoModalType] = useState<"help" | "privacy" | "terms" | null>(null);

  // Active preferences shortcuts
  const prefs = state.prefs;
  const currentSound = (prefs.soundType as SoundType) || "chime";
  const soundEnabled = prefs.soundNotif ?? true;
  const quietHours = prefs.quietHours || { enabled: false, startTime: "22:00", endTime: "07:00" };
  const quietActiveNow = isWithinQuietHours(quietHours);
  const storageMetrics = useMemo(() => calculateStorageMetrics(state), [state]);

  // Sync notif status
  useEffect(() => {
    setNotifPerm(notifStatus());
  }, []);

  const handleRequestNotif = async () => {
    const res = await requestNotifPermission();
    setNotifPerm(res);
    if (res === "granted") {
      showNotif(
        "AYXA Planner Pro 🌸",
        isAr ? "تم تفعيل إشعارات التطبيق بنجاح! ✨" : "Notifications enabled successfully! ✨",
      );
    }
  };

  const handleSoundSelect = (soundId: SoundType) => {
    setPrefs({ soundType: soundId });
    playNotificationSound(soundId, 0.6);
  };

  const handleTestNotification = () => {
    if (soundEnabled && !quietActiveNow) {
      playNotificationSound(currentSound, 0.7);
    }
    if (prefs.hapticFeedback) {
      triggerHaptic("success");
    }
    setTestToastVisible(true);
    setTimeout(() => setTestToastVisible(false), 4000);

    try {
      showNotif(
        "AYXA Planner Pro ✨",
        isAr
          ? "حان وقت مراجعة الأهداف والورد اليومي 🌸"
          : "Time for daily planning & mindful pause 🌸",
      );
    } catch {
      // Safe fallback
    }
  };

  const handleSaveProfile = () => {
    updateUser({
      name: nameInput.trim() || (isAr ? "الجميلة" : "Beautiful"),
      emoji: selectedEmoji,
    });
    setPrefs({ userBio: bioInput.trim() });
    setEditingProfile(false);
  };

  const handleExportSelected = () => {
    const payload = buildExportPayload(state, selectedExportCats);
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `ayxa-planner-backup-${new Date().toISOString().slice(0, 10)}.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setExportModalOpen(false);
  };

  const handleFileSelectForImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = inspectBackupJson(event.target?.result as string);
      setImportInspectResult(result);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleApplyImport = () => {
    if (!importInspectResult || !importInspectResult.payload) return;
    try {
      localStorage.setItem("ayxa-app-state-v2", JSON.stringify(importInspectResult.payload));
      alert(
        isAr
          ? "تم استرجاع النسخة الاحتياطية بنجاح! سيتم تحديث الصفحة الآن."
          : "Backup imported successfully! Reloading page now.",
      );
      window.location.reload();
    } catch {
      alert(isAr ? "خطأ في حفظ البيانات المسترجعة." : "Error saving restored data.");
    }
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      setCacheClearFeedback(true);
      setTimeout(() => setCacheClearFeedback(false), 3000);
    } catch {
      // safe fallback
    }
  };

  const handleCopyDiagnostics = () => {
    const report = generateDiagnosticsReport(state, lang);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(report);
      setCopiedDiag(true);
      setTimeout(() => setCopiedDiag(false), 3000);
    }
  };

  const handleDeleteAccountPermanent = () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE" && deleteConfirmText.trim() !== "حذف") {
      alert(isAr ? "يرجى كتابة كلمة DELETE أو حذف للتأكيد." : "Please type DELETE to confirm.");
      return;
    }
    resetData();
    localStorage.clear();
    sessionStorage.clear();
    alert(isAr ? "تم مسح كافة البيانات وإعادة ضبط التطبيق." : "All account data has been erased.");
    window.location.href = "/";
  };

  // Section Filter Matcher
  const isSectionVisible = (sectionId: string, searchKeywords: string[]) => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return searchKeywords.some((k) => k.toLowerCase().includes(query));
    }
    return activeSectionFilter === sectionId;
  };

  const sectionsList = [
    { id: "account", name: t("sectionAccount"), icon: "👤" },
    { id: "region", name: t("sectionRegion"), icon: "🌐" },
    { id: "appearance", name: t("sectionAppearance"), icon: "🎨" },
    { id: "notifications", name: t("sectionNotifications"), icon: "🔔" },
    { id: "privacy", name: t("sectionPrivacy"), icon: "🔒" },
    { id: "health", name: t("sectionHealth"), icon: "❤️" },
    { id: "data", name: t("sectionDataStorage"), icon: "💾" },
    { id: "accessibility", name: t("sectionAccessibility"), icon: "👁️" },
    { id: "preferences", name: t("sectionPreferences"), icon: "⚙️" },
    { id: "about", name: t("sectionAbout"), icon: "ℹ️" },
  ];

  return (
    <MobileShell>
      <Screen>
        {/* Floating Test Alert Preview */}
        {testToastVisible && (
          <div className="fixed top-4 left-4 right-4 z-50 animate-bounce-short">
            <div className="rounded-3xl border border-pink-300/80 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 p-4 text-white shadow-rose-lg flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl shadow-inner">
                  🔔
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-white">AYXA Planner Pro ✨</h4>
                  <p className="text-xs text-pink-100 font-medium">
                    {isAr
                      ? "حان وقت مراجعة الأهداف والورد اليومي 🌸"
                      : "Time for daily planning & mindful pause 🌸"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestToastVisible(false)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Top Header Navigation */}
        <div className="px-4 pt-5 pb-2">
          <div className="flex items-center justify-between">
            <Link
              to="/more"
              aria-label="Back"
              className="cursor-pointer pointer-events-auto touch-manipulation flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card border border-border/80 text-ink shadow-sm hover:bg-surface active:scale-90 transition-transform"
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180 transition-transform" />
            </Link>
            <div className="text-center">
              <h1 className="text-base font-extrabold text-ink leading-tight">
                {t("settingsControlCenter")}
              </h1>
              <p className="text-[11px] font-medium text-ink-light">{t("settingsSubtitle")}</p>
            </div>
            <div className="w-11" />
          </div>

          {/* Search Input Bar */}
          <div className="mt-4 relative">
            <Search
              size={16}
              className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-ink-light"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchSettings")}
              className="w-full h-11 rounded-2xl border border-border/80 bg-card pl-10 pr-9 rtl:pl-9 rtl:pr-10 text-xs font-semibold text-ink placeholder:text-ink-light/60 outline-none focus:border-hotpink focus:ring-2 focus:ring-hotpink/20 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink cursor-pointer p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Filter Section Pills */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveSectionFilter("all")}
              className={cn(
                "cursor-pointer shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border",
                activeSectionFilter === "all"
                  ? "grad-theme text-white border-transparent shadow-xs"
                  : "bg-card border-border/70 text-ink-light hover:text-ink",
              )}
            >
              {t("allSections")}
            </button>
            {sectionsList.map((sec) => (
              <button
                type="button"
                key={sec.id}
                onClick={() => setActiveSectionFilter(sec.id)}
                className={cn(
                  "cursor-pointer shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border",
                  activeSectionFilter === sec.id
                    ? "grad-theme text-white border-transparent shadow-xs"
                    : "bg-card border-border/70 text-ink-light hover:text-ink",
                )}
              >
                <span>{sec.icon}</span>
                <span>{sec.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── RETURN NAVIGATION (Shown when viewing a specific section) ── */}
        {activeSectionFilter !== "all" && (
          <div className="px-4 mt-3 mb-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveSectionFilter("all")}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card border border-border/80 text-xs font-bold text-ink hover:text-hotpink hover:border-pink-300 transition-all active:scale-95 shadow-xs"
            >
              <ArrowLeft size={14} className={isAr ? "rotate-180" : ""} />
              <span>{isAr ? "العودة لجميع الإعدادات" : "Back to All Settings"}</span>
            </button>
            <span className="text-xs font-bold text-hotpink bg-pink-50 dark:bg-pink-950/40 px-3 py-1 rounded-full border border-pink-200 dark:border-pink-900">
              {sectionsList.find((s) => s.id === activeSectionFilter)?.name}
            </span>
          </div>
        )}

        {/* ── SECTION 1: ACCOUNT & PROFILE (Shown on Hub landing, Account view, or Search) ── */}
        {(activeSectionFilter === "all" ||
          activeSectionFilter === "account" ||
          isSectionVisible("account", [
            "account",
            "profile",
            "guest",
            "sign in",
            "signup",
            "user",
            "delete",
            "name",
            "bio",
            "avatar",
          ])) && (
          <div className="px-4 mt-3">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-purple-500/10 p-5 border border-pink-200/80 dark:border-pink-900/50 shadow-rose-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="grad-theme flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-rose-md ring-2 ring-white dark:ring-pink-950">
                      {state.user?.emoji || "🌸"}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h2 className="text-base font-extrabold text-ink leading-tight">
                        {state.user?.name || (isAr ? "الجميلة" : "Beautiful")}
                      </h2>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                          state.user?.isGuest
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
                        )}
                      >
                        {state.user?.isGuest ? t("localGuestMode") : t("authenticatedMember")}
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-ink-light mt-0.5 truncate">
                      {state.user?.isGuest
                        ? isAr
                          ? "البيانات محفوظة على هذا الجهاز محلياً"
                          : "Data saved locally on this device"
                        : state.user?.email || "user@ayxaplanner.app"}
                    </p>

                    {prefs?.userBio && (
                      <p className="text-[11px] font-semibold text-hotpink mt-1 italic line-clamp-1">
                        "{prefs.userBio}"
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingProfile(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-card px-3 py-1.5 text-xs font-bold text-hotpink border border-pink-200 dark:border-pink-800 shadow-xs hover:bg-pink-50 transition-colors cursor-pointer shrink-0 active:scale-95"
                >
                  <Edit3 size={12} />
                  <span>{t("editProfile")}</span>
                </button>
              </div>

              {/* Guest Callout / Auth CTA */}
              {state.user?.isGuest ? (
                <div className="mt-4 pt-3.5 border-t border-pink-200/50 dark:border-pink-900/40 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-medium text-ink-light max-w-[200px]">
                    {t("localGuestDesc")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setExportModalOpen(true)}
                      className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-card text-hotpink border border-pink-200 dark:border-pink-800 hover:bg-pink-50 transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Download size={11} />
                      <span>{t("exportMyData")}</span>
                    </button>
                    <Link
                      to="/auth/sign-in"
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-card text-ink border border-border/80 hover:bg-surface transition-colors cursor-pointer shadow-xs"
                    >
                      {t("signIn")}
                    </Link>
                    <Link
                      to="/auth/sign-up"
                      className="grad-theme px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                    >
                      {t("createAccount")}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 pt-3.5 border-t border-pink-200/50 dark:border-pink-900/40 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-ink-light">
                    {state.user?.isPro ? t("proPlanActive") : t("freePlan")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSignOutModalOpen(true)}
                    className="text-xs font-bold text-danger hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <LogOut size={12} />
                    <span>{t("signOut")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS HUB: 8 FOCUSED SECTION CARDS GRID ── */}
        {activeSectionFilter === "all" && !searchQuery.trim() && (
          <div className="px-4 mt-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-extrabold text-ink uppercase tracking-wider">
                {isAr ? "أقسام الإعدادات 🌸" : "Settings Sections 🌸"}
              </h3>
              <span className="text-[11px] font-bold text-ink-light">
                8 {isAr ? "أقسام رئيسية" : "focused sections"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                {
                  id: "region",
                  icon: "🌐",
                  title: isAr ? "اللغة والمنطقة" : "Language & Region",
                  desc: isAr ? "العربية • بداية الأسبوع" : "Language • First Day",
                  badge: lang.toUpperCase(),
                },
                {
                  id: "appearance",
                  icon: "🎨",
                  title: isAr ? "المظهر والسمات" : "Appearance",
                  desc: isAr ? "الوضع الليلي والسمات" : "Themes & Palette",
                  badge: prefs.theme,
                },
                {
                  id: "notifications",
                  icon: "🔔",
                  title: isAr ? "الإشعارات والأصوات" : "Notifications",
                  desc: isAr ? "التنبيهات وساعات الهدوء" : "Alerts & Quiet hours",
                  badge: notifPerm === "granted" ? "On" : "Off",
                },
                {
                  id: "privacy",
                  icon: "🔒",
                  title: isAr ? "الخصوصية والأمان" : "Privacy & Security",
                  desc: isAr ? "قفل اليوميات والحماية" : "Journal lock & PIN",
                  badge: prefs.journalPinRequired ? "Locked" : "Open",
                },
                {
                  id: "health",
                  icon: "❤️",
                  title: isAr ? "الصحة والدورة" : "Health & Cycles",
                  desc: isAr ? "تتبع الدورة وترطيب الجسم" : "Cycle & Wellness",
                  badge: "Wellness",
                },
                {
                  id: "data",
                  icon: "💾",
                  title: isAr ? "البيانات والنسخ" : "Data & Backup",
                  desc: isAr ? "تصدير ونسخ واستيراد" : "Backup & Export",
                  badge: `${storageMetrics.totalRecords} rec`,
                },
                {
                  id: "accessibility",
                  icon: "👁️",
                  title: isAr ? "إمكانية الوصول" : "Accessibility",
                  desc: isAr ? "تكبير الخط وتقليل الحركة" : "Font scaling & Motion",
                  badge: "A11y",
                },
                {
                  id: "about",
                  icon: "ℹ️",
                  title: isAr ? "عن التطبيق" : "About AYXA",
                  desc: isAr ? "الإصدار وسياسة الخصوصية" : "Version 2.0 & Terms",
                  badge: "v2.0",
                },
              ].map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveSectionFilter(card.id)}
                  className="cursor-pointer p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-pink-300 hover:shadow-sm active:scale-[0.98] transition-all text-start flex flex-col justify-between space-y-2 group"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl p-1.5 rounded-xl bg-surface border border-border/50 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-hotpink border border-pink-200 dark:bg-pink-950/40 dark:border-pink-900 truncate max-w-[70px]">
                      {card.badge}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-ink group-hover:text-hotpink transition-colors truncate">
                      {card.title}
                    </h4>
                    <p className="text-[10px] font-medium text-ink-light truncate mt-0.5">
                      {card.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-hotpink pt-1 border-t border-border/40 w-full justify-between">
                    <span>{isAr ? "فتح القسم" : "Configure"}</span>
                    <ChevronRight size={12} className={isAr ? "rotate-180" : ""} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 2: LANGUAGE & REGION ───────────────────────────────── */}
        {isSectionVisible("region", [
          "language",
          "arabic",
          "english",
          "region",
          "timezone",
          "currency",
          "week",
          "date",
          "time",
          "format",
          "units",
        ]) && (
          <Group
            id="section-region"
            title={t("sectionRegion")}
            icon={<Globe size={14} className="text-hotpink" />}
          >
            {/* App Language (NO national flags) */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-ink">{t("language")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {isAr
                    ? "اختيار لغة الواجهة والاتجاه"
                    : "Choose interface language & layout direction"}
                </p>
              </div>
              <div className="flex rounded-full bg-ghost border border-border/60 p-1">
                <button
                  type="button"
                  onClick={() => setLang("ar")}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-1 text-xs font-bold transition-all",
                    lang === "ar"
                      ? "grad-theme text-white shadow-sm"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-1 text-xs font-bold transition-all",
                    lang === "en"
                      ? "grad-theme text-white shadow-sm"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  English
                </button>
              </div>
            </div>

            {/* Timezone */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div className="pr-2">
                <p className="text-[14px] font-bold text-ink">{t("timezone")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {prefs.timezone === "auto" || !prefs.timezone
                    ? isAr
                      ? "مضبوط تلقائياً حسب توقيت جهازك"
                      : "Auto-detected from your device system"
                    : prefs.timezone}
                </p>
              </div>
              <select
                value={prefs.timezone || "auto"}
                onChange={(e) => setPrefs({ timezone: e.target.value })}
                className="rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-hotpink cursor-pointer"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {isAr ? tz.nameAr : tz.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Format */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-ink">{t("timeFormat")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {prefs.timeFormat === "24h" ? t("time24h") : t("time12h")}
                </p>
              </div>
              <div className="flex rounded-full bg-ghost border border-border/60 p-1">
                <button
                  type="button"
                  onClick={() => setPrefs({ timeFormat: "12h" })}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-all",
                    (prefs.timeFormat || "12h") === "12h"
                      ? "grad-theme text-white shadow-sm"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  12h
                </button>
                <button
                  type="button"
                  onClick={() => setPrefs({ timeFormat: "24h" })}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-all",
                    prefs.timeFormat === "24h"
                      ? "grad-theme text-white shadow-sm"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  24h
                </button>
              </div>
            </div>

            {/* Date Format */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-ink">{t("dateFormat")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {isAr ? "طريقة عرض التواريخ في الجداول" : "Format for date displays"}
                </p>
              </div>
              <select
                value={prefs.dateFormat || "YYYY-MM-DD"}
                onChange={(e) => setPrefs({ dateFormat: e.target.value as DateFormatOption })}
                className="rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-hotpink cursor-pointer"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-05)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (05/09/2026)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (09/05/2026)</option>
                <option value="D MMMM YYYY">D MMMM YYYY (5 Sep 2026)</option>
              </select>
            </div>

            {/* First Day of Week */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-ink">{t("weekStartsOn")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {isAr ? "بداية التقويم الأسبوعي" : "First column in calendar grids"}
                </p>
              </div>
              <div className="flex rounded-full bg-ghost border border-border/60 p-1">
                {(["saturday", "sunday", "monday"] as WeekStartDay[]).map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => setPrefs({ weekStartsOn: day })}
                    className={cn(
                      "cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold transition-all",
                      (prefs.weekStartsOn || "saturday") === day
                        ? "grad-theme text-white shadow-sm"
                        : "text-ink-light hover:text-ink",
                    )}
                  >
                    {t(day)}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Currency */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-ink">{t("primaryCurrency")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {isAr
                    ? "العملة المستخدمة في الميزانية والأعمال"
                    : "Default for budget & business tracking"}
                </p>
              </div>
              <select
                value={prefs.currency || "MAD"}
                onChange={(e) => setPrefs({ currency: e.target.value })}
                className="rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-hotpink cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol}) — {isAr ? curr.nameAr : curr.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Measurement Units */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-ink">{t("measurementUnit")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {prefs.measurementUnit === "imperial" ? t("imperial") : t("metric")}
                </p>
              </div>
              <div className="flex rounded-full bg-ghost border border-border/60 p-1">
                <button
                  type="button"
                  onClick={() => setPrefs({ measurementUnit: "metric" })}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-all",
                    (prefs.measurementUnit || "metric") === "metric"
                      ? "grad-theme text-white shadow-sm"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  Metric (ml/km)
                </button>
                <button
                  type="button"
                  onClick={() => setPrefs({ measurementUnit: "imperial" })}
                  className={cn(
                    "cursor-pointer rounded-full px-3 py-1 text-xs font-bold transition-all",
                    prefs.measurementUnit === "imperial"
                      ? "grad-theme text-white shadow-sm"
                      : "text-ink-light hover:text-ink",
                  )}
                >
                  Imperial (oz/mi)
                </button>
              </div>
            </div>
          </Group>
        )}

        {/* ── SECTION 3: APPEARANCE & THEMES ─────────────────────────────── */}
        {isSectionVisible("appearance", [
          "appearance",
          "theme",
          "dark",
          "light",
          "system",
          "mode",
          "color",
          "rose",
          "emerald",
          "lavender",
          "gold",
          "mint",
          "ocean",
          "contrast",
          "transparency",
        ]) && (
          <Group
            id="section-appearance"
            title={t("sectionAppearance")}
            icon={<Palette size={14} className="text-hotpink" />}
          >
            {/* Appearance Mode (System / Light / Dark) */}
            <div className="px-4.5 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-bold text-ink">{t("appearanceMode")}</p>
                  <p className="text-[11px] font-medium text-ink-light mt-0.5">
                    {isAr
                      ? "مزامنة المظهر مع نظام جهازك أو اختيار نمط محدد"
                      : "Sync with device OS or select fixed mode"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { id: "system", label: t("systemMode"), icon: Laptop },
                  { id: "light", label: t("lightMode"), icon: Sun },
                  { id: "dark", label: t("darkModeTitle"), icon: Moon },
                ].map((item) => {
                  const isSelected = (prefs.appearanceMode || "system") === item.id;
                  const IconComp = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setPrefs({ appearanceMode: item.id as AppearanceMode })}
                      className={cn(
                        "cursor-pointer flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all active:scale-95 shadow-xs",
                        isSelected
                          ? "border-hotpink bg-pink-50/90 dark:bg-pink-950/60 ring-2 ring-hotpink/40 text-hotpink"
                          : "border-border bg-surface hover:border-pink-300 text-ink",
                      )}
                    >
                      <IconComp size={18} className="mb-1" />
                      <span className="text-xs font-bold truncate w-full text-center">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6 Unclipped Theme Swatches */}
            <div className="px-4.5 py-3.5">
              <p className="text-[14px] font-bold text-ink">{t("themeColor")}</p>
              <p className="text-[11px] font-medium text-ink-light mt-0.5">
                {isAr ? "اختيار ألوان الواجهة المتناسقة للتطبيق" : "Select your palette accent"}
              </p>

              <div className="mt-3.5 grid grid-cols-3 gap-2.5">
                {THEME_PRESETS.map((tItem) => {
                  const isSelected = (prefs.theme || "rose") === tItem.name;
                  return (
                    <button
                      type="button"
                      key={tItem.name}
                      onClick={() => {
                        setPrefs({ theme: tItem.name });
                        document.documentElement.style.setProperty("--theme-from", tItem.from);
                        document.documentElement.style.setProperty("--theme-to", tItem.to);
                        document.documentElement.style.setProperty("--hotpink", tItem.primary);
                      }}
                      className={cn(
                        "cursor-pointer relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all active:scale-95 shadow-xs",
                        isSelected
                          ? "border-hotpink bg-pink-50/90 dark:bg-pink-950/60 ring-2 ring-hotpink/40 shadow-sm"
                          : "border-border bg-surface hover:border-pink-300",
                      )}
                    >
                      <div
                        className="h-8 w-8 rounded-full shadow-inner border border-white dark:border-pink-950 flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${tItem.from}, ${tItem.to})`,
                        }}
                      >
                        {isSelected && <Check size={16} className="text-white font-black" />}
                      </div>
                      <span className="mt-2 text-[11px] font-bold text-ink text-center leading-tight">
                        {isAr ? tItem.nameAr : tItem.nameEn}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* High Contrast */}
            <Row
              label={t("highContrast")}
              subtitle={t("highContrastDesc")}
              icon={<Eye size={16} />}
              right={
                <Toggle
                  on={Boolean(prefs.accessibility?.highContrast)}
                  onClick={() =>
                    setPrefs({
                      accessibility: {
                        ...prefs.accessibility!,
                        highContrast: !prefs.accessibility?.highContrast,
                      },
                    })
                  }
                />
              }
            />

            {/* Reduce Transparency */}
            <Row
              label={t("reduceTransparency")}
              subtitle={t("reduceTransparencyDesc")}
              icon={<Layers size={16} />}
              right={
                <Toggle
                  on={Boolean(prefs.accessibility?.reduceTransparency)}
                  onClick={() =>
                    setPrefs({
                      accessibility: {
                        ...prefs.accessibility!,
                        reduceTransparency: !prefs.accessibility?.reduceTransparency,
                      },
                    })
                  }
                />
              }
            />
          </Group>
        )}

        {/* ── SECTION 4: NOTIFICATIONS & SMART REMINDERS ─────────────────── */}
        {isSectionVisible("notifications", [
          "notification",
          "sound",
          "chime",
          "quiet hours",
          "alert",
          "dhikr",
          "quote",
          "task",
          "water",
          "habits",
          "focus",
          "quran",
          "invoices",
          "budget",
          "journal",
          "haptic",
        ]) && (
          <Group
            id="section-notifications"
            title={t("sectionNotifications")}
            icon={<Bell size={14} className="text-hotpink" />}
          >
            {/* System Permission Card */}
            <div className="p-4 bg-surface/60 border-b border-border/40">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm",
                      notifPerm === "granted"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : notifPerm === "denied"
                          ? "bg-rose-100 text-danger dark:bg-rose-950 dark:text-rose-300"
                          : "bg-pink-100 text-hotpink dark:bg-pink-950",
                    )}
                  >
                    {notifPerm === "granted" ? "✓" : notifPerm === "denied" ? "✕" : "🔔"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink truncate">
                      {notifPerm === "granted"
                        ? t("permissionActive")
                        : notifPerm === "denied"
                          ? t("permissionBlocked")
                          : isAr
                            ? "إذن الإشعارات غير مفعل بعد"
                            : "Notification permission pending"}
                    </p>
                    {notifPerm === "denied" && (
                      <p className="text-[10px] text-ink-light mt-0.5 leading-tight">
                        {t("permissionBlockedDesc")}
                      </p>
                    )}
                  </div>
                </div>

                {notifPerm === "denied" ? (
                  <button
                    type="button"
                    onClick={() => {
                      alert(
                        isAr
                          ? "يُرجى النقر على أيقونة القفل أو الإعدادات بجانب شريط العنوان في المتصفح وتفعيل 'الإشعارات'."
                          : "Please tap the lock / settings icon next to your browser address bar and enable 'Notifications'.",
                      );
                    }}
                    className="px-3 py-1.5 rounded-full bg-rose-100 text-danger dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[11px] font-bold shadow-xs active:scale-95 transition-transform cursor-pointer shrink-0"
                  >
                    {t("openDeviceSettings")}
                  </button>
                ) : notifPerm !== "granted" ? (
                  <button
                    type="button"
                    onClick={handleRequestNotif}
                    className="grad-theme px-3 py-1.5 rounded-full text-white text-[11px] font-bold shadow-xs active:scale-95 transition-transform cursor-pointer shrink-0"
                  >
                    {t("enableNotifBtn")}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Master Sound Effects */}
            <div className="px-4.5 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 pr-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-950 text-hotpink shrink-0">
                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </span>
                  <div>
                    <p className="text-[14px] font-bold text-ink">{t("soundNotif")}</p>
                    <p className="text-[11px] font-medium text-ink-light mt-0.5">
                      {t("soundNotifDesc")}
                    </p>
                  </div>
                </div>
                <Toggle
                  on={soundEnabled}
                  onClick={() => {
                    const next = !soundEnabled;
                    setPrefs({ soundNotif: next });
                    if (next) playNotificationSound(currentSound, 0.5);
                  }}
                />
              </div>

              {/* Sound Melody Selector */}
              {soundEnabled && (
                <div className="mt-4 pt-3 border-t border-border/50">
                  <p className="text-xs font-bold text-ink mb-2.5 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-hotpink" />
                    <span>{t("soundTone")}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {NOTIFICATION_SOUNDS.map((snd) => {
                      const isSelected = currentSound === snd.id;
                      return (
                        <button
                          type="button"
                          key={snd.id}
                          onClick={() => handleSoundSelect(snd.id)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer text-left rtl:text-right",
                            isSelected
                              ? "border-hotpink bg-pink-50/90 dark:bg-pink-950/60 text-hotpink ring-1 ring-hotpink"
                              : "border-border bg-surface hover:bg-pink-50/40 text-ink",
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{snd.emoji}</span>
                            <span className="text-xs font-bold truncate">
                              {isAr ? snd.nameAr : snd.nameEn}
                            </span>
                          </div>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white dark:bg-card border border-border shadow-xs text-hotpink">
                            <Play size={10} className="fill-current ml-0.5 rtl:mr-0.5" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Haptic Vibration */}
            <Row
              label={t("hapticFeedback")}
              subtitle={
                isAr
                  ? "اهتزاز لطيف عند النقر والتسبيح"
                  : "Tactile feedback for button taps & tasbih"
              }
              icon={<Smartphone size={16} />}
              right={
                <Toggle
                  on={Boolean(prefs.hapticFeedback)}
                  onClick={() => {
                    const next = !prefs.hapticFeedback;
                    setPrefs({ hapticFeedback: next });
                    if (next) triggerHaptic("light");
                  }}
                />
              }
            />

            {/* Instant Test Alert Trigger */}
            <div className="p-4 bg-surface/40 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-ink">{t("testSound")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {isAr
                    ? "تجربة سماع الرنين واستلام الإشعار"
                    : "Hear audio chime and preview test alert"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestNotification}
                className="grad-theme px-3.5 py-1.5 rounded-full text-white text-xs font-bold shadow-rose-sm active:scale-95 transition-transform cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <Bell size={13} />
                <span>{isAr ? "تجربة التنبيه 🔔" : "Test Alert 🔔"}</span>
              </button>
            </div>

            {/* Quiet Hours (Do Not Disturb) */}
            <div className="px-4.5 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-bold text-ink">{t("quietHours")}</p>
                    {quietActiveNow && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {t("quietHoursActive")}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-ink-light mt-0.5">
                    {t("quietHoursDesc")}
                  </p>
                </div>
                <Toggle
                  on={Boolean(quietHours.enabled)}
                  onClick={() =>
                    setPrefs({
                      quietHours: {
                        ...quietHours,
                        enabled: !quietHours.enabled,
                      },
                    })
                  }
                />
              </div>

              {quietHours.enabled && (
                <div className="mt-3.5 grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                  <div>
                    <label className="text-[10px] font-bold text-ink-light uppercase">
                      {t("quietStartTime")}
                    </label>
                    <input
                      type="time"
                      value={quietHours.startTime}
                      onChange={(e) =>
                        setPrefs({
                          quietHours: {
                            ...quietHours,
                            startTime: e.target.value,
                          },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-border bg-canvas p-2 text-xs font-bold text-ink outline-none focus:border-hotpink"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink-light uppercase">
                      {t("quietEndTime")}
                    </label>
                    <input
                      type="time"
                      value={quietHours.endTime}
                      onChange={(e) =>
                        setPrefs({
                          quietHours: {
                            ...quietHours,
                            endTime: e.target.value,
                          },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-border bg-canvas p-2 text-xs font-bold text-ink outline-none focus:border-hotpink"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 10 Granular Notification Categories */}
            <div className="divide-y divide-border/40">
              <Row
                label={t("notifQuote")}
                subtitle={
                  isAr
                    ? "اقتباس ملهم ونية صباحية كل يوم 07:00 ص"
                    : "Daily morning inspiration at 07:00 AM"
                }
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.quote ?? prefs.quoteNotif)}
                    onClick={() => {
                      const next = !(prefs.notifCategories?.quote ?? prefs.quoteNotif);
                      setPrefs({
                        quoteNotif: next,
                        notifCategories: { ...prefs.notifCategories!, quote: next },
                      });
                    }}
                  />
                }
              />
              <Row
                label={t("notifDhikr")}
                subtitle={
                  isAr
                    ? "تذكير مواقيت الصلوات وأذكار الصباح والمساء"
                    : "Prayer times, morning & evening adhkar"
                }
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.dhikr ?? prefs.dhikrNotif)}
                    onClick={() => {
                      const next = !(prefs.notifCategories?.dhikr ?? prefs.dhikrNotif);
                      setPrefs({
                        dhikrNotif: next,
                        notifCategories: { ...prefs.notifCategories!, dhikr: next },
                      });
                    }}
                  />
                }
              />
              <Row
                label={t("notifTask")}
                subtitle={
                  isAr ? "تنبيه عند اقتراب مواعيد المهام المهمة" : "Reminders before task due times"
                }
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.task ?? prefs.taskNotif)}
                    onClick={() => {
                      const next = !(prefs.notifCategories?.task ?? prefs.taskNotif);
                      setPrefs({
                        taskNotif: next,
                        notifCategories: { ...prefs.notifCategories!, task: next },
                      });
                    }}
                  />
                }
              />
              <Row
                label={t("notifWater")}
                subtitle={isAr ? "تذكير دوري للترطيب وشرب الماء" : "Gentle hydration intervals"}
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.water)}
                    onClick={() =>
                      setPrefs({
                        notifCategories: {
                          ...prefs.notifCategories!,
                          water: !prefs.notifCategories?.water,
                        },
                      })
                    }
                  />
                }
              />
              <Row
                label={t("notifHabits")}
                subtitle={
                  isAr
                    ? "تذكير العادات اليومية والحفاظ على السلسلة"
                    : "Daily habit trackers and streaks"
                }
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.habits)}
                    onClick={() =>
                      setPrefs({
                        notifCategories: {
                          ...prefs.notifCategories!,
                          habits: !prefs.notifCategories?.habits,
                        },
                      })
                    }
                  />
                }
              />
              <Row
                label={t("notifFocus")}
                subtitle={
                  isAr
                    ? "تنبيه انتهاء جلسات بومودورو وفترات الاستراحة"
                    : "Focus timer completion and rest alerts"
                }
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.focus)}
                    onClick={() =>
                      setPrefs({
                        notifCategories: {
                          ...prefs.notifCategories!,
                          focus: !prefs.notifCategories?.focus,
                        },
                      })
                    }
                  />
                }
              />
              <Row
                label={t("notifQuran")}
                subtitle={
                  isAr
                    ? "تذكير الورد القرآني وسورة الكهف يوم الجمعة"
                    : "Quran daily reading & Friday Surah Al-Kahf"
                }
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.quran)}
                    onClick={() =>
                      setPrefs({
                        notifCategories: {
                          ...prefs.notifCategories!,
                          quran: !prefs.notifCategories?.quran,
                        },
                      })
                    }
                  />
                }
              />
              <Row
                label={t("notifInvoices")}
                subtitle={
                  isAr
                    ? "تنبيه استحقاق الفواتير وتسليمات المشاريع"
                    : "Invoice payment due dates & milestone deliverables"
                }
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.invoices)}
                    onClick={() =>
                      setPrefs({
                        notifCategories: {
                          ...prefs.notifCategories!,
                          invoices: !prefs.notifCategories?.invoices,
                        },
                      })
                    }
                  />
                }
              />
              <Row
                label={t("notifBudget")}
                subtitle={
                  isAr
                    ? "تنبيه تجاوز حد الميزانية وأهداف الادخار"
                    : "Budget threshold alerts & savings goals"
                }
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.budget)}
                    onClick={() =>
                      setPrefs({
                        notifCategories: {
                          ...prefs.notifCategories!,
                          budget: !prefs.notifCategories?.budget,
                        },
                      })
                    }
                  />
                }
              />
              <Row
                label={t("notifJournal")}
                subtitle={
                  isAr
                    ? "تذكير تدوين الامتنان وتفريغ المشاعر مساءً"
                    : "Evening gratitude & journaling check-in"
                }
                right={
                  <Toggle
                    on={Boolean(prefs.notifCategories?.journal)}
                    onClick={() =>
                      setPrefs({
                        notifCategories: {
                          ...prefs.notifCategories!,
                          journal: !prefs.notifCategories?.journal,
                        },
                      })
                    }
                  />
                }
              />
            </div>
          </Group>
        )}

        {/* ── SECTION 5: PRIVACY & SECURITY ──────────────────────────────── */}
        {isSectionVisible("privacy", [
          "privacy",
          "security",
          "journal lock",
          "pin",
          "ai",
          "preview",
          "mask",
          "blur",
        ]) && (
          <Group
            id="section-privacy"
            title={t("sectionPrivacy")}
            icon={<Shield size={14} className="text-hotpink" />}
          >
            {/* Journal PIN Lock */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div className="flex items-center gap-3 flex-1 pr-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 shrink-0">
                  <Lock size={18} />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-ink">{t("journalPinLock")}</p>
                  <p className="text-[11px] font-medium text-ink-light mt-0.5">
                    {state.journalSettings?.journalLockEnabled
                      ? isAr
                        ? "القفل برمز سري مفعّل ✓"
                        : "PIN passcode active ✓"
                      : t("journalPinLockDesc")}
                  </p>
                </div>
              </div>
              <Link
                to="/journal"
                search={{}}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-card border border-border shadow-xs text-ink hover:bg-surface transition-colors cursor-pointer"
              >
                {t("openJournalSecurity")}
              </Link>
            </div>

            {/* Notification Preview Privacy */}
            <Row
              label={t("hideNotifPreviews")}
              subtitle={t("hideNotifPreviewsDesc")}
              icon={<Eye size={16} />}
              right={
                <Toggle
                  on={Boolean(prefs.privacy?.hideSensitiveNotificationPreviews)}
                  onClick={() =>
                    setPrefs({
                      privacy: {
                        ...prefs.privacy!,
                        hideSensitiveNotificationPreviews:
                          !prefs.privacy?.hideSensitiveNotificationPreviews,
                      },
                    })
                  }
                />
              }
            />

            {/* AI Privacy Boundary */}
            <div className="p-4.5 bg-surface/50 border-t border-border/40">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-950 text-hotpink">
                  <Sparkle size={16} />
                </span>
                <div className="flex-1">
                  <h4 className="text-xs font-extrabold text-ink">{t("aiPrivacyBoundary")}</h4>
                  <p className="text-[11px] font-medium text-ink-light mt-0.5 leading-relaxed">
                    {t("aiPrivacyDesc")}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40">
                <span className="text-xs font-bold text-ink">{t("aiTaskContext")}</span>
                <Toggle
                  on={Boolean(prefs.privacy?.aiIncludeTaskContext)}
                  onClick={() =>
                    setPrefs({
                      privacy: {
                        ...prefs.privacy!,
                        aiIncludeTaskContext: !prefs.privacy?.aiIncludeTaskContext,
                      },
                    })
                  }
                />
              </div>
            </div>
          </Group>
        )}

        {/* ── SECTION 6: HEALTH & CONNECTIONS ────────────────────────────── */}
        {isSectionVisible("health", [
          "health",
          "apple health",
          "google health",
          "health connect",
          "wellness",
          "sync",
        ]) && (
          <Group
            id="section-health"
            title={t("sectionHealth")}
            icon={<Heart size={14} className="text-hotpink" />}
          >
            <div className="p-4.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-500 shrink-0">
                    <Heart size={18} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-ink">{t("healthManualStatus")}</h4>
                    <p className="text-[11px] text-ink-light mt-0.5">
                      {isAr
                        ? "تسجيل الماء، النوم، والخطوات محلياً"
                        : "Local logging for water, sleep, and steps"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Active
                </span>
              </div>

              <div className="mt-3.5 rounded-2xl bg-canvas p-3 border border-border/70 text-[11px] text-ink-light font-medium leading-relaxed">
                <div className="flex items-center gap-2 mb-1 text-ink font-bold">
                  <Info size={13} className="text-hotpink shrink-0" />
                  <span>Apple Health & Health Connect</span>
                </div>
                {t("healthNativeNote")}
              </div>
            </div>
          </Group>
        )}

        {/* ── SECTION 7: DATA, STORAGE & BACKUP ──────────────────────────── */}
        {isSectionVisible("data", [
          "data",
          "storage",
          "backup",
          "export",
          "import",
          "restore",
          "json",
          "clear",
          "cache",
          "reset",
        ]) && (
          <Group
            id="section-data"
            title={t("sectionDataStorage")}
            icon={<HardDrive size={14} className="text-hotpink" />}
          >
            {/* Storage Transparency Breakdown Card */}
            <div className="p-4.5 bg-surface/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-950 text-hotpink">
                    <HardDrive size={16} />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-ink">{t("storageBreakdown")}</h4>
                    <p className="text-[10px] text-ink-light font-semibold">
                      {t("storageLocalStatus")}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-hotpink bg-pink-50 dark:bg-pink-950 px-2.5 py-1 rounded-xl border border-pink-200 dark:border-pink-900">
                  {storageMetrics.formattedSize}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-ink-light pt-2 border-t border-border/40">
                <div className="rounded-xl bg-canvas p-1.5 border border-border/50">
                  <span className="block text-xs font-extrabold text-ink">
                    {storageMetrics.itemCounts.tasks}
                  </span>
                  <span>{t("tasks")}</span>
                </div>
                <div className="rounded-xl bg-canvas p-1.5 border border-border/50">
                  <span className="block text-xs font-extrabold text-ink">
                    {storageMetrics.itemCounts.habits}
                  </span>
                  <span>{isAr ? "العادات" : "Habits"}</span>
                </div>
                <div className="rounded-xl bg-canvas p-1.5 border border-border/50">
                  <span className="block text-xs font-extrabold text-ink">
                    {storageMetrics.itemCounts.goals}
                  </span>
                  <span>{isAr ? "الأهداف" : "Goals"}</span>
                </div>
                <div className="rounded-xl bg-canvas p-1.5 border border-border/50">
                  <span className="block text-xs font-extrabold text-ink">
                    {storageMetrics.itemCounts.journal}
                  </span>
                  <span>{t("journal")}</span>
                </div>
              </div>
            </div>

            {/* Selective Export */}
            <Row
              label={t("selectiveExport")}
              subtitle={t("selectiveExportDesc")}
              icon={<Download size={16} className="text-hotpink" />}
              onClick={() => setExportModalOpen(true)}
              right={<Download size={18} className="text-hotpink" />}
            />

            {/* Safe Import / Restore */}
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelectForImport}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <Row
                label={t("importBackup")}
                subtitle={t("importBackupDesc")}
                icon={<Upload size={16} className="text-emerald-500" />}
                right={<Upload size={18} className="text-emerald-500" />}
              />
            </div>

            {/* Clear Temporary Cache */}
            <Row
              label={t("clearCache")}
              subtitle={cacheClearFeedback ? t("cacheCleared") : t("clearCacheDesc")}
              icon={
                <RefreshCw
                  size={16}
                  className={cn("text-amber-500", cacheClearFeedback && "animate-spin")}
                />
              }
              onClick={handleClearCache}
              right={
                cacheClearFeedback ? (
                  <span className="text-xs font-bold text-emerald-500">✓ {t("copied")}</span>
                ) : (
                  <span className="text-xs font-bold text-ink-light">
                    {isAr ? "تنظيف" : "Clean"}
                  </span>
                )
              }
            />

            {/* Reset All Data */}
            <Row
              label={t("resetData")}
              subtitle={
                isAr
                  ? "مسح كافة المهام والعادات وإعادة التطبيق لحالته الأولية"
                  : "Clear all planner tasks, habits and start fresh"
              }
              icon={<Trash2 size={16} />}
              onClick={() => setDeleteModalOpen(true)}
              destructive
              right={<Trash2 size={18} className="text-danger" />}
            />
          </Group>
        )}

        {/* ── SECTION 8: ACCESSIBILITY ───────────────────────────────────── */}
        {isSectionVisible("accessibility", [
          "accessibility",
          "font",
          "scale",
          "text",
          "motion",
          "reduce motion",
          "gamification",
          "calm",
          "stress",
        ]) && (
          <Group
            id="section-accessibility"
            title={t("sectionAccessibility")}
            icon={<Eye size={14} className="text-hotpink" />}
          >
            {/* Text Scale */}
            <div className="px-4.5 py-3.5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[14px] font-bold text-ink">{t("textScale")}</p>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: "small", label: t("scaleSmall") },
                  { id: "normal", label: t("scaleNormal") },
                  { id: "large", label: t("scaleLarge") },
                  { id: "extra-large", label: t("scaleExtraLarge") },
                ].map((item) => {
                  const isSelected = (prefs.accessibility?.textScale || "normal") === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() =>
                        setPrefs({
                          accessibility: {
                            ...prefs.accessibility!,
                            textScale: item.id as TextScale,
                          },
                        })
                      }
                      className={cn(
                        "cursor-pointer p-2 rounded-xl border text-[11px] font-bold transition-all text-center",
                        isSelected
                          ? "grad-theme text-white border-transparent shadow-xs"
                          : "bg-surface border-border text-ink hover:border-pink-300",
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Text Scale Live Preview */}
              <div className="mt-3 p-3 rounded-2xl bg-canvas border border-border/70 text-center">
                <p className="text-xs font-semibold text-ink">{t("textScalePreview")}</p>
              </div>
            </div>

            {/* Reduce Motion */}
            <Row
              label={t("reduceMotion")}
              subtitle={t("reduceMotionDesc")}
              icon={<Sliders size={16} />}
              right={
                <Toggle
                  on={Boolean(prefs.accessibility?.reduceMotion)}
                  onClick={() =>
                    setPrefs({
                      accessibility: {
                        ...prefs.accessibility!,
                        reduceMotion: !prefs.accessibility?.reduceMotion,
                      },
                    })
                  }
                />
              }
            />

            {/* Reduced Gamification (Mindfulness Mode) */}
            <Row
              label={t("reducedGamification")}
              subtitle={t("reducedGamificationDesc")}
              icon={<Sparkles size={16} />}
              right={
                <Toggle
                  on={Boolean(prefs.accessibility?.reducedGamification)}
                  onClick={() =>
                    setPrefs({
                      accessibility: {
                        ...prefs.accessibility!,
                        reducedGamification: !prefs.accessibility?.reducedGamification,
                      },
                    })
                  }
                />
              }
            />
          </Group>
        )}

        {/* ── SECTION 9: GENERAL APP PREFERENCES ─────────────────────────── */}
        {isSectionVisible("preferences", [
          "preferences",
          "default",
          "landing",
          "focus",
          "pomodoro",
          "tasks display",
          "completed",
        ]) && (
          <Group
            id="section-preferences"
            title={t("sectionPreferences")}
            icon={<Sliders size={14} className="text-hotpink" />}
          >
            {/* Default Landing Tab */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-ink">{t("defaultLandingRoute")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {isAr
                    ? "الواجهة التي تفتح مباشرة عند تشغيل التطبيق"
                    : "Initial screen when opening app"}
                </p>
              </div>
              <select
                value={prefs.defaultLandingRoute || "/"}
                onChange={(e) =>
                  setPrefs({ defaultLandingRoute: e.target.value as DefaultLandingRoute })
                }
                className="rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-hotpink cursor-pointer"
              >
                <option value="/">{t("home")}</option>
                <option value="/tasks">{t("tasks")}</option>
                <option value="/journal">{t("journal")}</option>
                <option value="/deen">{t("myDeen")}</option>
                <option value="/more">{t("more")}</option>
              </select>
            </div>

            {/* Default Focus Block Duration */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-ink">{t("defaultFocusDuration")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {isAr
                    ? "المدة المقترحة لجلسات مؤقت التركيز"
                    : "Initial timer setting in focus mode"}
                </p>
              </div>
              <select
                value={prefs.defaultFocusDuration || 25}
                onChange={(e) => setPrefs({ defaultFocusDuration: Number(e.target.value) })}
                className="rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-hotpink cursor-pointer"
              >
                <option value={15}>{t("min15")}</option>
                <option value={25}>{t("min25")}</option>
                <option value={45}>{t("min45")}</option>
                <option value={60}>{t("min60")}</option>
              </select>
            </div>

            {/* Completed Tasks Display */}
            <div className="flex items-center justify-between px-4.5 py-3.5">
              <div>
                <p className="text-[14px] font-bold text-ink">{t("completedTaskVisibility")}</p>
                <p className="text-[11px] font-medium text-ink-light mt-0.5">
                  {isAr ? "سلوك المهام عند إكمالها" : "How done tasks are organized"}
                </p>
              </div>
              <select
                value={prefs.completedTaskVisibility || "show"}
                onChange={(e) =>
                  setPrefs({ completedTaskVisibility: e.target.value as CompletedTaskVisibility })
                }
                className="rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-bold text-ink outline-none focus:border-hotpink cursor-pointer"
              >
                <option value="show">{t("taskShowInPlace")}</option>
                <option value="bottom">{t("taskMoveToBottom")}</option>
                <option value="hide">{t("taskHide")}</option>
              </select>
            </div>
          </Group>
        )}

        {/* ── SECTION 10: HELP & ABOUT ───────────────────────────────────── */}
        {isSectionVisible("about", [
          "about",
          "help",
          "version",
          "diagnostics",
          "faq",
          "privacy policy",
          "terms",
          "support",
          "onboarding",
        ]) && (
          <Group
            id="section-about"
            title={t("sectionAbout")}
            icon={<HelpCircle size={14} className="text-hotpink" />}
          >
            {/* Version & Build */}
            <Row
              label={t("versionBuild")}
              subtitle="v2.4.0 (Build 2026.09-Pro) · Full Offline Capable"
              icon={<Info size={16} />}
              right={<span className="text-xs font-bold text-hotpink">v2.4.0</span>}
            />

            {/* Diagnostics Report */}
            <Row
              label={t("diagnosticsTitle")}
              subtitle={copiedDiag ? t("copied") : t("diagnosticsDesc")}
              icon={<Copy size={16} />}
              onClick={handleCopyDiagnostics}
              right={
                <button
                  type="button"
                  onClick={handleCopyDiagnostics}
                  className="px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-card border border-border shadow-xs text-ink hover:bg-surface cursor-pointer"
                >
                  {copiedDiag ? `✓ ${t("copied")}` : t("copyDiagnostics")}
                </button>
              }
            />

            {/* Replay Onboarding */}
            <Row
              label={t("replayOnboarding")}
              subtitle={
                isAr ? "إعادة مشاهدة الجولة الإرشادية للتطبيق" : "Walkthrough introduction tour"
              }
              icon={<Sparkles size={16} />}
              onClick={() => navigate({ to: "/welcome" })}
              right={<ChevronRight size={16} className="text-ink-light rtl:rotate-180" />}
            />

            {/* Help & FAQ */}
            <Row
              label={t("helpFaq")}
              icon={<HelpCircle size={16} />}
              onClick={() => setInfoModalType("help")}
              right={<ChevronRight size={16} className="text-ink-light rtl:rotate-180" />}
            />

            {/* Privacy Policy */}
            <Row
              label={t("privacyPolicy")}
              icon={<Shield size={16} />}
              onClick={() => setInfoModalType("privacy")}
              right={<ChevronRight size={16} className="text-ink-light rtl:rotate-180" />}
            />

            {/* Terms of Service */}
            <Row
              label={t("termsOfService")}
              icon={<Layers size={16} />}
              onClick={() => setInfoModalType("terms")}
              right={<ChevronRight size={16} className="text-ink-light rtl:rotate-180" />}
            />
          </Group>
        )}

        {/* Pro Planner Premium Showcase Card */}
        <div className="mt-6 px-4">
          <GlassCard gradient="grad-gold">
            <p className="font-display text-xl font-bold">{t("proPlannerPremium")}</p>
            <p className="mt-1 text-[13px] text-white/90 font-medium leading-relaxed">
              {t("premiumDesc")}
            </p>
          </GlassCard>
        </div>

        {/* Bottom Padding */}
        <div className="h-10" />

        {/* ── MODAL 1: EDIT PROFILE DRAWER ─────────────────────────────────── */}
        {editingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl border border-pink-200 dark:border-pink-900 animate-rise">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-hotpink uppercase tracking-wider">
                  {t("editProfile")}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="text-ink-light hover:text-ink cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <label className="label-xs text-ink-light">{t("displayName")}</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your Name"
                className="mt-1.5 w-full rounded-2xl border border-border bg-canvas p-3 text-sm font-bold text-ink outline-none focus:border-hotpink"
              />

              <label className="label-xs mt-3.5 block text-ink-light">{t("userBio")}</label>
              <input
                type="text"
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                placeholder={t("userBioPlaceholder")}
                className="mt-1.5 w-full rounded-2xl border border-border bg-canvas p-3 text-xs font-semibold text-ink outline-none focus:border-hotpink"
              />

              <label className="label-xs mt-3.5 block text-ink-light">{t("avatarEmoji")}</label>
              <div className="flex gap-2 my-2 overflow-x-auto pb-1 no-scrollbar">
                {[
                  "🌸",
                  "👑",
                  "✨",
                  "🌺",
                  "🦄",
                  "💫",
                  "🦋",
                  "🌷",
                  "🕌",
                  "🌙",
                  "🧘‍♀️",
                  "🎨",
                  "💎",
                  "🍓",
                  "🕊️",
                  "☕",
                ].map((em) => (
                  <button
                    type="button"
                    key={em}
                    onClick={() => setSelectedEmoji(em)}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl transition-transform cursor-pointer border",
                      selectedEmoji === em
                        ? "ring-2 ring-hotpink scale-110 bg-pink-100 dark:bg-pink-950 border-hotpink shadow-sm"
                        : "border-border bg-canvas hover:border-pink-300",
                    )}
                  >
                    {em}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="w-1/3 rounded-2xl border border-border bg-surface p-3 text-xs font-bold text-ink hover:bg-canvas cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <GradientButton
                  onClick={handleSaveProfile}
                  className="w-2/3 h-11 text-xs font-bold shadow-rose-md"
                >
                  {t("saveProfile")}
                </GradientButton>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 2: SELECTIVE EXPORT MODAL ──────────────────────────────── */}
        {exportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl border border-pink-200 dark:border-pink-900 animate-rise">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-extrabold text-ink flex items-center gap-2">
                  <Download size={16} className="text-hotpink" />
                  <span>{t("selectiveExport")}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="text-ink-light hover:text-ink cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-ink-light mb-4">{t("selectiveExportDesc")}</p>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {[
                  { id: "tasks", name: t("tasks"), count: state.tasks?.length || 0 },
                  {
                    id: "habits",
                    name: isAr ? "العادات" : "Habits",
                    count: state.habits?.length || 0,
                  },
                  { id: "routines", name: isAr ? "الروتينات" : "Routines", count: 3 },
                  {
                    id: "goals",
                    name: isAr ? "الأهداف" : "Goals",
                    count: state.goals?.length || 0,
                  },
                  { id: "journal", name: t("journal"), count: state.journal?.length || 0 },
                  { id: "deen", name: t("myDeen"), count: state.quranHistory?.length || 0 },
                  {
                    id: "wellness",
                    name: isAr ? "الصحة والماء" : "Wellness",
                    count: state.sleepRecords?.length || 0,
                  },
                  {
                    id: "finances",
                    name: isAr ? "المالية" : "Finances",
                    count: state.financialTransactions?.length || 0,
                  },
                  {
                    id: "business",
                    name: isAr ? "الأعمال" : "Business",
                    count: state.businessProjects?.length || 0,
                  },
                  {
                    id: "travel",
                    name: isAr ? "السفر" : "Travel",
                    count: state.travelTrips?.length || 0,
                  },
                  { id: "settings", name: t("settings"), count: 1 },
                ].map((item) => {
                  const isChecked = selectedExportCats.includes(item.id as ExportCategory);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedExportCats(selectedExportCats.filter((c) => c !== item.id));
                        } else {
                          setSelectedExportCats([...selectedExportCats, item.id as ExportCategory]);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-2xl border transition-all text-xs font-bold cursor-pointer text-left rtl:text-right",
                        isChecked
                          ? "border-hotpink bg-pink-50/90 dark:bg-pink-950/60 text-hotpink"
                          : "border-border bg-canvas text-ink",
                      )}
                    >
                      <span className="truncate">{item.name}</span>
                      <span className="text-[10px] opacity-70">({item.count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="w-1/3 rounded-2xl border border-border bg-surface p-3 text-xs font-bold text-ink cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <GradientButton
                  onClick={handleExportSelected}
                  disabled={selectedExportCats.length === 0}
                  className="w-2/3 h-11 text-xs font-bold shadow-rose-md"
                >
                  {t("exportNow")} ({selectedExportCats.length})
                </GradientButton>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 3: IMPORT INSPECTION MODAL ─────────────────────────────── */}
        {importInspectResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl border border-pink-200 dark:border-pink-900 animate-rise">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-extrabold text-ink flex items-center gap-2">
                  <Upload size={16} className="text-emerald-500" />
                  <span>{t("backupInspectTitle")}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setImportInspectResult(null)}
                  className="text-ink-light hover:text-ink cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {importInspectResult.valid ? (
                <>
                  <p className="text-xs text-ink-light mb-3">{t("backupInspectDesc")}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold bg-surface p-3 rounded-2xl border border-border/60 mb-4">
                    <div>
                      📋 {t("tasks")}:{" "}
                      <span className="text-hotpink">{importInspectResult.counts.tasks}</span>
                    </div>
                    <div>
                      🌱 {isAr ? "العادات" : "Habits"}:{" "}
                      <span className="text-hotpink">{importInspectResult.counts.habits}</span>
                    </div>
                    <div>
                      🎯 {isAr ? "الأهداف" : "Goals"}:{" "}
                      <span className="text-hotpink">{importInspectResult.counts.goals}</span>
                    </div>
                    <div>
                      📖 {t("journal")}:{" "}
                      <span className="text-hotpink">
                        {importInspectResult.counts.journalEntries}
                      </span>
                    </div>
                    <div>
                      💰 {isAr ? "المالية" : "Finances"}:{" "}
                      <span className="text-hotpink">
                        {importInspectResult.counts.financialTransactions}
                      </span>
                    </div>
                    <div>
                      💼 {isAr ? "الأعمال" : "Business"}:{" "}
                      <span className="text-hotpink">
                        {importInspectResult.counts.businessProjects}
                      </span>
                    </div>
                    <div>
                      ✈️ {isAr ? "الرحلات" : "Trips"}:{" "}
                      <span className="text-hotpink">{importInspectResult.counts.travelTrips}</span>
                    </div>
                    <div>
                      🏅 {isAr ? "الأوسمة" : "Badges"}:{" "}
                      <span className="text-hotpink">{importInspectResult.counts.badges}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setImportInspectResult(null)}
                      className="w-1/3 rounded-2xl border border-border bg-surface p-3 text-xs font-bold text-ink cursor-pointer"
                    >
                      {t("cancel")}
                    </button>
                    <GradientButton
                      onClick={handleApplyImport}
                      className="w-2/3 h-11 text-xs font-bold shadow-rose-md"
                    >
                      {t("restoreReplace")}
                    </GradientButton>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-bold text-danger mb-4 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    <span>{importInspectResult.error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportInspectResult(null)}
                    className="w-full rounded-2xl border border-border bg-surface p-3 text-xs font-bold text-ink cursor-pointer"
                  >
                    {t("cancel")}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL 4: SIGN OUT CONFIRMATION MODAL ─────────────────────────── */}
        {signOutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-2xl border border-border animate-rise text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 dark:bg-pink-950 text-hotpink mb-3">
                <LogOut size={22} />
              </div>
              <h3 className="text-sm font-extrabold text-ink mb-1">{t("signOut")}</h3>
              <p className="text-xs text-ink-light mb-5">{t("signOutConfirm")}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSignOutModalOpen(false)}
                  className="w-1/2 rounded-2xl border border-border bg-surface p-3 text-xs font-bold text-ink cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateUser({ isGuest: true, email: "" });
                    setSignOutModalOpen(false);
                  }}
                  className="w-1/2 rounded-2xl bg-danger p-3 text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-90"
                >
                  {t("signOut")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 5: DELETE ACCOUNT / RESET MODAL ────────────────────────── */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-card p-5 shadow-2xl border border-rose-300 dark:border-rose-900 animate-rise text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-danger mb-3">
                <Trash2 size={22} />
              </div>
              <h3 className="text-sm font-extrabold text-danger mb-1">{t("deleteAccount")}</h3>
              <p className="text-xs text-ink-light mb-3">{t("deleteAccountDesc")}</p>
              <p className="text-[11px] font-bold text-ink mb-2">{t("typeDeleteToConfirm")}</p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-2xl border border-rose-300 dark:border-rose-900 bg-canvas p-3 text-sm font-extrabold text-center text-danger outline-none mb-4"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirmText("");
                  }}
                  className="w-1/2 rounded-2xl border border-border bg-surface p-3 text-xs font-bold text-ink cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccountPermanent}
                  className="w-1/2 rounded-2xl bg-danger p-3 text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-90"
                >
                  {t("deleteAccount")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL 6: INFO / FAQ / PRIVACY MODAL ──────────────────────────── */}
        {infoModalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl border border-border animate-rise max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <h3 className="text-sm font-extrabold text-ink">
                  {infoModalType === "help"
                    ? t("helpFaq")
                    : infoModalType === "privacy"
                      ? t("privacyPolicy")
                      : t("termsOfService")}
                </h3>
                <button
                  type="button"
                  onClick={() => setInfoModalType(null)}
                  className="text-ink-light hover:text-ink cursor-pointer p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 text-xs text-ink font-medium leading-relaxed space-y-3">
                {infoModalType === "help" ? (
                  <>
                    <div className="p-3 rounded-2xl bg-surface">
                      <p className="font-bold text-hotpink mb-1">
                        {isAr ? "هل بياناتي محفوظة بدون إنترنت؟" : "Is my data stored offline?"}
                      </p>
                      <p className="text-ink-light text-[11px]">
                        {isAr
                          ? "نعم بالكامل! AYXA Planner Pro مصمم ليعمل بدون اتصال بالإنترنت (Offline First). كافة مهامك وعاداتك ومذكراتك تُخزن محلياً على جهازك."
                          : "Yes, 100%! All your tasks, habits, and journals are stored locally on your device with offline-first persistence."}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface">
                      <p className="font-bold text-hotpink mb-1">
                        {isAr ? "كيف أقوم بعمل نسخة احتياطية؟" : "How do I make a backup?"}
                      </p>
                      <p className="text-ink-light text-[11px]">
                        {isAr
                          ? "من قسم 'البيانات والنسخ الاحتياطي' يمكنكِ النقر على 'تصدير مخصص للبيانات' لتنزيل ملف JSON آمن يحتوي على كافة بياناتكِ لاسترجاعها في أي وقت."
                          : "From 'Data & Backup', click 'Selective Data Export' to download a clean JSON file of your planner data."}
                      </p>
                    </div>
                  </>
                ) : infoModalType === "privacy" ? (
                  <>
                    <p>
                      {isAr
                        ? "خصوصيتكِ هي أولويتنا المطلقة في AYXA Planner Pro. لا نقوم ببيع أو مشاركة بياناتكِ الشخصية مع أي طرف ثالث."
                        : "Your privacy is our utmost priority in AYXA Planner Pro. We do not sell or share your personal data with third parties."}
                    </p>
                    <p>
                      {isAr
                        ? "جميع مذكراتكِ الشخصية ومعاملاتكِ المالية مشفرة ومحفوظة محلياً على جهازكِ."
                        : "All your private reflections, finances, and routine data are stored securely on your local device."}
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      {isAr
                        ? "باستخدام تطبيق AYXA Planner Pro، فإنكِ توافقين على شروط الاستخدام الهادفة لتوفير بيئة تخطيط ملهمة وموثوقة."
                        : "By using AYXA Planner Pro, you agree to our terms of service aimed at providing an empowering, dependable planning environment."}
                    </p>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-border/50">
                <GradientButton
                  onClick={() => setInfoModalType(null)}
                  className="w-full h-10 text-xs font-bold"
                >
                  {isAr ? "فهمت ✓" : "Got it ✓"}
                </GradientButton>
              </div>
            </div>
          </div>
        )}
      </Screen>
    </MobileShell>
  );
}
