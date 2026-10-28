/**
 * AYXA Planner Pro — Settings & Preferences Engine
 * Comprehensive preference models, migrations, quiet hours logic,
 * selective JSON backup/restore validation, and system diagnostics.
 */

export type AppearanceMode = "system" | "light" | "dark";
export type TextScale = "small" | "normal" | "large" | "extra-large";
export type DateFormatOption = "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY" | "D MMMM YYYY";
export type TimeFormatOption = "12h" | "24h";
export type WeekStartDay = "saturday" | "sunday" | "monday";
export type DefaultLandingRoute = "/" | "/tasks" | "/journal" | "/deen" | "/habits" | "/more";
export type CompletedTaskVisibility = "show" | "bottom" | "hide";
export type AppTheme = "rose" | "emerald" | "lavender" | "gold" | "mint" | "ocean";

export type QuietHoursSettings = {
  enabled: boolean;
  startTime: string; // "22:00"
  endTime: string;   // "07:00"
};

export type NotificationCategoryPreferences = {
  quote: boolean;
  dhikr: boolean;
  task: boolean;
  water: boolean;
  habits: boolean;
  focus: boolean;
  quran: boolean;
  invoices: boolean;
  budget: boolean;
  journal: boolean;
};

export type PrivacySettings = {
  hideSensitiveNotificationPreviews: boolean;
  aiIncludeTaskContext: boolean;
  blurInAppSwitcher: boolean;
};

export type AccessibilitySettings = {
  textScale: TextScale;
  reduceMotion: boolean;
  highContrast: boolean;
  reduceTransparency: boolean;
  reducedGamification: boolean;
};

export type Prefs = {
  reminderTime: string;
  quoteNotif: boolean;
  dhikrNotif: boolean;
  taskNotif: boolean;
  soundNotif: boolean;
  soundType: "chime" | "bell" | "sparkle" | "drop";
  theme: AppTheme;
  currency?: string;
  // Extended preferences
  appearanceMode?: AppearanceMode;
  hapticFeedback?: boolean;
  quietHours?: QuietHoursSettings;
  notifCategories?: NotificationCategoryPreferences;
  privacy?: PrivacySettings;
  accessibility?: AccessibilitySettings;
  timezone?: string;
  dateFormat?: DateFormatOption;
  timeFormat?: TimeFormatOption;
  weekStartsOn?: WeekStartDay;
  measurementUnit?: "metric" | "imperial";
  defaultLandingRoute?: DefaultLandingRoute;
  defaultFocusDuration?: number;
  completedTaskVisibility?: CompletedTaskVisibility;
  journalPinRequired?: boolean;
  userBio?: string;
  language?: string;
  firstDayOfWeek?: WeekStartDay;
};

export const DEFAULT_QUIET_HOURS: QuietHoursSettings = {
  enabled: false,
  startTime: "22:00",
  endTime: "07:00",
};

export const DEFAULT_NOTIF_CATEGORIES: NotificationCategoryPreferences = {
  quote: true,
  dhikr: true,
  task: true,
  water: true,
  habits: true,
  focus: true,
  quran: true,
  invoices: true,
  budget: true,
  journal: true,
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  hideSensitiveNotificationPreviews: true,
  aiIncludeTaskContext: true,
  blurInAppSwitcher: false,
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  textScale: "normal",
  reduceMotion: false,
  highContrast: false,
  reduceTransparency: false,
  reducedGamification: false,
};

export const DEFAULT_PREFS: Prefs = {
  reminderTime: "08:00",
  quoteNotif: true,
  dhikrNotif: true,
  taskNotif: true,
  soundNotif: true,
  soundType: "chime",
  theme: "rose",
  currency: "MAD",
  appearanceMode: "system",
  hapticFeedback: true,
  quietHours: DEFAULT_QUIET_HOURS,
  notifCategories: DEFAULT_NOTIF_CATEGORIES,
  privacy: DEFAULT_PRIVACY_SETTINGS,
  accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,
  timezone: "auto",
  dateFormat: "YYYY-MM-DD",
  timeFormat: "12h",
  weekStartsOn: "saturday",
  measurementUnit: "metric",
  defaultLandingRoute: "/",
  defaultFocusDuration: 25,
  completedTaskVisibility: "show",
  userBio: "",
};

