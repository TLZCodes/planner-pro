import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useApp, uid, todayKey } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { notifStatus, requestNotifPermission } from "@/lib/notify";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  Bell,
  Clock,
  User as UserIcon,
  Layers,
  Heart,
  Calendar,
  BookOpen,
  Briefcase,
  Dumbbell,
  Compass,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Personalize Your Planner — AYXA Planner" },
      {
        name: "description",
        content: "Set up your profile, language, focus areas, and rhythm in AYXA Planner.",
      },
    ],
  }),
  component: OnboardingPage,
});

const AVATAR_OPTIONS = ["🌸", "🦋", "🌙", "💗", "🧁", "🌷", "⭐", "🍓", "🪞", "✨"];

const FOCUS_AREAS = [
  { key: "Planning", icon: "🗓️", en: "Daily Planning & Tasks", ar: "التخطيط اليومي والمهام" },
  { key: "Deen", icon: "🌙", en: "Faith & Spiritual Deen", ar: "ديني وروحي والأذكار" },
  { key: "Habits", icon: "🌱", en: "Mindful Habits", ar: "العادات وبناء الروتين" },
  { key: "Studies", icon: "📚", en: "Study & Learning", ar: "الدراسة والتعلم المستمر" },
  { key: "Self-care", icon: "🧖‍♀️", en: "Self-Care & Wellness", ar: "العناية بالنفس والصحة" },
  { key: "Finance", icon: "💸", en: "Budget & Savings", ar: "المالية والادخار الذكي" },
  { key: "Career", icon: "💼", en: "Career & Projects", ar: "العمل والمشاريع الشخصية" },
];