export type ThemePreset = {
  name: AppTheme;
  key: string;
  from: string;
  to: string;
  primary: string;
  accent: string;
  nameEn: string;
  nameAr: string;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: "rose",
    key: "roseTheme",
    from: "#ff75a0",
    to: "#ff1493",
    primary: "#ff1493",
    accent: "#ff75a0",
    nameEn: "Rose Gold 🌸",
    nameAr: "زهري ووردي 🌸",
  },
  {
    name: "emerald",
    key: "emeraldTheme",
    from: "#064e3b",
    to: "#10b981",
    primary: "#10b981",
    accent: "#34d399",
    nameEn: "Emerald Deen 🌙",
    nameAr: "زمردي إسلامي 🌙",
  },
  {
    name: "lavender",
    key: "lavenderTheme",
    from: "#bfa8ff",
    to: "#7c4dff",
    primary: "#7c4dff",
    accent: "#a78bfa",
    nameEn: "Dreamy Lavender ✨",
    nameAr: "لافندر حالم ✨",
  },
  {
    name: "gold",
    key: "goldTheme",
    from: "#ffd769",
    to: "#c79e26",
    primary: "#d4af37",
    accent: "#f59e0b",
    nameEn: "Royal Gold 👑",
    nameAr: "ذهبي فاخر 👑",
  },
  {
    name: "mint",
    key: "mintTheme",
    from: "#66ee98",
    to: "#059669",
    primary: "#059669",
    accent: "#10b981",
    nameEn: "Fresh Mint 🌿",
    nameAr: "نعناعي منعش 🌿",
  },
  {
    name: "ocean",
    key: "oceanTheme",
    from: "#38bdf8",
    to: "#0284c7",
    primary: "#0284c7",
    accent: "#0ea5e9",
    nameEn: "Serene Ocean 🌊",
    nameAr: "سماوي هادئ 🌊",
  },
];

export type CurrencyInfo = {
  code: string;
  nameEn: string;
  nameAr: string;
  symbol: string;
  region: string;
};

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "MAD", nameEn: "Moroccan Dirham", nameAr: "درهم مغربي", symbol: "MAD", region: "Morocco" },
  { code: "SAR", nameEn: "Saudi Riyal", nameAr: "ريال سعودي", symbol: "SAR", region: "Saudi Arabia" },
  { code: "AED", nameEn: "UAE Dirham", nameAr: "درهم إماراتي", symbol: "AED", region: "UAE" },
  { code: "KWD", nameEn: "Kuwaiti Dinar", nameAr: "دينار كويتي", symbol: "KWD", region: "Kuwait" },
  { code: "QAR", nameEn: "Qatari Riyal", nameAr: "ريال قطري", symbol: "QAR", region: "Qatar" },
  { code: "BHD", nameEn: "Bahraini Dinar", nameAr: "دينار بحريني", symbol: "BHD", region: "Bahrain" },
  { code: "OMR", nameEn: "Omani Rial", nameAr: "ريال عماني", symbol: "OMR", region: "Oman" },
  { code: "EGP", nameEn: "Egyptian Pound", nameAr: "جنيه مصري", symbol: "EGP", region: "Egypt" },
  { code: "JOD", nameEn: "Jordanian Dinar", nameAr: "دينار أردني", symbol: "JOD", region: "Jordan" },
  { code: "USD", nameEn: "US Dollar", nameAr: "دولار أمريكي", symbol: "$", region: "United States" },
  { code: "EUR", nameEn: "Euro", nameAr: "يورو أوروبي", symbol: "€", region: "European Union" },
  { code: "GBP", nameEn: "British Pound", nameAr: "جنيه إسترليني", symbol: "£", region: "United Kingdom" },
  { code: "TRY", nameEn: "Turkish Lira", nameAr: "ليرة تركية", symbol: "₺", region: "Turkey" },
  { code: "CAD", nameEn: "Canadian Dollar", nameAr: "دولار كندي", symbol: "CA$", region: "Canada" },
  { code: "AUD", nameEn: "Australian Dollar", nameAr: "دولار أسترالي", symbol: "A$", region: "Australia" },
];

export const COMMON_TIMEZONES = [
  { id: "auto", nameEn: "Device Automatic", nameAr: "تلقائي حسب الجهاز" },
  { id: "Africa/Casablanca", nameEn: "Casablanca (GMT+1)", nameAr: "الدار البيضاء (غرينتش+1)" },
  { id: "Asia/Riyadh", nameEn: "Riyadh / Mecca (GMT+3)", nameAr: "الرياض / مكة المكرمة (غرينتش+3)" },
  { id: "Asia/Dubai", nameEn: "Dubai / Abu Dhabi (GMT+4)", nameAr: "دبي / أبوظبي (غرينتش+4)" },
  { id: "Africa/Cairo", nameEn: "Cairo (GMT+3)", nameAr: "القاهرة (غرينتش+3)" },
  { id: "Asia/Kuwait", nameEn: "Kuwait City (GMT+3)", nameAr: "مدينة الكويت (غرينتش+3)" },
  { id: "Asia/Qatar", nameEn: "Doha (GMT+3)", nameAr: "الدوحة (غرينتش+3)" },
  { id: "Asia/Amman", nameEn: "Amman (GMT+3)", nameAr: "عمّان (غرينتش+3)" },
  { id: "Europe/London", nameEn: "London (GMT+0/+1)", nameAr: "لندن (غرينتش)" },
  { id: "Europe/Paris", nameEn: "Paris / Berlin (GMT+1/+2)", nameAr: "باريس / برلين (غرينتش+1)" },
  { id: "America/New_York", nameEn: "New York / EST (GMT-5)", nameAr: "نيويورك (توقيت الساحل الشرقي)" },
  { id: "America/Los_Angeles", nameEn: "Los Angeles / PST (GMT-8)", nameAr: "لوس أنجلوس (توقيت المحيط الهادئ)" },
];

/**
 * Normalizes and migrates preferences from raw stored objects safely.
 */