function OnboardingPage() {
  const { ready, state, completeOnboarding, update } = useApp();
  const { t, lang, setLang, dir } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  // Step indicator: 1 to 5
  const [step, setStep] = useState(1);

  // Form states
  const [displayName, setDisplayName] = useState(
    state.user?.name && state.user.name !== "Guest" ? state.user.name : "",
  );
  const [selectedAvatar, setSelectedAvatar] = useState(state.user?.avatar || "🌸");
  const [selectedFocus, setSelectedFocus] = useState<string[]>(
    state.user?.focus && state.user.focus.length > 0
      ? state.user.focus
      : ["Planning", "Deen", "Habits"],
  );
  const [reminderTime, setReminderTime] = useState("08:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [includeStarterContent, setIncludeStarterContent] = useState(false);

  const [finishing, setFinishing] = useState(false);

  // Redirect established users away from onboarding if already setup
  useEffect(() => {
    if (!ready) return;
    if (state.setupDone && state.session) {
      navigate({ to: "/", replace: true });
    }
  }, [ready, state.setupDone, state.session, navigate]);

  // Sync display name if user logged in
  useEffect(() => {
    if (state.user?.name && state.user.name !== "Guest" && !displayName) {
      setDisplayName(state.user.name);
    }
  }, [state.user?.name, displayName]);

  const toggleFocus = (key: string) => {
    if (selectedFocus.includes(key)) {
      if (selectedFocus.length > 1) {
        setSelectedFocus(selectedFocus.filter((f) => f !== key));
      }
    } else {
      if (selectedFocus.length < 5) {
        setSelectedFocus([...selectedFocus, key]);
      }
    }
  };

  const handleRequestNotifications = async () => {
    try {
      const granted = await requestNotifPermission();
      setNotificationsEnabled(granted === "granted");
    } catch {
      setNotificationsEnabled(false);
    }
  };

  const handleFinalSubmit = () => {
    setFinishing(true);

    const finalName = displayName.trim() || (isAr ? "صديقتنا الرائعة" : "Beautiful Soul");

    try {
      // Seed optional starter content only if explicitly opted in
      if (includeStarterContent) {
        const dKey = todayKey();
        update((s) => ({
          ...s,
          habits: [
            ...(s.habits || []),
            {
              id: uid(),
              name: isAr ? "شرب كوب ماء دافئ وترطيب الجسم" : "Morning hydration & glass of water",
              nameAr: "شرب كوب ماء دافئ وترطيب الجسم",
              emoji: "💧",
              category: "Health",
              streak: 0,
              days: [false, false, false, false, false, false, false],
              createdAt: new Date().toISOString(),
            },
            {
              id: uid(),
              name: isAr ? "أذكار الصباح والسكينة" : "Morning reflection & gentle breath",
              nameAr: "أذكار الصباح والسكينة",
              emoji: "🌙",
              category: "Faith",
              streak: 0,
              days: [false, false, false, false, false, false, false],
              createdAt: new Date().toISOString(),
            },
          ],
          tasks: [
            ...(s.tasks || []),
            {
              id: uid(),
              title: isAr
                ? "استكشاف لوحة التحكم وتخصيص مهامي"
                : "Explore dashboard & set my top 3 goals",
              done: false,
              priority: "medium",
              tag: "Personal",
              dueDate: dKey,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      }

      // Complete onboarding transactionally
      completeOnboarding({
        name: finalName,
        avatar: selectedAvatar,
        emoji: selectedAvatar,
        focus: selectedFocus,
        reminderTime,
      });

      navigate({ to: "/", replace: true });
    } catch (err) {
      console.error("Onboarding submission error:", err);
      setFinishing(false);
    }
  };

  return (
    <div
      dir={dir}
      className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between selection:bg-rose-200 selection:text-rose-900 relative overflow-x-hidden font-sans"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-rose-400/12 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* Top Header: Step Indicator & Language Switcher (Text only, NO flags) */}
      <header className="w-full max-w-md mx-auto px-5 pt-4 pb-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="h-9 w-9 rounded-full bg-card/80 backdrop-blur-md border border-border/60 flex items-center justify-center text-foreground hover:bg-card active:scale-95 transition-all shadow-xs"
              aria-label={isAr ? "الخطوة السابقة" : "Previous step"}
            >
              {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            </button>
          ) : (
            <div className="h-9 w-9 flex items-center justify-center">
              <span className="grad-theme h-7 w-7 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-2xs">
                A
              </span>
            </div>
          )}

          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5 px-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-6 grad-theme" : s < step ? "w-2 bg-primary/60" : "w-2 bg-muted/80"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Language switch button (Explicit text only) */}
        <button
          type="button"
          onClick={() => setLang(isAr ? "en" : "ar")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/60 text-xs font-semibold text-foreground/90 hover:bg-card active:scale-95 transition-all shadow-xs"
        >
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>{isAr ? "English" : "العربية"}</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md mx-auto px-5 py-2 flex-1 flex flex-col justify-center">
        <div className="w-full bg-card/90 backdrop-blur-xl border border-border/60 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {/* STEP 1: Profile & Avatar */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                  {t("onboardingStep1")}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground mt-2">
                  {t("whatShouldWeCallYou")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{t("profileStepSub")}</p>
              </div>

              {/* Name input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground/90 block">
                  {t("fullName")}
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t("fullNamePlaceholder")}
                    className="w-full h-11 ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 rounded-2xl bg-muted/40 border border-border/80 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-foreground/90 block">
                  {t("chooseAvatar")}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`h-11 rounded-2xl text-xl flex items-center justify-center transition-all ${
                        selectedAvatar === av
                          ? "grad-theme text-white shadow-rose-xs scale-105 border-2 border-primary"
                          : "bg-muted/40 hover:bg-muted/60 border border-border/60"
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Continue button */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-11 mt-4 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t("continue")}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* STEP 2: Language & Region */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                  {t("onboardingStep2")}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground mt-2">
                  {t("selectLanguageRegion")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{t("languageRegionSub")}</p>
              </div>

              {/* Language selection tiles (strictly no flags) */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setLang("ar")}
                  className={`w-full p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                    isAr
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/80 bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl grad-theme text-white font-bold text-sm flex items-center justify-center shadow-2xs">
                      ض
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">العربية</h4>
                      <p className="text-[11px] text-muted-foreground">
                        الواجهة بالكامل باللغة العربية (RTL) بصيغة المؤنث
                      </p>
                    </div>
                  </div>
                  {isAr && <Check className="h-4 w-4 text-primary stroke-[3]" />}
                </button>

                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`w-full p-3.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                    !isAr
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/80 bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl grad-theme text-white font-bold text-sm flex items-center justify-center shadow-2xs">
                      EN
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">English</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Full interface in English with clean LTR formatting
                      </p>
                    </div>
                  </div>
                  {!isAr && <Check className="h-4 w-4 text-primary stroke-[3]" />}
                </button>
              </div>

              {/* Continue button */}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full h-11 mt-4 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t("continue")}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* STEP 3: Focus Areas */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                  {t("onboardingStep3")}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground mt-2">
                  {t("selectFocusAreas")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{t("selectFocusAreasSub")}</p>
              </div>

              {/* Focus area multi-select tiles */}
              <div className="space-y-2 pt-1 max-h-60 overflow-y-auto pr-1">
                {FOCUS_AREAS.map((fa) => {
                  const isSelected = selectedFocus.includes(fa.key);
                  return (
                    <button
                      key={fa.key}
                      type="button"
                      onClick={() => toggleFocus(fa.key)}
                      className={`w-full p-2.5 rounded-2xl border text-start flex items-center justify-between transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-2xs"
                          : "border-border/70 bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{fa.icon}</span>
                        <span className="text-xs font-semibold text-foreground">
                          {isAr ? fa.ar : fa.en}
                        </span>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                          isSelected
                            ? "grad-theme border-transparent text-white"
                            : "border-border bg-card"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Continue button */}
              <button
                type="button"
                onClick={() => setStep(4)}
                className="w-full h-11 mt-4 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t("continue")}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* STEP 4: Daily Rhythm & Preferences */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                  {t("onboardingStep4")}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground mt-2">
                  {t("dailyRhythmTitle")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{t("dailyRhythmSub")}</p>
              </div>

              {/* Reminder time */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {t("reminderTime")}
                    </span>
                  </div>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="bg-card border border-border rounded-xl px-2.5 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "وقت هادئ لتذكيركِ بمراجعة خطة اليوم وإنجازاتكِ."
                    : "A gentle daily notification to check your rhythm."}
                </p>
              </div>

              {/* Notification Permission */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {isAr ? "تفعيل الإشعارات اللطيفة" : "Enable Gentle Notifications"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestNotifications}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      notificationsEnabled
                        ? "grad-theme text-white shadow-2xs"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {notificationsEnabled
                      ? isAr
                        ? "مفعلة ✓"
                        : "Enabled ✓"
                      : isAr
                        ? "تفعيل"
                        : "Enable"}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "تذكيرات خفيفة دون إزعاج لتشجيعكِ على الالتزام بالعادات."
                    : "No spam or pressure, just peaceful reminders to keep you on track."}
                </p>
              </div>

              {/* Continue button */}
              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full h-11 mt-4 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t("continue")}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* STEP 5: Final Review & Confirmation (No auto-seeding without permission) */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                  {t("onboardingStep5")}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground mt-2">
                  {t("readyToBlossom")}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">{t("finalReviewSub")}</p>
              </div>

              {/* Plan Summary Card */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {isAr ? "الاسم المختار" : "Display Name"}
                  </span>
                  <span className="text-xs font-bold text-foreground flex items-center gap-1">
                    <span>{selectedAvatar}</span>
                    <span>{displayName || (isAr ? "صديقتنا الرائعة" : "Beautiful Soul")}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">
                    {isAr ? "اللغة والواجهة" : "Interface Language"}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {isAr ? "العربية" : "English"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {isAr ? "مجالات التركيز" : "Focus Areas"}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {selectedFocus.length} {isAr ? "مجالات" : "areas"}
                  </span>
                </div>
              </div>

              {/* Explicit Starter Content Decision (Never auto-seed unconfirmed records) */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-foreground/90 block">
                  {t("starterTemplates")}
                </label>

                {/* Option A: Clean Start */}
                <button
                  type="button"
                  onClick={() => setIncludeStarterContent(false)}
                  className={`w-full p-3 rounded-2xl border text-start flex items-start gap-2.5 transition-all ${
                    !includeStarterContent
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/70 bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                      !includeStarterContent
                        ? "grad-theme border-transparent text-white"
                        : "border-border bg-card"
                    }`}
                  >
                    {!includeStarterContent && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t("cleanStart")}</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {t("cleanStartDesc")}
                    </p>
                  </div>
                </button>

                {/* Option B: Starter Essentials */}
                <button
                  type="button"
                  onClick={() => setIncludeStarterContent(true)}
                  className={`w-full p-3 rounded-2xl border text-start flex items-start gap-2.5 transition-all ${
                    includeStarterContent
                      ? "border-primary bg-primary/10 shadow-xs"
                      : "border-border/70 bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                      includeStarterContent
                        ? "grad-theme border-transparent text-white"
                        : "border-border bg-card"
                    }`}
                  >
                    {includeStarterContent && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{t("withTemplates")}</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {t("withTemplatesDesc")}
                    </p>
                  </div>
                </button>
              </div>

              {/* Commit & Launch Button */}
              <button
                type="button"
                disabled={finishing}
                onClick={handleFinalSubmit}
                className="w-full h-12 mt-4 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {finishing ? (
                  <span className="inline-block h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>{t("launchPlanner")}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-md mx-auto px-5 py-4 text-center text-[11px] text-muted-foreground/80 z-10">
        <p className="font-medium">
          AYXA Planner •{" "}
          {isAr ? "نحو أفضل نسخة منكِ، كل يوم 🌸" : "Becoming her, one day at a time 🌸"}
        </p>
      </footer>
    </div>
  );
}