export function normalizePrefs(raw?: Partial<Prefs> | null): Prefs {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_PREFS };
  }

  // Handle legacy darkMode boolean migration
  let appearanceMode: AppearanceMode = "system";
  if (raw.appearanceMode === "light" || raw.appearanceMode === "dark" || raw.appearanceMode === "system") {
    appearanceMode = raw.appearanceMode;
  } else if ((raw as any).darkMode === true) {
    appearanceMode = "dark";
  } else if ((raw as any).darkMode === false) {
    appearanceMode = "light";
  }

  // Handle valid theme
  const validThemes: AppTheme[] = ["rose", "emerald", "lavender", "gold", "mint", "ocean"];
  const theme = validThemes.includes(raw.theme as AppTheme) ? (raw.theme as AppTheme) : "rose";

  // Handle valid soundType
  const validSounds = ["chime", "bell", "sparkle", "drop"] as const;
  const soundType = validSounds.includes(raw.soundType as any) ? raw.soundType! : "chime";

  // Handle Quiet Hours
  const quietHours: QuietHoursSettings = {
    enabled: typeof raw.quietHours?.enabled === "boolean" ? raw.quietHours.enabled : DEFAULT_QUIET_HOURS.enabled,
    startTime: raw.quietHours?.startTime && /^\d{2}:\d{2}$/.test(raw.quietHours.startTime) ? raw.quietHours.startTime : DEFAULT_QUIET_HOURS.startTime,
    endTime: raw.quietHours?.endTime && /^\d{2}:\d{2}$/.test(raw.quietHours.endTime) ? raw.quietHours.endTime : DEFAULT_QUIET_HOURS.endTime,
  };

  // Handle Notification Categories
  const notifCategories: NotificationCategoryPreferences = {
    quote: typeof raw.notifCategories?.quote === "boolean" ? raw.notifCategories.quote : (raw.quoteNotif ?? true),
    dhikr: typeof raw.notifCategories?.dhikr === "boolean" ? raw.notifCategories.dhikr : (raw.dhikrNotif ?? true),
    task: typeof raw.notifCategories?.task === "boolean" ? raw.notifCategories.task : (raw.taskNotif ?? true),
    water: typeof raw.notifCategories?.water === "boolean" ? raw.notifCategories.water : true,
    habits: typeof raw.notifCategories?.habits === "boolean" ? raw.notifCategories.habits : true,
    focus: typeof raw.notifCategories?.focus === "boolean" ? raw.notifCategories.focus : true,
    quran: typeof raw.notifCategories?.quran === "boolean" ? raw.notifCategories.quran : true,
    invoices: typeof raw.notifCategories?.invoices === "boolean" ? raw.notifCategories.invoices : true,
    budget: typeof raw.notifCategories?.budget === "boolean" ? raw.notifCategories.budget : true,
    journal: typeof raw.notifCategories?.journal === "boolean" ? raw.notifCategories.journal : true,
  };

  // Handle Privacy
  const privacy: PrivacySettings = {
    hideSensitiveNotificationPreviews: typeof raw.privacy?.hideSensitiveNotificationPreviews === "boolean"
      ? raw.privacy.hideSensitiveNotificationPreviews
      : DEFAULT_PRIVACY_SETTINGS.hideSensitiveNotificationPreviews,
    aiIncludeTaskContext: typeof raw.privacy?.aiIncludeTaskContext === "boolean"
      ? raw.privacy.aiIncludeTaskContext
      : DEFAULT_PRIVACY_SETTINGS.aiIncludeTaskContext,
    blurInAppSwitcher: typeof raw.privacy?.blurInAppSwitcher === "boolean"
      ? raw.privacy.blurInAppSwitcher
      : DEFAULT_PRIVACY_SETTINGS.blurInAppSwitcher,
  };

  // Handle Accessibility
  const validTextScales: TextScale[] = ["small", "normal", "large", "extra-large"];
  const accessibility: AccessibilitySettings = {
    textScale: validTextScales.includes(raw.accessibility?.textScale as TextScale)
      ? (raw.accessibility!.textScale as TextScale)
      : DEFAULT_ACCESSIBILITY_SETTINGS.textScale,
    reduceMotion: typeof raw.accessibility?.reduceMotion === "boolean"
      ? raw.accessibility.reduceMotion
      : DEFAULT_ACCESSIBILITY_SETTINGS.reduceMotion,
    highContrast: typeof raw.accessibility?.highContrast === "boolean"
      ? raw.accessibility.highContrast
      : DEFAULT_ACCESSIBILITY_SETTINGS.highContrast,
    reduceTransparency: typeof raw.accessibility?.reduceTransparency === "boolean"
      ? raw.accessibility.reduceTransparency
      : DEFAULT_ACCESSIBILITY_SETTINGS.reduceTransparency,
    reducedGamification: typeof raw.accessibility?.reducedGamification === "boolean"
      ? raw.accessibility.reducedGamification
      : DEFAULT_ACCESSIBILITY_SETTINGS.reducedGamification,
  };

  return {
    reminderTime: raw.reminderTime && /^\d{2}:\d{2}$/.test(raw.reminderTime) ? raw.reminderTime : DEFAULT_PREFS.reminderTime,
    quoteNotif: typeof raw.quoteNotif === "boolean" ? raw.quoteNotif : DEFAULT_PREFS.quoteNotif,
    dhikrNotif: typeof raw.dhikrNotif === "boolean" ? raw.dhikrNotif : DEFAULT_PREFS.dhikrNotif,
    taskNotif: typeof raw.taskNotif === "boolean" ? raw.taskNotif : DEFAULT_PREFS.taskNotif,
    soundNotif: typeof raw.soundNotif === "boolean" ? raw.soundNotif : DEFAULT_PREFS.soundNotif,
    soundType,
    theme,
    currency: raw.currency || DEFAULT_PREFS.currency,
    appearanceMode,
    hapticFeedback: typeof raw.hapticFeedback === "boolean" ? raw.hapticFeedback : DEFAULT_PREFS.hapticFeedback,
    quietHours,
    notifCategories,
    privacy,
    accessibility,
    timezone: raw.timezone || DEFAULT_PREFS.timezone,
    dateFormat: raw.dateFormat || DEFAULT_PREFS.dateFormat,
    timeFormat: raw.timeFormat || DEFAULT_PREFS.timeFormat,
    weekStartsOn: raw.weekStartsOn || DEFAULT_PREFS.weekStartsOn,
    measurementUnit: raw.measurementUnit || DEFAULT_PREFS.measurementUnit,
    defaultLandingRoute: raw.defaultLandingRoute || DEFAULT_PREFS.defaultLandingRoute,
    defaultFocusDuration: typeof raw.defaultFocusDuration === "number" ? raw.defaultFocusDuration : DEFAULT_PREFS.defaultFocusDuration,
    completedTaskVisibility: raw.completedTaskVisibility || DEFAULT_PREFS.completedTaskVisibility,
    userBio: raw.userBio || "",
  };
}

/**
 * Checks whether the current time falls inside quiet hours.
 * Accurately supports intervals spanning midnight (e.g. 22:00 -> 07:00).
 */
export function isWithinQuietHours(settings?: QuietHoursSettings, currentTime?: Date): boolean {
  if (!settings || !settings.enabled) return false;
  const now = currentTime || new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = (settings.startTime || "22:00").split(":").map(Number);
  const [endH, endM] = (settings.endTime || "07:00").split(":").map(Number);

  const startMinutes = (startH ?? 22) * 60 + (startM ?? 0);
  const endMinutes = (endH ?? 7) * 60 + (endM ?? 0);

  if (startMinutes <= endMinutes) {
    // Standard same-day window (e.g. 13:00 to 15:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight window spanning midnight (e.g. 22:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

export type ExportCategory =
  | "all"
  | "tasks"
  | "habits"
  | "routines"
  | "goals"
  | "journal"
  | "deen"
  | "wellness"
  | "finances"
  | "business"
  | "travel"
  | "settings";

export type ExportPayload = {
  app: string;
  version: string;
  exportedAt: string;
  schemaVersion: number;
  categories: ExportCategory[];
  recordCounts: Record<string, number>;
  data: Record<string, any>;
};

/**
 * Builds a clean, structured export JSON payload based on selected categories.
 */
export function buildExportPayload(state: Record<string, any>, selectedCategories: ExportCategory[]): ExportPayload {
  const isAll = selectedCategories.includes("all");
  const includes = (cat: ExportCategory) => isAll || selectedCategories.includes(cat);

  const data: Record<string, any> = {};
  const recordCounts: Record<string, number> = {};

  if (includes("tasks")) {
    data.tasks = state.tasks || [];
    recordCounts.tasks = (data.tasks as any[]).length;
  }
  if (includes("habits")) {
    data.habits = state.habits || [];
    recordCounts.habits = (data.habits as any[]).length;
  }
  if (includes("routines")) {
    data.routines = state.routines || {};
    recordCounts.routines = Object.keys(data.routines).length;
  }
  if (includes("goals")) {
    data.goals = state.goals || [];
    recordCounts.goals = (data.goals as any[]).length;
  }
  if (includes("journal")) {
    data.journal = state.journal || [];
    data.dailyMoods = state.dailyMoods || {};
    data.journalSettings = state.journalSettings || {};
    data.weekInBloomKeepsakes = state.weekInBloomKeepsakes || [];
    data.wheelOfBecomingRecords = state.wheelOfBecomingRecords || [];
    data.wheelCustomization = state.wheelCustomization || {};
    recordCounts.journalEntries = (data.journal as any[]).length;
    recordCounts.wheelOfBecomingRecords = (data.wheelOfBecomingRecords as any[]).length;
  }
  if (includes("deen")) {
    data.deenSettings = state.deenSettings || {};
    data.prayerLogs = state.prayerLogs || {};
    data.quranGoal = state.quranGoal || {};
    data.quranHistory = state.quranHistory || [];
    data.surahProgress = state.surahProgress || {};
    data.sadaqahLogs = state.sadaqahLogs || [];
    data.goodDeeds = state.goodDeeds || [];
    data.goodDeedLogs = state.goodDeedLogs || {};
    data.activeTasbih = state.activeTasbih || {};
    recordCounts.quranLogs = (data.quranHistory as any[]).length;
    recordCounts.sadaqahLogs = (data.sadaqahLogs as any[]).length;
  }
  if (includes("wellness")) {
    data.wellnessSettings = state.wellnessSettings || {};
    data.hydrationEvents = state.hydrationEvents || [];
    data.sleepRecords = state.sleepRecords || [];
    data.dailyStepRecords = state.dailyStepRecords || {};
    data.workoutLogs = state.workoutLogs || [];
    data.careActivityLinks = state.careActivityLinks || [];
    recordCounts.sleepRecords = (data.sleepRecords as any[]).length;
    recordCounts.hydrationEvents = (data.hydrationEvents as any[]).length;
  }
  if (includes("finances")) {
    data.financeAccounts = state.financeAccounts || [];
    data.financialTransactions = state.financialTransactions || [];
    data.financeBudgets = state.financeBudgets || [];
    data.savingsGoals = state.savingsGoals || [];
    data.savingsContributions = state.savingsContributions || [];
    data.recurringTransactions = state.recurringTransactions || [];
    data.financeSettings = state.financeSettings || {};
    recordCounts.transactions = (data.financialTransactions as any[]).length;
    recordCounts.savingsGoals = (data.savingsGoals as any[]).length;
  }
  if (includes("business")) {
    data.businessProfile = state.businessProfile || {};
    data.businessProjects = state.businessProjects || [];
    data.businessMilestones = state.businessMilestones || [];
    data.businessClients = state.businessClients || [];
    data.businessOffers = state.businessOffers || [];
    data.businessInvoices = state.businessInvoices || [];
    recordCounts.businessProjects = (data.businessProjects as any[]).length;
    recordCounts.businessClients = (data.businessClients as any[]).length;
    recordCounts.businessInvoices = (data.businessInvoices as any[]).length;
  }
  if (includes("travel")) {
    data.travelTrips = state.travelTrips || [];
    data.travelDays = state.travelDays || [];
    data.itineraryItems = state.itineraryItems || [];
    data.travelBookings = state.travelBookings || [];
    data.travelBudgetCategories = state.travelBudgetCategories || [];
    data.travelChecklistItems = state.travelChecklistItems || [];
    data.travelDocuments = state.travelDocuments || [];
    data.bucketListItems = state.bucketListItems || [];
    data.travelMemories = state.travelMemories || [];
    data.travelSettings = state.travelSettings || {};
    recordCounts.travelTrips = (data.travelTrips as any[]).length;
    recordCounts.bucketList = (data.bucketListItems as any[]).length;
  }
  if (includes("settings")) {
    data.prefs = state.prefs || {};
    data.user = state.user || {};
    data.morePreferences = state.morePreferences || {};
  }

  // Preserve progression & badges
  if (isAll) {
    data.xp = state.xp || 0;
    data.xpLedger = state.xpLedger || [];
    data.unlockedBadges = state.unlockedBadges || [];
    recordCounts.badges = (data.unlockedBadges as any[]).length;
  }

  return {
    app: "AYXA Planner Pro",
    version: "2.4.0",
    exportedAt: new Date().toISOString(),
    schemaVersion: 2,
    categories: selectedCategories,
    recordCounts,
    data,
  };
}

export type BackupInspectionResult = {
  valid: boolean;
  error?: string;
  version?: string;
  exportedAt?: string;
  counts: {
    tasks: number;
    habits: number;
    goals: number;
    journalEntries: number;
    financialTransactions: number;
    businessProjects: number;
    travelTrips: number;
    badges: number;
  };
  payload?: Record<string, any>;
};

/**
 * Validates and inspects an imported JSON backup string before applying it.
 */
export function inspectBackupJson(jsonStr: string): BackupInspectionResult {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== "object") {
      return { valid: false, error: "Invalid JSON format: not an object", counts: emptyCounts() };
    }

    // Support both wrapped export payload and raw state dumps
    const rawData = parsed.data && typeof parsed.data === "object" ? parsed.data : parsed;

    const counts = {
      tasks: Array.isArray(rawData.tasks) ? rawData.tasks.length : 0,
      habits: Array.isArray(rawData.habits) ? rawData.habits.length : 0,
      goals: Array.isArray(rawData.goals) ? rawData.goals.length : 0,
      journalEntries: Array.isArray(rawData.journal) ? rawData.journal.length : 0,
      financialTransactions: Array.isArray(rawData.financialTransactions) ? rawData.financialTransactions.length : 0,
      businessProjects: Array.isArray(rawData.businessProjects) ? rawData.businessProjects.length : 0,
      travelTrips: Array.isArray(rawData.travelTrips) ? rawData.travelTrips.length : 0,
      badges: Array.isArray(rawData.unlockedBadges) ? rawData.unlockedBadges.length : Array.isArray(rawData.achievements) ? rawData.achievements.length : 0,
    };

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);
    if (totalRecords === 0 && !rawData.prefs && !rawData.user) {
      return { valid: false, error: "No recognizable AYXA Planner Pro records found in file", counts };
    }

    return {
      valid: true,
      version: parsed.version || "1.0",
      exportedAt: parsed.exportedAt || undefined,
      counts,
      payload: rawData,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Failed to parse JSON: ${err?.message || "Syntax error"}`,
      counts: emptyCounts(),
    };
  }
}

function emptyCounts() {
  return {
    tasks: 0,
    habits: 0,
    goals: 0,
    journalEntries: 0,
    financialTransactions: 0,
    businessProjects: 0,
    travelTrips: 0,
    badges: 0,
  };
}

export type StorageUsageMetrics = {
  estimatedBytes: number;
  formattedSize: string;
  totalEntities: number;
  totalRecords?: number;
  isOfflineReady: boolean;
  itemCounts: {
    tasks: number;
    habits: number;
    goals: number;
    journal: number;
    quran: number;
    finances: number;
    business: number;
    travel: number;
    badges: number;
  };
};

/**
 * Calculates local data storage footprint and entity counts.
 */
export function calculateStorageMetrics(state: Record<string, any>): StorageUsageMetrics {
  let estimatedBytes = 0;
  try {
    const raw = JSON.stringify(state);
    if (typeof Blob !== "undefined") {
      estimatedBytes = new Blob([raw]).size;
    } else if (typeof Buffer !== "undefined") {
      estimatedBytes = Buffer.byteLength(raw, "utf8");
    } else {
      estimatedBytes = raw.length * 2;
    }
  } catch {
    estimatedBytes = 1024 * 64; // fallback
  }

  const formattedSize = estimatedBytes < 1024
    ? `${estimatedBytes} B`
    : estimatedBytes < 1024 * 1024
    ? `${(estimatedBytes / 1024).toFixed(1)} KB`
    : `${(estimatedBytes / (1024 * 1024)).toFixed(2)} MB`;

  const itemCounts = {
    tasks: Array.isArray(state.tasks) ? state.tasks.length : 0,
    habits: Array.isArray(state.habits) ? state.habits.length : 0,
    goals: Array.isArray(state.goals) ? state.goals.length : 0,
    journal: Array.isArray(state.journal) ? state.journal.length : 0,
    quran: Array.isArray(state.quranHistory) ? state.quranHistory.length : 0,
    finances: Array.isArray(state.financialTransactions) ? state.financialTransactions.length : 0,
    business: Array.isArray(state.businessProjects) ? state.businessProjects.length : 0,
    travel: Array.isArray(state.travelTrips) ? state.travelTrips.length : 0,
    badges: Array.isArray(state.unlockedBadges) ? state.unlockedBadges.length : 0,
  };

  const totalEntities = Object.values(itemCounts).reduce((a, b) => a + b, 0);

  return {
    estimatedBytes,
    formattedSize,
    totalEntities,
    isOfflineReady: true,
    itemCounts,
  };
}

/**
 * Generates an anonymous system diagnostics bundle for troubleshooting.
 */
export function generateDiagnosticsReport(state: Record<string, any>, lang: string): string {
  const metrics = calculateStorageMetrics(state);
  const user = state.user || {};
  const prefs = state.prefs || {};

  const lines = [
    "=== AYXA PLANNER PRO DIAGNOSTICS ===",
    `App Version: 2.4.0 (Build 2026.09-Pro)`,
    `Timestamp: ${new Date().toISOString()}`,
    `Language: ${lang}`,
    `Theme: ${prefs.theme || "rose"} (${prefs.appearanceMode || "system"})`,
    `Currency: ${prefs.currency || "MAD"}`,
    `Auth Status: ${user.isGuest ? "Local Guest" : "Authenticated Member"}`,
    `User ID: ${user.id ? user.id.slice(0, 8) + "..." : "local-guest"}`,
    `Storage Footprint: ${metrics.formattedSize} (${metrics.totalEntities} total items)`,
    `Entity Breakdown:`,
    `  - Tasks: ${metrics.itemCounts.tasks}`,
    `  - Habits: ${metrics.itemCounts.habits}`,
    `  - Goals: ${metrics.itemCounts.goals}`,
    `  - Journal: ${metrics.itemCounts.journal}`,
    `  - Finances: ${metrics.itemCounts.finances}`,
    `  - Business: ${metrics.itemCounts.business}`,
    `  - Travel: ${metrics.itemCounts.travel}`,
    `  - Unlocked Badges: ${metrics.itemCounts.badges}`,
    `Notifications:`,
    `  - Master Sound: ${prefs.soundNotif ? "Enabled" : "Disabled"}`,
    `  - Sound Melody: ${prefs.soundType || "chime"}`,
    `  - Quiet Hours: ${prefs.quietHours?.enabled ? `Active (${prefs.quietHours.startTime} - ${prefs.quietHours.endTime})` : "Disabled"}`,
    `Platform:`,
    `  - User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "Unknown"}`,
    `  - Online Status: ${typeof navigator !== "undefined" && navigator.onLine ? "Online" : "Offline"}`,
    "=====================================",
  ];

  return lines.join("\n");
}
