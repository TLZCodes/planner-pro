import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { scheduleAsyncWrite } from "./slices/scheduler";
import { runMigration } from "./migration";
import {
  type FocusSession,
  type FocusPreset,
  type FocusMode,
  type FocusPhaseType,
  type FocusSessionStatus,
  type FocusSourceType,
  DEFAULT_FOCUS_PRESETS,
} from "./focusEngine";
import {
  type FlashDeck,
  type FlashCard,
  type ReviewSessionSummary,
  type ReviewRating,
  normalizeFlashDeck,
  sm2,
  undoSm2,
  SCHEDULER_VERSION,
} from "./sm2";
export * from "./sm2";
import {
  createDefaultMainAccount,
  DEFAULT_FINANCE_CATEGORIES,
  DEFAULT_FINANCE_SETTINGS,
  migrateLegacyMoneyToCanonicalLedger,
  toMinorUnits,
  fromMinorUnits,
  calculateAccountBalanceMinor,
  calculateNetPositionMinor,
  calculateMonthlyStats,
  calculateBudgetUsage,
  calculateSavingsProgressMinor,
  createTransferTransaction,
  createAdjustmentTransaction,
  formatMoney,
  formatMoneyCompact,
  type FinanceAccount,
  type FinancialTransaction,
  type FinancialTransactionLeg,
  type FinancialCategory,
  type Budget,
  type BudgetCategoryLimit,
  type SavingsGoal,
  type SavingsContribution,
  type RecurringTransactionTemplate,
  type FinanceSettings,
  type AccountType,
  type BalanceClass,
  type TransactionType,
  type TransactionStatus,
} from "./financeEngine";
export * from "./financeEngine";
export * from "./barakahJarEngine";
import {
  type PaperColor,
  type FlowerStyle,
} from "./barakahJarEngine";

export {
  type CapsuleStatus,
  type VisionBoardCapsuleSnapshot,
  type CapsuleAttachment,
  type FutureMeCapsule,
  type WritingPrompt,
  FUTURE_ME_PROMPTS,
  addCalendarMonths,
  addCalendarYears,
  getLocalDateInTimezone,
  getDaysUntilOpening,
  daysUntilDate,
  isCapsuleReadyToOpen,
  deriveCapsuleUiState,
  formatCapsuleDate,
  normalizeCapsule,
  maskSealedCapsuleForPublicView,
} from "./futureMeEngine";
import {
  type FutureMeCapsule,
  normalizeCapsule,
} from "./futureMeEngine";

export * from "./weekInBloomEngine";
import {
  type WeekInBloomKeepsake,
  normalizeWeekInBloomKeepsake,
} from "./weekInBloomEngine";

export * from "./selfCareBingoEngine";
import {
  type SelfCareBingoBoard,
  type SelfCareBingoTile,
  normalizeBingoBoard,
} from "./selfCareBingoEngine";

export * from "./somedayGardenEngine";
import {
  type SomedayWish,
  type SomedayWishStatus,
  type SomedayWishGrowthStage,
  normalizeSomedayWish,
  deriveGrowthStage,
  createDefaultWish,
  generateWishId,
} from "./somedayGardenEngine";

export * from "./bookshelfEngine";
import {
  type Book,
  type BookFormat,
  type ReadingStatus,
  type BookNote,
  type ReadingLogEntry,
  type ReadingCycle,
  type MonthlyReadingTarget,
  type BookshelfStats,
  normalizeBook,
  calculateBookProgress,
  logReadingSession,
  startNewReadingCycle as startNewBookCycleHelper,
  addBookNote as addBookNoteHelper,
  deleteBookNote as deleteBookNoteHelper,
  calculateBookshelfStats,
  calculateMonthlyTargetProgress,
  filterAndSortBooks,
} from "./bookshelfEngine";

export * from "./wheelOfBecomingEngine";
import {
  type WheelOfBecomingRecord,
  type WheelAreaConfig,
  type WheelReflectionNotes,
  type WheelCustomizationSettings,
  DEFAULT_WHEEL_AREAS,
  normalizeWheelRecord,
  normalizeWheelAreas,
  getYearMonth as getWheelYearMonth,
  compareMonthRecords,
  calculateWheelMetrics,
} from "./wheelOfBecomingEngine";

export * from "./aiPlannerEngine";
import {
  type AiConversation,
  type ContextPermissionScope,
  type AiProposal,
  type AiMessage,
  DEFAULT_CONTEXT_SCOPE,
  normalizeAiConversation,
  normalizeAiContextConsent,
} from "./aiPlannerEngine";

import {
  DEFAULT_BUSINESS_PROFILE,
  calculateBusinessFinances,
  calculateInvoiceTotals,
  calculateInvoiceFinancials,
  calculateProjectProgress,
  calculateProjectFinancials,
  calculateBusinessFocusMinutes,
  getDateRangeForPeriod,
  filterBusinessTransactions,
  type BusinessProfile,
  type BusinessProject,
  type ProjectMilestone,
  type ProjectTaskLink,
  type BusinessClient,
  type BusinessOffer,
  type BusinessInvoice,
  type InvoiceLineItem,
  type InvoicePaymentLink,
  type BusinessNote,
  type BusinessAttachment,
  type BusinessActivityEvent,
  type ProjectStatus,
  type ProjectProgressMethod,
  type ClientStatus,
  type ClientPriority,
  type OfferType,
  type OfferStatus,
  type InvoiceStatus,
  type BusinessPeriod,
} from "./businessEngine";
export * from "./businessEngine";

import {
  DEFAULT_TRAVEL_SETTINGS,
  calculatePreparationProgress,
  selectNextAdventure,
  generateItineraryDays,
  detectActivityOverlaps,
  calculateTripFinances,
  deriveDocumentStatus,
  type TravelTrip,
  type TravelDay,
  type ItineraryItem,
  type TravelBooking,
  type TravelBookingPaymentLink,
  type TravelBudgetCategory,
  type TravelChecklistItem,
  type TravelDocument,
  type BucketListItem,
  type TravelMemory,
  type TravelSettings,
  type TripStatus,
  type ActivityType,
  type BookingType,
  type BookingStatus,
  type PaymentStatus,
  type ChecklistCategory,
  type DocumentType,
  type DocumentStatus,
  type DesiredSeason,
  type PriorityLevel,
} from "./travelEngine";
export * from "./travelEngine";

import { migrateGuestDataToUser, type MigrationStrategy } from "./guestMigrationEngine";

import {
  DEFAULT_WELLNESS_SETTINGS,
  calculateDailyHydration,
  calculateSleepDuration,
  formatSleepDuration,
  calculateWellnessInsights,
  getLocalDateStr,
  convertMlToOz,
  convertOzToMl,
  type WellnessSettings,
  type WaterUnit,
  type HydrationSourceType,
  type HydrationEvent,
  type SleepRecord,
  type DailyStepRecord,
  type WorkoutActivityType,
  type WorkoutLog,
  type CareActivityLink,
  type HealthConnection,
} from "./wellnessEngine";
export * from "./wellnessEngine";
import {
  type CareCategory,
  type CareRecurrenceRule,
  type CareSourceType,
  type SelfCareActivity,
  type SelfCarePlanItem,
  type SelfCareCheckIn,
  type SelfCareIdea,
  type PlanItemStatus,
  migrateLegacySelfCare,
} from "./selfCareEngine";
export * from "./selfCareEngine";

import {
  DEFAULT_PREFS,
  DEFAULT_QUIET_HOURS,
  DEFAULT_NOTIF_CATEGORIES,
  DEFAULT_PRIVACY_SETTINGS,
  DEFAULT_ACCESSIBILITY_SETTINGS,
  THEME_PRESETS,
  SUPPORTED_CURRENCIES,
  COMMON_TIMEZONES,
  normalizePrefs,
  isWithinQuietHours,
  buildExportPayload,
  inspectBackupJson,
  calculateStorageMetrics,
  generateDiagnosticsReport,
  type AppearanceMode,
  type TextScale,
  type DateFormatOption,
  type TimeFormatOption,
  type WeekStartDay,
  type DefaultLandingRoute,
  type CompletedTaskVisibility,
  type AppTheme,
  type QuietHoursSettings,
  type NotificationCategoryPreferences,
  type PrivacySettings,
  type AccessibilitySettings,
  type Prefs,
  type ThemePreset,
  type CurrencyInfo,
  type ExportCategory,
  type ExportPayload,
  type BackupInspectionResult,
  type StorageUsageMetrics,
} from "./settingsEngine";
export * from "./settingsEngine";
import {
  type MoodPaletteId,
  type MoodPalette,
  type LegacyMoodSnapshot,
  type YearInPixelsSettings,
  type MoodSummaryStats,
  type DailyMoodRecord,
  type CanonicalMood,
  DEFAULT_PIXELS_SETTINGS,
  migrateLegacyPixels,
} from "./pixelsEngine";
export * from "./pixelsEngine";
import {
  type XPEvent,
  type XPEventState,
  type ProgressionTier,
  type LevelProgress,
  type TierProgress,
  type ProgressionOverview,
  type UserProgressSettings,
  XP_PER_LEVEL,
  PROGRESSION_TIERS,
  DEFAULT_PROGRESS_SETTINGS,
  getNumericLevel,
  getLevelProgress,
  getCurrentTier,
  getTierProgress,
  getProgressionOverview,
  getTotalActiveXp,
  reconcileLegacyXpLedger,
  getRewardKey,
  aggregateXpHistory,
  getPrivacySafeLabel,
} from "./progressionEngine";
export * from "./progressionEngine";

import {
  type BadgeAward,
  type BadgeSettings,
  DEFAULT_BADGE_SETTINGS,
  reconcileAndMigrateBadges,
  evaluateEligibleBadges,
} from "./badgeEngine";
export * from "./badgeEngine";

export * from "./visionEngine";
import {
  type VisionBoard,
  type VisionBoardItem,
  type VisionBoardTheme,
  type VisionBoardLayout,
  type VisionBoardItemType,
  normalizeVisionBoard,
  normalizeVisionBoardItem,
  duplicateBoardWithItems,
  reorderBoardItems,
} from "./visionEngine";

export * from "./idealWeekEngine";
import {
  type IdealWeekTemplate,
  type DayTypeConfig,
  type AppliedWeekRecord,
  type ApplyWeekActionPlan,
  createDefaultIdealWeekTemplate,
} from "./idealWeekEngine";

export * from "./brainDumpEngine";
import {
  type BrainDumpItem,
  type BrainDumpLabel,
  type BrainDumpStatus,
  type DestinationType,
  type BrainDumpDestinationRef,
  type BrainDumpAttachment,
  normalizeBrainDumpItem,
} from "./brainDumpEngine";


export type Priority = "high" | "medium" | "low";

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type RepeatRule = "none" | "daily" | "weekly" | "monthly" | "custom";

export type Task = {
  id: string;
  title: string;
  tag: string; // "Deen" | "Study" | "Work" | "Home" | "Health" | "Self-care" | "Money" | "Personal" | or custom
  category?: string;
  goalId?: string;
  due?: string;
  dueDate?: string; // "YYYY-MM-DD"
  dueTime?: string;
  optionalTime?: string; // "HH:MM" e.g. "09:30"
  priority: Priority;
  isTopThree?: boolean;
  reminder?: boolean;
  reminderTime?: string;
  repeatRule?: RepeatRule;
  subtasks?: Subtask[];
  notes?: string;
  details?: string;
  done: boolean;
  doneDate?: string; // YYYY-MM-DD when completed
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type HabitTrackingType = "check" | "count" | "duration";
export type HabitScheduleType = "daily" | "weekdays" | "custom" | "frequency";
export type HabitStatus = "active" | "paused" | "archived";

export type Habit = {
  id: string;
  emoji: string;
  name: string;
  nameAr?: string;
  title?: string;
  archived?: boolean;
  category?: string;
  trackingType?: HabitTrackingType; // "check" | "count" | "duration"
  targetValue?: number; // target per scheduled day (default 1 for check)
  currentValue?: number; // today's progress
  unit?: string; // e.g. "glasses", "pages", "min", "sessions", "reps"
  scheduleType?: HabitScheduleType;
  scheduledDays?: number[]; // [0..6] (0 = Sun, 1 = Mon ... 6 = Sat)
  weeklyFrequency?: number;
  preferredTime?: string;
  reminder?: boolean;
  reminderTime?: string;
  startDate?: string;
  notes?: string;
  status?: HabitStatus; // "active" | "paused" | "archived"
  streak: number;
  bestStreak?: number;
  days: boolean[]; // last 7 days (index 6 = today)
  lastChecked?: string; // YYYY-MM-DD
  history?: Record<
    string,
    { value: number; completed: boolean; completedAt?: string; xpAwarded?: boolean; skipped?: boolean }
  >;
  sourceBundleId?: string;
  sourceBundleHabitId?: string;
  sharedSourceId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RoutineSectionKey = "morning" | "day" | "afternoon" | "evening" | "night" | string;

export type RoutineStep = {
  id: string;
  time: string;
  emoji: string;
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  section?: RoutineSectionKey;
  schedulingType?: "fixed" | "prayer" | "none";
  prayerName?: "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
  prayerRelation?: "at" | "before" | "after";
  prayerOffsetMinutes?: number;
  durationMinutes?: number;
  reminder?: boolean;
  activeDays?: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  notes?: string;
  sharedStepKey?: string;
  skippedDate?: string;
  done: boolean;
  doneDate?: string;
};

export type UserRoutine = {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  badgeEn?: string;
  badgeAr?: string;
  color?: string;
  icon?: string;
  type?: string;
  activeDays?: number[];
  reminder?: boolean;
  reminderTime?: string;
  archived?: boolean;
  sourceTemplateId?: string;
  isCustom?: boolean;
  sections?: { id: string; titleEn: string; titleAr: string; icon: string }[];
  steps?: RoutineStep[];
  createdAt?: string;
  updatedAt?: string;
};

export type RoutineKey =
  | "ideal-day"
  | "morning"
  | "evening"
  | "bundle-reset"
  | "bundle-spiritual"
  | "bundle-glow"
  | "bundle-growth"
  | "friday"
  | "study"
  | "reset-day"
  | string;

export const DEFAULT_ROUTINES: Record<
  string,
  {
    titleEn: string;
    titleAr: string;
    subtitleEn: string;
    subtitleAr: string;
    badgeEn: string;
    badgeAr: string;
    color: string;
    icon?: string;
    steps: RoutineStep[];
  }
> = {
  "ideal-day": {
    titleEn: "Ideal Day ✨",
    titleAr: "خطة يومي المثالي ✨",
    subtitleEn: "Your ready-made master day plan",
    subtitleAr: "خطة يومكِ المتكاملة والمتوازنة",
    badgeEn: "Master Day Plan",
    badgeAr: "الخطة الشاملة",
    color: "from-pink-500 via-rose-500 to-amber-400",
    icon: "Star",
    steps: [
      // 1. Morning Section ☀️ (05:00 - 08:30)
      {
        id: "id-1",
        section: "morning",
        time: "05:00",
        emoji: "🌅",
        title: "Wake up",
        titleAr: "استيقاظ بدون تأجيل المنبه",
        sharedStepKey: "wake_morning",
        done: true,
      },
      {
        id: "id-2",
        section: "morning",
        time: "05:15",
        emoji: "🕌",
        title: "Fajr prayer with khushu'",
        titleAr: "صلاة الفجر بخشوع وحضور قلب",
        schedulingType: "prayer",
        prayerName: "Fajr",
        prayerRelation: "at",
        prayerOffsetMinutes: 0,
        sharedStepKey: "fajr",
        done: true,
      },
      {
        id: "id-3",
        section: "morning",
        time: "05:30",
        emoji: "📿",
        title: "Morning Adhkar",
        titleAr: "أذكار الصباح المباركة",
        sharedStepKey: "morning_adhkar",
        durationMinutes: 15,
        done: true,
      },
      {
        id: "id-4",
        section: "morning",
        time: "05:50",
        emoji: "📖",
        title: "Quran recitation & reflection",
        titleAr: "ورد القرآن الكريم وتدبر آية",
        sharedStepKey: "morning_quran",
        durationMinutes: 20,
        done: true,
      },
      {
        id: "id-5",
        section: "morning",
        time: "06:15",
        emoji: "💧",
        title: "Drink water & hydrate",
        titleAr: "شرب لتر ماء مع الليمون",
        done: true,
      },
      {
        id: "id-6",
        section: "morning",
        time: "06:30",
        emoji: "🛏️",
        title: "Make bed & tidy room",
        titleAr: "ترتيب السرير وتجديد هواء الغرفة",
        done: false,
      },
      {
        id: "id-7",
        section: "morning",
        time: "06:45",
        emoji: "🧴",
        title: "Skincare glow routine",
        titleAr: "روتين العناية ونضارة البشرة الصباحي",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "id-8",
        section: "morning",
        time: "07:15",
        emoji: "🥑",
        title: "Healthy breakfast",
        titleAr: "فطور صحي ومغذي",
        durationMinutes: 20,
        done: false,
      },
      {
        id: "id-9",
        section: "morning",
        time: "07:45",
        emoji: "📝",
        title: "Plan top 3 priorities",
        titleAr: "تحديد أهم 3 أولويات لليوم",
        sharedStepKey: "top3_plan",
        durationMinutes: 15,
        done: false,
      },

      // 2. Day & Focus Section 📚 (08:30 - 13:00)
      {
        id: "id-10",
        section: "day",
        time: "08:30",
        emoji: "🎯",
        title: "Focus / work / study block (Eat The Frog)",
        titleAr: "جلسة عمل ودراسة عميقة (إنجاز أصعب مهمة)",
        durationMinutes: 90,
        done: false,
      },
      {
        id: "id-duha",
        section: "day",
        time: "10:30",
        emoji: "☀️",
        title: "Duha prayer",
        titleAr: "صلاة الضحى والسكينة",
        sharedStepKey: "duha",
        done: false,
      },
      {
        id: "id-11",
        section: "day",
        time: "12:30",
        emoji: "🕌",
        title: "Dhuhr prayer & Sunnah",
        titleAr: "صلاة الظهر وسنتها",
        schedulingType: "prayer",
        prayerName: "Dhuhr",
        prayerRelation: "at",
        prayerOffsetMinutes: 0,
        sharedStepKey: "dhuhr",
        done: false,
      },
      {
        id: "id-12",
        section: "day",
        time: "13:00",
        emoji: "🥗",
        title: "Mindful lunch & pause",
        titleAr: "وجبة غداء صحية ومتوازنة",
        durationMinutes: 30,
        done: false,
      },

      // 3. Afternoon Section 🌿 (13:30 - 18:00)
      {
        id: "id-13",
        section: "afternoon",
        time: "13:45",
        emoji: "☕",
        title: "Short reset / tea / rest",
        titleAr: "استراحة قصيرة وشاي الأعشاب",
        durationMinutes: 20,
        done: false,
      },
      {
        id: "id-14",
        section: "afternoon",
        time: "14:15",
        emoji: "💻",
        title: "Second productive block",
        titleAr: "جلسة إنجاز المهام الثانوية والبريد",
        durationMinutes: 60,
        done: false,
      },
      {
        id: "id-15",
        section: "afternoon",
        time: "16:00",
        emoji: "🕌",
        title: "Asr prayer & tasbih",
        titleAr: "صلاة العصر والتسبيح",
        schedulingType: "prayer",
        prayerName: "Asr",
        prayerRelation: "at",
        prayerOffsetMinutes: 0,
        sharedStepKey: "asr",
        done: false,
      },
      {
        id: "id-16",
        section: "afternoon",
        time: "16:30",
        emoji: "🏃‍♀️",
        title: "Sport, walk & workout",
        titleAr: "ممارسة الرياضة أو المشي 8000 خطوة",
        durationMinutes: 45,
        done: false,
      },
      {
        id: "id-17",
        section: "afternoon",
        time: "17:30",
        emoji: "🛁",
        title: "Self-care & freshen up",
        titleAr: "وقت العناية والاسترخاء الشخصي",
        durationMinutes: 30,
        done: false,
      },

      // 4. Evening Section 🌙 (18:00 - 21:30)
      {
        id: "id-18",
        section: "evening",
        time: "18:45",
        emoji: "🕌",
        title: "Maghrib prayer & dua",
        titleAr: "صلاة المغرب والدعاء",
        schedulingType: "prayer",
        prayerName: "Maghrib",
        prayerRelation: "at",
        prayerOffsetMinutes: 0,
        sharedStepKey: "maghrib",
        done: false,
      },
      {
        id: "id-19",
        section: "evening",
        time: "19:15",
        emoji: "📚",
        title: "Evening Quran or book reading",
        titleAr: "قراءة في كتاب نافع أو مراجعة الحفظ",
        durationMinutes: 25,
        done: false,
      },
      {
        id: "id-20",
        section: "evening",
        time: "20:00",
        emoji: "🍲",
        title: "Light dinner",
        titleAr: "عشاء خفيف ومريح",
        durationMinutes: 25,
        done: false,
      },
      {
        id: "id-21",
        section: "evening",
        time: "20:45",
        emoji: "🕌",
        title: "Isha prayer & Witr",
        titleAr: "صلاة العشاء وركعات الوتر",
        schedulingType: "prayer",
        prayerName: "Isha",
        prayerRelation: "at",
        prayerOffsetMinutes: 0,
        sharedStepKey: "isha",
        done: false,
      },
      {
        id: "id-22",
        section: "evening",
        time: "21:15",
        emoji: "📿",
        title: "Evening Adhkar & Istighfar",
        titleAr: "أذكار المساء والاستغفار",
        sharedStepKey: "evening_adhkar",
        durationMinutes: 15,
        done: false,
      },

      // 5. Night & Sleep Section 💤 (21:30 - 23:00)
      {
        id: "id-23",
        section: "night",
        time: "21:40",
        emoji: "✍️",
        title: "Gratitude journal & reflection",
        titleAr: "تدوين الامتنان وتفريغ الأفكار",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "id-24",
        section: "night",
        time: "22:00",
        emoji: "🧺",
        title: "Prepare essentials for tomorrow",
        titleAr: "تجهيز ملابس ومستلزمات الغد",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "id-25",
        section: "night",
        time: "22:20",
        emoji: "📵",
        title: "Screen-free wind-down",
        titleAr: "إيقاف الشاشات وتصفية الذهن",
        durationMinutes: 20,
        done: false,
      },
      {
        id: "id-26",
        section: "night",
        time: "22:45",
        emoji: "🌙",
        title: "Surah Al-Mulk & sleep",
        titleAr: "سورة الملك وأذكار النوم ونوم هانئ",
        sharedStepKey: "surah_mulk",
        durationMinutes: 15,
        done: false,
      },
    ],
  },
  morning: {
    titleEn: "Morning Routine ☀️",
    titleAr: "الروتين الصباحي ☀️",
    subtitleEn: "Start your day with intention and barakah",
    subtitleAr: "ابدئي يومكِ بوعي وبركة وسكينة",
    badgeEn: "Fresh Start",
    badgeAr: "بداية ملهمة",
    color: "from-amber-400 via-orange-400 to-rose-500",
    icon: "Sun",
    steps: [
      {
        id: "mr-1",
        section: "morning",
        time: "05:30",
        emoji: "🌅",
        title: "Wake up",
        titleAr: "استيقاظ مبكر بنشاط",
        sharedStepKey: "wake_morning",
        done: true,
      },
      {
        id: "mr-2",
        section: "morning",
        time: "05:35",
        emoji: "🤲",
        title: "Say morning dua & gratitude",
        titleAr: "دعاء الاستيقاظ والشكر لله",
        durationMinutes: 5,
        done: true,
      },
      {
        id: "mr-3",
        section: "morning",
        time: "05:45",
        emoji: "🕌",
        title: "Fajr prayer with khushu'",
        titleAr: "صلاة الفجر بخشوع وحضور قلب",
        schedulingType: "prayer",
        prayerName: "Fajr",
        prayerRelation: "at",
        prayerOffsetMinutes: 0,
        sharedStepKey: "fajr",
        done: true,
      },
      {
        id: "mr-4",
        section: "morning",
        time: "06:00",
        emoji: "📿",
        title: "Morning Adhkar",
        titleAr: "أذكار الصباح المباركة",
        sharedStepKey: "morning_adhkar",
        durationMinutes: 15,
        done: true,
      },
      {
        id: "mr-5",
        section: "morning",
        time: "06:20",
        emoji: "📖",
        title: "Quran recitation & reflection",
        titleAr: "ورد القرآن الكريم وتدبر آية",
        sharedStepKey: "morning_quran",
        durationMinutes: 20,
        done: true,
      },
      {
        id: "mr-6",
        section: "morning",
        time: "06:40",
        emoji: "💧",
        title: "Drink warm water with lemon",
        titleAr: "شرب لتر ماء دافئ مع الليمون",
        done: false,
      },
      {
        id: "mr-7",
        section: "morning",
        time: "06:50",
        emoji: "🛏️",
        title: "Open curtains & make bed",
        titleAr: "فتح النوافذ للشمس وترتيب السرير",
        done: false,
      },
      {
        id: "mr-8",
        section: "morning",
        time: "07:00",
        emoji: "🧴",
        title: "Morning skincare & glow",
        titleAr: "روتين نضارة البشرة والواقي الصباحي",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "mr-9",
        section: "morning",
        time: "07:15",
        emoji: "🧘‍♀️",
        title: "Stretch or light movement",
        titleAr: "تمارين تمدد وتنفس عميق 10 دقائق",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "mr-10",
        section: "morning",
        time: "07:35",
        emoji: "🥑",
        title: "Healthy nourishing breakfast",
        titleAr: "فطور صحي متوازن ولذيذ",
        durationMinutes: 20,
        done: false,
      },
      {
        id: "mr-11",
        section: "morning",
        time: "08:00",
        emoji: "📝",
        title: "Write today's top 3 priorities",
        titleAr: "تدوين أهم 3 مهام تركزين عليها",
        sharedStepKey: "top3_plan",
        durationMinutes: 10,
        done: false,
      },
      {
        id: "mr-duha",
        section: "morning",
        time: "09:30",
        emoji: "☀️",
        title: "Duha prayer",
        titleAr: "صلاة الضحى",
        sharedStepKey: "duha",
        done: false,
      },
      {
        id: "mr-12",
        section: "morning",
        time: "10:00",
        emoji: "🎯",
        title: "Start the deep focus block",
        titleAr: "بدء جلسة العمل العميق والتركيز",
        durationMinutes: 90,
        done: false,
      },
    ],
  },
  evening: {
    titleEn: "Evening Routine 🌙",
    titleAr: "الروتين المسائي 🌙",
    subtitleEn: "End your day softly and intentionally",
    subtitleAr: "أنهي يومكِ بهدوء وسكينة واسترخاء",
    badgeEn: "Soft Wind-Down",
    badgeAr: "سكينة المساء",
    color: "from-indigo-900 via-purple-800 to-pink-700",
    icon: "Moon",
    steps: [
      {
        id: "ev-1",
        section: "evening",
        time: "20:00",
        emoji: "🧹",
        title: "Tidy the room for 10 minutes",
        titleAr: "ترتيب سريع وهادئ للغرفة 10 دقائق",
        durationMinutes: 10,
        done: false,
      },
      {
        id: "ev-2",
        section: "evening",
        time: "20:20",
        emoji: "👗",
        title: "Prepare clothes & essentials for tomorrow",
        titleAr: "تجهيز ملابس وحقيبة الغد",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "ev-3",
        section: "evening",
        time: "20:40",
        emoji: "📋",
        title: "Review today's completed tasks",
        titleAr: "مراجعة إنجازات اليوم والرضا",
        durationMinutes: 10,
        done: false,
      },
      {
        id: "ev-4",
        section: "evening",
        time: "21:00",
        emoji: "🕌",
        title: "Isha prayer & Witr",
        titleAr: "صلاة العشاء وركعات الوتر والخشوع",
        schedulingType: "prayer",
        prayerName: "Isha",
        prayerRelation: "at",
        prayerOffsetMinutes: 0,
        sharedStepKey: "isha",
        done: false,
      },
      {
        id: "ev-5",
        section: "evening",
        time: "21:20",
        emoji: "📿",
        title: "Evening Adhkar & Istighfar",
        titleAr: "أذكار المساء والاستغفار 100 مرة",
        sharedStepKey: "evening_adhkar",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "ev-6",
        section: "evening",
        time: "21:45",
        emoji: "📖",
        title: "Quran or book reading (15 min)",
        titleAr: "قراءة 15 دقيقة في كتاب نافع",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "ev-7",
        section: "night",
        time: "22:05",
        emoji: "🧴",
        title: "Shower / skincare / self-care",
        titleAr: "شاور دافئ وروتين العناية الليلية",
        durationMinutes: 20,
        done: false,
      },
      {
        id: "ev-8",
        section: "night",
        time: "22:25",
        emoji: "✍️",
        title: "Gratitude journal & brain dump",
        titleAr: "تدوين 3 نعم وتفريغ الأفكار",
        durationMinutes: 10,
        done: false,
      },
      {
        id: "ev-9",
        section: "night",
        time: "22:40",
        emoji: "📝",
        title: "Write tomorrow's top priorities",
        titleAr: "تحديد أولويات الغد للنوم براحة",
        durationMinutes: 10,
        done: false,
      },
      {
        id: "ev-10",
        section: "night",
        time: "22:50",
        emoji: "📵",
        title: "Put phone away / Do Not Disturb",
        titleAr: "وضع الهاتف بعيداً وتفعيل الصامت",
        done: false,
      },
      {
        id: "ev-11",
        section: "night",
        time: "23:00",
        emoji: "🕯️",
        title: "Relax & herbal tea",
        titleAr: "إشعال شمعة عطرية وشاي البابونج",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "ev-12",
        section: "night",
        time: "23:15",
        emoji: "🌙",
        title: "Surah Al-Mulk & sleep",
        titleAr: "سورة الملك، أذكار النوم، ونوم هانئ",
        sharedStepKey: "surah_mulk",
        durationMinutes: 15,
        done: false,
      },
    ],
  },
  friday: {
    titleEn: "Friday Routine 🕌",
    titleAr: "روتين يوم الجمعة المباركة 🕌",
    subtitleEn: "Special blessings and sunnahs for Friday",
    subtitleAr: "سنن وبركات يوم الجمعة وساعة الإجابة",
    badgeEn: "Friday Special",
    badgeAr: "يوم الجمعة 🤍",
    color: "from-teal-600 via-emerald-600 to-amber-500",
    icon: "Heart",
    steps: [
      {
        id: "fr-1",
        section: "morning",
        time: "06:00",
        emoji: "🚿",
        title: "Ghusl & wear clean clothes",
        titleAr: "الغسل والتطيب ولبس أحسن الثياب",
        durationMinutes: 25,
        done: false,
      },
      {
        id: "fr-2",
        section: "morning",
        time: "07:30",
        emoji: "📿",
        title: "Salawat on Prophet ﷺ (100x)",
        titleAr: "الإكثار من الصلاة على النبي ﷺ 100 مرة",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "fr-3",
        section: "day",
        time: "09:00",
        emoji: "📖",
        title: "Recite Surah Al-Kahf",
        titleAr: "قراءة سورة الكهف نورٌ بين الجمعتين",
        durationMinutes: 35,
        done: false,
      },
      {
        id: "fr-4",
        section: "day",
        time: "11:45",
        emoji: "🕌",
        title: "Early to Jumuah prayer",
        titleAr: "التبكير لصلاة الجمعة والاستماع للخطبة",
        done: false,
      },
      {
        id: "fr-5",
        section: "afternoon",
        time: "16:45",
        emoji: "🤲",
        title: "Hour of Acceptance (Dua before Maghrib)",
        titleAr: "ساعة الإجابة آخر ساعة قبل المغرب والدعاء",
        durationMinutes: 45,
        done: false,
      },
    ],
  },
  study: {
    titleEn: "Study & Exam Day 📚",
    titleAr: "روتين الدراسة وجلسات التركيز 📚",
    subtitleEn: "Structured learning and deep focus blocks",
    subtitleAr: "تنظيم جلسات المذاكرة العميقة والمراجعة الفعالة",
    badgeEn: "High Focus",
    badgeAr: "جلسات تركيز 🎯",
    color: "from-blue-600 via-indigo-600 to-purple-600",
    icon: "BookOpen",
    steps: [
      {
        id: "st-1",
        section: "morning",
        time: "08:00",
        emoji: "📋",
        title: "Review study goals for today",
        titleAr: "تحديد قائمة المواد والأهداف الدراسية",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "st-2",
        section: "morning",
        time: "08:30",
        emoji: "⏱️",
        title: "Pomodoro Block 1 (50 min study + 10 min break)",
        titleAr: "جلسة دراسة بومودورو 1 (50 دقيقة تركيز)",
        durationMinutes: 60,
        done: false,
      },
      {
        id: "st-3",
        section: "day",
        time: "10:00",
        emoji: "⏱️",
        title: "Pomodoro Block 2 (50 min study + 10 min break)",
        titleAr: "جلسة دراسة بومودورو 2 (حل تمارين ومسائل)",
        durationMinutes: 60,
        done: false,
      },
      {
        id: "st-4",
        section: "day",
        time: "11:30",
        emoji: "🧠",
        title: "Active recall & Flashcards review",
        titleAr: "المراجعة النشطة والبطاقات التعليمية",
        durationMinutes: 30,
        done: false,
      },
      {
        id: "st-5",
        section: "afternoon",
        time: "14:30",
        emoji: "📝",
        title: "Summarize and mind-map key concepts",
        titleAr: "تلخيص أهم النقاط والخرائط الذهنية",
        durationMinutes: 45,
        done: false,
      },
    ],
  },
  "reset-day": {
    titleEn: "Life & Weekly Reset 🌸",
    titleAr: "روتين إعادة الترتيب الأسبوعي 🌸",
    subtitleEn: "Declutter space, plan week & self-care",
    subtitleAr: "ترتيب المكان، التخطيط للأسبوع الجديد والراحة",
    badgeEn: "Fresh Reset",
    badgeAr: "تجديد الطاقة ✨",
    color: "from-rose-500 via-pink-500 to-purple-600",
    icon: "Zap",
    steps: [
      {
        id: "rd-1",
        section: "morning",
        time: "09:00",
        emoji: "🧺",
        title: "Laundry and room declutter",
        titleAr: "غسيل الملابس وترتيب الغرفة وتنظيم الخزانة",
        durationMinutes: 45,
        done: false,
      },
      {
        id: "rd-2",
        section: "day",
        time: "11:00",
        emoji: "💻",
        title: "Inbox & digital clean-up",
        titleAr: "تنظيف الملفات الرقمية والبريد الإلكتروني",
        durationMinutes: 30,
        done: false,
      },
      {
        id: "rd-3",
        section: "afternoon",
        time: "14:00",
        emoji: "📅",
        title: "Weekly planning & meal prep",
        titleAr: "تخطيط الأسبوع القادم وقائمة الوجبات",
        durationMinutes: 40,
        done: false,
      },
      {
        id: "rd-4",
        section: "evening",
        time: "17:00",
        emoji: "🛁",
        title: "Full pamper & self-care bath",
        titleAr: "جلسة عناية شخصية كاملة وشاور مهدئ",
        durationMinutes: 60,
        done: false,
      },
    ],
  },
  "bundle-reset": {
    titleEn: "Life & Daily Reset ✨",
    titleAr: "روتين إعادة ضبط الحياة والإنتاجية ✨",
    subtitleEn: "Reset procrastination & boost flow",
    subtitleAr: "الروتين الشامل لتنظيم اليوم والتخلص من المماطلة",
    badgeEn: "Most Popular",
    badgeAr: "الأكثر طلباً ✨",
    color: "from-pink-500 via-rose-500 to-amber-400",
    icon: "Zap",
    steps: [
      {
        id: "br-1",
        section: "morning",
        time: "05:30",
        emoji: "🌅",
        title: "Wake up",
        titleAr: "استيقاظ مبكر بدون تأجيل المنبه",
        sharedStepKey: "wake_morning",
        done: true,
      },
      {
        id: "br-2",
        section: "morning",
        time: "06:00",
        emoji: "💧",
        title: "Drink warm lemon water",
        titleAr: "شرب لتر ماء مع الليمون صباحاً",
        done: true,
      },
      {
        id: "br-3",
        section: "morning",
        time: "06:15",
        emoji: "📵",
        title: "Dopamine detox (no scrolling 1st hour)",
        titleAr: "صيام الدوبامين: عدم لمس الهاتف أول 60 دقيقة",
        durationMinutes: 60,
        done: true,
      },
      {
        id: "br-4",
        section: "morning",
        time: "07:30",
        emoji: "📝",
        title: "Brain dump & write top 3 priorities",
        titleAr: "تفريغ الأفكار وكتابة الأولويات الثلاثة",
        sharedStepKey: "top3_plan",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "br-5",
        section: "day",
        time: "08:30",
        emoji: "🎯",
        title: "Eat The Frog: complete hardest task first",
        titleAr: "إنجاز أصعب مهمة في الصباح (Eat The Frog)",
        durationMinutes: 90,
        done: false,
      },
      {
        id: "br-6",
        section: "day",
        time: "10:30",
        emoji: "☀️",
        title: "Duha prayer",
        titleAr: "صلاة الضحى والسكينة",
        sharedStepKey: "duha",
        done: false,
      },
      {
        id: "br-7",
        section: "afternoon",
        time: "17:00",
        emoji: "🧹",
        title: "10-minute tidy room & desk",
        titleAr: "ترتيب الغرفة والمكتب 10 دقائق",
        durationMinutes: 10,
        done: false,
      },
    ],
  },
  "bundle-spiritual": {
    titleEn: "Spiritual & Faith Daily Wird 🌙",
    titleAr: "ورد التقرب من الله والبركة اليومية 🌙",
    subtitleEn: "Daily devotion for peace and serenity",
    subtitleAr: "باقة العبادات اليومية للتقرب من الله وصلاة الفجر والقرآن",
    badgeEn: "Inner Peace",
    badgeAr: "سكينة وطمأنينة 🤍",
    color: "from-purple-600 via-indigo-600 to-pink-500",
    icon: "Heart",
    steps: [
      {
        id: "bs-1",
        section: "morning",
        time: "05:15",
        emoji: "🕌",
        title: "Fajr prayer on time with khushu'",
        titleAr: "صلاة الفجر في وقتها بخشوع",
        schedulingType: "prayer",
        prayerName: "Fajr",
        prayerRelation: "at",
        prayerOffsetMinutes: 0,
        sharedStepKey: "fajr",
        done: true,
      },
      {
        id: "bs-2",
        section: "morning",
        time: "05:45",
        emoji: "📿",
        title: "Morning Adhkar",
        titleAr: "أذكار الصباح المباركة كاملة",
        sharedStepKey: "morning_adhkar",
        durationMinutes: 15,
        done: true,
      },
      {
        id: "bs-3",
        section: "morning",
        time: "06:15",
        emoji: "📖",
        title: "Daily Quran recitation & reflection",
        titleAr: "ورد القرآن الكريم اليومي وتدبر آية",
        sharedStepKey: "morning_quran",
        durationMinutes: 20,
        done: true,
      },
      {
        id: "bs-4",
        section: "day",
        time: "09:30",
        emoji: "☀️",
        title: "Duha prayer",
        titleAr: "ركعتا الضحى صلاة الأوابين",
        sharedStepKey: "duha",
        done: false,
      },
      {
        id: "bs-5",
        section: "evening",
        time: "17:30",
        emoji: "📿",
        title: "Evening Adhkar",
        titleAr: "أذكار المساء وساعة الاستغفار",
        sharedStepKey: "evening_adhkar",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "bs-6",
        section: "evening",
        time: "21:00",
        emoji: "🤲",
        title: "Isha & Witr prayer",
        titleAr: "صلاة العشاء وركعات الوتر",
        schedulingType: "prayer",
        prayerName: "Isha",
        prayerRelation: "at",
        prayerOffsetMinutes: 0,
        sharedStepKey: "isha",
        done: false,
      },
      {
        id: "bs-7",
        section: "night",
        time: "22:30",
        emoji: "🤍",
        title: "Istighfar 100x & Salawat",
        titleAr: "الاستغفار 100 مرة والصلاة على النبي ﷺ",
        durationMinutes: 10,
        done: false,
      },
    ],
  },
  "bundle-glow": {
    titleEn: "Self-Care & Glow-Up Rituals 💅",
    titleAr: "روتين العناية والجمال والتجدد 💅",
    subtitleEn: "Skincare, movement, and wellness",
    subtitleAr: "طقوس العناية بالبشرة، التغذية الصحية، والمشي",
    badgeEn: "Radiant Glow",
    badgeAr: "إشراقة وجمال 🌸",
    color: "from-rose-400 via-pink-400 to-amber-300",
    icon: "Sparkles",
    steps: [
      {
        id: "bg-1",
        section: "morning",
        time: "07:00",
        emoji: "🧴",
        title: "Morning skincare glow routine",
        titleAr: "روتين العناية بالبشرة الصباحي والواقي",
        durationMinutes: 15,
        done: true,
      },
      {
        id: "bg-2",
        section: "morning",
        time: "08:00",
        emoji: "🥑",
        title: "Nourishing colorful breakfast",
        titleAr: "وجبة صحية مغذية ومليئة بالألوان",
        durationMinutes: 20,
        done: false,
      },
      {
        id: "bg-3",
        section: "day",
        time: "11:00",
        emoji: "💧",
        title: "Hydrate: drink water",
        titleAr: "شرب لتر ماء والترطيب المستمر",
        done: false,
      },
      {
        id: "bg-4",
        section: "afternoon",
        time: "16:30",
        emoji: "🏃‍♀️",
        title: "Walk 8,000 to 10,000 steps",
        titleAr: "المشي 8,000 إلى 10,000 خطوة يومياً",
        durationMinutes: 45,
        done: false,
      },
      {
        id: "bg-5",
        section: "afternoon",
        time: "17:30",
        emoji: "🧘‍♀️",
        title: "Stretching & deep breathing",
        titleAr: "تمارين التمدد والتنفس العميق",
        durationMinutes: 15,
        done: false,
      },
      {
        id: "bg-6",
        section: "evening",
        time: "20:30",
        emoji: "🍵",
        title: "Herbal tea & relaxing warm shower",
        titleAr: "شاي الأعشاب وحمام دافئ مهدئ",
        durationMinutes: 30,
        done: false,
      },
      {
        id: "bg-7",
        section: "night",
        time: "21:30",
        emoji: "🧴",
        title: "Night skincare & hydration",
        titleAr: "روتين العناية بالبشرة الليلي",
        durationMinutes: 15,
        done: false,
      },
    ],
  },
  "bundle-growth": {
    titleEn: "Mindset Growth & Learning 📚",
    titleAr: "نمو الفكر وتطوير الذات المستمر 📚",
    subtitleEn: "Daily reading, podcast & gratitude",
    subtitleAr: "عادة القراءة اليومية، البودكاست الملهم، والامتنان",
    badgeEn: "Constant Growth",
    badgeAr: "تطور مستمر 💡",
    color: "from-amber-500 via-orange-500 to-rose-500",
    icon: "BookOpen",
    steps: [
      {
        id: "bgr-1",
        section: "morning",
        time: "08:00",
        emoji: "✍️",
        title: "Write 3 blessings in gratitude journal",
        titleAr: "كتابة 3 نعم في مفكرة الامتنان اليومية",
        durationMinutes: 10,
        done: false,
      },
      {
        id: "bgr-2",
        section: "day",
        time: "12:00",
        emoji: "🎙️",
        title: "Listen to inspiring podcast or video",
        titleAr: "الاستماع لبودكاست أو فيديو مفيد أثناء المشي",
        durationMinutes: 30,
        done: false,
      },
      {
        id: "bgr-3",
        section: "afternoon",
        time: "15:00",
        emoji: "💡",
        title: "Learn a new skill for 20 mins",
        titleAr: "تعلم مهارة جديدة يومياً لمدة 20 دقيقة",
        durationMinutes: 20,
        done: false,
      },
      {
        id: "bgr-4",
        section: "evening",
        time: "19:30",
        emoji: "📖",
        title: "Read 20 pages of a good book",
        titleAr: "قراءة 20 صفحة من كتاب ملهم",
        durationMinutes: 25,
        done: false,
      },
    ],
  },
};

export type GoalStatus = "active" | "completed" | "archived" | "paused";
export type GoalProgressMethod = "milestones" | "numeric" | "linked" | "manual";

export type GoalMilestone = {
  id: string;
  title: string;
  titleAr?: string;
  dueDate?: string;
  targetDate?: string;
  done?: boolean;
  xpReward?: number;
  order?: number;
  weight?: number; // default 1
  completed: boolean;
  completedAt?: string;
};

export type GoalLinkedSourceType =
  "tasks" | "habits" | "routines" | "finance" | "learning" | "business";

export type GoalLink = {
  id: string;
  sourceType: GoalLinkedSourceType;
  sourceId: string;
  sourceTitle?: string;
  targetCount?: number;
  currentCount?: number;
};

export type GoalCheckIn = {
  id: string;
  date: string; // YYYY-MM-DD
  progress: number;
  wentWell?: string;
  challenge?: string;
  nextStep?: string;
  note?: string;
  createdAt: string;
};

export type Goal = {
  id: string;
  title: string;
  titleAr?: string;
  description?: string;
  category?: string; // alias to area
  current?: number; // alias to currentValue
  startValue?: number; // alias to startingValue
  isFocus?: boolean; // alias to isFocusGoal
  why?: string; // Step 2: Why this matters
  successVision?: string; // Step 2: What success looks/feels like
  icon?: string; // emoji e.g. "🎯"
  area: string; // "Deen" | "Study" | "Work" | "Home" | "Health" | "Self-care" | "Money" | "Personal" | custom
  status: GoalStatus; // "active" | "completed" | "archived" | "paused"
  isFocusGoal?: boolean; // Max 3 active focus goals ⭐
  progressMethod: GoalProgressMethod; // "milestones" | "numeric" | "linked" | "manual"
  progress: number; // 0-100 clamped
  target: string; // Display deadline/target label e.g. "Dec 2026"
  startDate?: string; // YYYY-MM-DD
  targetDate?: string; // YYYY-MM-DD

  // Numeric target method
  startingValue?: number;
  currentValue?: number;
  targetValue?: number;
  unit?: string;

  // Milestones method
  milestones?: GoalMilestone[];

  // Linked progress method
  linkedSources?: GoalLink[];

  // Systems & Actions (Step 4)
  nextAction?: string;
  checkInFrequency?: "weekly" | "monthly" | "custom" | "none";
  reminder?: boolean;
  reminderDate?: string;
  notes?: string;

  // History & Check-ins
  checkIns?: GoalCheckIn[];
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function migrateGoalCategory(area?: string): string {
  if (!area) return "Personal";
  if (area === "Studies") return "Study";
  if (area === "Finance") return "Money";
  if (area === "Planning") return "Personal";
  return area;
}

export function normalizeGoal(raw: Partial<Goal> & { milestones?: any[] }): Goal {
  const id = raw.id || uid();
  const area = migrateGoalCategory(raw.area);
  const status: GoalStatus =
    raw.status || (raw.progress !== undefined && raw.progress >= 100 ? "completed" : "active");
  const progressMethod: GoalProgressMethod =
    raw.progressMethod || (raw.milestones && raw.milestones.length > 0 ? "milestones" : "manual");

  // Normalize milestones
  const milestones: GoalMilestone[] = (raw.milestones || []).map((m: any, idx: number) => ({
    id: m.id || uid(),
    title: m.title || m.label || "",
    titleAr: m.titleAr,
    dueDate: m.dueDate,
    order: m.order ?? idx,
    weight: m.weight ?? 1,
    completed: m.completed ?? m.done ?? false,
    completedAt: m.completedAt || (m.done ? new Date().toISOString() : undefined),
  }));

  // Calculate progress based on method
  let progress = raw.progress ?? 0;
  if (progressMethod === "milestones" && milestones.length > 0) {
    const totalWeight = milestones.reduce((sum, m) => sum + (m.weight || 1), 0);
    const completedWeight = milestones
      .filter((m) => m.completed)
      .reduce((sum, m) => sum + (m.weight || 1), 0);
    progress = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  } else if (progressMethod === "numeric") {
    const start = raw.startingValue ?? 0;
    const current = raw.currentValue ?? 0;
    const target = raw.targetValue ?? 100;
    const range = target - start;
    if (range > 0) {
      progress = Math.min(100, Math.max(0, Math.round(((current - start) / range) * 100)));
    }
  }

  progress = Math.min(100, Math.max(0, progress));

  return {
    id,
    title: raw.title || "",
    titleAr: raw.titleAr,
    description: raw.description,
    why: raw.why,
    successVision: raw.successVision,
    icon: raw.icon || "🎯",
    area,
    status,
    isFocusGoal: raw.isFocusGoal ?? false,
    progressMethod,
    progress,
    target: raw.target || raw.targetDate || "Dec 2026",
    startDate: raw.startDate || todayKey(),
    targetDate: raw.targetDate,
    startingValue: raw.startingValue,
    currentValue: raw.currentValue,
    targetValue: raw.targetValue,
    unit: raw.unit,
    milestones,
    linkedSources: raw.linkedSources || [],
    nextAction: raw.nextAction,
    checkInFrequency: raw.checkInFrequency || "weekly",
    reminder: raw.reminder ?? false,
    reminderDate: raw.reminderDate,
    notes: raw.notes,
    checkIns: raw.checkIns || [],
    completedAt: raw.completedAt || (progress >= 100 ? new Date().toISOString() : undefined),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export type JournalTemplateId =
  | "free"
  | "gratitude"
  | "healing"
  | "morning"
  | "evening"
  | "faith"
  | "weekly"
  | "brain_dump"
  | "deen_reflection"
  | "self_love"
  | string;

export type JournalAttachment = {
  id: string;
  type: "photo" | "audio" | "image";
  url: string; // data URI or local storage ref
  name?: string;
  sizeBytes?: number;
  durationSeconds?: number;
};

export type DailyHydrationRecord = {
  userId: string;
  localDate: string; // YYYY-MM-DD
  consumedMl: number;
  targetMl: number; // default 2000
  preferredGlassMl: number; // default 250
  updatedAt: string;
};

export {
  type FocusSession,
  type FocusPreset,
  type FocusMode,
  type FocusPhaseType,
  type FocusSessionStatus,
  type FocusSourceType,
} from "./focusEngine";

export type MoodKey =
  | "happy"
  | "calm"
  | "okay"
  | "sad"
  | "anxious"
  | "tired"
  | "grateful"
  | "ecstatic"
  | "neutral"
  | string;
export type EnergyLevel = "low" | "medium" | "high";



export type JournalSettings = {
  journalLockEnabled: boolean;
  pin?: string;
  biometricEnabled?: boolean;
  autoLockMinutes?: number;
  hideNotificationContent?: boolean;
};

export type JournalEntry = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  title?: string;
  body: string;
  templateId?: JournalTemplateId;
  template?: string; // alias to templateId
  promptId?: string;
  promptText?: string;
  mood?: string; // emoji or mood key
  energy?: EnergyLevel;
  tags?: string[];
  sticker?: string;
  locked?: boolean;
  isLocked?: boolean; // alias to locked
  archived?: boolean;
  attachments?: JournalAttachment[];
  wordCount?: number;
  // Barakah Jar fields
  isBarakahJar?: boolean;
  paperColor?: PaperColor;
  flowerStyle?: FlowerStyle;
  createdAt: string;
  updatedAt: string;
};

export function normalizeJournalEntry(raw: Partial<JournalEntry>): JournalEntry {
  const id = raw.id || uid();
  const date = raw.date || todayKey();
  const body = raw.body || "";
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;
  return {
    id,
    date,
    time: raw.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    title: raw.title || "",
    body,
    templateId: raw.templateId || "free",
    promptId: raw.promptId,
    promptText: raw.promptText,
    mood: raw.mood || "🌸",
    energy: raw.energy,
    tags: raw.tags || [],
    sticker: raw.sticker || "✨",
    locked: Boolean(raw.locked),
    archived: Boolean(raw.archived),
    attachments: raw.attachments || [],
    wordCount: raw.wordCount ?? words,
    isBarakahJar: Boolean(raw.isBarakahJar),
    paperColor: raw.paperColor,
    flowerStyle: raw.flowerStyle,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export type MoneyEntry = {
  id: string;
  label: string;
  amount: number; // negative = expense
  category: string;
  date: string;
};

export type Trip = {
  id: string;
  place: string;
  date: string;
  budget: number;
  saved: number;
  checklist: { id: string; label: string; done: boolean }[];
};

export type StudyBlock = {
  id: string;
  subject: string;
  minutes: number;
  target: number;
  emoji: string;
};

// Per-date study session log (for heatmap)
export type StudySession = {
  date: string; // YYYY-MM-DD
  subject: string;
  minutes: number;
};

// ── Unified Learning Types ───────────────────────────────────────────────────
export type LearningItemType = "subject" | "course" | "book" | "skill" | "exam_prep";
export type LearningItemStatus = "active" | "paused" | "completed" | "archived";
export type LearningProgressMethod =
  | "study_time"
  | "lessons_completed"
  | "modules_completed"
  | "pages_read"
  | "manual_percentage";
export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface LearningLesson {
  id: string;
  moduleId?: string;
  learningItemId: string;
  title: string;
  titleAr?: string;
  description?: string;
  order: number;
  estimatedMinutes?: number;
  dueDate?: string; // YYYY-MM-DD
  status: LessonStatus;
  linkedTaskId?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningModule {
  id: string;
  learningItemId: string;
  title: string;
  titleAr?: string;
  description?: string;
  order: number;
  status?: "active" | "completed";
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningPlanItem {
  id: string;
  userId?: string;
  learningItemId: string;
  lessonId?: string;
  type: "session" | "deadline" | "assignment" | "exam" | "review";
  title: string;
  localDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  plannedMinutes?: number;
  dueAt?: string;
  reminderId?: string;
  linkedTaskId?: string;
  status: "pending" | "completed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningResource {
  id: string;
  learningItemId: string;
  lessonId?: string;
  type: "link" | "file" | "doc" | "note";
  title: string;
  externalUrl?: string;
  secureStorageReference?: string;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningNote {
  id: string;
  learningItemId: string;
  lessonId?: string;
  title?: string;
  body: string;
  date?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningItem {
  id: string;
  userId?: string;
  type: LearningItemType;
  title: string;
  titleAr?: string;
  description?: string;
  icon: string;
  color: string;
  status: LearningItemStatus;
  progressMethod: LearningProgressMethod;
  progress: number; // 0-100
  startingValue?: number;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
  weeklyTargetMinutes: number;
  startDate?: string; // YYYY-MM-DD
  targetDate?: string; // YYYY-MM-DD
  author?: string; // Book author
  totalPages?: number; // Book total pages
  currentPage?: number; // Book current page
  platform?: string; // Course platform
  instructor?: string; // Course instructor
  totalLessons?: number; // Course total lessons
  completedLessons?: number; // Course completed lessons
  level?: "Beginner" | "Intermediate" | "Advanced" | "Expert"; // Skill level
  examDate?: string; // Exam date
  preferredStudyDays?: number[]; // [0, 1, 2, 3, 4, 5, 6]
  linkedTaskId?: string;
  linkedGoalId?: string;
  completedAt?: string;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function normalizeLearningItem(raw: Partial<LearningItem>): LearningItem {
  const id = raw.id || uid();
  const type: LearningItemType = raw.type || "subject";
  const status: LearningItemStatus = raw.status || "active";
  
  let progressMethod: LearningProgressMethod = raw.progressMethod || "study_time";
  if (!raw.progressMethod) {
    if (type === "book") progressMethod = "pages_read";
    else if (type === "course") progressMethod = "lessons_completed";
    else if (type === "skill") progressMethod = "manual_percentage";
    else if (type === "exam_prep") progressMethod = "study_time";
  }

  let progress = raw.progress ?? 0;
  if (type === "book" && raw.totalPages) {
    progress = Math.min(100, Math.max(0, Math.round(((raw.currentPage ?? 0) / Math.max(1, raw.totalPages)) * 100)));
  } else if (type === "course" && raw.totalLessons) {
    progress = Math.min(100, Math.max(0, Math.round(((raw.completedLessons ?? 0) / Math.max(1, raw.totalLessons)) * 100)));
  }
  progress = Math.min(100, Math.max(0, progress));

  return {
    id,
    userId: raw.userId,
    type,
    title: raw.title || "Untitled",
    titleAr: raw.titleAr,
    description: raw.description,
    icon: raw.icon || (type === "book" ? "📗" : type === "course" ? "🎓" : type === "skill" ? "🎯" : type === "exam_prep" ? "📝" : "📚"),
    color: raw.color || (type === "book" ? "#C5DFC0" : type === "course" ? "#C8B6E2" : type === "skill" ? "#FDE49C" : "#A8E0D8"),
    status,
    progressMethod,
    progress,
    startingValue: raw.startingValue,
    currentValue: raw.currentValue,
    targetValue: raw.targetValue,
    unit: raw.unit,
    weeklyTargetMinutes: raw.weeklyTargetMinutes ?? 180,
    startDate: raw.startDate || todayKey(),
    targetDate: raw.targetDate,
    author: raw.author,
    totalPages: raw.totalPages,
    currentPage: raw.currentPage,
    platform: raw.platform,
    instructor: raw.instructor,
    totalLessons: raw.totalLessons,
    completedLessons: raw.completedLessons,
    level: raw.level,
    examDate: raw.examDate,
    preferredStudyDays: raw.preferredStudyDays || [1, 2, 3, 4, 5],
    linkedTaskId: raw.linkedTaskId,
    linkedGoalId: raw.linkedGoalId,
    completedAt: raw.completedAt,
    archivedAt: raw.archivedAt,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export const LEARNING_ITEM_COLORS = [
  "#8b5cf6", // Purple / Violet
  "#ec4899", // Hotpink / Rose
  "#3b82f6", // Blue
  "#10b981", // Emerald / Mint
  "#f59e0b", // Amber / Gold
  "#06b6d4", // Cyan
  "#f97316", // Coral / Orange
  "#6366f1", // Indigo
];

export const LEARNING_ITEM_ICONS: Record<LearningItemType, string[]> = {
  subject: ["📚", "📐", "🔬", "🌍", "💻", "🎨", "✍️", "📖", "🧬", "🧪", "🪐", "⚖️"],
  course: ["🎓", "💻", "🎬", "🖥️", "🎙️", "📝", "📊", "🧠", "📱", "🎯"],
  book: ["📗", "📕", "📘", "📙", "📖", "📚", "🔖", "📜", "📑", "📓"],
  skill: ["🎯", "🎨", "🎤", "🇫🇷", "📊", "🎸", "🍳", "🥋", "🏊", "💡"],
  exam_prep: ["📝", "⏰", "📑", "🧠", "🎯", "🏆", "📊", "🔥", "💯", "✍️"],
};

// Legacy Books, Courses, Skills (Book is imported from bookshelfEngine)

export type Course = {
  id: string;
  name: string;
  platform: string;
  instructor: string;
  progress: number; // 0-100
  totalLessons: number;
  completedLessons: number;
};

export type Skill = {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  progress: number; // 0-100
  emoji: string;
};

export type Pixel = { date: string; mood: number };

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  emoji: string;
  focus: string[];
  isGuest: boolean;
  isPro?: boolean;
  setupDone: boolean;
  emailVerified?: boolean;
  authType?: "guest" | "authenticated" | "none";
  createdAt?: string;
};

export type UserMorePreferences = {
  pinnedModuleIds: string[];
  hiddenModuleIds: string[];
  customModuleOrder: string[];
  updatedAt: string;
  schemaVersion: number;
};

export type RecentModuleVisit = {
  moduleId: string;
  lastVisitedAt: string;
};

export type DeenPrayerSettings = {
  locationMode: "gps" | "manual";
  manualCityId: string;
  latitude: number;
  longitude: number;
  calculationMethod: string;
  asrMadhab: "shafi" | "hanafi";
  hijriDayAdjustment: number;
  trackingPaused: boolean;
  trackingPauseUntil?: string; // YYYY-MM-DD
  hapticsEnabled: boolean;
  tasbihSoundEnabled: boolean;
  showTransliteration: boolean;
  showTranslation: boolean;
  notificationsEnabled: boolean;
};

export type PrayerLogRecord = {
  logged: boolean;
  loggedAt?: string;
  note?: string;
  inMosque?: boolean;
};

export type QuranGoalData = {
  progressMethod: "pages" | "minutes" | "juz" | "surahs";
  dailyTarget: number;
  targetDate?: string;
};

export type QuranProgressEvent = {
  id: string;
  localDate: string;
  amount: number;
  unit: string;
  timestamp: string;
  idempotencyKey?: string;
};

export type SadaqahEntry = {
  id: string;
  localDate: string;
  amount?: number;
  currency: string;
  category: string;
  privateNote?: string;
  isAnonymous?: boolean;
  createdAt: string;
};

export type GoodDeedItem = {
  id: string;
  titleEn: string;
  titleAr: string;
  category?: string;
  isCustom?: boolean;
  createdAt?: string;
};

export type HabitWeekGroupingMode = "none" | "timeOfDay" | "category";
export type HabitWeekDensity = "comfortable" | "compact";
export type HabitWeekPaperTheme = "blossom" | "butter" | "lavender" | "minimal";

export type HabitWeekPreferences = {
  firstDayOfWeek?: "saturday" | "sunday" | "monday";
  groupingMode?: HabitWeekGroupingMode;
  density?: HabitWeekDensity;
  paperTheme?: HabitWeekPaperTheme;
  showWater?: boolean;
  showMood?: boolean;
  showEnergy?: boolean;
  showDayRating?: boolean;
  showStreaks?: boolean;
  showIntentionCard?: boolean;
  showNotesCard?: boolean;
  showFlexibleSection?: boolean;
  updatedAt?: string;
};

export type WeeklyIntentionRecord = {
  id: string;
  userId: string;
  weekStartDate: string; // YYYY-MM-DD
  text: string;
  presetTag?: string;
  updatedAt: string;
};

export type WeeklyNoteRecord = {
  id: string;
  userId: string;
  weekStartDate: string; // YYYY-MM-DD
  text: string;
  journalEntryId?: string;
  reflectionAnswers?: Record<string, string>;
  energyDrained?: string;
  energyRestored?: string;
  accomplishments?: any[];
  nextWeekPriorities?: any[];
  nextWeekIntention?: string;
  completedReflection?: boolean;
  updatedAt: string;
};

export type AppState = {
  user: User;
  session: boolean;
  setupDone?: boolean;
  tasks: Task[];
  customCategories: string[];
  habits: Habit[];
  habitWeekPreferences?: HabitWeekPreferences;
  weeklyIntentions?: Record<string, WeeklyIntentionRecord>;
  weeklyNotes?: Record<string, WeeklyNoteRecord>;
  routines: Record<string, RoutineStep[]>;
  customRoutines?: UserRoutine[];
  archivedRoutines?: string[];
  routineCompletionsByDate?: Record<string, string[]>;
  goals: Goal[];
  visionBoards?: VisionBoard[];
  visionBoardItems?: VisionBoardItem[];
  journal: JournalEntry[];
  journalEntries?: JournalEntry[];
  journalLocked?: boolean;
  routineLogs?: any;
  wellness?: any;
  dailyMoods: Record<string, DailyMoodRecord>;
  dailyHydration: Record<string, DailyHydrationRecord>;
  hydrationTargetMl: number;
  preferredGlassMl: number;
  focusSessions: FocusSession[];
  activeFocusSession: FocusSession | null;
  focusPresets?: FocusPreset[];
  journalSettings?: JournalSettings;
  money: MoneyEntry[];
  // Canonical Finance System
  financeAccounts: FinanceAccount[];
  financialTransactions: FinancialTransaction[];
  financeCategories: FinancialCategory[];
  financeBudgets: Budget[];
  savingsGoals: SavingsGoal[];
  savingsContributions: SavingsContribution[];
  recurringTransactions: RecurringTransactionTemplate[];
  financeSettings: FinanceSettings;
  financeSchemaVersion: number;
  // Canonical Business Workspace
  businessProfile?: BusinessProfile;
  businessProjects: BusinessProject[];
  businessMilestones: ProjectMilestone[];
  businessProjectTaskLinks: ProjectTaskLink[];
  businessClients: BusinessClient[];
  businessOffers: BusinessOffer[];
  businessInvoices: BusinessInvoice[];
  businessInvoiceLineItems: InvoiceLineItem[];
  businessInvoicePaymentLinks: InvoicePaymentLink[];
  businessNotes: BusinessNote[];
  businessAttachments: BusinessAttachment[];
  businessActivityEvents: BusinessActivityEvent[];
  // Canonical Travel Workspace
  travelTrips: TravelTrip[];
  travelDays: TravelDay[];
  itineraryItems: ItineraryItem[];
  travelBookings: TravelBooking[];
  travelBookingPaymentLinks: TravelBookingPaymentLink[];
  travelBudgetCategories: TravelBudgetCategory[];
  travelChecklistItems: TravelChecklistItem[];
  travelDocuments: TravelDocument[];
  bucketListItems: BucketListItem[];
  travelMemories: TravelMemory[];
  travelSettings: TravelSettings;
  // Canonical Unified Wellness Hub
  wellnessSettings: WellnessSettings;
  hydrationEvents: HydrationEvent[];
  sleepRecords: SleepRecord[];
  dailyStepRecords: Record<string, DailyStepRecord>;
  workoutLogs: WorkoutLog[];
  careActivityLinks: CareActivityLink[];
  healthConnections: Record<string, HealthConnection>;
  // Canonical Self-Care Workspace
  selfCareActivities: SelfCareActivity[];
  selfCarePlanItems: SelfCarePlanItem[];
  selfCareCheckIns: Record<string, SelfCareCheckIn>;
  trips: Trip[];
  study: StudyBlock[];
  studySessions: StudySession[];
  books: Book[];
  monthlyReadingTarget?: MonthlyReadingTarget;
  courses: Course[];
  skills: Skill[];
  // Unified Learning Hub Models
  learningItems?: LearningItem[];
  learningModules?: LearningModule[];
  learningLessons?: LearningLesson[];
  learningPlanItems?: LearningPlanItem[];
  learningResources?: LearningResource[];
  learningNotes?: LearningNote[];
  flashcardDecks?: FlashDeck[];
  reviewSessions?: ReviewSessionSummary[];
  selfcare: { id: string; emoji: string; label: string; done: boolean; doneDate?: string }[];
  pixels: Pixel[];
  yearInPixelsSettings?: YearInPixelsSettings;
  legacyMoodSnapshots?: Record<string, LegacyMoodSnapshot>;
  prefs: Prefs;
  morePreferences?: UserMorePreferences;
  recentModuleVisits?: RecentModuleVisit[];
  // Deen State & Islamic Companion
  deenSettings?: DeenPrayerSettings;
  prayerLogs?: Record<string, PrayerLogRecord>; // key: `${localDate}_${prayerKey}`
  quranGoal?: QuranGoalData;
  quranHistory?: QuranProgressEvent[];
  surahProgress?: Record<number, { status: "not_started" | "reading" | "completed"; completedAt?: string }>;
  sadaqahLogs?: SadaqahEntry[];
  goodDeeds?: GoodDeedItem[];
  goodDeedLogs?: Record<string, boolean>; // key: `${localDate}_${deedId}`
  activeTasbih?: { phraseAr: string; phraseEn: string; count: number; target: number; isCustom?: boolean };
  xp: number;
  xpLedger: XPEvent[];
  userProgressSettings?: UserProgressSettings;
  badgeAwards?: BadgeAward[];
  badgeSettings?: BadgeSettings;
  unlockedBadges: string[];
  achievements: string[];
  totalTasksDone: number;
  totalFlashcardsReviewed: number;
  // Ideal Week & Between the Prayers
  idealWeekTemplate?: IdealWeekTemplate;
  customDayTypes?: DayTypeConfig[];
  appliedIdealWeeks?: Record<string, AppliedWeekRecord>;
  // Brain Dump Inbox
  brainDumpItems?: BrainDumpItem[];
  // Future Me Time Capsule
  timeCapsules?: FutureMeCapsule[];
  // My Week in Bloom Keepsakes
  weekInBloomKeepsakes?: WeekInBloomKeepsake[];
  // Self-care Bingo Boards
  selfCareBingoBoards?: SelfCareBingoBoard[];
  // Someday Garden Wishes
  somedayWishes?: SomedayWish[];
  // Wheel of Becoming Records & Customization
  wheelOfBecomingRecords?: WheelOfBecomingRecord[];
  wheelCustomization?: WheelCustomizationSettings;
  // AYXA AI Planner Conversations & User Context Consent
  aiConversations?: AiConversation[];
  aiContextConsent?: ContextPermissionScope;
  aiCredits?: number;
  aiPersona?: "feminine" | "masculine";
  aiSettings?: AiSettings;
};

export interface AiSettings {
  level: "saver" | "balanced" | "deep";
  tone: "gentle" | "action" | "barakah";
  confirmBeforeGenerating: boolean;
  lowCreditAlertThreshold: number;
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  level: "balanced",
  tone: "barakah",
  confirmBeforeGenerating: false,
  lowCreditAlertThreshold: 5,
};

export function getStableGuestId(): string {
  if (typeof window === "undefined") return "guest_default";
  try {
    let gid = localStorage.getItem("ayxa_guest_id");
    if (!gid) {
      gid = "guest_" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("ayxa_guest_id", gid);
    }
    return gid;
  } catch {
    return "guest_default";
  }
}

export function createDefaultGuestUser(): User {
  return {
    id: getStableGuestId(),
    name: "Guest",
    email: "",
    avatar: "🌸",
    emoji: "🌸",
    focus: ["Planning", "Faith", "Habits", "Self-Care"],
    isGuest: true,
    isPro: false,
    setupDone: false,
    authType: "guest",
    createdAt: new Date().toISOString(),
  };
}

export const DEFAULT_TASK_CATEGORIES = [
  {
    id: "Deen",
    labelEn: "Deen",
    labelAr: "الدين",
    emoji: "🌙",
    tone: "mint",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  {
    id: "Study",
    labelEn: "Study",
    labelAr: "الدراسة",
    emoji: "📚",
    tone: "violet",
    bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  },
  {
    id: "Work",
    labelEn: "Work",
    labelAr: "العمل",
    emoji: "💼",
    tone: "blue",
    bg: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
  },
  {
    id: "Home",
    labelEn: "Home",
    labelAr: "المنزل",
    emoji: "🏡",
    tone: "gold",
    bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
  {
    id: "Health",
    labelEn: "Health",
    labelAr: "الصحة",
    emoji: "🥑",
    tone: "teal",
    bg: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  },
  {
    id: "Self-care",
    labelEn: "Self-care",
    labelAr: "العناية بالنفس",
    emoji: "🌸",
    tone: "rose",
    bg: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800",
  },
  {
    id: "Money",
    labelEn: "Money",
    labelAr: "المال",
    emoji: "💰",
    tone: "gold",
    bg: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800",
  },
  {
    id: "Personal",
    labelEn: "Personal",
    labelAr: "شخصي",
    emoji: "✨",
    tone: "lavender",
    bg: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
  },
];

export function getTomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function migrateTaskCategory(tag?: string): string {
  if (!tag) return "Personal";
  if (tag === "Studies") return "Study";
  if (tag === "Finance") return "Money";
  if (tag === "Planning") return "Personal";
  return tag;
}

export function normalizeTask(raw: Partial<Task>): Task {
  const nowIso = new Date().toISOString();
  const tag = migrateTaskCategory(raw.tag);
  let dueDate = raw.dueDate;
  let optionalTime = raw.optionalTime;

  if (!dueDate) {
    if (raw.due && raw.due.toLowerCase().includes("tomorrow")) {
      dueDate = getTomorrowKey();
    } else {
      dueDate = todayKey();
    }
  }

  if (!optionalTime && raw.due) {
    const match = raw.due.match(/\b(\d{1,2}:\d{2})\b/);
    if (match) {
      optionalTime = match[1];
    }
  }

  return {
    id: raw.id || Math.random().toString(36).slice(2, 10),
    title: raw.title || "",
    tag,
    due: raw.due || `${dueDate}${optionalTime ? " " + optionalTime : ""}`,
    dueDate,
    optionalTime,
    priority: raw.priority || "medium",
    isTopThree: Boolean(raw.isTopThree),
    reminder: Boolean(raw.reminder),
    reminderTime: raw.reminderTime || "",
    repeatRule: raw.repeatRule || "none",
    subtasks: raw.subtasks || [],
    notes: raw.notes || "",
    done: Boolean(raw.done),
    doneDate: raw.doneDate || (raw.done ? todayKey() : undefined),
    completedAt: raw.completedAt || (raw.done ? nowIso : undefined),
    createdAt: raw.createdAt || nowIso,
    updatedAt: raw.updatedAt || nowIso,
  };
}

export const uid = () => Math.random().toString(36).slice(2, 10);
export const todayKey = (timezone?: string) => getLocalDateStr(new Date(), timezone);

const defaultState: AppState = {
  user: createDefaultGuestUser(),
  session: false,
  hydrationTargetMl: 2000,
  preferredGlassMl: 250,
  // Canonical Unified Wellness Hub
  wellnessSettings: DEFAULT_WELLNESS_SETTINGS,
  hydrationEvents: [],
  sleepRecords: [],
  dailyStepRecords: {},
  workoutLogs: [],
  careActivityLinks: [],
  healthConnections: {},
  customCategories: [],
  brainDumpItems: [],
  timeCapsules: [],
  weekInBloomKeepsakes: [],
  selfCareBingoBoards: [],
  somedayWishes: [],
  tasks: [],
  habitWeekPreferences: {
    firstDayOfWeek: "saturday",
    groupingMode: "none",
    density: "comfortable",
    paperTheme: "blossom",
    showWater: true,
    showMood: true,
    showEnergy: true,
    showDayRating: true,
    showStreaks: true,
    showIntentionCard: true,
    showNotesCard: true,
    showFlexibleSection: true,
  },
  weeklyIntentions: {},
  weeklyNotes: {},
  habits: [],
  routines: {
    "ideal-day": DEFAULT_ROUTINES["ideal-day"].steps,
    morning: DEFAULT_ROUTINES["morning"].steps,
    evening: DEFAULT_ROUTINES["evening"].steps,
  },
  goals: [],
  visionBoards: [],
  visionBoardItems: [],
  journal: [],
  dailyMoods: {},
  dailyHydration: {},
  journalSettings: {
    journalLockEnabled: false,
    autoLockMinutes: 5,
    hideNotificationContent: true,
  },
  focusSessions: [],
  activeFocusSession: null,
  focusPresets: DEFAULT_FOCUS_PRESETS,
  money: [],
  financeAccounts: [createDefaultMainAccount("MAD")],
  financialTransactions: [],
  financeCategories: DEFAULT_FINANCE_CATEGORIES,
  financeBudgets: [],
  savingsGoals: [],
  savingsContributions: [],
  recurringTransactions: [],
  financeSettings: DEFAULT_FINANCE_SETTINGS,
  financeSchemaVersion: 1,
  // Canonical Business Workspace (honest empty initial state)
  businessProfile: DEFAULT_BUSINESS_PROFILE,
  businessProjects: [],
  businessMilestones: [],
  businessProjectTaskLinks: [],
  businessClients: [],
  businessOffers: [],
  businessInvoices: [],
  businessInvoiceLineItems: [],
  businessInvoicePaymentLinks: [],
  businessNotes: [],
  businessAttachments: [],
  businessActivityEvents: [],
  // Canonical Travel Workspace
  travelTrips: [],
  travelDays: [],
  itineraryItems: [],
  travelBookings: [],
  travelBookingPaymentLinks: [],
  travelBudgetCategories: [],
  travelChecklistItems: [],
  travelDocuments: [],
  bucketListItems: [],
  travelMemories: [],
  travelSettings: DEFAULT_TRAVEL_SETTINGS,
  trips: [],
  study: [],
  studySessions: [], // populated dynamically
  books: [],
  monthlyReadingTarget: undefined,
  courses: [],
  skills: [],
  // Canonical Self-Care Workspace
  selfCareActivities: [],
  selfCarePlanItems: [],
  selfCareCheckIns: {},
  selfcare: [],
  pixels: [],
  yearInPixelsSettings: DEFAULT_PIXELS_SETTINGS,
  legacyMoodSnapshots: {},
  prefs: DEFAULT_PREFS,
  deenSettings: {
    locationMode: "manual",
    manualCityId: "casablanca",
    latitude: 33.5731,
    longitude: -7.5898,
    calculationMethod: "MuslimWorldLeague",
    asrMadhab: "shafi",
    hijriDayAdjustment: 0,
    trackingPaused: false,
    hapticsEnabled: true,
    tasbihSoundEnabled: false,
    showTransliteration: true,
    showTranslation: true,
    notificationsEnabled: false,
  },
  prayerLogs: {},
  quranGoal: {
    progressMethod: "pages",
    dailyTarget: 4,
  },
  quranHistory: [],
  surahProgress: {},
  sadaqahLogs: [],
  goodDeeds: [
    { id: "gd_smile", titleEn: "Smile at someone & spread joy", titleAr: "التبسم في وجه الآخرين ونشر البهجة", category: "daily" },
    { id: "gd_salawat", titleEn: "Send 100 Salawat on Prophet ﷺ", titleAr: "الصلاة على النبي ﷺ 100 مرة", category: "daily" },
    { id: "gd_kin", titleEn: "Check on parents or family ties", titleAr: "بر الوالدين أو صلة الرحم بالسؤال والدعاء", category: "daily" },
    { id: "gd_kind_word", titleEn: "Say a kind uplifting word", titleAr: "الكلمة الطيبة وجبر الخواطر", category: "daily" },
    { id: "gd_feed_animal", titleEn: "Feed a stray bird or cat with water", titleAr: "إطعام طير أو قطة وسقيا ماء", category: "weekly" },
    { id: "gd_fast_mon_thu", titleEn: "Voluntary fasting (Monday / Thursday)", titleAr: "صيام الإثنين أو الخميس (نافلة)", category: "weekly" },
    { id: "gd_surah_kahf", titleEn: "Read Surah Al-Kahf on Friday", titleAr: "قراءة سورة الكهف يوم الجمعة", category: "weekly" },
    { id: "gd_dua_secret", titleEn: "Make Dua for a sister in secret", titleAr: "الدعاء لأخت بظهر الغيب", category: "daily" },
  ],
  goodDeedLogs: {},
  activeTasbih: {
    phraseAr: "سُبْحَانَ اللَّهِ",
    phraseEn: "SubhanAllah",
    count: 0,
    target: 33,
    isCustom: false,
  },
  xp: 0,
  xpLedger: [],
  userProgressSettings: DEFAULT_PROGRESS_SETTINGS,
  badgeAwards: [],
  badgeSettings: DEFAULT_BADGE_SETTINGS,
  unlockedBadges: [],
  achievements: [],
  totalTasksDone: 0,
  totalFlashcardsReviewed: 0,
  idealWeekTemplate: createDefaultIdealWeekTemplate(),
  customDayTypes: [],
  appliedIdealWeeks: {},
  wheelOfBecomingRecords: [],
  wheelCustomization: {},
  aiConversations: [],
  aiContextConsent: DEFAULT_CONTEXT_SCOPE,
  aiCredits: 50,
  aiPersona: "feminine",
  aiSettings: DEFAULT_AI_SETTINGS,
};

const KEY = "ayxa-app-state-v2";

// ─── Achievement auto-check helper ────────────────────────────────────────
function checkAchievements(state: AppState): string[] {
  const earned: string[] = [];
  const has = (id: string) => state.achievements.includes(id);

  if (!has("first_task") && state.totalTasksDone >= 1) earned.push("first_task");
  if (!has("five_tasks") && state.totalTasksDone >= 5) earned.push("five_tasks");
  if (!has("habit_streak_7") && state.habits.some((h) => h.streak >= 7))
    earned.push("habit_streak_7");
  if (!has("habit_streak_21") && state.habits.some((h) => h.streak >= 21))
    earned.push("habit_streak_21");
  if (!has("goal_complete") && state.goals.some((g) => g.progress >= 100))
    earned.push("goal_complete");

  const totalStudyMins = state.study.reduce((a, b) => a + b.minutes, 0);
  if (!has("study_60") && totalStudyMins >= 60) earned.push("study_60");
  if (!has("study_300") && totalStudyMins >= 300) earned.push("study_300");

  if (!has("journal_7") && state.journal.length >= 7) earned.push("journal_7");

  if (!has("flashcard_100") && state.totalFlashcardsReviewed >= 100) earned.push("flashcard_100");

  if (!has("xp_500") && state.xp >= 500) earned.push("xp_500");
  if (!has("xp_2000") && state.xp >= 2000) earned.push("xp_2000");
  if (!has("xp_5000") && state.xp >= 5000) earned.push("xp_5000");
  if (!has("xp_10000") && state.xp >= 10000) earned.push("xp_10000");

  if (!has("travel_plan") && state.trips.length >= 1) earned.push("travel_plan");

  const todayTasks = state.tasks.filter((t) => t.doneDate === todayKey() && t.done);
  if (!has("perfect_day") && state.tasks.length > 0 && todayTasks.length === state.tasks.length)
    earned.push("perfect_day");

  return earned;
}

type Ctx = {
  ready: boolean;
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  signUp: (u: { name: string; email: string; password?: string }) => void;
  signIn: (email: string, password?: string) => { ok: boolean; error?: string };
  loginAsGuest: () => void;
  continueAsGuest: () => void;
  signOut: () => void;
  completeOnboarding: (prefs: { name?: string; avatar?: string; emoji?: string; focus?: string[]; reminderTime?: string }) => void;
  applyGuestMigration: (targetUserId: string, targetEmail: string, targetName: string, strategy: MigrationStrategy) => void;
  // Tasks
  addTask: (t: Omit<Task, "id" | "done"> & { id?: string; done?: boolean }) => void;
  editTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  moveTaskDate: (id: string, newDate: string) => void;
  toggleTopThree: (id: string) => { ok: boolean; count: number };
  replaceTopThree: (removeId: string, addId: string) => void;
  addCustomCategory: (category: string) => void;
  // Habits
  addHabit: (h: Partial<Habit> & { name: string; emoji?: string; category?: string }) => void;
  editHabit: (id: string, updates: Partial<Habit>) => void;
  toggleHabit: (id: string, date?: string) => void;
  updateHabitProgress: (id: string, value: number, date?: string) => void;
  pauseHabit: (id: string) => void;
  resumeHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  skipHabitForToday: (id: string, date?: string) => void;
  removeHabit: (id: string) => void;
  addHabitBundle: (
    habits: {
      emoji: string;
      name: string;
      category?: string;
      trackingType?: HabitTrackingType;
      targetValue?: number;
      unit?: string;
    }[],
  ) => void;
  importHabitBundle: (
    bundleId: string,
    habits: (Partial<Habit> & { name: string; emoji: string })[],
  ) => number;
  setWeeklyIntention: (weekStartDate: string, text: string, presetTag?: string) => void;
  setWeeklyNote: (
    weekStartDate: string,
    text: string,
    reflectionData?: Partial<WeeklyNoteRecord>
  ) => void;
  updateHabitWeekPreferences: (prefs: Partial<HabitWeekPreferences>) => void;
  saveWeeklyReflectionToJournal: (
    weekStartDate: string,
    reflectionText: string,
    answers?: Record<string, string>
  ) => string;
  // Routines
  toggleRoutineStep: (routineKey: string, stepId: string) => void;
  addRoutineStep: (
    routineKey: string,
    step: Partial<RoutineStep> & { title: string; time?: string; emoji?: string },
  ) => void;
  editRoutineStep: (routineKey: string, stepId: string, updates: Partial<RoutineStep>) => void;
  removeRoutineStep: (routineKey: string, stepId: string) => void;
  moveRoutineStepSection: (routineKey: string, stepId: string, newSection: string) => void;
  duplicateRoutineStep: (routineKey: string, stepId: string) => void;
  skipRoutineStepForToday: (routineKey: string, stepId: string) => void;
  reorderRoutineSteps: (routineKey: string, steps: RoutineStep[]) => void;
  resetRoutineToday: (routineKey: string) => void;
  resetRoutineToDefault: (routineKey: string) => void;
  restoreRoutineTemplate: (routineKey: string) => void;
  useRoutineTemplate: (templateKey: string) => void;
  createUserRoutine: (routine: Omit<UserRoutine, "id">) => string;
  duplicateRoutine: (routineKey: string) => string;
  archiveRoutine: (routineKey: string) => void;
  deleteCustomRoutine: (routineKey: string) => void;
  // Ideal Week
  saveIdealWeekTemplate: (template: IdealWeekTemplate) => void;
  saveCustomDayTypes: (dayTypes: DayTypeConfig[]) => void;
  applyIdealWeekPlan: (actionPlan: ApplyWeekActionPlan) => { createdCount: number; scheduledCount: number };
  resetIdealWeekToDefault: () => void;
  // Goals
  addGoal: (g: Partial<Goal> & { title: string }) => string;
  editGoal: (id: string, updates: Partial<Goal>) => void;
  updateGoalProgress: (id: string, progress: number, note?: string) => void;
  toggleGoalFocus: (id: string) => { ok: boolean; count: number };
  replaceGoalFocus: (removeId: string, addId: string) => void;
  pauseGoal: (id: string) => void;
  resumeGoal: (id: string) => void;
  completeGoal: (id: string) => void;
  uncompleteGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  restoreGoal: (id: string) => void;
  removeGoal: (id: string) => void;
  addGoalMilestone: (goalId: string, milestone: Partial<GoalMilestone> & { title: string }) => void;
  editGoalMilestone: (goalId: string, milestoneId: string, updates: Partial<GoalMilestone>) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  removeGoalMilestone: (goalId: string, milestoneId: string) => void;
  reorderGoalMilestones: (goalId: string, milestones: GoalMilestone[]) => void;
  addGoalCheckIn: (goalId: string, checkIn: Omit<GoalCheckIn, "id" | "createdAt">) => void;
  updateGoalNumericValue: (goalId: string, currentValue: number) => void;
  // Vision Boards
  addVisionBoard: (board: Partial<VisionBoard> & { title: string }) => string;
  updateVisionBoard: (id: string, updates: Partial<VisionBoard>) => void;
  deleteVisionBoard: (id: string) => void;
  archiveVisionBoard: (id: string) => void;
  restoreVisionBoard: (id: string) => void;
  duplicateVisionBoard: (id: string) => string;
  togglePinVisionBoardToHome: (id: string) => void;
  addVisionBoardItem: (item: Omit<VisionBoardItem, "id" | "createdAt" | "updatedAt">) => string;
  updateVisionBoardItem: (id: string, updates: Partial<VisionBoardItem>) => void;
  deleteVisionBoardItem: (id: string) => void;
  reorderVisionBoardItems: (boardId: string, itemIds: string[]) => void;
  moveVisionBoardItem: (boardId: string, itemId: string, direction: "up" | "down" | "top" | "bottom") => void;
  // Journal & Mood
  addJournal: (e: Partial<JournalEntry> & { body: string }) => string;
  editJournal: (id: string, updates: Partial<JournalEntry>) => void;
  removeJournal: (id: string) => void;
  archiveJournal: (id: string) => void;
  restoreJournal: (id: string) => void;
  toggleJournalLock: (id: string) => void;
  setDailyMood: (date: string, mood: CanonicalMood, energy?: EnergyLevel, source?: string) => void;
  updateJournalSettings: (settings: Partial<JournalSettings>) => void;
  // Money & Canonical Finance
  addMoney: (e: Omit<MoneyEntry, "id">) => void;
  removeMoney: (id: string) => void;
  addFinanceAccount: (account: Omit<FinanceAccount, "id" | "createdAt" | "updatedAt">) => void;
  updateFinanceAccount: (id: string, updates: Partial<FinanceAccount>) => void;
  archiveFinanceAccount: (id: string) => void;
  addFinancialTransaction: (tx: Omit<FinancialTransaction, "id" | "createdAt" | "updatedAt">) => void;
  updateFinancialTransaction: (id: string, updates: Partial<FinancialTransaction>) => void;
  voidFinancialTransaction: (id: string) => void;
  deleteFinancialTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, "id" | "createdAt" | "updatedAt">) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  addSavingsContribution: (contrib: Omit<SavingsContribution, "id" | "createdAt">) => void;
  updateFinanceSettings: (settings: Partial<FinanceSettings>) => void;
  // Business Workspace
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  addBusinessProject: (project: Omit<BusinessProject, "id" | "createdAt" | "updatedAt">) => string;
  updateBusinessProject: (id: string, updates: Partial<BusinessProject>) => void;
  archiveBusinessProject: (id: string) => void;
  deleteBusinessProject: (id: string) => void;
  addProjectMilestone: (milestone: Omit<ProjectMilestone, "id" | "createdAt" | "updatedAt">) => string;
  updateProjectMilestone: (id: string, updates: Partial<ProjectMilestone>) => void;
  deleteProjectMilestone: (id: string) => void;
  addProjectTaskLink: (projectId: string, taskId: string, milestoneId?: string) => void;
  removeProjectTaskLink: (id: string) => void;
  addBusinessClient: (client: Omit<BusinessClient, "id" | "createdAt" | "updatedAt">) => string;
  updateBusinessClient: (id: string, updates: Partial<BusinessClient>) => void;
  archiveBusinessClient: (id: string) => void;
  deleteBusinessClient: (id: string) => void;
  addBusinessOffer: (offer: Omit<BusinessOffer, "id" | "createdAt" | "updatedAt">) => string;
  updateBusinessOffer: (id: string, updates: Partial<BusinessOffer>) => void;
  archiveBusinessOffer: (id: string) => void;
  deleteBusinessOffer: (id: string) => void;
  addBusinessInvoice: (
    invoice: Omit<BusinessInvoice, "id" | "createdAt" | "updatedAt">,
    lineItems?: Array<Omit<InvoiceLineItem, "id" | "invoiceId" | "createdAt" | "updatedAt">>
  ) => string;
  updateBusinessInvoice: (id: string, updates: Partial<BusinessInvoice>) => void;
  deleteBusinessInvoice: (id: string) => void;
  recordBusinessInvoicePayment: (params: {
    invoiceId: string;
    amountMinor: number;
    financeAccountId: string;
    localDate: string;
    note?: string;
  }) => void;
  addBusinessNote: (note: Omit<BusinessNote, "id" | "createdAt" | "updatedAt">) => string;
  deleteBusinessNote: (id: string) => void;
  addBusinessAttachment: (att: Omit<BusinessAttachment, "id" | "createdAt">) => string;
  deleteBusinessAttachment: (id: string) => void;
  // Study
  addStudyMinutes: (subject: string, mins: number) => void;
  updateStudyTarget: (subject: string, target: number) => void;
  addStudySubject: (subject: string, emoji: string, target: number) => void;
  removeStudySubject: (id: string) => void;
  // Books & Bookshelf
  addBook: (b: Partial<Book> & { title: string }) => string;
  updateBook: (id: string, updates: Partial<Book>) => void;
  updateBookPage: (id: string, currentPage: number) => void;
  removeBook: (id: string) => void;
  deleteBook: (id: string) => void;
  archiveBook: (id: string) => void;
  restoreBook: (id: string) => void;
  logReadingProgress: (bookId: string, params: { localDate: string; pagesRead?: number; newPage?: number; minutesListened?: number; newMinutes?: number; percentage?: number; durationMinutes?: number; notes?: string; focusSessionId?: string }) => void;
  startNewReadingCycle: (bookId: string, startDate?: string) => void;
  addBookNote: (bookId: string, note: { type: "note" | "quote"; content: string; pageOrLocation?: string }) => void;
  deleteBookNote: (bookId: string, noteId: string) => void;
  setMonthlyReadingTarget: (target: MonthlyReadingTarget) => void;
  // Courses
  addCourse: (c: Omit<Course, "id">) => void;
  updateCourseProgress: (id: string, completedLessons: number) => void;
  removeCourse: (id: string) => void;
  // Skills
  addSkill: (s: Omit<Skill, "id">) => void;
  updateSkillProgress: (id: string, progress: number, level: Skill["level"]) => void;
  removeSkill: (id: string) => void;
  // Unified Learning Hub
  addLearningItem: (item: Partial<LearningItem> & { title: string; type: LearningItemType }) => string;
  editLearningItem: (id: string, updates: Partial<LearningItem>) => void;
  updateLearningProgress: (id: string, progress: number, currentValue?: number) => void;
  pauseLearningItem: (id: string) => void;
  resumeLearningItem: (id: string) => void;
  completeLearningItem: (id: string) => void;
  archiveLearningItem: (id: string) => void;
  restoreLearningItem: (id: string) => void;
  removeLearningItem: (id: string) => void;
  addLearningModule: (module: Partial<LearningModule> & { title: string; learningItemId: string }) => string;
  editLearningModule: (id: string, updates: Partial<LearningModule>) => void;
  removeLearningModule: (id: string) => void;
  reorderLearningModules: (learningItemId: string, modules: LearningModule[]) => void;
  addLearningLesson: (lesson: Partial<LearningLesson> & { title: string; learningItemId: string }) => string;
  editLearningLesson: (id: string, updates: Partial<LearningLesson>) => void;
  toggleLearningLesson: (id: string) => void;
  removeLearningLesson: (id: string) => void;
  reorderLearningLessons: (learningItemId: string, lessons: LearningLesson[]) => void;
  addLearningPlanItem: (plan: Partial<LearningPlanItem> & { title: string; learningItemId: string; localDate: string }) => string;
  editLearningPlanItem: (id: string, updates: Partial<LearningPlanItem>) => void;
  toggleLearningPlanItem: (id: string) => void;
  removeLearningPlanItem: (id: string) => void;
  addLearningResource: (res: Partial<LearningResource> & { title: string; learningItemId: string; type: LearningResource["type"] }) => string;
  removeLearningResource: (id: string) => void;
  addLearningNote: (note: Partial<LearningNote> & { body: string; learningItemId: string }) => string;
  editLearningNote: (id: string, updates: Partial<LearningNote>) => void;
  removeLearningNote: (id: string) => void;
  addFlashcardDeck: (deck: Partial<FlashDeck> & { name: string; emoji: string; color: string }) => string;
  editFlashcardDeck: (id: string, updates: Partial<FlashDeck>) => void;
  removeFlashcardDeck: (id: string) => void;
  addFlashcard: (deckId: string, card: Partial<FlashCard> & { front: string; back: string }) => string;
  editFlashcard: (deckId: string, cardId: string, updates: Partial<FlashCard>) => void;
  removeFlashcard: (deckId: string, cardId: string) => void;
  reviewFlashcard: (deckId: string, cardId: string, rating: ReviewRating) => void;
  undoFlashcardReview: (deckId: string, cardId: string) => void;
  recordReviewSession: (session: Omit<ReviewSessionSummary, "id">) => void;
  // Selfcare
  toggleSelfcare: (id: string) => void;
  addSelfcareItem: (emoji: string, label: string) => void;
  removeSelfcareItem: (id: string) => void;
  // Pixels
  setPixel: (date: string, mood: number) => void;
  // Trips (Legacy)
  addTrip: (t: Omit<Trip, "id">) => void;
  updateTripSaved: (id: string, saved: number) => void;
  toggleTripChecklist: (tripId: string, itemId: string) => void;
  addTripChecklistItem: (tripId: string, label: string) => void;
  removeTrip: (id: string) => void;
  // Canonical Travel Workspace
  createTravelTrip: (trip: Omit<TravelTrip, "id" | "createdAt" | "updatedAt">) => string;
  updateTravelTrip: (id: string, updates: Partial<TravelTrip>) => void;
  deleteTravelTrip: (id: string) => void;
  completeTravelTrip: (id: string) => void;
  archiveTravelTrip: (id: string) => void;
  addItineraryDay: (day: Omit<TravelDay, "id" | "createdAt" | "updatedAt">) => string;
  updateItineraryDay: (id: string, updates: Partial<TravelDay>) => void;
  deleteItineraryDay: (id: string) => void;
  addItineraryItem: (item: Omit<ItineraryItem, "id" | "createdAt" | "updatedAt">) => string;
  updateItineraryItem: (id: string, updates: Partial<ItineraryItem>) => void;
  deleteItineraryItem: (id: string) => void;
  reorderItineraryItem: (tripId: string, travelDayId: string, itemId: string, direction: "up" | "down") => void;
  addTravelBooking: (booking: Omit<TravelBooking, "id" | "createdAt" | "updatedAt">) => string;
  updateTravelBooking: (id: string, updates: Partial<TravelBooking>) => void;
  deleteTravelBooking: (id: string) => void;
  addTravelChecklistItem: (item: Omit<TravelChecklistItem, "id" | "createdAt" | "updatedAt">) => string;
  updateTravelChecklistItem: (id: string, updates: Partial<TravelChecklistItem>) => void;
  deleteTravelChecklistItem: (id: string) => void;
  toggleTravelChecklistItem: (id: string) => void;
  importChecklistTemplate: (tripId: string, templateItems: { category: ChecklistCategory; title: string; required: boolean }[]) => void;
  addTravelDocument: (doc: Omit<TravelDocument, "id" | "createdAt" | "updatedAt">) => string;
  updateTravelDocument: (id: string, updates: Partial<TravelDocument>) => void;
  deleteTravelDocument: (id: string) => void;
  addBucketListItem: (item: Omit<BucketListItem, "id" | "createdAt" | "updatedAt">) => string;
  updateBucketListItem: (id: string, updates: Partial<BucketListItem>) => void;
  deleteBucketListItem: (id: string) => void;
  convertBucketListToTrip: (bucketItemId: string, startDate: string, endDate: string) => string;
  addTravelMemory: (memory: Omit<TravelMemory, "id" | "createdAt" | "updatedAt">) => string;
  deleteTravelMemory: (id: string) => void;
  sendTravelMemoryToJournal: (memoryId: string) => string;
  updateTravelSettings: (settings: Partial<TravelSettings>) => void;
  recordTravelExpense: (expense: {
    tripId: string;
    bookingId?: string;
    amountStr: string;
    merchantOrSource: string;
    categoryId: string;
    accountId: string;
    date: string;
    note?: string;
  }) => string;
  // Flashcards
  incrementFlashcardsReviewed: (count: number) => void;
  // More Page Preferences & Visits
  updateMorePreferences: (prefs: Partial<UserMorePreferences>) => void;
  trackModuleVisit: (moduleId: string) => void;
  resetMorePreferences: () => void;
  // Deen & Islamic Companion
  togglePrayerLog: (date: string, prayerKey: string, note?: string) => void;
  logQuranProgress: (date: string, amount: number, unit?: string) => void;
  undoLatestQuranProgress: () => void;
  updateQuranGoal: (target: number, method?: QuranGoalData["progressMethod"], targetDate?: string) => void;
  setSurahStatus: (surahId: number, status: "not_started" | "reading" | "completed") => void;
  addSadaqahEntry: (entry: Omit<SadaqahEntry, "id" | "createdAt">) => void;
  removeSadaqahEntry: (id: string) => void;
  toggleGoodDeedLog: (date: string, deedId: string) => void;
  addCustomGoodDeed: (titleEn: string, titleAr: string) => void;
  removeGoodDeed: (deedId: string) => void;
  updateDeenSettings: (settings: Partial<DeenPrayerSettings>) => void;
  toggleTrackingPause: (paused: boolean, untilDate?: string) => void;
  updateActiveTasbih: (updates: Partial<NonNullable<AppState["activeTasbih"]>>) => void;
  // Focus & Pomodoro Canonical Engine
  startFocusSession: (params: {
    mode: FocusMode;
    sourceType: FocusSourceType;
    sourceId?: string;
    sourceLabelSnapshot: string;
    presetId?: string;
    plannedFocusSeconds: number;
    plannedShortBreakSeconds?: number;
    plannedLongBreakSeconds?: number;
    plannedCycles?: number;
    ambientSoundId?: string;
  }) => FocusSession;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  extendFocusSession: (extraMinutes?: number) => void;
  transitionFocusPhase: (nextPhase: FocusPhaseType) => void;
  finishFocusSessionEarly: (rating?: number, note?: string) => void;
  completeFocusSession: (rating?: number, note?: string) => void;
  cancelFocusSession: () => void;
  addManualFocusSession: (session: Omit<FocusSession, "id" | "userId" | "idempotencyKey" | "createdAt" | "updatedAt">) => void;
  deleteFocusSession: (id: string) => void;
  updateFocusPresets: (presets: FocusPreset[]) => void;
  // Canonical Unified Wellness Hub Actions
  addHydration: (ml: number, date?: string) => void;
  setHydration: (ml: number, date?: string) => void;
  addHydrationEvent: (amount: number, unit?: WaterUnit, sourceType?: HydrationSourceType, sourceId?: string, localDate?: string) => string;
  editHydrationEvent: (id: string, updates: { amount?: number; unit?: WaterUnit }) => void;
  deleteHydrationEvent: (id: string) => void;
  undoLastHydrationEvent: (localDate?: string) => void;
  updateWellnessSettings: (updates: Partial<WellnessSettings>) => void;
  logSleepRecord: (record: Omit<SleepRecord, "id" | "userId" | "createdAt" | "updatedAt">) => string;
  deleteSleepRecord: (id: string) => void;
  logStepRecord: (date: string, count: number, source?: "manual" | "apple_health" | "health_connect") => void;
  logWorkout: (workout: Omit<WorkoutLog, "id" | "userId" | "createdAt" | "updatedAt">) => string;
  deleteWorkout: (id: string) => void;
  addCareActivityLink: (link: Omit<CareActivityLink, "id" | "userId" | "createdAt">) => string;
  deleteCareActivityLink: (id: string) => void;
  toggleCareActivity: (linkId: string, date?: string) => void;
  // Canonical Self-Care Workspace Actions
  addCareActivity: (activity: Omit<SelfCareActivity, "id" | "userId" | "createdAt" | "updatedAt">) => string;
  updateCareActivity: (id: string, updates: Partial<SelfCareActivity>) => void;
  deleteCareActivity: (id: string) => void;
  archiveCareActivity: (id: string) => void;
  restoreCareActivity: (id: string) => void;
  toggleCarePlanItem: (planItemId: string) => void;
  skipCarePlanItem: (planItemId: string) => void;
  addCarePlanItemForDate: (activityId: string, localDate: string) => string;
  saveCareCheckIn: (localDate: string, needs: string[], timePreference?: "5m" | "15m" | "30m" | "any") => void;
  linkSourceToCare: (sourceType: CareSourceType, sourceId: string, title: string, icon: string, category: CareCategory) => string;
  // Canonical Year in Pixels & Mood Actions
  clearDailyMood: (date: string) => void;
  updateYearInPixelsSettings: (updates: Partial<YearInPixelsSettings>) => void;
  resolveLegacyMoodSnapshot: (date: string, mood: CanonicalMood) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  addXP: (
    sourceTypeOrAmount: string | number,
    sourceId?: string,
    amount?: number,
    localDate?: string,
    actionType?: string,
    labelEn?: string,
    labelAr?: string
  ) => { awarded: boolean; newTotalXP: number };
  reverseXP: (rewardKey: string, reason?: string) => { reversed: boolean; newTotalXP: number };
  updateUserProgressSettings: (updates: Partial<UserProgressSettings>) => void;
  markCelebrationShown: (awardId: string) => void;
  updateBadgeSettings: (updates: Partial<BadgeSettings>) => void;
  unlockBadge: (badgeId: string) => boolean;
  updateUser: (user: Partial<User>) => void;
  resetData: () => void;
  // Brain Dump Inbox
  addBrainDumpItem: (item: Partial<BrainDumpItem> & { content: string }) => string;
  updateBrainDumpItem: (id: string, updates: Partial<BrainDumpItem>) => void;
  deleteBrainDumpItem: (id: string) => void;
  archiveBrainDumpItem: (id: string) => void;
  restoreBrainDumpItem: (id: string) => void;
  organizeBrainDumpItem: (id: string, destination: BrainDumpDestinationRef, removeInboxCopy?: boolean) => void;
  unlinkBrainDumpDestination: (id: string) => void;
  splitBrainDumpItem: (id: string, parts: string[]) => void;
  // Future Me Time Capsule
  saveCapsuleDraft: (draft: Partial<FutureMeCapsule>) => string;
  sealCapsuleAction: (id: string, options?: { reminderEnabled?: boolean }) => boolean;
  openCapsuleAction: (id: string) => boolean;
  unsealCapsuleEarlyAction: (id: string) => boolean;
  deleteCapsuleAction: (id: string) => void;
  linkCapsuleReplyAction: (capsuleId: string, journalId: string) => void;
  // My Week in Bloom Keepsakes
  saveWeekInBloomKeepsake: (keepsake: Partial<WeekInBloomKeepsake>, saveToJournal?: boolean) => string;
  deleteWeekInBloomKeepsake: (id: string) => void;
  duplicateWeekInBloomKeepsake: (id: string) => string;
  // Self-care Bingo Boards
  saveBingoBoard: (board: Partial<SelfCareBingoBoard>) => string;
  deleteBingoBoard: (boardId: string) => void;
  toggleBingoTile: (boardId: string, tileId: string, customDate?: string) => void;
  updateBingoTileProgress: (boardId: string, tileId: string, value: number, customDate?: string) => void;
  repeatBingoBoardForWeek: (sourceBoardId: string, targetWeekStart: string, targetWeekEnd: string, overwriteExisting?: boolean) => string;
  // Someday Garden Wishes (Strictly 0 new XP)
  addSomedayWish: (wish: Partial<SomedayWish> & { title: string }) => string;
  updateSomedayWish: (id: string, updates: Partial<SomedayWish>) => void;
  deleteSomedayWish: (id: string) => void;
  archiveSomedayWish: (id: string) => void;
  restoreSomedayWish: (id: string) => void;
  reorderSomedayWishes: (orderedIds: string[]) => void;
  linkWishToGoal: (wishId: string, goalId: string) => void;
  unlinkWishGoal: (wishId: string) => void;
  convertWishToGoal: (wishId: string, goalData: Partial<Goal> & { title: string }) => string;
  addWishToVisionBoard: (wishId: string, boardId: string, caption?: string) => string;
  // Wheel of Becoming (دائرة التوازن 🌸) (Strictly 0 new XP)
  saveWheelRecord: (record: Partial<WheelOfBecomingRecord> & { yearMonth: string }) => string;
  updateWheelCustomization: (settings: Partial<WheelCustomizationSettings>) => void;
  linkGoalToWheel: (yearMonth: string, goalId: string) => void;
  unlinkGoalFromWheel: (yearMonth: string) => void;
  // AYXA AI Planner Conversations & Context (Strictly 0 new XP)
  saveAiConversation: (convo: Partial<AiConversation> & { id: string }) => void;
  deleteAiConversation: (id: string) => void;
  renameAiConversation: (id: string, newTitle: string) => void;
  clearAiConversations: () => void;
  updateAiContextConsent: (consent: Partial<ContextPermissionScope>) => void;
  revokeAiContextConsent: () => void;
  useAiCredit: (amount?: number) => boolean;
  addAiCredits: (amount: number, reason?: string) => void;
  setAiPersona: (persona: "feminine" | "masculine") => void;
  updateAiSettings: (settings: Partial<AiSettings>) => void;
};

const AppContext = createContext<Ctx | null>(null);


export function normalizeCanonicalState(parsed: Partial<AppState>): AppState {
  const hasExistingData = Boolean(
    (parsed.tasks && parsed.tasks.length > 0) ||
    (parsed.habits && parsed.habits.length > 0) ||
    (parsed.goals && parsed.goals.length > 0) ||
    (parsed.journal && parsed.journal.length > 0) ||
    (typeof parsed.xp === "number" && parsed.xp > 0)
  );

  const guestUser = createDefaultGuestUser();
  if (hasExistingData) {
    guestUser.setupDone = true;
  }

  const rawUser = parsed.user;
  const user: User = rawUser
    ? {
        id: (rawUser as any).id || (rawUser.email ? "user_" + (rawUser.email.replace(/[^a-zA-Z0-9]/g, "_")) : guestUser.id),
        name: rawUser.name || "Guest",
        email: rawUser.email || "",
        password: (rawUser as any).password,
        avatar: (rawUser as any).avatar || (rawUser as any).emoji || "🌸",
        emoji: (rawUser as any).emoji || "🌸",
        focus: rawUser.focus || [],
        isGuest: (rawUser as any).isGuest ?? (!rawUser.email),
        isPro: Boolean((rawUser as any).isPro),
        setupDone: Boolean(rawUser.setupDone ?? hasExistingData),
        authType: (rawUser as any).authType || (rawUser.email ? "authenticated" : "guest"),
        createdAt: (rawUser as any).createdAt || new Date().toISOString(),
      }
    : guestUser;

  // Normalize Daily Moods
  const dailyMoods: Record<string, DailyMoodRecord> = {};
  if (parsed.dailyMoods && typeof parsed.dailyMoods === "object") {
    Object.entries(parsed.dailyMoods).forEach(([dateKey, rawRecord]: [string, any]) => {
      if (typeof rawRecord === "string") {
        const rawStr = rawRecord.toLowerCase();
        let canonical: CanonicalMood = "okay";
        if (rawStr.includes("peace") || rawStr.includes("bloom") || rawStr.includes("good") || rawStr.includes("calm")) canonical = "calm";
        else if (rawStr.includes("amaz") || rawStr.includes("happy") || rawStr.includes("ecstat")) canonical = "happy";
        else if (rawStr.includes("sad") || rawStr.includes("low")) canonical = "sad";
        else if (rawStr.includes("stress") || rawStr.includes("anx")) canonical = "anxious";
        else if (rawStr.includes("tire") || rawStr.includes("sleep")) canonical = "tired";
        else if (rawStr.includes("grat") || rawStr.includes("bless")) canonical = "grateful";

        dailyMoods[dateKey] = {
          userId: user.id,
          localDate: dateKey,
          mood: canonical,
          updatedAt: new Date().toISOString(),
          lastSource: "legacy_migration",
        };
      } else if (rawRecord && typeof rawRecord === "object") {
        dailyMoods[dateKey] = {
          userId: rawRecord.userId || user.id,
          localDate: rawRecord.localDate || dateKey,
          mood: rawRecord.mood || "okay",
          energy: rawRecord.energy,
          updatedAt: rawRecord.updatedAt || new Date().toISOString(),
          lastSource: rawRecord.lastSource || "migrated",
        };
      }
    });
  }

  // Normalize Hydration
  const dailyHydration: Record<string, DailyHydrationRecord> = {};
  if (parsed.dailyHydration && typeof parsed.dailyHydration === "object") {
    Object.entries(parsed.dailyHydration).forEach(([dateKey, rawRecord]: [string, any]) => {
      dailyHydration[dateKey] = {
        userId: rawRecord.userId || user.id,
        localDate: rawRecord.localDate || dateKey,
        consumedMl: typeof rawRecord.consumedMl === "number" ? rawRecord.consumedMl : 0,
        targetMl: typeof rawRecord.targetMl === "number" ? rawRecord.targetMl : 2000,
        preferredGlassMl: typeof rawRecord.preferredGlassMl === "number" ? rawRecord.preferredGlassMl : 250,
        updatedAt: rawRecord.updatedAt || new Date().toISOString(),
      };
    });
  }

  // Normalize XP & Ledger
  const xp = typeof parsed.xp === "number" ? parsed.xp : 0;
  const xpLedger: XPEvent[] = Array.isArray(parsed.xpLedger) ? parsed.xpLedger : [];
  const unlockedBadges: string[] = Array.isArray(parsed.unlockedBadges)
    ? parsed.unlockedBadges
    : Array.isArray(parsed.achievements)
    ? parsed.achievements
    : [];

  const focusSessions: FocusSession[] = Array.isArray(parsed.focusSessions) ? parsed.focusSessions : [];

  const mergedGoals = Array.isArray(parsed.goals) ? parsed.goals.map((g) => normalizeGoal(g)) : [];
  const mergedVisionBoards = Array.isArray(parsed.visionBoards) ? parsed.visionBoards.map((b) => normalizeVisionBoard(b)) : [];
  const mergedVisionBoardItems = Array.isArray(parsed.visionBoardItems) ? parsed.visionBoardItems.map((it) => normalizeVisionBoardItem(it)) : [];
  const mergedJournal = Array.isArray(parsed.journal) ? parsed.journal.map((j) => normalizeJournalEntry(j)) : [];

  const prefs: Prefs = normalizePrefs(parsed.prefs);

  const defaultMorePrefs: UserMorePreferences = {
    pinnedModuleIds: ["my-deen", "habits", "goals", "routines"],
    hiddenModuleIds: [],
    customModuleOrder: [],
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  };

  const morePreferences: UserMorePreferences = {
    ...defaultMorePrefs,
    ...(parsed.morePreferences || {}),
    pinnedModuleIds: Array.isArray(parsed.morePreferences?.pinnedModuleIds)
      ? Array.from(new Set(parsed.morePreferences.pinnedModuleIds))
      : defaultMorePrefs.pinnedModuleIds,
    hiddenModuleIds: Array.isArray(parsed.morePreferences?.hiddenModuleIds)
      ? Array.from(new Set(parsed.morePreferences.hiddenModuleIds))
      : [],
    customModuleOrder: Array.isArray(parsed.morePreferences?.customModuleOrder)
      ? Array.from(new Set(parsed.morePreferences.customModuleOrder))
      : [],
  };

  const recentModuleVisits: RecentModuleVisit[] = Array.isArray(parsed.recentModuleVisits)
    ? parsed.recentModuleVisits
    : [];

  // Normalize Deen Settings & Logs
  const deenSettings: DeenPrayerSettings = {
    ...defaultState.deenSettings!,
    ...(parsed.deenSettings || {}),
  };

  const prayerLogs: Record<string, PrayerLogRecord> = parsed.prayerLogs && typeof parsed.prayerLogs === "object"
    ? { ...parsed.prayerLogs }
    : { ...defaultState.prayerLogs };

  const quranGoal: QuranGoalData = {
    ...defaultState.quranGoal!,
    ...(parsed.quranGoal || {}),
  };

  const quranHistory: QuranProgressEvent[] = Array.isArray(parsed.quranHistory)
    ? parsed.quranHistory
    : [];

  const surahProgress: Record<number, { status: "not_started" | "reading" | "completed"; completedAt?: string }> = {
    ...defaultState.surahProgress!,
    ...(parsed.surahProgress || {}),
  };

  const sadaqahLogs: SadaqahEntry[] = Array.isArray(parsed.sadaqahLogs)
    ? parsed.sadaqahLogs
    : [];

  const goodDeeds: GoodDeedItem[] = Array.isArray(parsed.goodDeeds) && parsed.goodDeeds.length > 0
    ? parsed.goodDeeds
    : [...defaultState.goodDeeds!];

  const goodDeedLogs: Record<string, boolean> = parsed.goodDeedLogs && typeof parsed.goodDeedLogs === "object"
    ? { ...parsed.goodDeedLogs }
    : {};

  const activeTasbih = {
    ...defaultState.activeTasbih!,
    ...(parsed.activeTasbih || {}),
  };

  // Normalize Unified Learning Items (with automatic migration from legacy study/books/courses/skills)
  let learningItems: LearningItem[] = [];
  if (Array.isArray(parsed.learningItems) && parsed.learningItems.length > 0) {
    learningItems = parsed.learningItems.map((it) => normalizeLearningItem(it));
  } else {
    // Migrate legacy study subjects
    const legacyStudy = Array.isArray(parsed.study) ? parsed.study : defaultState.study;
    legacyStudy.forEach((st) => {
      learningItems.push(
        normalizeLearningItem({
          id: st.id,
          type: "subject",
          title: st.subject,
          icon: st.emoji || "📐",
          weeklyTargetMinutes: st.target || 180,
          status: "active",
        })
      );
    });

    // Migrate legacy books
    const legacyBooks = Array.isArray(parsed.books) ? parsed.books : defaultState.books;
    legacyBooks.forEach((b) => {
      learningItems.push(
        normalizeLearningItem({
          id: b.id,
          type: "book",
          title: b.title,
          author: b.author,
          totalPages: b.totalPages,
          currentPage: b.currentPage,
          icon: b.coverEmoji || "📗",
          status: (b.currentPage || 0) >= (b.totalPages || 1) ? "completed" : "active",
        })
      );
    });

    // Migrate legacy courses
    const legacyCourses = Array.isArray(parsed.courses) ? parsed.courses : defaultState.courses;
    legacyCourses.forEach((c) => {
      learningItems.push(
        normalizeLearningItem({
          id: c.id,
          type: "course",
          title: c.name,
          platform: c.platform,
          instructor: c.instructor,
          totalLessons: c.totalLessons,
          completedLessons: c.completedLessons,
          progress: c.progress,
          icon: "🎓",
          status: c.completedLessons >= c.totalLessons ? "completed" : "active",
        })
      );
    });

    // Migrate legacy skills
    const legacySkills = Array.isArray(parsed.skills) ? parsed.skills : defaultState.skills;
    legacySkills.forEach((sk) => {
      learningItems.push(
        normalizeLearningItem({
          id: sk.id,
          type: "skill",
          title: sk.name,
          level: sk.level,
          progress: sk.progress,
          icon: sk.emoji || "🎯",
          status: sk.progress >= 100 ? "completed" : "active",
        })
      );
    });
  }

  const learningModules: LearningModule[] = Array.isArray(parsed.learningModules) ? parsed.learningModules : [];
  const learningLessons: LearningLesson[] = Array.isArray(parsed.learningLessons) ? parsed.learningLessons : [];
  const learningPlanItems: LearningPlanItem[] = Array.isArray(parsed.learningPlanItems) ? parsed.learningPlanItems : [];
  const learningResources: LearningResource[] = Array.isArray(parsed.learningResources) ? parsed.learningResources : [];
  const learningNotes: LearningNote[] = Array.isArray(parsed.learningNotes) ? parsed.learningNotes : [];

  // Normalize Flashcard Decks
  let flashcardDecks: FlashDeck[] = [];
  if (Array.isArray(parsed.flashcardDecks) && parsed.flashcardDecks.length > 0) {
    flashcardDecks = parsed.flashcardDecks.map((d) => normalizeFlashDeck(d));
  } else {
    // Check if there are decks in legacy localStorage key
    if (typeof window !== "undefined") {
      try {
        const rawDecks = window.localStorage.getItem("proplanner_flashcards_v1");
        if (rawDecks) {
          const parsedDecks = JSON.parse(rawDecks);
          if (Array.isArray(parsedDecks)) {
            flashcardDecks = parsedDecks.map((d) => normalizeFlashDeck(d));
          }
        }
      } catch { /* ignore */ }
    }
  }

  const reviewSessions: ReviewSessionSummary[] = Array.isArray(parsed.reviewSessions) ? parsed.reviewSessions : [];

  const normalizedState: AppState = {
    ...defaultState,
    ...parsed,
    tasks: Array.isArray(parsed.tasks) ? parsed.tasks.map(normalizeTask) : [],
    habits: Array.isArray(parsed.habits) ? parsed.habits : [],
    user,
    session: typeof parsed.session === "boolean" ? parsed.session : hasExistingData,
    habitWeekPreferences: {
      ...defaultState.habitWeekPreferences!,
      ...(parsed.habitWeekPreferences || {}),
    },
    weeklyIntentions: parsed.weeklyIntentions && typeof parsed.weeklyIntentions === "object"
      ? { ...parsed.weeklyIntentions }
      : {},
    weeklyNotes: parsed.weeklyNotes && typeof parsed.weeklyNotes === "object"
      ? { ...parsed.weeklyNotes }
      : {},
    hydrationTargetMl: parsed.hydrationTargetMl || 2000,
    preferredGlassMl: parsed.preferredGlassMl || 250,
    focusSessions,
    activeFocusSession: parsed.activeFocusSession &&
      parsed.activeFocusSession.status !== "completed" &&
      parsed.activeFocusSession.status !== "cancelled"
        ? parsed.activeFocusSession
        : null,
    focusPresets: Array.isArray(parsed.focusPresets) && parsed.focusPresets.length > 0
      ? parsed.focusPresets
      : DEFAULT_FOCUS_PRESETS,
    goals: mergedGoals,
    visionBoards: mergedVisionBoards,
    visionBoardItems: mergedVisionBoardItems,
    journal: mergedJournal,
    prefs,
    morePreferences,
    recentModuleVisits,
    deenSettings,
    prayerLogs,
    quranGoal,
    quranHistory,
    surahProgress,
    sadaqahLogs,
    goodDeeds,
    goodDeedLogs,
    activeTasbih,
    learningItems,
    learningModules,
    learningLessons,
    learningPlanItems,
    learningNotes,
    flashcardDecks,
    reviewSessions,
    // Brain Dump Inbox
    brainDumpItems: Array.isArray(parsed.brainDumpItems)
      ? parsed.brainDumpItems.map(normalizeBrainDumpItem)
      : [],
    // Future Me Time Capsule
    timeCapsules: Array.isArray(parsed.timeCapsules)
      ? parsed.timeCapsules.map(normalizeCapsule)
      : [],
    // My Week in Bloom Keepsakes
    weekInBloomKeepsakes: Array.isArray(parsed.weekInBloomKeepsakes)
      ? parsed.weekInBloomKeepsakes.map(normalizeWeekInBloomKeepsake)
      : [],
    // Self-care Bingo Boards
    selfCareBingoBoards: Array.isArray(parsed.selfCareBingoBoards)
      ? parsed.selfCareBingoBoards.map((b) => normalizeBingoBoard(b))
      : [],
    // Someday Garden Wishes
    somedayWishes: Array.isArray(parsed.somedayWishes)
      ? parsed.somedayWishes.map((w: any, idx: number) => normalizeSomedayWish(w, idx))
      : [],
    // Bookshelf
    books: (Array.isArray(parsed.books) ? parsed.books : defaultState.books).map((b) => normalizeBook(b)),
    monthlyReadingTarget: parsed.monthlyReadingTarget || undefined,
    // Wheel of Becoming Records & Customization
    wheelOfBecomingRecords: Array.isArray(parsed.wheelOfBecomingRecords)
      ? parsed.wheelOfBecomingRecords.map((r: any) =>
          normalizeWheelRecord(r, r.yearMonth, parsed.wheelCustomization?.customAreas)
        )
      : [],
    wheelCustomization: parsed.wheelCustomization || {},
    // AYXA AI Planner Conversations & Context Normalization
    aiConversations: Array.isArray(parsed.aiConversations)
      ? parsed.aiConversations.map(normalizeAiConversation)
      : [],
    aiContextConsent: normalizeAiContextConsent(parsed.aiContextConsent),
    aiCredits: typeof parsed.aiCredits === "number" ? parsed.aiCredits : 50,
    aiPersona: parsed.aiPersona === "masculine" ? "masculine" : "feminine",
    aiSettings: parsed.aiSettings
      ? { ...DEFAULT_AI_SETTINGS, ...parsed.aiSettings }
      : DEFAULT_AI_SETTINGS,
    // Canonical Finance Normalization
    financeAccounts: (() => {
      const rawAccounts = Array.isArray(parsed.financeAccounts) && parsed.financeAccounts.length > 0
        ? parsed.financeAccounts
        : [createDefaultMainAccount((parsed.prefs as any)?.currency || "MAD")];
      return rawAccounts;
    })(),
    financialTransactions: (() => {
      const existingTxs = Array.isArray(parsed.financialTransactions) ? parsed.financialTransactions : [];
      const legacyMoney = Array.isArray(parsed.money) ? parsed.money : [];
      const existingAccs = Array.isArray(parsed.financeAccounts) && parsed.financeAccounts.length > 0
        ? parsed.financeAccounts
        : [createDefaultMainAccount((parsed.prefs as any)?.currency || "MAD")];
      const migrated = migrateLegacyMoneyToCanonicalLedger(
        legacyMoney,
        existingAccs,
        existingTxs,
        (parsed.prefs as any)?.currency || "MAD"
      );
      return migrated.transactions;
    })(),
    financeCategories: Array.isArray(parsed.financeCategories) && parsed.financeCategories.length > 0
      ? parsed.financeCategories
      : DEFAULT_FINANCE_CATEGORIES,
    financeBudgets: Array.isArray(parsed.financeBudgets) ? parsed.financeBudgets : [],
    savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : [],
    savingsContributions: Array.isArray(parsed.savingsContributions) ? parsed.savingsContributions : [],
    recurringTransactions: Array.isArray(parsed.recurringTransactions) ? parsed.recurringTransactions : [],
    financeSettings: parsed.financeSettings
      ? { ...DEFAULT_FINANCE_SETTINGS, ...parsed.financeSettings }
      : DEFAULT_FINANCE_SETTINGS,
    financeSchemaVersion: 1,
    // Canonical Business Normalization
    businessProfile: parsed.businessProfile || DEFAULT_BUSINESS_PROFILE,
    businessProjects: Array.isArray(parsed.businessProjects) ? parsed.businessProjects : [],
    businessMilestones: Array.isArray(parsed.businessMilestones) ? parsed.businessMilestones : [],
    businessProjectTaskLinks: Array.isArray(parsed.businessProjectTaskLinks) ? parsed.businessProjectTaskLinks : [],
    businessClients: Array.isArray(parsed.businessClients) ? parsed.businessClients : [],
    businessOffers: Array.isArray(parsed.businessOffers) ? parsed.businessOffers : [],
    businessInvoices: Array.isArray(parsed.businessInvoices) ? parsed.businessInvoices : [],
    businessInvoiceLineItems: Array.isArray(parsed.businessInvoiceLineItems) ? parsed.businessInvoiceLineItems : [],
    businessInvoicePaymentLinks: Array.isArray(parsed.businessInvoicePaymentLinks) ? parsed.businessInvoicePaymentLinks : [],
    businessNotes: Array.isArray(parsed.businessNotes) ? parsed.businessNotes : [],
    businessAttachments: Array.isArray(parsed.businessAttachments) ? parsed.businessAttachments : [],
    businessActivityEvents: Array.isArray(parsed.businessActivityEvents) ? parsed.businessActivityEvents : [],
    // Canonical Travel Normalization
    ...(() => {
      const tripsList: TravelTrip[] = Array.isArray(parsed.travelTrips) ? [...parsed.travelTrips] : [];
      const checklistList: TravelChecklistItem[] = Array.isArray(parsed.travelChecklistItems) ? [...parsed.travelChecklistItems] : [];

      if (tripsList.length === 0 && Array.isArray(parsed.trips) && parsed.trips.length > 0) {
        const isDefaultSeed =
          parsed.trips.length === 1 &&
          parsed.trips[0].place === "Istanbul 🌷" &&
          parsed.trips[0].saved === 4300 &&
          parsed.trips[0].budget === 12000;

        if (!isDefaultSeed) {
          parsed.trips.forEach((tr, trIdx) => {
            const tripId = tr.id || `trip_${trIdx}`;
            tripsList.push({
              id: tripId,
              title: tr.place,
              primaryCity: tr.place.replace(/[^\p{L}\s]/gu, "").trim() || tr.place,
              startDate: "2027-04-10",
              endDate: "2027-04-20",
              travelerCount: 1,
              status: "planning",
              primaryCurrency: (parsed.prefs as any)?.currency || "MAD",
              estimatedBudgetMinor: Math.round((tr.budget || 0) * 100),
              notes: tr.saved ? `Legacy saved amount: ${tr.saved}` : undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });

            if (Array.isArray(tr.checklist)) {
              tr.checklist.forEach((c, cIdx) => {
                checklistList.push({
                  id: c.id || `chk_${tripId}_${cIdx}`,
                  tripId: tripId,
                  category: c.label.toLowerCase().includes("passport") ? "documents" : "packing",
                  title: c.label,
                  required: true,
                  completed: !!c.done,
                  completedAt: c.done ? new Date().toISOString() : undefined,
                  order: cIdx,
                  contributionMode: "checklist_only",
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              });
            }
          });
        }
      }

      return {
        travelTrips: tripsList,
        travelDays: Array.isArray(parsed.travelDays) ? parsed.travelDays : [],
        itineraryItems: Array.isArray(parsed.itineraryItems) ? parsed.itineraryItems : [],
        travelBookings: Array.isArray(parsed.travelBookings) ? parsed.travelBookings : [],
        travelBookingPaymentLinks: Array.isArray(parsed.travelBookingPaymentLinks) ? parsed.travelBookingPaymentLinks : [],
        travelBudgetCategories: Array.isArray(parsed.travelBudgetCategories) ? parsed.travelBudgetCategories : [],
        travelChecklistItems: checklistList,
        travelDocuments: Array.isArray(parsed.travelDocuments) ? parsed.travelDocuments : [],
        bucketListItems: Array.isArray(parsed.bucketListItems) ? parsed.bucketListItems : [],
        travelMemories: Array.isArray(parsed.travelMemories) ? parsed.travelMemories : [],
        travelSettings: parsed.travelSettings ? { ...DEFAULT_TRAVEL_SETTINGS, ...parsed.travelSettings } : DEFAULT_TRAVEL_SETTINGS,
      };
    })(),
    // Canonical Unified Wellness Hub Normalization & Hydration Migration
    ...(() => {
      const wellnessSettings: WellnessSettings = parsed.wellnessSettings
        ? { ...DEFAULT_WELLNESS_SETTINGS, ...parsed.wellnessSettings }
        : DEFAULT_WELLNESS_SETTINGS;

      let hydrationEvents: HydrationEvent[] = Array.isArray(parsed.hydrationEvents)
        ? parsed.hydrationEvents
        : [];

      // Idempotent Legacy Hydration Migration: if no events exist yet, migrate dailyHydration map
      if (hydrationEvents.length === 0 && parsed.dailyHydration && typeof parsed.dailyHydration === "object") {
        Object.entries(parsed.dailyHydration).forEach(([dKey, rec]: [string, any]) => {
          if (rec && typeof rec.consumedMl === "number" && rec.consumedMl > 0) {
            hydrationEvents.push({
              id: `mig_hyd_${dKey}`,
              userId: parsed.user?.id || "default",
              localDate: dKey,
              amount: rec.consumedMl,
              unit: "ml",
              normalizedMillilitres: rec.consumedMl,
              occurredAt: rec.updatedAt || new Date().toISOString(),
              timezone: wellnessSettings.timezone || "UTC",
              sourceType: "manual",
              idempotencyKey: `mig_hyd_${dKey}`,
              createdAt: rec.updatedAt || new Date().toISOString(),
              updatedAt: rec.updatedAt || new Date().toISOString(),
            });
          }
        });
      }

      // Synchronize dailyHydration map from active hydrationEvents so that Self-care and Wellness are 100% in sync
      const synchronizedDailyHydration: Record<string, DailyHydrationRecord> = {
        ...(parsed.dailyHydration && typeof parsed.dailyHydration === "object" ? parsed.dailyHydration : {}),
      };

      hydrationEvents.forEach((ev) => {
        if (!ev.deletedAt && ev.localDate) {
          const activeForDay = hydrationEvents.filter((e) => e.localDate === ev.localDate && !e.deletedAt);
          const totalMl = activeForDay.reduce((sum, e) => sum + (e.normalizedMillilitres || 0), 0);
          synchronizedDailyHydration[ev.localDate] = {
            userId: ev.userId,
            localDate: ev.localDate,
            consumedMl: totalMl,
            targetMl: wellnessSettings.dailyWaterTarget
              ? (wellnessSettings.waterUnit === "oz" ? convertOzToMl(wellnessSettings.dailyWaterTarget) : wellnessSettings.dailyWaterTarget)
              : 2000,
            preferredGlassMl: wellnessSettings.defaultDrinkAmount
              ? (wellnessSettings.waterUnit === "oz" ? convertOzToMl(wellnessSettings.defaultDrinkAmount) : wellnessSettings.defaultDrinkAmount)
              : 250,
            updatedAt: ev.updatedAt || new Date().toISOString(),
          };
        }
      });

      return {
        dailyHydration: synchronizedDailyHydration,
        wellnessSettings,
        hydrationEvents,
        sleepRecords: Array.isArray(parsed.sleepRecords) ? parsed.sleepRecords : [],
        dailyStepRecords: parsed.dailyStepRecords && typeof parsed.dailyStepRecords === "object" ? parsed.dailyStepRecords : {},
        workoutLogs: Array.isArray(parsed.workoutLogs) ? parsed.workoutLogs : [],
        careActivityLinks: Array.isArray(parsed.careActivityLinks) ? parsed.careActivityLinks : [],
        healthConnections: parsed.healthConnections && typeof parsed.healthConnections === "object" ? parsed.healthConnections : {},
      };
    })(),
    // Canonical Self-Care Workspace Normalization & Legacy Migration
    ...(() => {
      let selfCareActivities: SelfCareActivity[] = Array.isArray(parsed.selfCareActivities)
        ? parsed.selfCareActivities
        : [];
      let selfCarePlanItems: SelfCarePlanItem[] = Array.isArray(parsed.selfCarePlanItems)
        ? parsed.selfCarePlanItems
        : [];
      const selfCareCheckIns: Record<string, SelfCareCheckIn> =
        parsed.selfCareCheckIns && typeof parsed.selfCareCheckIns === "object"
          ? parsed.selfCareCheckIns
          : {};

      const todayStr = getLocalDateStr(new Date(), parsed.wellnessSettings?.timezone);

      // Idempotent migration from legacy state.selfcare if selfCareActivities is empty
      if (selfCareActivities.length === 0 && Array.isArray(parsed.selfcare) && parsed.selfcare.length > 0) {
        const migrated = migrateLegacySelfCare(parsed.selfcare, todayStr, parsed.user?.id || "default");
        selfCareActivities = migrated.activities;
        selfCarePlanItems = migrated.planItems;
      }

      // Synchronize legacy selfcare array from selfCareActivities & today's plan items
      const synchronizedSelfCare = selfCareActivities
        .filter((a) => a.status === "active")
        .map((a) => {
          const planItem = selfCarePlanItems.find((p) => p.activityId === a.id && p.localDate === todayStr);
          return {
            id: a.id.replace(/^act_/, ""),
            emoji: a.icon || "🌸",
            label: a.title,
            done: planItem?.status === "completed",
            doneDate: planItem?.status === "completed" ? todayStr : undefined,
          };
        });

      return {
        selfCareActivities,
        selfCarePlanItems,
        selfCareCheckIns,
        selfcare: synchronizedSelfCare.length > 0 ? synchronizedSelfCare : (Array.isArray(parsed.selfcare) ? parsed.selfcare : defaultState.selfcare),
      };
    })(),
    // Canonical Year in Pixels Normalization & Legacy Migration
    ...(() => {
      const existingDailyMoods: Record<string, DailyMoodRecord> =
        parsed.dailyMoods && typeof parsed.dailyMoods === "object" ? { ...parsed.dailyMoods } : {};
      const legacyPixels = Array.isArray(parsed.pixels) ? parsed.pixels : [];
      let legacySnapshots: Record<string, LegacyMoodSnapshot> =
        parsed.legacyMoodSnapshots && typeof parsed.legacyMoodSnapshots === "object"
          ? { ...parsed.legacyMoodSnapshots }
          : {};

      // Idempotently migrate legacy pixels into dailyMoods & legacySnapshots
      if (legacyPixels.length > 0) {
        const migration = migrateLegacyPixels(legacyPixels, existingDailyMoods, parsed.user?.id || "default");
        Object.assign(existingDailyMoods, migration.migratedDailyMoods);
        Object.assign(legacySnapshots, migration.legacySnapshots);
      }

      // Synchronize legacy pixels array from dailyMoods so legacy readers see full data
      const moodIndexMap: Record<CanonicalMood, number> = {
        happy: 1,
        calm: 2,
        okay: 3,
        sad: 5,
        anxious: 6,
        tired: 7,
        grateful: 8,
      };
      const synchronizedPixels = Object.entries(existingDailyMoods).map(([date, rec]) => ({
        date,
        mood: moodIndexMap[rec.mood] || 3,
      }));

      const yearInPixelsSettings: YearInPixelsSettings = {
        ...DEFAULT_PIXELS_SETTINGS,
        ...(parsed.yearInPixelsSettings || {}),
        userId: parsed.user?.id || DEFAULT_PIXELS_SETTINGS.userId,
      };

      return {
        dailyMoods: existingDailyMoods,
        legacyMoodSnapshots: legacySnapshots,
        pixels: synchronizedPixels.length > 0 ? synchronizedPixels : legacyPixels,
        yearInPixelsSettings,
      };
    })(),
    // Canonical Progression, Badges & Ledger Reconciliation
    ...(() => {
      const persistedXp = typeof parsed.xp === "number" ? parsed.xp : defaultState.xp;
      const rawLedger: XPEvent[] = Array.isArray(parsed.xpLedger) ? parsed.xpLedger : [];
      const userProgressSettings: UserProgressSettings = {
        ...DEFAULT_PROGRESS_SETTINGS,
        ...(parsed.userProgressSettings || {}),
        userId: parsed.user?.id || DEFAULT_PROGRESS_SETTINGS.userId,
      };

      const { reconciledLedger, canonicalTotalXp } = reconcileLegacyXpLedger(
        persistedXp,
        rawLedger,
        parsed.user?.id || "default"
      );

      const unlockedBadges = Array.isArray(parsed.unlockedBadges)
        ? parsed.unlockedBadges
        : Array.isArray(parsed.achievements)
        ? parsed.achievements
        : [];

      const badgeSettings: BadgeSettings = {
        ...DEFAULT_BADGE_SETTINGS,
        ...(parsed.badgeSettings || {}),
        userId: parsed.user?.id || DEFAULT_BADGE_SETTINGS.userId,
      };

      const badgeAwards: BadgeAward[] = Array.isArray(parsed.badgeAwards) ? parsed.badgeAwards : [];

      return {
        xp: canonicalTotalXp,
        xpLedger: reconciledLedger,
        userProgressSettings,
        badgeSettings,
        badgeAwards,
        unlockedBadges,
        achievements: unlockedBadges,
      };
    })(),
    // Ideal Week Rehydration
    idealWeekTemplate: parsed.idealWeekTemplate || defaultState.idealWeekTemplate,
    customDayTypes: Array.isArray(parsed.customDayTypes) ? parsed.customDayTypes : [],
    appliedIdealWeeks: parsed.appliedIdealWeeks && typeof parsed.appliedIdealWeeks === "object" ? parsed.appliedIdealWeeks : {},
  };

  // Authoritative historical reconciliation & deterministic badge evaluation
  const badgeMigration = reconcileAndMigrateBadges(normalizedState as AppState);
  return {
    ...normalizedState,
    badgeAwards: badgeMigration.badgeAwards,
    unlockedBadges: badgeMigration.unlockedBadges,
    achievements: badgeMigration.unlockedBadges,
    xpLedger: badgeMigration.xpLedger,
    xp: badgeMigration.xp,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Read localStorage synchronously with idempotent canonical migration
  const [state, setState] = useState<AppState>(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        return normalizeCanonicalState(parsed);
      }
    } catch (err) {
      console.warn("Storage parse fallback:", err);
    }
    return normalizeCanonicalState({});
  });

  // Run background idempotent migration to Dexie
  useEffect(() => {
    runMigration().catch(() => {});
  }, []);

  // High-performance debounced storage sync (zero input lag, zero thread freezing)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = setTimeout(() => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(state));
        window.localStorage.setItem("ayxa-prefs-v1", JSON.stringify(state.prefs));
      } catch (e) {
        console.warn("Storage sync:", e);
      }
    }, 150);

    return () => clearTimeout(handle);
  }, [state]);

  // Helper: apply deterministic badge evaluation after state mutation
  const withAchievements = useCallback((s: AppState): AppState => {
    const evalRes = evaluateEligibleBadges(s);
    if (!evalRes.newAwards.length) return s;
    const unlocked = evalRes.updatedAwards.map((a) => a.badgeId);
    return {
      ...s,
      badgeAwards: evalRes.updatedAwards,
      unlockedBadges: unlocked,
      achievements: unlocked,
      xpLedger: evalRes.updatedXpLedger,
      xp: evalRes.newTotalXp,
    };
  }, []);

  const update = useCallback(
    (fn: (s: AppState) => AppState) => setState((prev) => withAchievements(fn(prev))),
    [withAchievements]
  );

  // ready is always true since initial state is loaded
  const ready = true;

  const value = useMemo<Ctx>(
    () => ({
      ready,
      state,
      update,

      // ── Auth & Identity ──────────────────────────────────────────────────
      signUp: ({ name, email, password }) =>
        update((s) => ({
          ...s,
          user: {
            id: s.user?.isGuest ? s.user.id : "user_" + uid(),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            avatar: s.user?.avatar || "🌸",
            emoji: s.user?.emoji || "🌸",
            focus: s.user?.focus || ["Planning", "Faith", "Habits"],
            isGuest: false,
            isPro: false,
            setupDone: s.user?.setupDone || false,
            authType: "authenticated",
            createdAt: s.user?.createdAt || new Date().toISOString(),
          },
          session: true,
        })),

      signIn: (email, password) => {
        const u = state.user;
        const cleanEmail = email.trim().toLowerCase();
        if (!u || u.isGuest || !u.email) {
          update((s) => ({
            ...s,
            user: {
              ...s.user,
              name: s.user?.name && s.user.name !== "Guest" ? s.user.name : cleanEmail.split("@")[0],
              email: cleanEmail,
              password,
              isGuest: false,
              authType: "authenticated",
            },
            session: true,
          }));
          return { ok: true };
        }
        if (u.email && (u.email.toLowerCase() !== cleanEmail || (u.password && password && u.password !== password))) {
          // If already authenticated with different local record, update to current valid sign-in
          update((s) => ({
            ...s,
            user: {
              ...s.user,
              email: cleanEmail,
              name: cleanEmail.split("@")[0],
              isGuest: false,
              authType: "authenticated",
            },
            session: true,
          }));
          return { ok: true };
        }
        update((s) => ({ ...s, session: true }));
        return { ok: true };
      },

      continueAsGuest: () =>
        update((s) => {
          const currentGuest = s.user?.isGuest ? s.user : createDefaultGuestUser();
          return {
            ...s,
            user: {
              ...currentGuest,
              isGuest: true,
              authType: "guest",
            },
            session: true,
          };
        }),

      loginAsGuest: () =>
        update((s) => {
          const currentGuest = s.user?.isGuest ? s.user : createDefaultGuestUser();
          return {
            ...s,
            user: {
              ...currentGuest,
              isGuest: true,
              authType: "guest",
            },
            session: true,
          };
        }),

      signOut: () =>
        update((s) => ({
          ...s,
          session: false,
        })),

      completeOnboarding: (prefs) => {
        update((s) => {
          const nextPrefs = prefs.reminderTime
            ? { ...s.prefs, reminderTime: prefs.reminderTime }
            : s.prefs;
          return {
            ...s,
            prefs: nextPrefs,
            user: {
              ...s.user,
              name: prefs.name?.trim() || s.user?.name || "Guest",
              avatar: prefs.avatar || s.user?.avatar || "🌸",
              emoji: prefs.emoji || s.user?.emoji || "🌸",
              focus: prefs.focus && prefs.focus.length > 0 ? prefs.focus : s.user?.focus || ["Planning", "Habits"],
              setupDone: true,
            },
            setupDone: true,
            session: true,
          };
        });
      },

      applyGuestMigration: (targetUserId, targetEmail, targetName, strategy) => {
        update((s) => migrateGuestDataToUser(s, targetUserId, targetEmail, targetName, strategy));
      },

      updateUser: (userUpdates) =>
        update((s) => ({
          ...s,
          user: { ...s.user, ...userUpdates },
        })),

      // ── Canonical XP, Badges & Progression ───────────────────────────────
      addXP: (
        sourceTypeOrAmount,
        sourceId,
        amount,
        localDate,
        actionType,
        labelEn,
        labelAr
      ) => {
        let finalSourceType = "activity";
        let finalSourceId = uid();
        let finalAmount = 10;
        let finalLocalDate = todayKey();
        let finalActionType = actionType || "complete";

        if (typeof sourceTypeOrAmount === "number") {
          finalAmount = sourceTypeOrAmount;
        } else {
          finalSourceType = sourceTypeOrAmount || "activity";
          finalSourceId = sourceId || uid();
          finalAmount = typeof amount === "number" ? amount : 10;
          if (localDate) finalLocalDate = localDate;
        }

        const rewardKey = getRewardKey(
          finalSourceType,
          finalSourceId,
          finalLocalDate,
          finalActionType
        );

        let awarded = false;
        let newTotalXP = state.xp;

        update((s) => {
          const ledger = s.xpLedger || [];
          const existingIdx = ledger.findIndex(
            (e) => e.rewardKey === rewardKey || e.idempotencyKey === rewardKey
          );

          if (existingIdx !== -1) {
            const existing = ledger[existingIdx];
            if (existing.state === "reversed") {
              const updatedLedger = [...ledger];
              updatedLedger[existingIdx] = {
                ...existing,
                state: "active",
                updatedAt: new Date().toISOString(),
              };
              const activeTotal = getTotalActiveXp(updatedLedger, s.xp);
              awarded = true;
              newTotalXP = activeTotal;
              return {
                ...s,
                xp: activeTotal,
                xpLedger: updatedLedger,
              };
            }
            return s;
          }

          awarded = true;
          const newEvent: XPEvent = {
            id: uid(),
            userId: s.user.id,
            rewardKey,
            sourceType: finalSourceType,
            sourceId: finalSourceId,
            actionType: finalActionType,
            amount: finalAmount,
            state: "active",
            localDate: finalLocalDate,
            idempotencyKey: rewardKey,
            createdAt: new Date().toISOString(),
            labelEn,
            labelAr,
          };

          const updatedLedger = [...ledger, newEvent];
          newTotalXP = getTotalActiveXp(updatedLedger, s.xp + finalAmount);

          return {
            ...s,
            xp: newTotalXP,
            xpLedger: updatedLedger,
          };
        });

        return { awarded, newTotalXP };
      },

      reverseXP: (rewardKey) => {
        let reversed = false;
        let newTotalXP = state.xp;

        update((s) => {
          const ledger = s.xpLedger || [];
          const targetIdx = ledger.findIndex(
            (e) => e.rewardKey === rewardKey || e.idempotencyKey === rewardKey
          );

          if (targetIdx === -1) return s;

          const target = ledger[targetIdx];
          if (target.state === "reversed") return s;

          reversed = true;
          const updatedLedger = [...ledger];
          updatedLedger[targetIdx] = {
            ...target,
            state: "reversed",
            updatedAt: new Date().toISOString(),
            labelEn: target.labelEn ? `${target.labelEn} (Reversed)` : "Reward reversed",
            labelAr: target.labelAr ? `${target.labelAr} (تم التراجع)` : "تم التراجع عن المكافأة",
          };

          newTotalXP = getTotalActiveXp(updatedLedger, 0);

          return {
            ...s,
            xp: newTotalXP,
            xpLedger: updatedLedger,
          };
        });

        return { reversed, newTotalXP };
      },

      updateUserProgressSettings: (updates) =>
        update((s) => ({
          ...s,
          userProgressSettings: {
            ...DEFAULT_PROGRESS_SETTINGS,
            ...(s.userProgressSettings || {}),
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        })),

      markCelebrationShown: (awardId) =>
        update((s) => ({
          ...s,
          badgeAwards: (s.badgeAwards || []).map((a) =>
            a.id === awardId ? { ...a, celebrationShownAt: new Date().toISOString() } : a
          ),
        })),

      updateBadgeSettings: (updates) =>
        update((s) => ({
          ...s,
          badgeSettings: {
            ...(s.badgeSettings || DEFAULT_BADGE_SETTINGS),
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        })),

      unlockBadge: (badgeId) => {
        let unlocked = false;
        update((s) => {
          const evalRes = evaluateEligibleBadges(s);
          unlocked = evalRes.updatedAwards.some((a) => a.badgeId === badgeId);
          const unlockedIds = evalRes.updatedAwards.map((a) => a.badgeId);
          return {
            ...s,
            badgeAwards: evalRes.updatedAwards,
            unlockedBadges: unlockedIds,
            achievements: unlockedIds,
            xpLedger: evalRes.updatedXpLedger,
            xp: evalRes.newTotalXp,
          };
        });
        return unlocked;
      },

      // ── Canonical Mood & Hydration ───────────────────────────────────────
      setDailyMood: (date, mood, energy, source) => {
        const dKey = date || todayKey();
        update((s) => {
          const prevMap = s.dailyMoods || {};
          const record: DailyMoodRecord = {
            userId: s.user.id,
            localDate: dKey,
            mood,
            energy: energy || prevMap[dKey]?.energy || "medium",
            updatedAt: new Date().toISOString(),
            lastSource: source || "manual",
          };
          const moodIndexMap: Record<CanonicalMood, number> = {
            happy: 1,
            calm: 2,
            okay: 3,
            sad: 5,
            anxious: 6,
            tired: 7,
            grateful: 8,
          };
          const pixelVal = moodIndexMap[mood] || 3;
          const newPixels = [...(s.pixels || []).filter((p) => p.date !== dKey), { date: dKey, mood: pixelVal }];

          // Remove legacy snapshot if date is now resolved
          const legacySnapshots = { ...(s.legacyMoodSnapshots || {}) };
          if (legacySnapshots[dKey]) {
            delete legacySnapshots[dKey];
          }

          // Award XP once per date
          const idempotencyKey = `mood:${dKey}:${dKey}`;
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
            addedXp = 5;
            newLedger = [
              ...newLedger,
              {
                id: uid(),
                userId: s.user.id,
                sourceType: "mood",
                sourceId: dKey,
                amount: 5,
                localDate: dKey,
                idempotencyKey,
                createdAt: new Date().toISOString(),
              },
            ];
          }

          return {
            ...s,
            dailyMoods: { ...prevMap, [dKey]: record },
            legacyMoodSnapshots: legacySnapshots,
            pixels: newPixels,
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          };
        });
      },

      clearDailyMood: (date) => {
        const dKey = date || todayKey();
        update((s) => {
          const nextMoods = { ...(s.dailyMoods || {}) };
          delete nextMoods[dKey];

          const nextSnapshots = { ...(s.legacyMoodSnapshots || {}) };
          delete nextSnapshots[dKey];

          const nextPixels = (s.pixels || []).filter((p) => p.date !== dKey);

          return {
            ...s,
            dailyMoods: nextMoods,
            legacyMoodSnapshots: nextSnapshots,
            pixels: nextPixels,
          };
        });
      },

      updateYearInPixelsSettings: (updates) => {
        update((s) => ({
          ...s,
          yearInPixelsSettings: {
            ...(s.yearInPixelsSettings || DEFAULT_PIXELS_SETTINGS),
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      resolveLegacyMoodSnapshot: (date, mood) => {
        const dKey = date || todayKey();
        update((s) => {
          const prevMap = s.dailyMoods || {};
          const record: DailyMoodRecord = {
            userId: s.user.id,
            localDate: dKey,
            mood,
            energy: prevMap[dKey]?.energy || "medium",
            updatedAt: new Date().toISOString(),
            lastSource: "legacy_resolved",
          };
          const moodIndexMap: Record<CanonicalMood, number> = {
            happy: 1,
            calm: 2,
            okay: 3,
            sad: 5,
            anxious: 6,
            tired: 7,
            grateful: 8,
          };
          const pixelVal = moodIndexMap[mood] || 3;
          const newPixels = [...(s.pixels || []).filter((p) => p.date !== dKey), { date: dKey, mood: pixelVal }];

          const legacySnapshots = { ...(s.legacyMoodSnapshots || {}) };
          delete legacySnapshots[dKey];

          return {
            ...s,
            dailyMoods: { ...prevMap, [dKey]: record },
            legacyMoodSnapshots: legacySnapshots,
            pixels: newPixels,
          };
        });
      },

      addHydrationEvent: (amount, unit = "ml", sourceType = "manual", sourceId, localDate) => {
        const dKey = localDate || todayKey();
        const eventId = `hyd_${uid()}`;
        const normalizedMl = unit === "oz" ? convertOzToMl(amount) : Math.round(amount);

        update((s) => {
          const nowIso = new Date().toISOString();
          const targetInMl = s.wellnessSettings?.dailyWaterTarget
            ? (s.wellnessSettings.waterUnit === "oz"
                ? convertOzToMl(s.wellnessSettings.dailyWaterTarget)
                : s.wellnessSettings.dailyWaterTarget)
            : s.hydrationTargetMl || 2000;

          const newEvent: HydrationEvent = {
            id: eventId,
            userId: s.user.id,
            localDate: dKey,
            amount,
            unit,
            normalizedMillilitres: normalizedMl,
            occurredAt: nowIso,
            timezone: s.wellnessSettings?.timezone || "UTC",
            sourceType,
            sourceId,
            idempotencyKey: `${sourceType}:${sourceId || eventId}:${dKey}`,
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          const allEvents = [...(s.hydrationEvents || []), newEvent];
          const activeForDay = allEvents.filter((e) => e.localDate === dKey && !e.deletedAt);
          const nextConsumedMl = activeForDay.reduce((sum, e) => sum + (e.normalizedMillilitres || 0), 0);

          const prevDaily = (s.dailyHydration || {})[dKey] || {
            userId: s.user.id,
            localDate: dKey,
            consumedMl: 0,
            targetMl: targetInMl,
            preferredGlassMl: s.preferredGlassMl || 250,
            updatedAt: nowIso,
          };

          const prevConsumed = prevDaily.consumedMl;
          const newlyReachedTarget = prevConsumed < targetInMl && nextConsumedMl >= targetInMl;

          let newLedger = s.xpLedger || [];
          let addedXp = 0;
          if (newlyReachedTarget) {
            const idempotencyKey = `hydration_goal:${dKey}`;
            if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
              addedXp = 20;
              newLedger = [
                ...newLedger,
                {
                  id: uid(),
                  userId: s.user.id,
                  sourceType: "hydration",
                  sourceId: dKey,
                  amount: 20,
                  localDate: dKey,
                  idempotencyKey,
                  createdAt: nowIso,
                },
              ];
            }
          }

          return {
            ...s,
            hydrationEvents: allEvents,
            dailyHydration: {
              ...(s.dailyHydration || {}),
              [dKey]: {
                ...prevDaily,
                consumedMl: nextConsumedMl,
                targetMl: targetInMl,
                updatedAt: nowIso,
              },
            },
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          };
        });

        return eventId;
      },

      editHydrationEvent: (id, updates) => {
        update((s) => {
          const list = s.hydrationEvents || [];
          const target = list.find((e) => e.id === id);
          if (!target) return s;

          const nowIso = new Date().toISOString();
          const newAmount = updates.amount !== undefined ? updates.amount : target.amount;
          const newUnit = updates.unit !== undefined ? updates.unit : target.unit;
          const normalizedMl = newUnit === "oz" ? convertOzToMl(newAmount) : Math.round(newAmount);

          const updatedList = list.map((e) =>
            e.id === id
              ? {
                  ...e,
                  amount: newAmount,
                  unit: newUnit,
                  normalizedMillilitres: normalizedMl,
                  updatedAt: nowIso,
                }
              : e
          );

          const dKey = target.localDate;
          const activeForDay = updatedList.filter((e) => e.localDate === dKey && !e.deletedAt);
          const nextConsumedMl = activeForDay.reduce((sum, e) => sum + (e.normalizedMillilitres || 0), 0);
          const prevDaily = (s.dailyHydration || {})[dKey];

          return {
            ...s,
            hydrationEvents: updatedList,
            dailyHydration: prevDaily
              ? {
                  ...(s.dailyHydration || {}),
                  [dKey]: {
                    ...prevDaily,
                    consumedMl: nextConsumedMl,
                    updatedAt: nowIso,
                  },
                }
              : s.dailyHydration,
          };
        });
      },

      deleteHydrationEvent: (id) => {
        update((s) => {
          const list = s.hydrationEvents || [];
          const target = list.find((e) => e.id === id);
          if (!target) return s;

          const nowIso = new Date().toISOString();
          const updatedList = list.map((e) =>
            e.id === id ? { ...e, deletedAt: nowIso, updatedAt: nowIso } : e
          );

          const dKey = target.localDate;
          const activeForDay = updatedList.filter((e) => e.localDate === dKey && !e.deletedAt);
          const nextConsumedMl = activeForDay.reduce((sum, e) => sum + (e.normalizedMillilitres || 0), 0);
          const prevDaily = (s.dailyHydration || {})[dKey];

          return {
            ...s,
            hydrationEvents: updatedList,
            dailyHydration: prevDaily
              ? {
                  ...(s.dailyHydration || {}),
                  [dKey]: {
                    ...prevDaily,
                    consumedMl: nextConsumedMl,
                    updatedAt: nowIso,
                  },
                }
              : s.dailyHydration,
          };
        });
      },

      undoLastHydrationEvent: (localDate) => {
        const dKey = localDate || todayKey();
        update((s) => {
          const list = s.hydrationEvents || [];
          const activeForDay = list.filter((e) => e.localDate === dKey && !e.deletedAt);
          if (activeForDay.length === 0) return s;

          const lastEvent = activeForDay[activeForDay.length - 1];
          const nowIso = new Date().toISOString();
          const updatedList = list.map((e) =>
            e.id === lastEvent.id ? { ...e, deletedAt: nowIso, updatedAt: nowIso } : e
          );

          const remainingActive = updatedList.filter((e) => e.localDate === dKey && !e.deletedAt);
          const nextConsumedMl = remainingActive.reduce((sum, e) => sum + (e.normalizedMillilitres || 0), 0);
          const prevDaily = (s.dailyHydration || {})[dKey];

          return {
            ...s,
            hydrationEvents: updatedList,
            dailyHydration: prevDaily
              ? {
                  ...(s.dailyHydration || {}),
                  [dKey]: {
                    ...prevDaily,
                    consumedMl: nextConsumedMl,
                    updatedAt: nowIso,
                  },
                }
              : s.dailyHydration,
          };
        });
      },

      addHydration: (ml, date) => {
        const dKey = date || todayKey();
        const eventId = `hyd_${uid()}`;
        const normalizedMl = Math.round(ml);

        update((s) => {
          const nowIso = new Date().toISOString();
          const targetInMl = s.wellnessSettings?.dailyWaterTarget
            ? (s.wellnessSettings.waterUnit === "oz"
                ? convertOzToMl(s.wellnessSettings.dailyWaterTarget)
                : s.wellnessSettings.dailyWaterTarget)
            : s.hydrationTargetMl || 2000;

          const newEvent: HydrationEvent = {
            id: eventId,
            userId: s.user.id,
            localDate: dKey,
            amount: ml,
            unit: "ml",
            normalizedMillilitres: normalizedMl,
            occurredAt: nowIso,
            timezone: s.wellnessSettings?.timezone || "UTC",
            sourceType: "manual",
            idempotencyKey: `manual:${eventId}:${dKey}`,
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          const allEvents = [...(s.hydrationEvents || []), newEvent];
          const activeForDay = allEvents.filter((e) => e.localDate === dKey && !e.deletedAt);
          const nextConsumedMl = activeForDay.reduce((sum, e) => sum + (e.normalizedMillilitres || 0), 0);

          const prevDaily = (s.dailyHydration || {})[dKey] || {
            userId: s.user.id,
            localDate: dKey,
            consumedMl: 0,
            targetMl: targetInMl,
            preferredGlassMl: s.preferredGlassMl || 250,
            updatedAt: nowIso,
          };

          const prevConsumed = prevDaily.consumedMl;
          const newlyReachedTarget = prevConsumed < targetInMl && nextConsumedMl >= targetInMl;

          let newLedger = s.xpLedger || [];
          let addedXp = 0;
          if (newlyReachedTarget) {
            const idempotencyKey = `hydration_goal:${dKey}`;
            if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
              addedXp = 20;
              newLedger = [
                ...newLedger,
                {
                  id: uid(),
                  userId: s.user.id,
                  sourceType: "hydration",
                  sourceId: dKey,
                  amount: 20,
                  localDate: dKey,
                  idempotencyKey,
                  createdAt: nowIso,
                },
              ];
            }
          }

          return {
            ...s,
            hydrationEvents: allEvents,
            dailyHydration: {
              ...(s.dailyHydration || {}),
              [dKey]: {
                ...prevDaily,
                consumedMl: nextConsumedMl,
                targetMl: targetInMl,
                updatedAt: nowIso,
              },
            },
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          };
        });
      },

      setHydration: (ml, date) => {
        const dKey = date || todayKey();
        update((s) => {
          const nowIso = new Date().toISOString();
          const targetInMl = s.wellnessSettings?.dailyWaterTarget
            ? (s.wellnessSettings.waterUnit === "oz"
                ? convertOzToMl(s.wellnessSettings.dailyWaterTarget)
                : s.wellnessSettings.dailyWaterTarget)
            : s.hydrationTargetMl || 2000;

          const otherEvents = (s.hydrationEvents || []).filter((e) => e.localDate !== dKey || e.deletedAt);
          const singleEvent: HydrationEvent = {
            id: `hyd_${uid()}`,
            userId: s.user.id,
            localDate: dKey,
            amount: Math.max(0, ml),
            unit: "ml",
            normalizedMillilitres: Math.max(0, ml),
            occurredAt: nowIso,
            timezone: s.wellnessSettings?.timezone || "UTC",
            sourceType: "manual",
            idempotencyKey: `set:${dKey}:${nowIso}`,
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          return {
            ...s,
            hydrationEvents: [...otherEvents, singleEvent],
            dailyHydration: {
              ...(s.dailyHydration || {}),
              [dKey]: {
                userId: s.user.id,
                localDate: dKey,
                consumedMl: Math.max(0, ml),
                targetMl: targetInMl,
                preferredGlassMl: s.preferredGlassMl || 250,
                updatedAt: nowIso,
              },
            },
          };
        });
      },

      updateWellnessSettings: (updates) =>
        update((s) => ({
          ...s,
          wellnessSettings: {
            ...(s.wellnessSettings || DEFAULT_WELLNESS_SETTINGS),
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        })),

      logSleepRecord: (record) => {
        const id = `slp_${uid()}`;
        update((s) => {
          const nowIso = new Date().toISOString();
          const newRecord: SleepRecord = {
            ...record,
            id,
            userId: s.user.id,
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          return {
            ...s,
            sleepRecords: [newRecord, ...(s.sleepRecords || []).filter((r) => r.id !== id)],
          };
        });
        return id;
      },

      deleteSleepRecord: (id) =>
        update((s) => ({
          ...s,
          sleepRecords: (s.sleepRecords || []).filter((r) => r.id !== id),
        })),

      logStepRecord: (date, count, source = "manual") => {
        const dKey = date || todayKey();
        update((s) => ({
          ...s,
          dailyStepRecords: {
            ...(s.dailyStepRecords || {}),
            [dKey]: {
              userId: s.user.id,
              localDate: dKey,
              stepCount: Math.max(0, count),
              sourceType: source,
              lastSyncedAt: new Date().toISOString(),
              timezone: s.wellnessSettings?.timezone || "UTC",
            },
          },
        }));
      },

      logWorkout: (workout) => {
        const id = `wkt_${uid()}`;
        update((s) => {
          const nowIso = new Date().toISOString();
          const newLog: WorkoutLog = {
            ...workout,
            id,
            userId: s.user.id,
            idempotencyKey: workout.idempotencyKey || `workout:${id}`,
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          let newLedger = s.xpLedger || [];
          let addedXp = 0;
          const xpKey = `workout:${id}`;
          if (!newLedger.some((e) => e.idempotencyKey === xpKey)) {
            addedXp = 15;
            newLedger = [
              ...newLedger,
              {
                id: uid(),
                userId: s.user.id,
                sourceType: "workout",
                sourceId: id,
                amount: 15,
                localDate: workout.localDate,
                idempotencyKey: xpKey,
                createdAt: nowIso,
              },
            ];
          }

          return {
            ...s,
            workoutLogs: [newLog, ...(s.workoutLogs || [])],
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          };
        });
        return id;
      },

      deleteWorkout: (id) =>
        update((s) => ({
          ...s,
          workoutLogs: (s.workoutLogs || []).filter((w) => w.id !== id),
        })),

      addCareActivityLink: (link) => {
        const id = `care_${uid()}`;
        update((s) => ({
          ...s,
          careActivityLinks: [
            ...(s.careActivityLinks || []),
            {
              ...link,
              id,
              userId: s.user.id,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return id;
      },

      deleteCareActivityLink: (id) =>
        update((s) => ({
          ...s,
          careActivityLinks: (s.careActivityLinks || []).filter((c) => c.id !== id),
        })),

      toggleCareActivity: (linkId, date) => {
        const dKey = date || todayKey();
        update((s) => {
          const link = (s.careActivityLinks || []).find((c) => c.id === linkId);
          if (!link) return s;

          if (link.sourceType === "selfcare") {
            const list = s.selfcare || [];
            const target = list.find((item) => item.id === link.sourceId);
            if (target) {
              const willBeDone = !target.done;
              return {
                ...s,
                selfcare: list.map((item) =>
                  item.id === link.sourceId
                    ? { ...item, done: willBeDone, doneDate: willBeDone ? dKey : undefined }
                    : item
                ),
              };
            }
          }
          return s;
        });
      },

      setHydrationTarget: (targetMl: number, glassMl?: number) => {
        update((s) => ({
          ...s,
          hydrationTargetMl: targetMl,
          preferredGlassMl: glassMl || s.preferredGlassMl || 250,
        }));
      },

      // ── Canonical Self-Care Workspace Actions ─────────────────────────────
      addCareActivity: (activity) => {
        const id = `act_${uid()}`;
        const nowIso = new Date().toISOString();
        const dKey = todayKey();
        update((s) => {
          const newAct: SelfCareActivity = {
            ...activity,
            id,
            userId: s.user.id,
            status: "active",
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          const planItemId = `plan_${id}_${dKey}`;
          const newPlanItem: SelfCarePlanItem = {
            id: planItemId,
            userId: s.user.id,
            activityId: id,
            localDate: dKey,
            plannedDuration: activity.estimatedDurationMinutes,
            status: "pending",
            sourceType: activity.sourceType,
            sourceId: activity.sourceId,
            order: (s.selfCarePlanItems || []).filter((p) => p.localDate === dKey).length,
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          // Synchronize legacy selfcare array
          const legacyItem = {
            id: id.replace(/^act_/, ""),
            emoji: activity.icon || "🌸",
            label: activity.title,
            done: false,
          };

          return {
            ...s,
            selfCareActivities: [...(s.selfCareActivities || []), newAct],
            selfCarePlanItems: [...(s.selfCarePlanItems || []), newPlanItem],
            selfcare: [...(s.selfcare || []), legacyItem],
          };
        });
        return id;
      },

      updateCareActivity: (id, updates) => {
        update((s) => {
          const nowIso = new Date().toISOString();
          const activities = (s.selfCareActivities || []).map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: nowIso } : a
          );
          // Keep legacy selfcare array label in sync
          const legacyId = id.replace(/^act_/, "");
          const selfcare = (s.selfcare || []).map((sc) =>
            sc.id === legacyId || sc.id === id
              ? {
                  ...sc,
                  label: updates.title || sc.label,
                  emoji: updates.icon || sc.emoji,
                }
              : sc
          );
          return { ...s, selfCareActivities: activities, selfcare };
        });
      },

      deleteCareActivity: (id) => {
        update((s) => {
          const legacyId = id.replace(/^act_/, "");
          return {
            ...s,
            selfCareActivities: (s.selfCareActivities || []).filter((a) => a.id !== id),
            selfCarePlanItems: (s.selfCarePlanItems || []).filter((p) => p.activityId !== id),
            selfcare: (s.selfcare || []).filter((sc) => sc.id !== legacyId && sc.id !== id),
          };
        });
      },

      archiveCareActivity: (id) => {
        update((s) => {
          const nowIso = new Date().toISOString();
          return {
            ...s,
            selfCareActivities: (s.selfCareActivities || []).map((a) =>
              a.id === id ? { ...a, status: "archived", updatedAt: nowIso } : a
            ),
          };
        });
      },

      restoreCareActivity: (id) => {
        update((s) => {
          const nowIso = new Date().toISOString();
          return {
            ...s,
            selfCareActivities: (s.selfCareActivities || []).map((a) =>
              a.id === id ? { ...a, status: "active", updatedAt: nowIso } : a
            ),
          };
        });
      },

      toggleCarePlanItem: (planItemId) => {
        update((s) => {
          const nowIso = new Date().toISOString();
          const planItems = s.selfCarePlanItems || [];
          const target = planItems.find((p) => p.id === planItemId);
          if (!target) return s;

          const willBeDone = target.status !== "completed";
          const newStatus: PlanItemStatus = willBeDone ? "completed" : "pending";
          const dKey = target.localDate || todayKey();

          const updatedPlanItems = planItems.map((p) =>
            p.id === planItemId
              ? {
                  ...p,
                  status: newStatus,
                  completedAt: willBeDone ? nowIso : undefined,
                  updatedAt: nowIso,
                }
              : p
          );

          // Find parent activity
          const activity = (s.selfCareActivities || []).find((a) => a.id === target.activityId);

          // 1. Cross-Page Synchronization:
          let habits = s.habits || [];
          let routines = s.routines || {};
          let tasks = s.tasks || [];

          if (activity) {
            // Habit
            if (activity.sourceType === "habit" && activity.sourceId) {
              habits = habits.map((h) => {
                if (h.id === activity.sourceId) {
                  const currentHist = h.history || {};
                  return {
                    ...h,
                    history: {
                      ...currentHist,
                      [dKey]: {
                        value: willBeDone ? (h.targetValue || 1) : 0,
                        completed: willBeDone,
                        completedAt: willBeDone ? nowIso : undefined,
                      },
                    },
                  };
                }
                return h;
              });
            }
            // Routine
            if (activity.sourceType === "routine" && activity.sourceId) {
              Object.keys(routines).forEach((rKey) => {
                routines[rKey] = routines[rKey].map((st: any) =>
                  st.id === activity.sourceId ? { ...st, done: willBeDone } : st
                );
              });
            }
            // Task
            if (activity.sourceType === "task" && activity.sourceId) {
              tasks = tasks.map((t) =>
                t.id === activity.sourceId
                  ? { ...t, done: willBeDone, completedAt: willBeDone ? nowIso : undefined }
                  : t
              );
            }
          }

          // 2. Synchronize legacy selfcare array
          const legacyId = target.activityId.replace(/^act_/, "");
          const selfcare = (s.selfcare || []).map((sc) =>
            sc.id === legacyId || sc.id === target.activityId
              ? { ...sc, done: willBeDone, doneDate: willBeDone ? dKey : undefined }
              : sc
          );

          // 3. Centralized XP Deduplication:
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          if (willBeDone && (!activity || activity.sourceType === "custom")) {
            const idempotencyKey = `care:${target.activityId}:${dKey}`;
            if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
              addedXp = 10;
              newLedger = [
                ...newLedger,
                {
                  id: uid(),
                  userId: s.user.id,
                  sourceType: "selfcare",
                  sourceId: target.activityId,
                  amount: 10,
                  localDate: dKey,
                  idempotencyKey,
                  createdAt: nowIso,
                },
              ];
            }
          }

          return withAchievements({
            ...s,
            selfCarePlanItems: updatedPlanItems,
            habits,
            routines,
            tasks,
            selfcare,
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        });
      },

      skipCarePlanItem: (planItemId) => {
        update((s) => {
          const nowIso = new Date().toISOString();
          const planItems = (s.selfCarePlanItems || []).map((p) =>
            p.id === planItemId ? { ...p, status: "skipped" as PlanItemStatus, updatedAt: nowIso } : p
          );
          return { ...s, selfCarePlanItems: planItems };
        });
      },

      addCarePlanItemForDate: (activityId, localDate) => {
        const id = `plan_${activityId}_${localDate}_${uid().slice(0, 5)}`;
        const nowIso = new Date().toISOString();
        update((s) => {
          const act = (s.selfCareActivities || []).find((a) => a.id === activityId);
          const newPlanItem: SelfCarePlanItem = {
            id,
            userId: s.user.id,
            activityId,
            localDate,
            plannedDuration: act?.estimatedDurationMinutes || 10,
            status: "pending",
            sourceType: act?.sourceType || "custom",
            sourceId: act?.sourceId,
            order: (s.selfCarePlanItems || []).filter((p) => p.localDate === localDate).length,
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          return {
            ...s,
            selfCarePlanItems: [...(s.selfCarePlanItems || []), newPlanItem],
          };
        });
        return id;
      },

      saveCareCheckIn: (localDate, needs, timePreference) => {
        const dKey = localDate || todayKey();
        const nowIso = new Date().toISOString();
        update((s) => ({
          ...s,
          selfCareCheckIns: {
            ...(s.selfCareCheckIns || {}),
            [dKey]: {
              userId: s.user.id,
              localDate: dKey,
              selectedNeeds: needs,
              availableTimeRange: timePreference,
              createdAt: s.selfCareCheckIns?.[dKey]?.createdAt || nowIso,
              updatedAt: nowIso,
            },
          },
        }));
      },

      linkSourceToCare: (sourceType, sourceId, title, icon, category) => {
        const actId = `act_${sourceType}_${sourceId}`;
        const dKey = todayKey();
        const nowIso = new Date().toISOString();
        update((s) => {
          const existing = (s.selfCareActivities || []).find((a) => a.id === actId);
          if (existing) return s;

          const newAct: SelfCareActivity = {
            id: actId,
            userId: s.user.id,
            title,
            icon: icon || "🌸",
            category,
            recurrenceRule: "daily",
            sourceType,
            sourceId,
            status: "active",
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          const planItemId = `plan_${actId}_${dKey}`;
          const newPlanItem: SelfCarePlanItem = {
            id: planItemId,
            userId: s.user.id,
            activityId: actId,
            localDate: dKey,
            status: "pending",
            sourceType,
            sourceId,
            order: (s.selfCarePlanItems || []).filter((p) => p.localDate === dKey).length,
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          return {
            ...s,
            selfCareActivities: [...(s.selfCareActivities || []), newAct],
            selfCarePlanItems: [...(s.selfCarePlanItems || []), newPlanItem],
          };
        });
        return actId;
      },

      // ── Tasks ────────────────────────────────────────────────────────────
      addTask: (t) =>
        update((s) => {
          const newTask = normalizeTask({
            ...t,
            id: t.id || uid(),
            done: t.done ?? false,
          });
          return withAchievements({ ...s, tasks: [newTask, ...s.tasks] });
        }),

      editTask: (id, updates) =>
        update((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === id
              ? normalizeTask({ ...t, ...updates, updatedAt: new Date().toISOString() })
              : t,
          ),
        })),

      toggleTask: (id) =>
        update((s) => {
          const nowIso = new Date().toISOString();
          const target = s.tasks.find((t) => t.id === id);
          if (!target) return s;
          const willBeDone = !target.done;
          const tasks = s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  done: willBeDone,
                  doneDate: willBeDone ? todayKey() : undefined,
                  completedAt: willBeDone ? nowIso : undefined,
                  updatedAt: nowIso,
                }
              : t,
          );
          const totalTasksDone = willBeDone
            ? s.totalTasksDone + 1
            : Math.max(0, s.totalTasksDone - 1);

          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          if (willBeDone) {
            const idempotencyKey = `task:${id}:${todayKey()}`;
            if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
              addedXp = 10;
              newLedger = [
                ...newLedger,
                {
                  id: uid(),
                  userId: s.user.id,
                  sourceType: "task",
                  sourceId: id,
                  amount: 10,
                  localDate: todayKey(),
                  idempotencyKey,
                  createdAt: nowIso,
                },
              ];
            }
          }

          return withAchievements({
            ...s,
            tasks,
            totalTasksDone,
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      removeTask: (id) => update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),

      moveTaskDate: (id, newDate) =>
        update((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  dueDate: newDate,
                  due: `${newDate}${t.optionalTime ? " " + t.optionalTime : ""}`,
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        })),

      toggleTopThree: (id) => {
        const t = state.tasks.find((item) => item.id === id);
        if (!t) return { ok: true, count: 0 };

        const dKey = t.dueDate || todayKey();
        const activeTop3 = state.tasks.filter(
          (item) =>
            (item.dueDate || todayKey()) === dKey &&
            item.isTopThree &&
            !item.done &&
            item.id !== id,
        );

        if (!t.isTopThree && activeTop3.length >= 3) {
          return { ok: false, count: activeTop3.length };
        }

        const willBeTop3 = !t.isTopThree;
        const finalCount = activeTop3.length + (willBeTop3 ? 1 : 0);

        update((s) => ({
          ...s,
          tasks: s.tasks.map((item) =>
            item.id === id
              ? { ...item, isTopThree: willBeTop3, updatedAt: new Date().toISOString() }
              : item,
          ),
        }));

        return { ok: true, count: finalCount };
      },

      replaceTopThree: (removeId, addId) =>
        update((s) => ({
          ...s,
          tasks: s.tasks.map((item) => {
            if (item.id === removeId) return { ...item, isTopThree: false, updatedAt: new Date().toISOString() };
            if (item.id === addId) return { ...item, isTopThree: true, updatedAt: new Date().toISOString() };
            return item;
          }),
        })),

      addCustomCategory: (category) =>
        update((s) => ({
          ...s,
          customCategories: Array.from(new Set([...(s.customCategories || []), category.trim()])),
        })),

      // ── Habits ───────────────────────────────────────────────────────────
      addHabit: (h) =>
        update((s) => {
          const newHabit: Habit = {
            id: h.id || uid(),
            emoji: h.emoji || "✨",
            name: h.name,
            nameAr: h.nameAr,
            category: h.category || "General",
            trackingType: h.trackingType || "check",
            targetValue: h.targetValue || 1,
            currentValue: 0,
            unit: h.unit,
            scheduleType: h.scheduleType || "daily",
            scheduledDays: h.scheduledDays || [0, 1, 2, 3, 4, 5, 6],
            weeklyFrequency: h.weeklyFrequency || 7,
            preferredTime: h.preferredTime,
            reminder: h.reminder,
            reminderTime: h.reminderTime,
            startDate: h.startDate || todayKey(),
            notes: h.notes,
            status: "active",
            streak: 0,
            bestStreak: 0,
            days: [false, false, false, false, false, false, false],
            lastChecked: undefined,
            history: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return withAchievements({ ...s, habits: [newHabit, ...s.habits] });
        }),

      editHabit: (id, updates) =>
        update((s) => ({
          ...s,
          habits: s.habits.map((h) =>
            h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h,
          ),
        })),

      toggleHabit: (id, date) =>
        update((s) => {
          const dKey = date || todayKey();
          const target = s.habits.find((h) => h.id === id);
          if (!target) return s;

          const prevHistory = target.history || {};
          const isDone = Boolean(prevHistory[dKey]?.completed);
          const willBeDone = !isDone;

          const newHistory = {
            ...prevHistory,
            [dKey]: {
              value: willBeDone ? target.targetValue || 1 : 0,
              completed: willBeDone,
              completedAt: willBeDone ? new Date().toISOString() : undefined,
              xpAwarded: willBeDone,
            },
          };

          const newDays = [...target.days];
          newDays[6] = willBeDone;
          const streak = willBeDone ? target.streak + 1 : Math.max(0, target.streak - 1);
          const bestStreak = Math.max(target.bestStreak || 0, streak);

          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          if (willBeDone) {
            const idempotencyKey = `habit:${id}:${dKey}`;
            if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
              addedXp = 20;
              newLedger = [
                ...newLedger,
                {
                  id: uid(),
                  userId: s.user.id,
                  sourceType: "habit",
                  sourceId: id,
                  amount: 20,
                  localDate: dKey,
                  idempotencyKey,
                  createdAt: new Date().toISOString(),
                },
              ];
            }
          }

          return withAchievements({
            ...s,
            habits: s.habits.map((h) =>
              h.id === id
                ? {
                    ...h,
                    history: newHistory,
                    days: newDays,
                    streak,
                    bestStreak,
                    lastChecked: willBeDone ? dKey : h.lastChecked,
                    updatedAt: new Date().toISOString(),
                  }
                : h,
            ),
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      updateHabitProgress: (id, value, date) =>
        update((s) => {
          const dKey = date || todayKey();
          return {
            ...s,
            habits: s.habits.map((h) => {
              if (h.id !== id) return h;
              const target = h.targetValue || 1;
              const completed = value >= target;
              const prevHist = h.history || {};
              return {
                ...h,
                currentValue: value,
                history: {
                  ...prevHist,
                  [dKey]: { value, completed, updatedAt: new Date().toISOString() },
                },
                updatedAt: new Date().toISOString(),
              };
            }),
          };
        }),

      pauseHabit: (id) =>
        update((s) => ({
          ...s,
          habits: s.habits.map((h) => (h.id === id ? { ...h, status: "paused", updatedAt: new Date().toISOString() } : h)),
        })),

      resumeHabit: (id) =>
        update((s) => ({
          ...s,
          habits: s.habits.map((h) => (h.id === id ? { ...h, status: "active", updatedAt: new Date().toISOString() } : h)),
        })),

      archiveHabit: (id) =>
        update((s) => ({
          ...s,
          habits: s.habits.map((h) => (h.id === id ? { ...h, status: "archived", updatedAt: new Date().toISOString() } : h)),
        })),

      skipHabitForToday: (id, date) =>
        update((s) => {
          const dKey = date || todayKey();
          return {
            ...s,
            habits: s.habits.map((h) =>
              h.id === id
                ? {
                    ...h,
                    history: {
                      ...(h.history || {}),
                      [dKey]: { value: 0, completed: false, skipped: true, updatedAt: new Date().toISOString() },
                    },
                    updatedAt: new Date().toISOString(),
                  }
                : h,
            ),
          };
        }),

      removeHabit: (id) =>
        update((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) })),

      addHabitBundle: (habits) =>
        update((s) => {
          const created: Habit[] = habits.map((h) => ({
            id: uid(),
            emoji: h.emoji,
            name: h.name,
            category: h.category || "Bundle",
            trackingType: h.trackingType || "check",
            targetValue: h.targetValue || 1,
            currentValue: 0,
            unit: h.unit,
            scheduleType: "daily",
            scheduledDays: [0, 1, 2, 3, 4, 5, 6],
            weeklyFrequency: 7,
            startDate: todayKey(),
            status: "active",
            streak: 0,
            bestStreak: 0,
            days: [false, false, false, false, false, false, false],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          return withAchievements({ ...s, habits: [...created, ...s.habits] });
        }),

      importHabitBundle: (bundleId, habits) => {
        let count = 0;
        update((s) => {
          const existingNames = new Set(s.habits.map((h) => h.name.toLowerCase()));
          const toAdd: Habit[] = [];
          habits.forEach((h) => {
            if (!existingNames.has(h.name.toLowerCase())) {
              toAdd.push({
                id: uid(),
                emoji: h.emoji || "✨",
                name: h.name,
                nameAr: h.nameAr,
                category: h.category || "Bundle",
                status: "active",
                streak: 0,
                days: [false, false, false, false, false, false, false],
                sourceBundleId: bundleId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              count++;
            }
          });
          return withAchievements({ ...s, habits: [...toAdd, ...s.habits] });
        });
        return count;
      },

      setWeeklyIntention: (weekStartDate, text, presetTag) =>
        update((s) => {
          const prev = s.weeklyIntentions?.[weekStartDate];
          return {
            ...s,
            weeklyIntentions: {
              ...(s.weeklyIntentions || {}),
              [weekStartDate]: {
                id: prev?.id || uid(),
                userId: s.user.id,
                weekStartDate,
                text,
                presetTag,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      setWeeklyNote: (weekStartDate, text, reflectionData) =>
        update((s) => {
          const prev = s.weeklyNotes?.[weekStartDate];
          return {
            ...s,
            weeklyNotes: {
              ...(s.weeklyNotes || {}),
              [weekStartDate]: {
                id: prev?.id || uid(),
                userId: s.user.id,
                weekStartDate,
                text,
                journalEntryId: reflectionData?.journalEntryId ?? prev?.journalEntryId,
                reflectionAnswers: reflectionData?.reflectionAnswers ?? prev?.reflectionAnswers,
                energyDrained: reflectionData?.energyDrained ?? prev?.energyDrained,
                energyRestored: reflectionData?.energyRestored ?? prev?.energyRestored,
                accomplishments: reflectionData?.accomplishments ?? prev?.accomplishments,
                nextWeekPriorities: reflectionData?.nextWeekPriorities ?? prev?.nextWeekPriorities,
                nextWeekIntention: reflectionData?.nextWeekIntention ?? prev?.nextWeekIntention,
                completedReflection: reflectionData?.completedReflection ?? prev?.completedReflection ?? false,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      updateHabitWeekPreferences: (prefs) =>
        update((s) => ({
          ...s,
          habitWeekPreferences: {
            firstDayOfWeek: "saturday",
            groupingMode: "none",
            density: "comfortable",
            paperTheme: "blossom",
            showWater: true,
            showMood: true,
            showEnergy: true,
            showDayRating: true,
            showStreaks: true,
            showIntentionCard: true,
            showNotesCard: true,
            showFlexibleSection: true,
            ...(s.habitWeekPreferences || {}),
            ...prefs,
            updatedAt: new Date().toISOString(),
          },
        })),

      saveWeeklyReflectionToJournal: (weekStartDate, reflectionText, answers) => {
        let returnId = "";
        update((s) => {
          const existingNote = s.weeklyNotes?.[weekStartDate];
          const existingEntryId = existingNote?.journalEntryId;
          const entryExists = existingEntryId && s.journal.some((j) => j.id === existingEntryId);

          const targetId = entryExists ? existingEntryId : existingEntryId || uid();
          returnId = targetId;

          const date = todayKey();
          const entry = normalizeJournalEntry({
            id: targetId,
            date,
            title: `Weekly Reset Reflection (${weekStartDate})`,
            body: reflectionText,
            templateId: "weekly",
            tags: ["reflection", "weekly", "reset"],
            sticker: "🌸",
          });

          const updatedWeeklyNotes = {
            ...(s.weeklyNotes || {}),
            [weekStartDate]: {
              id: existingNote?.id || uid(),
              userId: s.user.id,
              weekStartDate,
              text: existingNote?.text || "",
              journalEntryId: targetId,
              reflectionAnswers: answers || existingNote?.reflectionAnswers,
              energyDrained: existingNote?.energyDrained,
              energyRestored: existingNote?.energyRestored,
              accomplishments: existingNote?.accomplishments,
              nextWeekPriorities: existingNote?.nextWeekPriorities,
              nextWeekIntention: existingNote?.nextWeekIntention,
              completedReflection: true,
              updatedAt: new Date().toISOString(),
            },
          };

          const newJournal = entryExists
            ? s.journal.map((j) => (j.id === targetId ? { ...j, title: entry.title, body: entry.body, tags: entry.tags, updatedAt: new Date().toISOString() } : j))
            : [entry, ...s.journal];

          return withAchievements({
            ...s,
            journal: newJournal,
            weeklyNotes: updatedWeeklyNotes,
          });
        });
        return returnId;
      },

      // ── Routines ─────────────────────────────────────────────────────────
      toggleRoutineStep: (routineKey, stepId) =>
        update((s) => {
          const today = todayKey();
          const list = s.routines[routineKey] || [];
          const step = list.find((st) => st.id === stepId);
          if (!step) return s;
          const willBeDone = !step.done;

          const updatedList = list.map((st) =>
            st.id === stepId
              ? { ...st, done: willBeDone, doneDate: willBeDone ? today : undefined }
              : st,
          );

          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          if (willBeDone) {
            const idempotencyKey = `routine:${routineKey}:${stepId}:${today}`;
            if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
              addedXp = 10;
              newLedger = [
                ...newLedger,
                {
                  id: uid(),
                  userId: s.user.id,
                  sourceType: "routine",
                  sourceId: `${routineKey}_${stepId}`,
                  amount: 10,
                  localDate: today,
                  idempotencyKey,
                  createdAt: new Date().toISOString(),
                },
              ];
            }
          }

          return withAchievements({
            ...s,
            routines: { ...s.routines, [routineKey]: updatedList },
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      addRoutineStep: (routineKey, step) =>
        update((s) => {
          const list = s.routines[routineKey] || [];
          const newStep: RoutineStep = {
            id: uid(),
            time: step.time || "08:00",
            emoji: step.emoji || "✨",
            title: step.title,
            titleAr: step.titleAr,
            section: step.section || "morning",
            durationMinutes: step.durationMinutes,
            done: false,
          };
          return {
            ...s,
            routines: { ...s.routines, [routineKey]: [...list, newStep] },
          };
        }),

      editRoutineStep: (routineKey, stepId, updates) =>
        update((s) => {
          const list = s.routines[routineKey] || [];
          return {
            ...s,
            routines: {
              ...s.routines,
              [routineKey]: list.map((st) => (st.id === stepId ? { ...st, ...updates } : st)),
            },
          };
        }),

      removeRoutineStep: (routineKey, stepId) =>
        update((s) => {
          const list = s.routines[routineKey] || [];
          return {
            ...s,
            routines: {
              ...s.routines,
              [routineKey]: list.filter((st) => st.id !== stepId),
            },
          };
        }),

      moveRoutineStepSection: (routineKey, stepId, newSection) =>
        update((s) => {
          const list = s.routines[routineKey] || [];
          return {
            ...s,
            routines: {
              ...s.routines,
              [routineKey]: list.map((st) => (st.id === stepId ? { ...st, section: newSection } : st)),
            },
          };
        }),

      duplicateRoutineStep: (routineKey, stepId) =>
        update((s) => {
          const list = s.routines[routineKey] || [];
          const target = list.find((st) => st.id === stepId);
          if (!target) return s;
          const copy: RoutineStep = { ...target, id: uid(), done: false };
          return {
            ...s,
            routines: { ...s.routines, [routineKey]: [...list, copy] },
          };
        }),

      skipRoutineStepForToday: (routineKey, stepId) =>
        update((s) => {
          const list = s.routines[routineKey] || [];
          return {
            ...s,
            routines: {
              ...s.routines,
              [routineKey]: list.map((st) =>
                st.id === stepId ? { ...st, skippedDate: todayKey(), done: false } : st,
              ),
            },
          };
        }),

      reorderRoutineSteps: (routineKey, steps) =>
        update((s) => ({
          ...s,
          routines: { ...s.routines, [routineKey]: steps },
        })),

      resetRoutineToday: (routineKey) =>
        update((s) => {
          const list = s.routines[routineKey] || [];
          return {
            ...s,
            routines: {
              ...s.routines,
              [routineKey]: list.map((st) => ({ ...st, done: false, doneDate: undefined })),
            },
          };
        }),

      resetRoutineToDefault: (routineKey) =>
        update((s) => {
          const def = DEFAULT_ROUTINES[routineKey];
          if (!def) return s;
          return {
            ...s,
            routines: {
              ...s.routines,
              [routineKey]: def.steps.map((st) => ({ ...st, done: false })),
            },
          };
        }),

      restoreRoutineTemplate: (routineKey) =>
        update((s) => {
          const def = DEFAULT_ROUTINES[routineKey];
          if (!def) return s;
          return {
            ...s,
            routines: {
              ...s.routines,
              [routineKey]: def.steps.map((st) => ({ ...st, done: false })),
            },
          };
        }),

      useRoutineTemplate: (templateKey) =>
        update((s) => {
          const def = DEFAULT_ROUTINES[templateKey];
          if (!def) return s;
          return {
            ...s,
            routines: {
              ...s.routines,
              [templateKey]: def.steps.map((st) => ({ ...st, done: false })),
            },
          };
        }),

      createUserRoutine: (routine) => {
        const id = "custom-" + uid();
        update((s) => {
          const userRoutines = s.customRoutines || [];
          const newRoutine: UserRoutine = {
            ...routine,
            id,
            isCustom: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            ...s,
            customRoutines: [...userRoutines, newRoutine],
            routines: {
              ...s.routines,
              [id]: (routine.steps || []).map((st) => ({ ...st, done: false })),
            },
          };
        });
        return id;
      },

      duplicateRoutine: (routineKey) => {
        const newKey = "copy-" + uid();
        update((s) => {
          const list = s.routines[routineKey] || [];
          return {
            ...s,
            routines: {
              ...s.routines,
              [newKey]: list.map((st) => ({ ...st, id: uid(), done: false })),
            },
          };
        });
        return newKey;
      },

      archiveRoutine: (routineKey) =>
        update((s) => ({
          ...s,
          archivedRoutines: Array.from(new Set([...(s.archivedRoutines || []), routineKey])),
        })),

      deleteCustomRoutine: (routineKey) =>
        update((s) => {
          const nextRoutines = { ...s.routines };
          delete nextRoutines[routineKey];
          return {
            ...s,
            routines: nextRoutines,
            customRoutines: (s.customRoutines || []).filter((r) => r.id !== routineKey),
          };
        }),

      // ── Ideal Week & Between the Prayers (Zero XP planning) ──────────────
      saveIdealWeekTemplate: (template) =>
        update((s) => ({
          ...s,
          idealWeekTemplate: {
            ...template,
            updatedAt: new Date().toISOString(),
          },
        })),

      saveCustomDayTypes: (dayTypes) =>
        update((s) => ({
          ...s,
          customDayTypes: dayTypes,
        })),

      resetIdealWeekToDefault: () =>
        update((s) => ({
          ...s,
          idealWeekTemplate: createDefaultIdealWeekTemplate(),
        })),

      applyIdealWeekPlan: (actionPlan) => {
        let createdCount = 0;
        let scheduledCount = 0;

        update((s) => {
          const nowIso = new Date().toISOString();
          const newTasks: Task[] = [...s.tasks];
          const newCreatedIds: string[] = [];
          const newScheduledRoutineKeys: string[] = [];

          // 1. Create task proposals (Zero XP)
          actionPlan.tasksToCreate.forEach((tc) => {
            const taskId = uid();
            newCreatedIds.push(taskId);
            createdCount++;
            newTasks.push({
              id: taskId,
              title: tc.title,
              tag: tc.tag || "Personal",
              dueDate: tc.dueDate,
              optionalTime: tc.optionalTime,
              priority: "medium",
              notes: tc.notes,
              done: false,
              createdAt: nowIso,
              updatedAt: nowIso,
            });
          });

          // 2. Schedule routines for active days
          const nextRoutines = { ...s.routines };
          actionPlan.routinesToSchedule.forEach((rs) => {
            newScheduledRoutineKeys.push(rs.routineKey);
            scheduledCount++;
            // If routine steps exist, update their activeDays if appropriate
            const steps = nextRoutines[rs.routineKey];
            if (steps) {
              nextRoutines[rs.routineKey] = steps.map((st) => ({
                ...st,
                activeDays: Array.from(new Set([...(st.activeDays || []), ...rs.activeDays])),
              }));
            }
          });

          // 3. Record applied week metadata for idempotency and duplicate detection
          const prevApplied = s.appliedIdealWeeks || {};
          const currentRecord = prevApplied[actionPlan.weekStartDate];

          const updatedRecord: AppliedWeekRecord = {
            weekStartDate: actionPlan.weekStartDate,
            appliedAt: nowIso,
            createdTaskIds: Array.from(
              new Set([...(currentRecord?.createdTaskIds || []), ...newCreatedIds])
            ),
            scheduledRoutineKeys: Array.from(
              new Set([...(currentRecord?.scheduledRoutineKeys || []), ...newScheduledRoutineKeys])
            ),
          };

          return {
            ...s,
            tasks: newTasks,
            routines: nextRoutines,
            appliedIdealWeeks: {
              ...prevApplied,
              [actionPlan.weekStartDate]: updatedRecord,
            },
          };
        });

        return { createdCount, scheduledCount };
      },

      // ── Goals ────────────────────────────────────────────────────────────
      addGoal: (g) => {
        const id = g.id || uid();
        update((s) => {
          const newGoal = normalizeGoal({
            ...g,
            id,
            status: "active",
            progress: g.progress || 0,
            targetDate: g.targetDate || todayKey(),
            milestones: g.milestones || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return withAchievements({ ...s, goals: [newGoal, ...s.goals] });
        });
        return id;
      },

      editGoal: (id, updates) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => (g.id === id ? normalizeGoal({ ...g, ...updates, updatedAt: new Date().toISOString() }) : g)),
        })),

      updateGoalProgress: (id, progress, note) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => {
            if (g.id !== id) return g;
            const completed = progress >= 100;
            return normalizeGoal({
              ...g,
              progress: Math.min(100, Math.max(0, progress)),
              status: completed ? "completed" : g.status,
              completedAt: completed ? new Date().toISOString() : g.completedAt,
              updatedAt: new Date().toISOString(),
            });
          }),
        })),

      toggleGoalFocus: (id) => {
        const g = state.goals.find((item) => item.id === id);
        if (!g) return { ok: true, count: 0 };
        const activeFocus = state.goals.filter((item) => item.isFocus && item.status === "active" && item.id !== id);
        if (!g.isFocus && activeFocus.length >= 3) return { ok: false, count: activeFocus.length };
        const willBeFocus = !g.isFocus;
        update((s) => ({
          ...s,
          goals: s.goals.map((item) => (item.id === id ? { ...item, isFocus: willBeFocus, updatedAt: new Date().toISOString() } : item)),
        }));
        return { ok: true, count: activeFocus.length + (willBeFocus ? 1 : 0) };
      },

      replaceGoalFocus: (removeId, addId) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((item) => {
            if (item.id === removeId) return { ...item, isFocus: false, updatedAt: new Date().toISOString() };
            if (item.id === addId) return { ...item, isFocus: true, updatedAt: new Date().toISOString() };
            return item;
          }),
        })),

      pauseGoal: (id) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => (g.id === id ? { ...g, status: "paused", updatedAt: new Date().toISOString() } : g)),
        })),

      resumeGoal: (id) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => (g.id === id ? { ...g, status: "active", updatedAt: new Date().toISOString() } : g)),
        })),

      completeGoal: (id) =>
        update((s) => {
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          const idempotencyKey = `goal:${id}:${todayKey()}`;
          if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
            addedXp = 50;
            newLedger = [
              ...newLedger,
              {
                id: uid(),
                userId: s.user.id,
                sourceType: "goal",
                sourceId: id,
                amount: 50,
                localDate: todayKey(),
                idempotencyKey,
                createdAt: new Date().toISOString(),
              },
            ];
          }
          return withAchievements({
            ...s,
            goals: s.goals.map((g) =>
              g.id === id
                ? { ...g, status: "completed", progress: 100, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
                : g,
            ),
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      uncompleteGoal: (id) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) =>
            g.id === id
              ? { ...g, status: "active", progress: Math.min(95, g.progress), completedAt: undefined, updatedAt: new Date().toISOString() }
              : g,
          ),
        })),

      archiveGoal: (id) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => (g.id === id ? { ...g, status: "archived", updatedAt: new Date().toISOString() } : g)),
        })),

      restoreGoal: (id) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => (g.id === id ? { ...g, status: "active", updatedAt: new Date().toISOString() } : g)),
        })),

      removeGoal: (id) =>
        update((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) })),

      addGoalMilestone: (goalId, milestone) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const ms = g.milestones || [];
            const newM: GoalMilestone = {
              id: milestone.id || uid(),
              title: milestone.title,
              targetDate: milestone.targetDate,
              completed: Boolean((milestone as any).completed || milestone.done),
              done: Boolean(milestone.done || (milestone as any).completed),
              xpReward: milestone.xpReward || 15,
              order: ms.length,
            };
            return normalizeGoal({ ...g, milestones: [...ms, newM], updatedAt: new Date().toISOString() });
          }),
        })),

      editGoalMilestone: (goalId, milestoneId, updates) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            return normalizeGoal({
              ...g,
              milestones: (g.milestones || []).map((m) => (m.id === milestoneId ? { ...m, ...updates } : m)),
              updatedAt: new Date().toISOString(),
            });
          }),
        })),

      toggleGoalMilestone: (goalId, milestoneId) =>
        update((s) => {
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          const nextGoals = s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const ms = (g.milestones || []).map((m) => {
              if (m.id !== milestoneId) return m;
              const willBeDone = !m.done;
              if (willBeDone) {
                const idempotencyKey = `milestone:${milestoneId}:${todayKey()}`;
                if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
                  addedXp += m.xpReward || 15;
                  newLedger.push({
                    id: uid(),
                    userId: s.user.id,
                    sourceType: "milestone",
                    sourceId: milestoneId,
                    amount: m.xpReward || 15,
                    localDate: todayKey(),
                    idempotencyKey,
                    createdAt: new Date().toISOString(),
                  });
                }
              }
              return { ...m, done: willBeDone, completedAt: willBeDone ? new Date().toISOString() : undefined };
            });
            return normalizeGoal({ ...g, milestones: ms, updatedAt: new Date().toISOString() });
          });
          return withAchievements({
            ...s,
            goals: nextGoals,
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      removeGoalMilestone: (goalId, milestoneId) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            return normalizeGoal({
              ...g,
              milestones: (g.milestones || []).filter((m) => m.id !== milestoneId),
              updatedAt: new Date().toISOString(),
            });
          }),
        })),

      reorderGoalMilestones: (goalId, milestones) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => (g.id === goalId ? normalizeGoal({ ...g, milestones, updatedAt: new Date().toISOString() }) : g)),
        })),

      addGoalCheckIn: (goalId, checkIn) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const newCheckIn: GoalCheckIn = {
              ...checkIn,
              id: uid(),
              createdAt: new Date().toISOString(),
            };
            return normalizeGoal({
              ...g,
              checkIns: [newCheckIn, ...(g.checkIns || [])],
              progress: checkIn.progress ?? g.progress,
              updatedAt: new Date().toISOString(),
            });
          }),
        })),

      updateGoalNumericValue: (goalId, currentValue) =>
        update((s) => ({
          ...s,
          goals: s.goals.map((g) => {
            if (g.id !== goalId) return g;
            const target = g.targetValue || 100;
            const start = g.startValue || 0;
            const pct = Math.round(((currentValue - start) / Math.max(1, target - start)) * 100);
            return normalizeGoal({
              ...g,
              currentValue,
              progress: Math.min(100, Math.max(0, pct)),
              updatedAt: new Date().toISOString(),
            });
          }),
        })),

      // ── Vision Boards (Strictly 0 XP) ────────────────────────────────────
      addVisionBoard: (board) => {
        const id = board.id || uid();
        update((s) => {
          const newBoard = normalizeVisionBoard({
            ...board,
            id,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return {
            ...s,
            visionBoards: [newBoard, ...(s.visionBoards || [])],
          };
        });
        return id;
      },

      updateVisionBoard: (id, updates) =>
        update((s) => ({
          ...s,
          visionBoards: (s.visionBoards || []).map((b) =>
            b.id === id ? normalizeVisionBoard({ ...b, ...updates, updatedAt: new Date().toISOString() }) : b
          ),
        })),

      deleteVisionBoard: (id) =>
        update((s) => ({
          ...s,
          visionBoards: (s.visionBoards || []).filter((b) => b.id !== id),
          visionBoardItems: (s.visionBoardItems || []).filter((it) => it.boardId !== id),
        })),

      archiveVisionBoard: (id) =>
        update((s) => ({
          ...s,
          visionBoards: (s.visionBoards || []).map((b) =>
            b.id === id ? { ...b, status: "archived", updatedAt: new Date().toISOString() } : b
          ),
        })),

      restoreVisionBoard: (id) =>
        update((s) => ({
          ...s,
          visionBoards: (s.visionBoards || []).map((b) =>
            b.id === id ? { ...b, status: "active", updatedAt: new Date().toISOString() } : b
          ),
        })),

      duplicateVisionBoard: (id) => {
        const currentBoards = state.visionBoards || [];
        const board = currentBoards.find((b) => b.id === id);
        if (!board) return "";
        const { duplicatedBoard, duplicatedItems } = duplicateBoardWithItems(
          board,
          state.visionBoardItems || [],
          state.prefs?.language === "ar"
        );
        update((s) => ({
          ...s,
          visionBoards: [duplicatedBoard, ...(s.visionBoards || [])],
          visionBoardItems: [...(s.visionBoardItems || []), ...duplicatedItems],
        }));
        return duplicatedBoard.id;
      },

      togglePinVisionBoardToHome: (id) =>
        update((s) => ({
          ...s,
          visionBoards: (s.visionBoards || []).map((b) =>
            b.id === id ? { ...b, isPinnedToHome: !b.isPinnedToHome, updatedAt: new Date().toISOString() } : b
          ),
        })),

      addVisionBoardItem: (item) => {
        const id = uid();
        update((s) => {
          const boardItems = (s.visionBoardItems || []).filter((it) => it.boardId === item.boardId);
          const maxOrder = boardItems.reduce((max, it) => Math.max(max, it.order ?? 0), -1);
          const newItem = normalizeVisionBoardItem({
            ...item,
            id,
            order: typeof item.order === "number" ? item.order : maxOrder + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return {
            ...s,
            visionBoardItems: [...(s.visionBoardItems || []), newItem],
          };
        });
        return id;
      },

      updateVisionBoardItem: (id, updates) =>
        update((s) => ({
          ...s,
          visionBoardItems: (s.visionBoardItems || []).map((it) =>
            it.id === id ? normalizeVisionBoardItem({ ...it, ...updates, updatedAt: new Date().toISOString() }) : it
          ),
        })),

      deleteVisionBoardItem: (id) =>
        update((s) => ({
          ...s,
          visionBoardItems: (s.visionBoardItems || []).filter((it) => it.id !== id),
        })),

      reorderVisionBoardItems: (boardId, itemIds) =>
        update((s) => {
          const idOrderMap = new Map<string, number>();
          itemIds.forEach((itemId, idx) => idOrderMap.set(itemId, idx));
          return {
            ...s,
            visionBoardItems: (s.visionBoardItems || []).map((it) => {
              if (it.boardId === boardId && idOrderMap.has(it.id)) {
                return { ...it, order: idOrderMap.get(it.id)!, updatedAt: new Date().toISOString() };
              }
              return it;
            }),
          };
        }),

      moveVisionBoardItem: (boardId, itemId, direction) =>
        update((s) => ({
          ...s,
          visionBoardItems: reorderBoardItems(s.visionBoardItems || [], boardId, itemId, direction),
        })),

      // ── Journal ──────────────────────────────────────────────────────────
      addJournal: (e) => {
        const id = e.id || uid();
        update((s) => {
          const entry = normalizeJournalEntry({ ...e, id });
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          const idempotencyKey = `journal:${id}:${entry.date}`;
          if (!newLedger.some((item) => item.idempotencyKey === idempotencyKey)) {
            addedXp = 15;
            newLedger = [
              ...newLedger,
              {
                id: uid(),
                userId: s.user.id,
                sourceType: "journal",
                sourceId: id,
                amount: 15,
                localDate: entry.date,
                idempotencyKey,
                createdAt: new Date().toISOString(),
              },
            ];
          }
          return withAchievements({
            ...s,
            journal: [entry, ...s.journal],
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        });
        return id;
      },

      editJournal: (id, updates) =>
        update((s) => ({
          ...s,
          journal: s.journal.map((j) => (j.id === id ? normalizeJournalEntry({ ...j, ...updates, updatedAt: new Date().toISOString() }) : j)),
        })),

      removeJournal: (id) =>
        update((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== id) })),

      archiveJournal: (id) =>
        update((s) => ({
          ...s,
          journal: s.journal.map((j) => (j.id === id ? { ...j, archived: true, updatedAt: new Date().toISOString() } : j)),
        })),

      restoreJournal: (id) =>
        update((s) => ({
          ...s,
          journal: s.journal.map((j) => (j.id === id ? { ...j, archived: false, updatedAt: new Date().toISOString() } : j)),
        })),

      toggleJournalLock: (id) =>
        update((s) => ({
          ...s,
          journal: s.journal.map((j) => (j.id === id ? { ...j, locked: !j.locked, updatedAt: new Date().toISOString() } : j)),
        })),

      updateJournalSettings: (settings) =>
        update((s) => ({
          ...s,
          journalSettings: { ...(s.journalSettings || { journalLockEnabled: false }), ...settings },
        })),

      // ── Money / Finance (Canonical Ledger & Backward Compatibility) ─────
      addMoney: (e) =>
        update((s) => {
          const newId = uid();
          const legacyEntry: MoneyEntry = { ...e, id: newId };
          const mainAcc = s.financeAccounts?.[0] || createDefaultMainAccount(s.prefs?.currency || "MAD");
          const isInc = e.amount > 0;
          const amtMinor = toMinorUnits(Math.abs(e.amount));
          const now = new Date().toISOString();

          const leg: FinancialTransactionLeg = {
            id: "leg_" + newId,
            transactionId: newId,
            accountId: mainAcc.id,
            signedAmountMinor: isInc ? amtMinor : -amtMinor,
            currency: s.prefs?.currency || "MAD",
            legType: isInc ? "destination" : "source",
            createdAt: now,
          };

          const newTx: FinancialTransaction = {
            id: newId,
            type: isInc ? "income" : "expense",
            status: "posted",
            categoryId: isInc ? "inc_other" : "exp_other",
            merchantOrSource: e.label,
            occurredAt: e.date ? `${e.date}T12:00:00.000Z` : now,
            localDate: e.date || now.slice(0, 10),
            legs: [leg],
            createdAt: now,
            updatedAt: now,
          };

          return {
            ...s,
            money: [legacyEntry, ...(s.money || [])],
            financialTransactions: [newTx, ...(s.financialTransactions || [])],
          };
        }),

      removeMoney: (id) =>
        update((s) => ({
          ...s,
          money: (s.money || []).filter((m) => m.id !== id),
          financialTransactions: (s.financialTransactions || []).filter((tx) => tx.id !== id),
        })),

      addFinanceAccount: (account) =>
        update((s) => {
          const now = new Date().toISOString();
          const newAcc: FinanceAccount = {
            ...account,
            id: "acc_" + uid(),
            createdAt: now,
            updatedAt: now,
          };
          return {
            ...s,
            financeAccounts: [...(s.financeAccounts || []), newAcc],
          };
        }),

      updateFinanceAccount: (id, updates) =>
        update((s) => ({
          ...s,
          financeAccounts: (s.financeAccounts || []).map((acc) =>
            acc.id === id ? { ...acc, ...updates, updatedAt: new Date().toISOString() } : acc
          ),
        })),

      archiveFinanceAccount: (id) =>
        update((s) => ({
          ...s,
          financeAccounts: (s.financeAccounts || []).map((acc) =>
            acc.id === id
              ? { ...acc, status: "archived", archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : acc
          ),
        })),

      addFinancialTransaction: (tx) =>
        update((s) => {
          const now = new Date().toISOString();
          const newTx: FinancialTransaction = {
            ...tx,
            id: "tx_" + uid(),
            createdAt: now,
            updatedAt: now,
          };

          // Synchronize legacy money array for backward compatibility
          const primaryLeg = newTx.legs[0];
          const signedMinor = primaryLeg ? primaryLeg.signedAmountMinor : 0;
          const legacyEntry: MoneyEntry = {
            id: newTx.id,
            label: newTx.merchantOrSource,
            amount: fromMinorUnits(signedMinor),
            category: newTx.categoryId,
            date: newTx.localDate,
          };

          return {
            ...s,
            financialTransactions: [newTx, ...(s.financialTransactions || [])],
            money: [legacyEntry, ...(s.money || [])],
          };
        }),

      updateFinancialTransaction: (id, updates) =>
        update((s) => ({
          ...s,
          financialTransactions: (s.financialTransactions || []).map((tx) =>
            tx.id === id ? { ...tx, ...updates, updatedAt: new Date().toISOString() } : tx
          ),
        })),

      voidFinancialTransaction: (id) =>
        update((s) => ({
          ...s,
          financialTransactions: (s.financialTransactions || []).map((tx) =>
            tx.id === id
              ? { ...tx, status: "voided", voidedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : tx
          ),
          money: (s.money || []).filter((m) => m.id !== id),
        })),

      deleteFinancialTransaction: (id) =>
        update((s) => ({
          ...s,
          financialTransactions: (s.financialTransactions || []).filter((tx) => tx.id !== id),
          money: (s.money || []).filter((m) => m.id !== id),
        })),

      addBudget: (budget) =>
        update((s) => {
          const now = new Date().toISOString();
          const newBudget: Budget = {
            ...budget,
            id: "bgt_" + uid(),
            createdAt: now,
            updatedAt: now,
          };
          return {
            ...s,
            financeBudgets: [...(s.financeBudgets || []), newBudget],
          };
        }),

      updateBudget: (id, updates) =>
        update((s) => ({
          ...s,
          financeBudgets: (s.financeBudgets || []).map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        })),

      deleteBudget: (id) =>
        update((s) => ({
          ...s,
          financeBudgets: (s.financeBudgets || []).filter((b) => b.id !== id),
        })),

      addSavingsGoal: (goal) =>
        update((s) => {
          const now = new Date().toISOString();
          const newGoal: SavingsGoal = {
            ...goal,
            id: "svg_" + uid(),
            createdAt: now,
            updatedAt: now,
          };
          return {
            ...s,
            savingsGoals: [...(s.savingsGoals || []), newGoal],
          };
        }),

      updateSavingsGoal: (id, updates) =>
        update((s) => ({
          ...s,
          savingsGoals: (s.savingsGoals || []).map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          ),
        })),

      addSavingsContribution: (contrib) =>
        update((s) => {
          const now = new Date().toISOString();
          const newContrib: SavingsContribution = {
            ...contrib,
            id: "contrib_" + uid(),
            createdAt: now,
          };

          // If contribution is linked to an existing goal, update goal's progress without duplicate XP
          let updatedGoals = s.goals;
          const targetSavingsGoal = (s.savingsGoals || []).find((sg) => sg.id === contrib.savingsGoalId);
          if (targetSavingsGoal && targetSavingsGoal.linkedGoalId) {
            updatedGoals = (s.goals || []).map((g) => {
              if (g.id === targetSavingsGoal.linkedGoalId) {
                const currentVal = (g.currentValue || 0) + fromMinorUnits(contrib.amountMinor);
                return { ...g, currentValue: currentVal, updatedAt: now };
              }
              return g;
            });
          }

          return {
            ...s,
            goals: updatedGoals,
            savingsContributions: [newContrib, ...(s.savingsContributions || [])],
          };
        }),

      updateFinanceSettings: (settings) =>
        update((s) => ({
          ...s,
          financeSettings: { ...(s.financeSettings || DEFAULT_FINANCE_SETTINGS), ...settings },
        })),

      // ── Canonical Business Workspace ────────────────────────────────────
      updateBusinessProfile: (profile) =>
        update((s) => ({
          ...s,
          businessProfile: {
            ...(s.businessProfile || DEFAULT_BUSINESS_PROFILE),
            ...profile,
            updatedAt: new Date().toISOString(),
          },
        })),

      addBusinessProject: (project) => {
        const id = "proj_" + uid();
        const now = new Date().toISOString();
        const newProj: BusinessProject = {
          ...project,
          id,
          createdAt: now,
          updatedAt: now,
        };
        const event: BusinessActivityEvent = {
          id: "act_" + uid(),
          sourceType: "project",
          sourceId: id,
          eventType: "project_created",
          eventTimestamp: now,
          title: `Project "${newProj.title}" created`,
        };
        update((s) => ({
          ...s,
          businessProjects: [newProj, ...(s.businessProjects || [])],
          businessActivityEvents: [event, ...(s.businessActivityEvents || [])],
        }));
        return id;
      },

      updateBusinessProject: (id, updates) =>
        update((s) => {
          const now = new Date().toISOString();
          let event: BusinessActivityEvent | undefined;
          if (updates.status) {
            event = {
              id: "act_" + uid(),
              sourceType: "project",
              sourceId: id,
              eventType: "status_changed",
              eventTimestamp: now,
              title: `Project status updated to ${updates.status}`,
            };
          }
          return {
            ...s,
            businessProjects: (s.businessProjects || []).map((p) =>
              p.id === id ? { ...p, ...updates, updatedAt: now } : p
            ),
            businessActivityEvents: event
              ? [event, ...(s.businessActivityEvents || [])]
              : s.businessActivityEvents || [],
          };
        }),

      archiveBusinessProject: (id) =>
        update((s) => ({
          ...s,
          businessProjects: (s.businessProjects || []).map((p) =>
            p.id === id
              ? { ...p, status: "archived", archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      deleteBusinessProject: (id) =>
        update((s) => ({
          ...s,
          businessProjects: (s.businessProjects || []).filter((p) => p.id !== id),
          businessMilestones: (s.businessMilestones || []).filter((m) => m.projectId !== id),
          businessProjectTaskLinks: (s.businessProjectTaskLinks || []).filter((l) => l.projectId !== id),
        })),

      addProjectMilestone: (milestone) => {
        const id = "ms_" + uid();
        const now = new Date().toISOString();
        const newMs: ProjectMilestone = {
          ...milestone,
          id,
          createdAt: now,
          updatedAt: now,
        };
        update((s) => ({
          ...s,
          businessMilestones: [...(s.businessMilestones || []), newMs],
        }));
        return id;
      },

      updateProjectMilestone: (id, updates) =>
        update((s) => {
          const now = new Date().toISOString();
          let event: BusinessActivityEvent | undefined;
          if (updates.status === "completed") {
            event = {
              id: "act_" + uid(),
              sourceType: "milestone",
              sourceId: id,
              eventType: "milestone_completed",
              eventTimestamp: now,
              title: "Milestone marked completed",
            };
          }
          return {
            ...s,
            businessMilestones: (s.businessMilestones || []).map((m) =>
              m.id === id
                ? {
                    ...m,
                    ...updates,
                    completedAt: updates.status === "completed" ? now : m.completedAt,
                    updatedAt: now,
                  }
                : m
            ),
            businessActivityEvents: event
              ? [event, ...(s.businessActivityEvents || [])]
              : s.businessActivityEvents || [],
          };
        }),

      deleteProjectMilestone: (id) =>
        update((s) => ({
          ...s,
          businessMilestones: (s.businessMilestones || []).filter((m) => m.id !== id),
        })),

      addProjectTaskLink: (projectId, taskId, milestoneId) =>
        update((s) => {
          const exists = (s.businessProjectTaskLinks || []).some(
            (l) => l.projectId === projectId && l.taskId === taskId
          );
          if (exists) return s;
          const link: ProjectTaskLink = {
            id: "ptl_" + uid(),
            projectId,
            taskId,
            milestoneId,
            createdAt: new Date().toISOString(),
          };
          return {
            ...s,
            businessProjectTaskLinks: [...(s.businessProjectTaskLinks || []), link],
          };
        }),

      removeProjectTaskLink: (id) =>
        update((s) => ({
          ...s,
          businessProjectTaskLinks: (s.businessProjectTaskLinks || []).filter((l) => l.id !== id),
        })),

      addBusinessClient: (client) => {
        const id = "cli_" + uid();
        const now = new Date().toISOString();
        const newClient: BusinessClient = {
          ...client,
          id,
          createdAt: now,
          updatedAt: now,
        };
        const event: BusinessActivityEvent = {
          id: "act_" + uid(),
          sourceType: "client",
          sourceId: id,
          eventType: "client_created",
          eventTimestamp: now,
          title: `Client "${newClient.name}" added`,
        };
        update((s) => ({
          ...s,
          businessClients: [newClient, ...(s.businessClients || [])],
          businessActivityEvents: [event, ...(s.businessActivityEvents || [])],
        }));
        return id;
      },

      updateBusinessClient: (id, updates) =>
        update((s) => ({
          ...s,
          businessClients: (s.businessClients || []).map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),

      archiveBusinessClient: (id) =>
        update((s) => ({
          ...s,
          businessClients: (s.businessClients || []).map((c) =>
            c.id === id
              ? { ...c, status: "archived", archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : c
          ),
        })),

      deleteBusinessClient: (id) =>
        update((s) => ({
          ...s,
          businessClients: (s.businessClients || []).filter((c) => c.id !== id),
        })),

      addBusinessOffer: (offer) => {
        const id = "off_" + uid();
        const now = new Date().toISOString();
        const newOffer: BusinessOffer = {
          ...offer,
          id,
          createdAt: now,
          updatedAt: now,
        };
        update((s) => ({
          ...s,
          businessOffers: [newOffer, ...(s.businessOffers || [])],
        }));
        return id;
      },

      updateBusinessOffer: (id, updates) =>
        update((s) => ({
          ...s,
          businessOffers: (s.businessOffers || []).map((o) =>
            o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o
          ),
        })),

      archiveBusinessOffer: (id) =>
        update((s) => ({
          ...s,
          businessOffers: (s.businessOffers || []).map((o) =>
            o.id === id ? { ...o, status: "archived", updatedAt: new Date().toISOString() } : o
          ),
        })),

      deleteBusinessOffer: (id) =>
        update((s) => ({
          ...s,
          businessOffers: (s.businessOffers || []).filter((o) => o.id !== id),
        })),

      addBusinessInvoice: (invoice, lineItems) => {
        const id = "inv_" + uid();
        const now = new Date().toISOString();
        const newInv: BusinessInvoice = {
          ...invoice,
          id,
          createdAt: now,
          updatedAt: now,
        };
        const items: InvoiceLineItem[] = (lineItems || []).map((item, idx) => ({
          ...item,
          id: "ili_" + uid() + "_" + idx,
          invoiceId: id,
          createdAt: now,
          updatedAt: now,
        }));
        const event: BusinessActivityEvent = {
          id: "act_" + uid(),
          sourceType: "invoice",
          sourceId: id,
          eventType: "invoice_created",
          eventTimestamp: now,
          title: `Invoice #${newInv.invoiceNumber} created`,
        };
        update((s) => {
          const nextSeq = Math.max(
            (s.businessProfile?.nextInvoiceSequence || 1001) + 1,
            parseInt(newInv.invoiceNumber.replace(/\D/g, ""), 10) + 1 || 1002
          );
          return {
            ...s,
            businessInvoices: [newInv, ...(s.businessInvoices || [])],
            businessInvoiceLineItems: [...items, ...(s.businessInvoiceLineItems || [])],
            businessActivityEvents: [event, ...(s.businessActivityEvents || [])],
            businessProfile: {
              ...(s.businessProfile || DEFAULT_BUSINESS_PROFILE),
              nextInvoiceSequence: nextSeq,
            },
          };
        });
        return id;
      },

      updateBusinessInvoice: (id, updates) =>
        update((s) => ({
          ...s,
          businessInvoices: (s.businessInvoices || []).map((inv) =>
            inv.id === id ? { ...inv, ...updates, updatedAt: new Date().toISOString() } : inv
          ),
        })),

      deleteBusinessInvoice: (id) =>
        update((s) => ({
          ...s,
          businessInvoices: (s.businessInvoices || []).filter((inv) => inv.id !== id),
          businessInvoiceLineItems: (s.businessInvoiceLineItems || []).filter((li) => li.invoiceId !== id),
          businessInvoicePaymentLinks: (s.businessInvoicePaymentLinks || []).filter((pl) => pl.invoiceId !== id),
        })),

      recordBusinessInvoicePayment: ({ invoiceId, amountMinor, financeAccountId, localDate, note }) =>
        update((s) => {
          const invoice = (s.businessInvoices || []).find((inv) => inv.id === invoiceId);
          if (!invoice) return s;

          const now = new Date().toISOString();
          const txId = "tx_" + uid();
          const legId = "leg_" + uid();
          const primaryCurrency = invoice.currency || s.prefs?.currency || "MAD";

          // 1. Create canonical Finance Transaction
          const newTx: FinancialTransaction = {
            id: txId,
            type: "income",
            status: "posted",
            categoryId: "inc_business",
            merchantOrSource: `${invoice.invoiceNumber} Payment`,
            occurredAt: `${localDate}T12:00:00.000Z`,
            localDate,
            note: note || `Invoice ${invoice.invoiceNumber} payment`,
            sourceType: "business",
            sourceId: invoiceId,
            legs: [
              {
                id: legId,
                transactionId: txId,
                accountId: financeAccountId,
                signedAmountMinor: Math.abs(amountMinor),
                currency: primaryCurrency,
                legType: "destination",
                createdAt: now,
              },
            ],
            createdAt: now,
            updatedAt: now,
          };

          // 2. Create Payment Link
          const paymentLink: InvoicePaymentLink = {
            id: "pl_" + uid(),
            invoiceId,
            financeTransactionId: txId,
            amountMinor,
            currency: primaryCurrency,
            linkedAt: now,
          };

          const allLinks = [paymentLink, ...(s.businessInvoicePaymentLinks || [])];
          const allTxs = [newTx, ...(s.financialTransactions || [])];
          const fin = calculateInvoiceFinancials(invoice, allLinks, allTxs, localDate);

          const updatedInvoices = (s.businessInvoices || []).map((inv) =>
            inv.id === invoiceId
              ? { ...inv, status: fin.derivedStatus, updatedAt: now }
              : inv
          );

          const event: BusinessActivityEvent = {
            id: "act_" + uid(),
            sourceType: "payment",
            sourceId: invoiceId,
            eventType: "payment_recorded",
            eventTimestamp: now,
            title: `Payment received for Invoice #${invoice.invoiceNumber}`,
          };

          // Legacy money entry
          const legacyEntry: MoneyEntry = {
            id: txId,
            label: newTx.merchantOrSource,
            amount: fromMinorUnits(amountMinor),
            category: "inc_business",
            date: localDate,
          };

          return {
            ...s,
            financialTransactions: allTxs,
            businessInvoicePaymentLinks: allLinks,
            businessInvoices: updatedInvoices,
            businessActivityEvents: [event, ...(s.businessActivityEvents || [])],
            money: [legacyEntry, ...(s.money || [])],
          };
        }),

      addBusinessNote: (note) => {
        const id = "note_" + uid();
        const now = new Date().toISOString();
        const newNote: BusinessNote = {
          ...note,
          id,
          createdAt: now,
          updatedAt: now,
        };
        update((s) => ({
          ...s,
          businessNotes: [newNote, ...(s.businessNotes || [])],
        }));
        return id;
      },

      deleteBusinessNote: (id) =>
        update((s) => ({
          ...s,
          businessNotes: (s.businessNotes || []).filter((n) => n.id !== id),
        })),

      addBusinessAttachment: (att) => {
        const id = "att_" + uid();
        const now = new Date().toISOString();
        const newAtt: BusinessAttachment = {
          ...att,
          id,
          createdAt: now,
        };
        update((s) => ({
          ...s,
          businessAttachments: [newAtt, ...(s.businessAttachments || [])],
        }));
        return id;
      },

      deleteBusinessAttachment: (id) =>
        update((s) => ({
          ...s,
          businessAttachments: (s.businessAttachments || []).filter((a) => a.id !== id),
        })),

      // ── Study ────────────────────────────────────────────────────────────
      addStudyMinutes: (subject, mins) =>
        update((s) => {
          const date = todayKey();
          const studySessions = [{ date, subject, minutes: mins }, ...(s.studySessions || [])];
          const study = (s.study || []).map((b) =>
            b.subject.toLowerCase() === subject.toLowerCase()
              ? { ...b, minutes: b.minutes + mins }
              : b,
          );
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          const idempotencyKey = `study:${subject}:${date}:${Date.now()}`;
          addedXp = Math.min(30, Math.max(5, Math.round(mins / 5)));
          newLedger = [
            ...newLedger,
            {
              id: uid(),
              userId: s.user.id,
              sourceType: "study",
              sourceId: subject,
              amount: addedXp,
              localDate: date,
              idempotencyKey,
              createdAt: new Date().toISOString(),
            },
          ];
          return withAchievements({
            ...s,
            study,
            studySessions,
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      updateStudyTarget: (subject, target) =>
        update((s) => ({
          ...s,
          study: (s.study || []).map((b) => (b.subject === subject ? { ...b, target } : b)),
        })),

      addStudySubject: (subject, emoji, target) =>
        update((s) => ({
          ...s,
          study: [...(s.study || []), { id: uid(), subject, emoji, minutes: 0, target }],
        })),

      removeStudySubject: (id) =>
        update((s) => ({ ...s, study: (s.study || []).filter((b) => b.id !== id) })),

      // ── Books & Bookshelf (Unified Learning) ────────────────────
      addBook: (b) => {
        const id = b.id || uid();
        const normalized = normalizeBook({ ...b, id });
        update((s) => {
          const newLearningItem = normalizeLearningItem({
            id,
            type: "book",
            title: normalized.title,
            author: normalized.author,
            totalPages: normalized.totalPages,
            currentPage: normalized.currentPage || 0,
            icon: normalized.coverEmoji || "📗",
            status: normalized.status === "finished" ? "completed" : normalized.status === "paused" ? "paused" : "active",
          });
          return {
            ...s,
            books: [normalized, ...(s.books || []).filter((it) => it.id !== id)],
            learningItems: [newLearningItem, ...(s.learningItems || []).filter((it) => it.id !== id)],
          };
        });
        return id;
      },

      updateBook: (id, updates) =>
        update((s) => {
          const books = (s.books || []).map((b) =>
            b.id === id ? normalizeBook({ ...b, ...updates, updatedAt: new Date().toISOString() }) : b
          );
          const target = books.find((b) => b.id === id);
          const learningItems = (s.learningItems || []).map((it) => {
            if (it.id !== id || !target) return it;
            const progress = target.totalPages
              ? Math.min(100, Math.round(((target.currentPage || 0) / Math.max(1, target.totalPages)) * 100))
              : target.manualPercentage ?? it.progress;
            return {
              ...it,
              title: target.title,
              author: target.author,
              totalPages: target.totalPages,
              currentPage: target.currentPage,
              progress,
              status: (target.status === "finished" ? "completed" : target.status === "paused" ? "paused" : "active") as LearningItemStatus,
              updatedAt: new Date().toISOString(),
            };
          });
          return { ...s, books, learningItems };
        }),

      updateBookPage: (id, currentPage) =>
        update((s) => {
          const books = (s.books || []).map((b) => {
            if (b.id !== id) return b;
            const isFin = b.totalPages && currentPage >= b.totalPages;
            return {
              ...b,
              currentPage,
              status: isFin ? "finished" : b.status === "want_to_read" ? "reading" : b.status,
              finishedDate: isFin ? (b.finishedDate || todayKey()) : b.finishedDate,
              updatedAt: new Date().toISOString(),
            };
          });
          const target = books.find((b) => b.id === id);
          const learningItems = (s.learningItems || []).map((it) => {
            if (it.id !== id) return it;
            const progress = it.totalPages ? Math.min(100, Math.round((currentPage / Math.max(1, it.totalPages)) * 100)) : it.progress;
            return {
              ...it,
              currentPage,
              progress,
              status: (progress >= 100 ? "completed" : it.status === "completed" ? "active" : it.status) as LearningItemStatus,
              updatedAt: new Date().toISOString(),
            };
          });
          return { ...s, books, learningItems };
        }),

      removeBook: (id) =>
        update((s) => ({
          ...s,
          books: (s.books || []).filter((b) => b.id !== id),
          learningItems: (s.learningItems || []).filter((it) => it.id !== id),
        })),

      deleteBook: (id) =>
        update((s) => ({
          ...s,
          books: (s.books || []).filter((b) => b.id !== id),
          learningItems: (s.learningItems || []).filter((it) => it.id !== id),
        })),

      archiveBook: (id) =>
        update((s) => ({
          ...s,
          books: (s.books || []).map((b) =>
            b.id === id ? { ...b, isArchived: true, updatedAt: new Date().toISOString() } : b
          ),
        })),

      restoreBook: (id) =>
        update((s) => ({
          ...s,
          books: (s.books || []).map((b) =>
            b.id === id ? { ...b, isArchived: false, updatedAt: new Date().toISOString() } : b
          ),
        })),

      logReadingProgress: (bookId, params) =>
        update((s) => {
          const books = (s.books || []).map((b) => (b.id === bookId ? logReadingSession(b, params) : b));
          const target = books.find((b) => b.id === bookId);
          const learningItems = (s.learningItems || []).map((it) => {
            if (it.id !== bookId || !target) return it;
            const progress = target.totalPages
              ? Math.min(100, Math.round(((target.currentPage || 0) / Math.max(1, target.totalPages)) * 100))
              : target.manualPercentage ?? it.progress;
            return {
              ...it,
              currentPage: target.currentPage,
              progress,
              status: (target.status === "finished" ? "completed" : target.status === "paused" ? "paused" : "active") as LearningItemStatus,
              updatedAt: new Date().toISOString(),
            };
          });
          return { ...s, books, learningItems };
        }),

      startNewReadingCycle: (bookId, startDate) =>
        update((s) => ({
          ...s,
          books: (s.books || []).map((b) => (b.id === bookId ? startNewBookCycleHelper(b, startDate) : b)),
        })),

      addBookNote: (bookId, note) =>
        update((s) => ({
          ...s,
          books: (s.books || []).map((b) => (b.id === bookId ? addBookNoteHelper(b, note) : b)),
        })),

      deleteBookNote: (bookId, noteId) =>
        update((s) => ({
          ...s,
          books: (s.books || []).map((b) => (b.id === bookId ? deleteBookNoteHelper(b, noteId) : b)),
        })),

      setMonthlyReadingTarget: (target) =>
        update((s) => ({
          ...s,
          monthlyReadingTarget: target,
        })),

      addCourse: (c) => {
        const id = uid();
        update((s) => {
          const newCourse: Course = { ...c, id };
          const newLearningItem = normalizeLearningItem({
            id,
            type: "course",
            title: c.name,
            platform: c.platform,
            instructor: c.instructor,
            totalLessons: c.totalLessons,
            completedLessons: c.completedLessons || 0,
            progress: c.progress || 0,
            icon: "🎓",
            status: (c.completedLessons || 0) >= c.totalLessons ? "completed" : "active",
          });
          return {
            ...s,
            courses: [newCourse, ...(s.courses || [])],
            learningItems: [newLearningItem, ...(s.learningItems || [])],
          };
        });
      },

      updateCourseProgress: (id, completedLessons) =>
        update((s) => {
          const courses = (s.courses || []).map((c) => {
            if (c.id !== id) return c;
            const progress = Math.round((completedLessons / Math.max(1, c.totalLessons)) * 100);
            return { ...c, completedLessons, progress };
          });
          const learningItems = (s.learningItems || []).map((it) => {
            if (it.id !== id) return it;
            const total = it.totalLessons || 1;
            const progress = Math.min(100, Math.round((completedLessons / total) * 100));
            return {
              ...it,
              completedLessons,
              progress,
              status: (progress >= 100 ? "completed" : it.status === "completed" ? "active" : it.status) as LearningItemStatus,
              updatedAt: new Date().toISOString(),
            };
          });
          return { ...s, courses, learningItems };
        }),

      removeCourse: (id) =>
        update((s) => ({
          ...s,
          courses: (s.courses || []).filter((c) => c.id !== id),
          learningItems: (s.learningItems || []).filter((it) => it.id !== id),
        })),

      addSkill: (sItem) => {
        const id = uid();
        update((s) => {
          const newSkill: Skill = { ...sItem, id };
          const newLearningItem = normalizeLearningItem({
            id,
            type: "skill",
            title: sItem.name,
            level: sItem.level,
            progress: sItem.progress,
            icon: sItem.emoji || "🎯",
            status: sItem.progress >= 100 ? "completed" : "active",
          });
          return {
            ...s,
            skills: [newSkill, ...(s.skills || [])],
            learningItems: [newLearningItem, ...(s.learningItems || [])],
          };
        });
      },

      updateSkillProgress: (id, progress, level) =>
        update((s) => {
          const skills = (s.skills || []).map((item) => (item.id === id ? { ...item, progress, level } : item));
          const learningItems = (s.learningItems || []).map((it) =>
            it.id === id
              ? {
                  ...it,
                  progress,
                  level,
                  status: (progress >= 100 ? "completed" : it.status === "completed" ? "active" : it.status) as LearningItemStatus,
                  updatedAt: new Date().toISOString(),
                }
              : it
          );
          return { ...s, skills, learningItems };
        }),

      removeSkill: (id) =>
        update((s) => ({
          ...s,
          skills: (s.skills || []).filter((item) => item.id !== id),
          learningItems: (s.learningItems || []).filter((it) => it.id !== id),
        })),

      // ── Unified Learning Hub Actions ─────────────────────────────────────
      addLearningItem: (item) => {
        const id = uid();
        update((s) => {
          const newItem = normalizeLearningItem({ ...item, id });
          return {
            ...s,
            learningItems: [newItem, ...(s.learningItems || [])],
          };
        });
        return id;
      },

      editLearningItem: (id, updates) =>
        update((s) => ({
          ...s,
          learningItems: (s.learningItems || []).map((it) =>
            it.id === id
              ? normalizeLearningItem({ ...it, ...updates, updatedAt: new Date().toISOString() })
              : it
          ),
        })),

      updateLearningProgress: (id, progress, currentValue) =>
        update((s) => ({
          ...s,
          learningItems: (s.learningItems || []).map((it) => {
            if (it.id !== id) return it;
            const nextProgress = Math.min(100, Math.max(0, Math.round(progress)));
            return {
              ...it,
              progress: nextProgress,
              currentValue: currentValue !== undefined ? currentValue : it.currentValue,
              status: nextProgress >= 100 ? "completed" : it.status === "completed" ? "active" : it.status,
              completedAt: nextProgress >= 100 ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      pauseLearningItem: (id) =>
        update((s) => ({
          ...s,
          learningItems: (s.learningItems || []).map((it) =>
            it.id === id ? { ...it, status: "paused", updatedAt: new Date().toISOString() } : it
          ),
        })),

      resumeLearningItem: (id) =>
        update((s) => ({
          ...s,
          learningItems: (s.learningItems || []).map((it) =>
            it.id === id ? { ...it, status: "active", updatedAt: new Date().toISOString() } : it
          ),
        })),

      completeLearningItem: (id) =>
        update((s) => {
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          const idempotencyKey = `learning_complete:${id}:${todayKey()}`;
          if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
            addedXp = 50;
            newLedger = [
              ...newLedger,
              {
                id: uid(),
                userId: s.user.id,
                sourceType: "learning",
                sourceId: id,
                amount: 50,
                localDate: todayKey(),
                idempotencyKey,
                createdAt: new Date().toISOString(),
              },
            ];
          }
          return withAchievements({
            ...s,
            learningItems: (s.learningItems || []).map((it) =>
              it.id === id
                ? {
                    ...it,
                    status: "completed",
                    progress: 100,
                    completedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                : it
            ),
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      archiveLearningItem: (id) =>
        update((s) => ({
          ...s,
          learningItems: (s.learningItems || []).map((it) =>
            it.id === id ? { ...it, status: "archived", archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : it
          ),
        })),

      restoreLearningItem: (id) =>
        update((s) => ({
          ...s,
          learningItems: (s.learningItems || []).map((it) =>
            it.id === id ? { ...it, status: "active", archivedAt: undefined, updatedAt: new Date().toISOString() } : it
          ),
        })),

      removeLearningItem: (id) =>
        update((s) => ({
          ...s,
          learningItems: (s.learningItems || []).filter((it) => it.id !== id),
          learningModules: (s.learningModules || []).filter((m) => m.learningItemId !== id),
          learningLessons: (s.learningLessons || []).filter((l) => l.learningItemId !== id),
          learningPlanItems: (s.learningPlanItems || []).filter((p) => p.learningItemId !== id),
          learningResources: (s.learningResources || []).filter((r) => r.learningItemId !== id),
          learningNotes: (s.learningNotes || []).filter((n) => n.learningItemId !== id),
        })),

      // ── Modules & Lessons ────────────────────────────────────────────────
      addLearningModule: (module) => {
        const id = uid();
        update((s) => {
          const list = s.learningModules || [];
          const newModule: LearningModule = {
            ...module,
            id,
            order: list.filter((m) => m.learningItemId === module.learningItemId).length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            ...s,
            learningModules: [...list, newModule],
          };
        });
        return id;
      },

      editLearningModule: (id, updates) =>
        update((s) => ({
          ...s,
          learningModules: (s.learningModules || []).map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
          ),
        })),

      removeLearningModule: (id) =>
        update((s) => ({
          ...s,
          learningModules: (s.learningModules || []).filter((m) => m.id !== id),
          learningLessons: (s.learningLessons || []).filter((l) => l.moduleId !== id),
        })),

      reorderLearningModules: (learningItemId, modules) =>
        update((s) => {
          const other = (s.learningModules || []).filter((m) => m.learningItemId !== learningItemId);
          const updated = modules.map((m, idx) => ({ ...m, order: idx }));
          return {
            ...s,
            learningModules: [...other, ...updated],
          };
        }),

      addLearningLesson: (lesson) => {
        const id = uid();
        update((s) => {
          const list = s.learningLessons || [];
          const newLesson: LearningLesson = {
            ...lesson,
            id,
            status: lesson.status || "not_started",
            order: list.filter((l) => l.learningItemId === lesson.learningItemId).length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const nextLessons = [...list, newLesson];
          // Update item lesson counts
          const itemLessons = nextLessons.filter((l) => l.learningItemId === lesson.learningItemId);
          const completedCount = itemLessons.filter((l) => l.status === "completed").length;
          const learningItems = (s.learningItems || []).map((it) => {
            if (it.id !== lesson.learningItemId) return it;
            const progress = it.progressMethod === "lessons_completed"
              ? Math.min(100, Math.round((completedCount / Math.max(1, itemLessons.length)) * 100))
              : it.progress;
            return {
              ...it,
              totalLessons: itemLessons.length,
              completedLessons: completedCount,
              progress,
              updatedAt: new Date().toISOString(),
            };
          });
          return {
            ...s,
            learningLessons: nextLessons,
            learningItems,
          };
        });
        return id;
      },

      editLearningLesson: (id, updates) =>
        update((s) => ({
          ...s,
          learningLessons: (s.learningLessons || []).map((l) =>
            l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
          ),
        })),

      toggleLearningLesson: (id) =>
        update((s) => {
          const list = s.learningLessons || [];
          const target = list.find((l) => l.id === id);
          if (!target) return s;
          const willBeDone = target.status !== "completed";
          const nextStatus: LessonStatus = willBeDone ? "completed" : "not_started";
          const nextLessons = list.map((l) =>
            l.id === id
              ? {
                  ...l,
                  status: nextStatus,
                  completedAt: willBeDone ? new Date().toISOString() : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : l
          );

          // Update parent learning item lessons/progress
          const itemLessons = nextLessons.filter((l) => l.learningItemId === target.learningItemId);
          const completedCount = itemLessons.filter((l) => l.status === "completed").length;
          const learningItems = (s.learningItems || []).map((it) => {
            if (it.id !== target.learningItemId) return it;
            const progress = it.progressMethod === "lessons_completed"
              ? Math.min(100, Math.round((completedCount / Math.max(1, itemLessons.length)) * 100))
              : it.progress;
            return {
              ...it,
              completedLessons: completedCount,
              progress,
              status: (progress >= 100 ? "completed" : it.status === "completed" ? "active" : it.status) as LearningItemStatus,
              updatedAt: new Date().toISOString(),
            };
          });

          // Idempotent XP for completing lesson (once per lesson per day)
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          if (willBeDone) {
            const idempotencyKey = `lesson_complete:${id}:${todayKey()}`;
            if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
              addedXp = 15;
              newLedger = [
                ...newLedger,
                {
                  id: uid(),
                  userId: s.user.id,
                  sourceType: "learning_lesson",
                  sourceId: id,
                  amount: 15,
                  localDate: todayKey(),
                  idempotencyKey,
                  createdAt: new Date().toISOString(),
                },
              ];
            }
          }

          return withAchievements({
            ...s,
            learningLessons: nextLessons,
            learningItems,
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      removeLearningLesson: (id) =>
        update((s) => {
          const list = s.learningLessons || [];
          const target = list.find((l) => l.id === id);
          const nextLessons = list.filter((l) => l.id !== id);
          if (!target) return { ...s, learningLessons: nextLessons };

          const itemLessons = nextLessons.filter((l) => l.learningItemId === target.learningItemId);
          const completedCount = itemLessons.filter((l) => l.status === "completed").length;
          const learningItems = (s.learningItems || []).map((it) => {
            if (it.id !== target.learningItemId) return it;
            const progress = it.progressMethod === "lessons_completed"
              ? Math.min(100, Math.round((completedCount / Math.max(1, itemLessons.length)) * 100))
              : it.progress;
            return {
              ...it,
              totalLessons: itemLessons.length,
              completedLessons: completedCount,
              progress,
              status: (progress >= 100 ? "completed" : it.status === "completed" ? "active" : it.status) as LearningItemStatus,
              updatedAt: new Date().toISOString(),
            };
          });

          return { ...s, learningLessons: nextLessons, learningItems };
        }),

      reorderLearningLessons: (learningItemId, lessons) =>
        update((s) => {
          const other = (s.learningLessons || []).filter((l) => l.learningItemId !== learningItemId);
          const updated = lessons.map((l, idx) => ({ ...l, order: idx }));
          return {
            ...s,
            learningLessons: [...other, ...updated],
          };
        }),

      // ── Study Agenda & Plans ─────────────────────────────────────────────
      addLearningPlanItem: (plan) => {
        const id = uid();
        update((s) => {
          const newPlan: LearningPlanItem = {
            ...plan,
            id,
            type: plan.type || "session",
            status: plan.status || "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return {
            ...s,
            learningPlanItems: [newPlan, ...(s.learningPlanItems || [])],
          };
        });
        return id;
      },

      editLearningPlanItem: (id, updates) =>
        update((s) => ({
          ...s,
          learningPlanItems: (s.learningPlanItems || []).map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),

      toggleLearningPlanItem: (id) =>
        update((s) => ({
          ...s,
          learningPlanItems: (s.learningPlanItems || []).map((p) =>
            p.id === id
              ? { ...p, status: p.status === "completed" ? "pending" : "completed", updatedAt: new Date().toISOString() }
              : p
          ),
        })),

      removeLearningPlanItem: (id) =>
        update((s) => ({
          ...s,
          learningPlanItems: (s.learningPlanItems || []).filter((p) => p.id !== id),
        })),

      // ── Notes & Resources ────────────────────────────────────────────────
      addLearningResource: (res) => {
        const id = uid();
        update((s) => ({
          ...s,
          learningResources: [
            { ...res, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ...(s.learningResources || []),
          ],
        }));
        return id;
      },

      removeLearningResource: (id) =>
        update((s) => ({
          ...s,
          learningResources: (s.learningResources || []).filter((r) => r.id !== id),
        })),

      addLearningNote: (note) => {
        const id = uid();
        update((s) => ({
          ...s,
          learningNotes: [
            { ...note, id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ...(s.learningNotes || []),
          ],
        }));
        return id;
      },

      editLearningNote: (id, updates) =>
        update((s) => ({
          ...s,
          learningNotes: (s.learningNotes || []).map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        })),

      removeLearningNote: (id) =>
        update((s) => ({
          ...s,
          learningNotes: (s.learningNotes || []).filter((n) => n.id !== id),
        })),

      // ── Flashcard Decks & Spaced Repetition ──────────────────────────────
      addFlashcardDeck: (deck) => {
        const id = uid();
        update((s) => {
          const newDeck = normalizeFlashDeck({ ...deck, id });
          const decks = [newDeck, ...(s.flashcardDecks || [])];
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("proplanner_flashcards_v1", JSON.stringify(decks));
            }
          } catch { /* ignore */ }
          return { ...s, flashcardDecks: decks };
        });
        return id;
      },

      editFlashcardDeck: (id, updates) =>
        update((s) => {
          const decks = (s.flashcardDecks || []).map((d) =>
            d.id === id ? normalizeFlashDeck({ ...d, ...updates, updatedAt: new Date().toISOString() }) : d
          );
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("proplanner_flashcards_v1", JSON.stringify(decks));
            }
          } catch { /* ignore */ }
          return { ...s, flashcardDecks: decks };
        }),

      removeFlashcardDeck: (id) =>
        update((s) => {
          const decks = (s.flashcardDecks || []).filter((d) => d.id !== id);
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("proplanner_flashcards_v1", JSON.stringify(decks));
            }
          } catch { /* ignore */ }
          return { ...s, flashcardDecks: decks };
        }),

      addFlashcard: (deckId, card) => {
        const cardId = uid();
        update((s) => {
          const decks = (s.flashcardDecks || []).map((d) => {
            if (d.id !== deckId) return d;
            const newCard: FlashCard = {
              id: cardId,
              deckId,
              front: card.front.trim(),
              back: card.back.trim(),
              hint: card.hint?.trim() || undefined,
              explanation: card.explanation?.trim() || undefined,
              tags: card.tags || [],
              state: "new",
              easeFactor: 2.5,
              interval: 0,
              repetitions: 0,
              nextReview: todayKey(),
              dueAt: todayKey(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return {
              ...d,
              cards: [...(d.cards || []), newCard],
              updatedAt: new Date().toISOString(),
            };
          });
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("proplanner_flashcards_v1", JSON.stringify(decks));
            }
          } catch { /* ignore */ }
          return { ...s, flashcardDecks: decks };
        });
        return cardId;
      },

      editFlashcard: (deckId, cardId, updates) =>
        update((s) => {
          const decks = (s.flashcardDecks || []).map((d) => {
            if (d.id !== deckId) return d;
            return {
              ...d,
              cards: (d.cards || []).map((c) => (c.id === cardId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)),
              updatedAt: new Date().toISOString(),
            };
          });
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("proplanner_flashcards_v1", JSON.stringify(decks));
            }
          } catch { /* ignore */ }
          return { ...s, flashcardDecks: decks };
        }),

      removeFlashcard: (deckId, cardId) =>
        update((s) => {
          const decks = (s.flashcardDecks || []).map((d) => {
            if (d.id !== deckId) return d;
            return {
              ...d,
              cards: (d.cards || []).filter((c) => c.id !== cardId),
              updatedAt: new Date().toISOString(),
            };
          });
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("proplanner_flashcards_v1", JSON.stringify(decks));
            }
          } catch { /* ignore */ }
          return { ...s, flashcardDecks: decks };
        }),

      reviewFlashcard: (deckId, cardId, rating) =>
        update((s) => {
          const decks = (s.flashcardDecks || []).map((d) => {
            if (d.id !== deckId) return d;
            return {
              ...d,
              cards: (d.cards || []).map((c) => (c.id === cardId ? sm2(c, rating) : c)),
              updatedAt: new Date().toISOString(),
            };
          });
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("proplanner_flashcards_v1", JSON.stringify(decks));
            }
          } catch { /* ignore */ }
          return {
            ...s,
            flashcardDecks: decks,
            totalFlashcardsReviewed: s.totalFlashcardsReviewed + 1,
          };
        }),

      undoFlashcardReview: (deckId, cardId) =>
        update((s) => {
          const decks = (s.flashcardDecks || []).map((d) => {
            if (d.id !== deckId) return d;
            return {
              ...d,
              cards: (d.cards || []).map((c) => (c.id === cardId ? undoSm2(c) : c)),
              updatedAt: new Date().toISOString(),
            };
          });
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("proplanner_flashcards_v1", JSON.stringify(decks));
            }
          } catch { /* ignore */ }
          return {
            ...s,
            flashcardDecks: decks,
            totalFlashcardsReviewed: Math.max(0, s.totalFlashcardsReviewed - 1),
          };
        }),

      recordReviewSession: (session) =>
        update((s) => {
          const id = uid();
          const newSession: ReviewSessionSummary = { ...session, id };
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          const idempotencyKey = `review_session:${id}:${todayKey()}`;
          if (session.reviewedCount > 0 && !newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
            addedXp = Math.min(30, Math.max(5, session.reviewedCount * 2));
            newLedger = [
              ...newLedger,
              {
                id: uid(),
                userId: s.user.id,
                sourceType: "flashcard_review",
                sourceId: id,
                amount: addedXp,
                localDate: todayKey(),
                idempotencyKey,
                createdAt: new Date().toISOString(),
              },
            ];
          }
          return withAchievements({
            ...s,
            reviewSessions: [newSession, ...(s.reviewSessions || [])],
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      // ── Self-Care ────────────────────────────────────────────────────────
      toggleSelfcare: (id) =>
        update((s) => {
          const list = s.selfcare || [];
          const target = list.find((item) => item.id === id);
          if (!target) return s;
          const willBeDone = !target.done;
          return {
            ...s,
            selfcare: list.map((item) =>
              item.id === id ? { ...item, done: willBeDone, doneDate: willBeDone ? todayKey() : undefined } : item,
            ),
          };
        }),

      addSelfcareItem: (emoji, label) =>
        update((s) => ({
          ...s,
          selfcare: [...(s.selfcare || []), { id: uid(), emoji, label, done: false }],
        })),

      removeSelfcareItem: (id) =>
        update((s) => ({ ...s, selfcare: (s.selfcare || []).filter((item) => item.id !== id) })),

      // ── Pixels (Legacy) ──────────────────────────────────────────────────
      setPixel: (date, moodVal) =>
        update((s) => {
          const dKey = date || todayKey();
          const filtered = (s.pixels || []).filter((p) => p.date !== dKey);
          return {
            ...s,
            pixels: [...filtered, { date: dKey, mood: moodVal }],
          };
        }),

      // ── Trips ────────────────────────────────────────────────────────────
      addTrip: (t) =>
        update((s) => ({
          ...s,
          trips: [{ ...t, id: uid() }, ...(s.trips || [])],
        })),

      updateTripSaved: (id, saved) =>
        update((s) => ({
          ...s,
          trips: (s.trips || []).map((t) => (t.id === id ? { ...t, saved } : t)),
        })),

      toggleTripChecklist: (tripId, itemId) =>
        update((s) => ({
          ...s,
          trips: (s.trips || []).map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              checklist: t.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)),
            };
          }),
        })),

      addTripChecklistItem: (tripId, label) =>
        update((s) => ({
          ...s,
          trips: (s.trips || []).map((t) => {
            if (t.id !== tripId) return t;
            return {
              ...t,
              checklist: [...t.checklist, { id: uid(), label, done: false }],
            };
          }),
        })),

      removeTrip: (id) =>
        update((s) => ({ ...s, trips: (s.trips || []).filter((t) => t.id !== id) })),

      // ── Canonical Travel Workspace ──────────────────────────────────────────
      createTravelTrip: (trip) => {
        const id = uid();
        const now = new Date().toISOString();
        const newTrip: TravelTrip = {
          ...trip,
          id,
          createdAt: now,
          updatedAt: now,
        };
        const daysToCreate = generateItineraryDays(
          id,
          trip.startDate,
          trip.endDate,
          trip.destinationTimezone || "UTC"
        );
        const newDays: TravelDay[] = daysToCreate.map((d) => ({
          ...d,
          id: uid(),
          createdAt: now,
          updatedAt: now,
        }));
        update((s) => ({
          ...s,
          travelTrips: [newTrip, ...(s.travelTrips || [])],
          travelDays: [...(s.travelDays || []), ...newDays],
        }));
        return id;
      },

      updateTravelTrip: (id, updates) =>
        update((s) => ({
          ...s,
          travelTrips: (s.travelTrips || []).map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTravelTrip: (id) =>
        update((s) => ({
          ...s,
          travelTrips: (s.travelTrips || []).filter((t) => t.id !== id),
          travelDays: (s.travelDays || []).filter((d) => d.tripId !== id),
          itineraryItems: (s.itineraryItems || []).filter((i) => i.tripId !== id),
          travelBookings: (s.travelBookings || []).filter((b) => b.tripId !== id),
          travelChecklistItems: (s.travelChecklistItems || []).filter((c) => c.tripId !== id),
          travelDocuments: (s.travelDocuments || []).filter((doc) => doc.tripId !== id),
          travelMemories: (s.travelMemories || []).filter((m) => m.tripId !== id),
        })),

      completeTravelTrip: (id) =>
        update((s) => ({
          ...s,
          travelTrips: (s.travelTrips || []).map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      archiveTravelTrip: (id) =>
        update((s) => ({
          ...s,
          travelTrips: (s.travelTrips || []).map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "archived",
                  archivedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      addItineraryDay: (day) => {
        const id = uid();
        const newDay: TravelDay = {
          ...day,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        update((s) => ({ ...s, travelDays: [...(s.travelDays || []), newDay] }));
        return id;
      },

      updateItineraryDay: (id, updates) =>
        update((s) => ({
          ...s,
          travelDays: (s.travelDays || []).map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        })),

      deleteItineraryDay: (id) =>
        update((s) => ({
          ...s,
          travelDays: (s.travelDays || []).filter((d) => d.id !== id),
          itineraryItems: (s.itineraryItems || []).filter((i) => i.travelDayId !== id),
        })),

      addItineraryItem: (item) => {
        const id = uid();
        const newItem: ItineraryItem = {
          ...item,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        update((s) => ({ ...s, itineraryItems: [...(s.itineraryItems || []), newItem] }));
        return id;
      },

      updateItineraryItem: (id, updates) =>
        update((s) => ({
          ...s,
          itineraryItems: (s.itineraryItems || []).map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
          ),
        })),

      deleteItineraryItem: (id) =>
        update((s) => ({
          ...s,
          itineraryItems: (s.itineraryItems || []).filter((i) => i.id !== id),
        })),

      reorderItineraryItem: (tripId, travelDayId, itemId, direction) =>
        update((s) => {
          const dayItems = (s.itineraryItems || [])
            .filter((i) => i.tripId === tripId && i.travelDayId === travelDayId)
            .sort((a, b) => a.order - b.order);
          const idx = dayItems.findIndex((i) => i.id === itemId);
          if (idx === -1) return s;
          const targetIdx = direction === "up" ? idx - 1 : idx + 1;
          if (targetIdx < 0 || targetIdx >= dayItems.length) return s;

          const swapped = [...dayItems];
          const temp = swapped[idx];
          swapped[idx] = swapped[targetIdx];
          swapped[targetIdx] = temp;

          const updatedMap = new Map(swapped.map((it, order) => [it.id, order]));
          return {
            ...s,
            itineraryItems: (s.itineraryItems || []).map((i) =>
              updatedMap.has(i.id) ? { ...i, order: updatedMap.get(i.id)! } : i
            ),
          };
        }),

      addTravelBooking: (booking) => {
        const id = uid();
        const newBooking: TravelBooking = {
          ...booking,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        update((s) => ({ ...s, travelBookings: [newBooking, ...(s.travelBookings || [])] }));
        return id;
      },

      updateTravelBooking: (id, updates) =>
        update((s) => ({
          ...s,
          travelBookings: (s.travelBookings || []).map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        })),

      deleteTravelBooking: (id) =>
        update((s) => ({
          ...s,
          travelBookings: (s.travelBookings || []).filter((b) => b.id !== id),
        })),

      addTravelChecklistItem: (item) => {
        const id = uid();
        const newItem: TravelChecklistItem = {
          ...item,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        update((s) => ({ ...s, travelChecklistItems: [...(s.travelChecklistItems || []), newItem] }));
        return id;
      },

      updateTravelChecklistItem: (id, updates) =>
        update((s) => ({
          ...s,
          travelChecklistItems: (s.travelChecklistItems || []).map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),

      deleteTravelChecklistItem: (id) =>
        update((s) => ({
          ...s,
          travelChecklistItems: (s.travelChecklistItems || []).filter((c) => c.id !== id),
        })),

      toggleTravelChecklistItem: (id) =>
        update((s) => ({
          ...s,
          travelChecklistItems: (s.travelChecklistItems || []).map((c) => {
            if (c.id !== id) return c;
            const completed = !c.completed;
            return {
              ...c,
              completed,
              completedAt: completed ? new Date().toISOString() : undefined,
              updatedAt: new Date().toISOString(),
            };
          }),
        })),

      importChecklistTemplate: (tripId, templateItems) =>
        update((s) => {
          const existingForTrip = (s.travelChecklistItems || []).filter((c) => c.tripId === tripId);
          const existingTitles = new Set(existingForTrip.map((c) => c.title.toLowerCase().trim()));
          const newItems: TravelChecklistItem[] = [];
          let order = existingForTrip.length;

          for (const item of templateItems) {
            if (existingTitles.has(item.title.toLowerCase().trim())) continue;
            newItems.push({
              id: uid(),
              tripId,
              category: item.category,
              title: item.title,
              required: item.required,
              completed: false,
              order: order++,
              contributionMode: "checklist_only",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }

          return {
            ...s,
            travelChecklistItems: [...(s.travelChecklistItems || []), ...newItems],
          };
        }),

      addTravelDocument: (doc) => {
        const id = uid();
        const newDoc: TravelDocument = {
          ...doc,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        update((s) => ({ ...s, travelDocuments: [newDoc, ...(s.travelDocuments || [])] }));
        return id;
      },

      updateTravelDocument: (id, updates) =>
        update((s) => ({
          ...s,
          travelDocuments: (s.travelDocuments || []).map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        })),

      deleteTravelDocument: (id) =>
        update((s) => ({
          ...s,
          travelDocuments: (s.travelDocuments || []).filter((d) => d.id !== id),
        })),

      addBucketListItem: (item) => {
        const id = uid();
        const newItem: BucketListItem = {
          ...item,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        update((s) => ({ ...s, bucketListItems: [newItem, ...(s.bucketListItems || [])] }));
        return id;
      },

      updateBucketListItem: (id, updates) =>
        update((s) => ({
          ...s,
          bucketListItems: (s.bucketListItems || []).map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          ),
        })),

      deleteBucketListItem: (id) =>
        update((s) => ({
          ...s,
          bucketListItems: (s.bucketListItems || []).filter((b) => b.id !== id),
        })),

      convertBucketListToTrip: (bucketItemId, startDate, endDate) => {
        const tripId = uid();
        const now = new Date().toISOString();
        update((s) => {
          const targetBucket = (s.bucketListItems || []).find((b) => b.id === bucketItemId);
          if (!targetBucket) return s;

          const newTrip: TravelTrip = {
            id: tripId,
            title: targetBucket.destination,
            primaryCity: targetBucket.destination,
            countryCode: targetBucket.countryCode,
            coverStorageReference: targetBucket.coverStorageReference,
            startDate,
            endDate,
            travelerCount: 1,
            status: "planning",
            primaryCurrency: targetBucket.currency || s.prefs?.currency || "MAD",
            estimatedBudgetMinor: targetBucket.estimatedBudgetMinor || 0,
            notes: targetBucket.personalReason ? `Reason: ${targetBucket.personalReason}` : undefined,
            createdAt: now,
            updatedAt: now,
          };

          const daysToCreate = generateItineraryDays(tripId, startDate, endDate, "UTC");
          const newDays: TravelDay[] = daysToCreate.map((d) => ({
            ...d,
            id: uid(),
            createdAt: now,
            updatedAt: now,
          }));

          return {
            ...s,
            travelTrips: [newTrip, ...(s.travelTrips || [])],
            travelDays: [...(s.travelDays || []), ...newDays],
            bucketListItems: (s.bucketListItems || []).map((b) =>
              b.id === bucketItemId
                ? { ...b, status: "converted", convertedTripId: tripId, updatedAt: now }
                : b
            ),
          };
        });
        return tripId;
      },

      addTravelMemory: (memory) => {
        const id = uid();
        const newMemory: TravelMemory = {
          ...memory,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        update((s) => ({ ...s, travelMemories: [newMemory, ...(s.travelMemories || [])] }));
        return id;
      },

      deleteTravelMemory: (id) =>
        update((s) => ({
          ...s,
          travelMemories: (s.travelMemories || []).filter((m) => m.id !== id),
        })),

      sendTravelMemoryToJournal: (memoryId) => {
        const journalId = uid();
        update((s) => {
          const memory = (s.travelMemories || []).find((m) => m.id === memoryId);
          if (!memory) return s;
          const trip = (s.travelTrips || []).find((t) => t.id === memory.tripId);
          const tripName = trip?.primaryCity || trip?.title || "Travel";

          const newJournalEntry = normalizeJournalEntry({
            id: journalId,
            date: memory.localDate || todayKey(),
            title: `✈️ ${tripName}: ${memory.caption}`,
            body: memory.reflection || memory.caption,
            mood: "peaceful",
            tags: ["Travel", tripName],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          return {
            ...s,
            journal: [newJournalEntry, ...(s.journal || [])],
            travelMemories: (s.travelMemories || []).map((m) =>
              m.id === memoryId ? { ...m, linkedJournalEntryId: journalId, updatedAt: new Date().toISOString() } : m
            ),
          };
        });
        return journalId;
      },

      updateTravelSettings: (settings) =>
        update((s) => ({
          ...s,
          travelSettings: {
            ...(s.travelSettings || DEFAULT_TRAVEL_SETTINGS),
            ...settings,
            updatedAt: new Date().toISOString(),
          },
        })),

      recordTravelExpense: (expense) => {
        const txId = uid();
        const amtMinor = toMinorUnits(expense.amountStr);
        const now = new Date().toISOString();

        update((s) => {
          const acc = (s.financeAccounts || []).find((a) => a.id === expense.accountId) || s.financeAccounts[0];
          const curr = acc?.currency || s.prefs?.currency || "MAD";

          const leg: FinancialTransactionLeg = {
            id: uid(),
            transactionId: txId,
            accountId: acc?.id || "acc_default",
            signedAmountMinor: -Math.abs(amtMinor),
            currency: curr,
            legType: "source",
            createdAt: now,
          };

          const newTx: FinancialTransaction = {
            id: txId,
            occurredAt: now,
            localDate: expense.date,
            type: "expense",
            status: "posted",
            merchantOrSource: expense.merchantOrSource,
            categoryId: expense.categoryId,
            note: expense.note,
            sourceType: "travel",
            sourceId: expense.tripId,
            tags: ["Travel", `trip:${expense.tripId}`],
            legs: [leg],
            createdAt: now,
            updatedAt: now,
          };

          return {
            ...s,
            financialTransactions: [newTx, ...(s.financialTransactions || [])],
          };
        });

        return txId;
      },

      // ── Flashcards ───────────────────────────────────────────────────────
      incrementFlashcardsReviewed: (count) =>
        update((s) => ({
          ...s,
          totalFlashcardsReviewed: (s.totalFlashcardsReviewed || 0) + count,
        })),

      // ── More Preferences & Visits ───────────────────────────────────────
      updateMorePreferences: (prefs) =>
        update((s) => ({
          ...s,
          morePreferences: {
            ...(s.morePreferences || {
              pinnedModuleIds: ["my-deen", "habits", "goals", "routines"],
              hiddenModuleIds: [],
              customModuleOrder: [],
              updatedAt: new Date().toISOString(),
              schemaVersion: 1,
            }),
            ...prefs,
            updatedAt: new Date().toISOString(),
          },
        })),

      trackModuleVisit: (moduleId) =>
        update((s) => {
          const prev = s.recentModuleVisits || [];
          const filtered = prev.filter((v) => v.moduleId !== moduleId);
          return {
            ...s,
            recentModuleVisits: [
              { moduleId, lastVisitedAt: new Date().toISOString() },
              ...filtered,
            ].slice(0, 20),
          };
        }),

      resetMorePreferences: () =>
        update((s) => ({
          ...s,
          morePreferences: {
            pinnedModuleIds: ["my-deen", "habits", "goals", "routines"],
            hiddenModuleIds: [],
            customModuleOrder: [],
            updatedAt: new Date().toISOString(),
            schemaVersion: 1,
          },
        })),

      // ── Deen & Islamic Companion ─────────────────────────────────────────
      togglePrayerLog: (date, prayerKey, note) =>
        update((s) => {
          const dKey = date || todayKey();
          const logKey = `${dKey}_${prayerKey}`;
          const prev = s.prayerLogs?.[logKey];
          const isDone = !prev?.logged;
          const updatedLogs = {
            ...(s.prayerLogs || {}),
            [logKey]: {
              logged: isDone,
              loggedAt: isDone ? new Date().toISOString() : undefined,
              note: note !== undefined ? note : prev?.note,
            },
          };
          return {
            ...s,
            prayerLogs: updatedLogs,
          };
        }),

      logQuranProgress: (date, amount, unit = "pages") =>
        update((s) => {
          if (amount <= 0) return s;
          const dKey = date || todayKey();
          const newEvent: QuranProgressEvent = {
            id: uid(),
            localDate: dKey,
            amount,
            unit,
            timestamp: new Date().toISOString(),
            idempotencyKey: `quran_${dKey}_${Date.now()}`,
          };
          return {
            ...s,
            quranHistory: [newEvent, ...(s.quranHistory || [])],
          };
        }),

      undoLatestQuranProgress: () =>
        update((s) => {
          const list = s.quranHistory || [];
          if (list.length === 0) return s;
          const today = todayKey();
          const todayIndex = list.findIndex((e) => e.localDate === today);
          if (todayIndex === -1) return s;
          const updated = [...list];
          updated.splice(todayIndex, 1);
          return {
            ...s,
            quranHistory: updated,
          };
        }),

      updateQuranGoal: (target, method, targetDate) =>
        update((s) => ({
          ...s,
          quranGoal: {
            progressMethod: method || s.quranGoal?.progressMethod || "pages",
            dailyTarget: Math.max(1, target),
            targetDate: targetDate !== undefined ? targetDate : s.quranGoal?.targetDate,
          },
        })),

      setSurahStatus: (surahId, status) =>
        update((s) => ({
          ...s,
          surahProgress: {
            ...(s.surahProgress || {}),
            [surahId]: {
              status,
              completedAt: status === "completed" ? new Date().toISOString() : undefined,
            },
          },
        })),

      addSadaqahEntry: (entry) =>
        update((s) => {
          const newEntry: SadaqahEntry = {
            ...entry,
            id: uid(),
            createdAt: new Date().toISOString(),
          };
          return {
            ...s,
            sadaqahLogs: [newEntry, ...(s.sadaqahLogs || [])],
          };
        }),

      removeSadaqahEntry: (id) =>
        update((s) => ({
          ...s,
          sadaqahLogs: (s.sadaqahLogs || []).filter((e) => e.id !== id),
        })),

      toggleGoodDeedLog: (date, deedId) =>
        update((s) => {
          const dKey = date || todayKey();
          const logKey = `${dKey}_${deedId}`;
          const current = Boolean(s.goodDeedLogs?.[logKey]);
          return {
            ...s,
            goodDeedLogs: {
              ...(s.goodDeedLogs || {}),
              [logKey]: !current,
            },
          };
        }),

      addCustomGoodDeed: (titleEn, titleAr) =>
        update((s) => ({
          ...s,
          goodDeeds: [
            ...(s.goodDeeds || []),
            {
              id: `custom_${uid()}`,
              titleEn,
              titleAr,
              category: "custom",
              isCustom: true,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeGoodDeed: (deedId) =>
        update((s) => ({
          ...s,
          goodDeeds: (s.goodDeeds || []).filter((d) => d.id !== deedId),
        })),

      updateDeenSettings: (settings) =>
        update((s) => ({
          ...s,
          deenSettings: {
            ...(s.deenSettings || defaultState.deenSettings!),
            ...settings,
          },
        })),

      toggleTrackingPause: (paused, untilDate) =>
        update((s) => ({
          ...s,
          deenSettings: {
            ...(s.deenSettings || defaultState.deenSettings!),
            trackingPaused: paused,
            trackingPauseUntil: paused ? untilDate : undefined,
          },
        })),

      updateActiveTasbih: (updates) =>
        update((s) => ({
          ...s,
          activeTasbih: {
            ...(s.activeTasbih || defaultState.activeTasbih!),
            ...updates,
          },
        })),

      // ── Focus & Pomodoro Canonical Engine ────────────────────────────────
      startFocusSession: (params) => {
        let createdSession: FocusSession | null = null;
        update((s) => {
          // If already running, prevent duplicate creation
          if (s.activeFocusSession && (s.activeFocusSession.status === "running" || s.activeFocusSession.status === "paused" || s.activeFocusSession.status === "break_running" || s.activeFocusSession.status === "break_paused")) {
            createdSession = s.activeFocusSession;
            return s;
          }

          const nowIso = new Date().toISOString();
          const plannedSec = Math.max(1, params.plannedFocusSeconds);
          const plannedEndAt = params.mode === "stopwatch"
            ? undefined
            : new Date(Date.now() + plannedSec * 1000).toISOString();

          const newSession: FocusSession = {
            id: uid(),
            userId: s.user.id,
            mode: params.mode,
            status: "running",
            phase: "focus",
            sourceType: params.sourceType,
            sourceId: params.sourceId,
            sourceLabelSnapshot: params.sourceLabelSnapshot,
            presetId: params.presetId,
            plannedFocusSeconds: plannedSec,
            plannedShortBreakSeconds: params.plannedShortBreakSeconds || 300,
            plannedLongBreakSeconds: params.plannedLongBreakSeconds || 900,
            plannedCycles: params.plannedCycles || 4,
            currentCycle: 1,
            startedAt: nowIso,
            plannedEndAt,
            totalPausedSeconds: 0,
            actualFocusSeconds: 0,
            actualBreakSeconds: 0,
            localDate: todayKey(),
            ambientSoundId: params.ambientSoundId,
            idempotencyKey: `focus_${uid()}_${Date.now()}`,
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          createdSession = newSession;
          return {
            ...s,
            activeFocusSession: newSession,
          };
        });
        return createdSession!;
      },

      pauseFocusSession: () =>
        update((s) => {
          if (!s.activeFocusSession) return s;
          const current = s.activeFocusSession;
          if (current.status !== "running" && current.status !== "break_running") return s;
          const nowIso = new Date().toISOString();
          const nextStatus = current.phase === "focus" ? "paused" : "break_paused";
          return {
            ...s,
            activeFocusSession: {
              ...current,
              status: nextStatus,
              pausedAt: nowIso,
              updatedAt: nowIso,
            },
          };
        }),

      resumeFocusSession: () =>
        update((s) => {
          if (!s.activeFocusSession) return s;
          const current = s.activeFocusSession;
          if (current.status !== "paused" && current.status !== "break_paused") return s;
          const nowMs = Date.now();
          const pausedAtMs = current.pausedAt ? new Date(current.pausedAt).getTime() : nowMs;
          const pauseSec = Math.max(0, Math.floor((nowMs - pausedAtMs) / 1000));
          const totalPaused = (current.totalPausedSeconds || 0) + pauseSec;
          const nextStatus = current.phase === "focus" ? "running" : "break_running";

          let plannedEndAt = current.plannedEndAt;
          if (plannedEndAt && current.mode !== "stopwatch") {
            const prevEndMs = new Date(plannedEndAt).getTime();
            plannedEndAt = new Date(prevEndMs + pauseSec * 1000).toISOString();
          }

          return {
            ...s,
            activeFocusSession: {
              ...current,
              status: nextStatus,
              pausedAt: undefined,
              totalPausedSeconds: totalPaused,
              plannedEndAt,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      extendFocusSession: (extraMinutes = 5) =>
        update((s) => {
          if (!s.activeFocusSession) return s;
          const current = s.activeFocusSession;
          const extraSec = extraMinutes * 60;
          const newPlanned = current.plannedFocusSeconds + extraSec;
          let newEnd = current.plannedEndAt;
          if (newEnd) {
            newEnd = new Date(new Date(newEnd).getTime() + extraSec * 1000).toISOString();
          }
          return {
            ...s,
            activeFocusSession: {
              ...current,
              plannedFocusSeconds: newPlanned,
              plannedEndAt: newEnd,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      transitionFocusPhase: (nextPhase) =>
        update((s) => {
          if (!s.activeFocusSession) return s;
          const current = s.activeFocusSession;
          const nowIso = new Date().toISOString();

          let durationSec = current.plannedFocusSeconds;
          let nextStatus: FocusSessionStatus = "running";
          let currentCycle = current.currentCycle;

          if (nextPhase === "short_break") {
            durationSec = current.plannedShortBreakSeconds;
            nextStatus = "break_running";
          } else if (nextPhase === "long_break") {
            durationSec = current.plannedLongBreakSeconds;
            nextStatus = "break_running";
          } else {
            // Returning to focus phase for next cycle
            currentCycle += 1;
            nextStatus = "running";
          }

          const plannedEndAt = current.mode === "stopwatch"
            ? undefined
            : new Date(Date.now() + durationSec * 1000).toISOString();

          return {
            ...s,
            activeFocusSession: {
              ...current,
              phase: nextPhase,
              status: nextStatus,
              currentCycle,
              startedAt: nowIso,
              plannedEndAt,
              pausedAt: undefined,
              totalPausedSeconds: 0,
              updatedAt: nowIso,
            },
          };
        }),

      finishFocusSessionEarly: (rating, note) =>
        update((s) => {
          if (!s.activeFocusSession) return s;
          const current = s.activeFocusSession;
          const nowIso = new Date().toISOString();
          const startMs = new Date(current.startedAt).getTime();
          const totalPausedMs = (current.totalPausedSeconds || 0) * 1000;
          const elapsedSec = Math.max(0, Math.floor((Date.now() - startMs - totalPausedMs) / 1000));
          const actualFocusSec = Math.min(current.plannedFocusSeconds, elapsedSec);
          const actualFocusMins = Math.round(actualFocusSec / 60);

          const completedRecord: FocusSession = {
            ...current,
            status: "completed",
            completionType: "early",
            actualFocusSeconds: actualFocusSec,
            endedAt: nowIso,
            focusRating: rating,
            privateNote: note,
            updatedAt: nowIso,
          };

          // If linked to a study subject or learning item, update subject minutes, studySessions and learningItems
          let study = s.study || [];
          let studySessions = s.studySessions || [];
          let learningItems = s.learningItems || [];
          if ((current.sourceType === "subject" || current.sourceType === "learning" || (current as any).contextType === "subject") && actualFocusMins > 0) {
            const subjName = current.sourceLabelSnapshot;
            study = study.map((b) =>
              b.subject.toLowerCase() === subjName.toLowerCase()
                ? { ...b, minutes: b.minutes + actualFocusMins }
                : b
            );
            studySessions = [{ date: current.localDate, subject: subjName, minutes: actualFocusMins }, ...studySessions];
            learningItems = learningItems.map((it) => {
              if (it.id === current.sourceId || it.title.toLowerCase() === subjName.toLowerCase()) {
                const currentMinutes = (it.currentValue || 0) + actualFocusMins;
                const progress = it.progressMethod === "study_time" && it.weeklyTargetMinutes
                  ? Math.min(100, Math.round((currentMinutes / Math.max(1, it.weeklyTargetMinutes)) * 100))
                  : it.progress;
                return {
                  ...it,
                  currentValue: currentMinutes,
                  progress,
                  updatedAt: nowIso,
                };
              }
              return it;
            });
          }

          // Award deduplicated XP if >= 5 mins
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          const idempotencyKey = `focus_complete_${completedRecord.id}`;
          if (actualFocusMins >= 5 && !newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
            addedXp = Math.min(25, Math.max(5, Math.round(actualFocusMins / 5)));
            newLedger = [
              ...newLedger,
              {
                id: uid(),
                userId: s.user.id,
                sourceType: "focus",
                sourceId: completedRecord.id,
                amount: addedXp,
                localDate: current.localDate,
                idempotencyKey,
                createdAt: nowIso,
              },
            ];
          }

          return withAchievements({
            ...s,
            activeFocusSession: null,
            focusSessions: [completedRecord, ...(s.focusSessions || [])],
            study,
            studySessions,
            learningItems,
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      completeFocusSession: (rating, note) =>
        update((s) => {
          if (!s.activeFocusSession) return s;
          const current = s.activeFocusSession;
          const nowIso = new Date().toISOString();
          const actualFocusSec = current.plannedFocusSeconds;
          const actualFocusMins = Math.round(actualFocusSec / 60);

          const completedRecord: FocusSession = {
            ...current,
            status: "completed",
            completionType: "completed",
            actualFocusSeconds: actualFocusSec,
            endedAt: nowIso,
            focusRating: rating,
            privateNote: note,
            updatedAt: nowIso,
          };

          // If linked to a study subject or learning item, update subject minutes, studySessions and learningItems
          let study = s.study || [];
          let studySessions = s.studySessions || [];
          let learningItems = s.learningItems || [];
          if ((current.sourceType === "subject" || current.sourceType === "learning" || (current as any).contextType === "subject") && actualFocusMins > 0) {
            const subjName = current.sourceLabelSnapshot;
            study = study.map((b) =>
              b.subject.toLowerCase() === subjName.toLowerCase()
                ? { ...b, minutes: b.minutes + actualFocusMins }
                : b
            );
            studySessions = [{ date: current.localDate, subject: subjName, minutes: actualFocusMins }, ...studySessions];
            learningItems = learningItems.map((it) => {
              if (it.id === current.sourceId || it.title.toLowerCase() === subjName.toLowerCase()) {
                const currentMinutes = (it.currentValue || 0) + actualFocusMins;
                const progress = it.progressMethod === "study_time" && it.weeklyTargetMinutes
                  ? Math.min(100, Math.round((currentMinutes / Math.max(1, it.weeklyTargetMinutes)) * 100))
                  : it.progress;
                return {
                  ...it,
                  currentValue: currentMinutes,
                  progress,
                  updatedAt: nowIso,
                };
              }
              return it;
            });
          }

          // Award deduplicated XP
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          const idempotencyKey = `focus_complete_${completedRecord.id}`;
          if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
            addedXp = Math.min(30, Math.max(10, Math.round(actualFocusMins / 3)));
            newLedger = [
              ...newLedger,
              {
                id: uid(),
                userId: s.user.id,
                sourceType: "focus",
                sourceId: completedRecord.id,
                amount: addedXp,
                localDate: current.localDate,
                idempotencyKey,
                createdAt: nowIso,
              },
            ];
          }

          return withAchievements({
            ...s,
            activeFocusSession: null,
            focusSessions: [completedRecord, ...(s.focusSessions || [])],
            study,
            studySessions,
            learningItems,
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        }),

      cancelFocusSession: () =>
        update((s) => ({
          ...s,
          activeFocusSession: null,
        })),

      addManualFocusSession: (sessionData) =>
        update((s) => {
          const nowIso = new Date().toISOString();
          const manualSession: FocusSession = {
            ...sessionData,
            id: uid(),
            userId: s.user.id,
            status: "completed",
            completionType: "manual",
            isManual: true,
            idempotencyKey: `manual_focus_${uid()}_${Date.now()}`,
            createdAt: nowIso,
            updatedAt: nowIso,
          };

          const actualFocusMins = Math.round(manualSession.actualFocusSeconds / 60);
          let study = s.study || [];
          let studySessions = s.studySessions || [];
          if ((manualSession.sourceType === "subject" || (manualSession as any).contextType === "subject") && actualFocusMins > 0) {
            const subjName = manualSession.sourceLabelSnapshot;
            study = study.map((b) =>
              b.subject.toLowerCase() === subjName.toLowerCase()
                ? { ...b, minutes: b.minutes + actualFocusMins }
                : b
            );
            studySessions = [{ date: manualSession.localDate, subject: subjName, minutes: actualFocusMins }, ...studySessions];
          }

          return {
            ...s,
            focusSessions: [manualSession, ...(s.focusSessions || [])],
            study,
            studySessions,
          };
        }),

      deleteFocusSession: (id) =>
        update((s) => ({
          ...s,
          focusSessions: (s.focusSessions || []).filter((item) => item.id !== id),
        })),

      updateFocusPresets: (presets) =>
        update((s) => ({
          ...s,
          focusPresets: presets,
        })),

      // ── Prefs & Misc ─────────────────────────────────────────────────────
      setPrefs: (p) =>
        update((s) => ({
          ...s,
          prefs: { ...s.prefs, ...p },
        })),

      resetData: () => update(() => defaultState),

      // ── Brain Dump Inbox ──────────────────────────────────────────────────
      addBrainDumpItem: (item) => {
        const id = item.id || uid();
        const now = new Date().toISOString();
        const newItem = normalizeBrainDumpItem({
          ...item,
          id,
          createdAt: item.createdAt || now,
          updatedAt: now,
        });
        update((s) => ({
          ...s,
          brainDumpItems: [newItem, ...(s.brainDumpItems || [])],
        }));
        return id;
      },

      updateBrainDumpItem: (id, updates) =>
        update((s) => ({
          ...s,
          brainDumpItems: (s.brainDumpItems || []).map((b) =>
            b.id === id ? normalizeBrainDumpItem({ ...b, ...updates, updatedAt: new Date().toISOString() }) : b
          ),
        })),

      deleteBrainDumpItem: (id) =>
        update((s) => ({
          ...s,
          brainDumpItems: (s.brainDumpItems || []).filter((b) => b.id !== id),
        })),

      archiveBrainDumpItem: (id) =>
        update((s) => ({
          ...s,
          brainDumpItems: (s.brainDumpItems || []).map((b) =>
            b.id === id ? { ...b, status: "archived", updatedAt: new Date().toISOString() } : b
          ),
        })),

      restoreBrainDumpItem: (id) =>
        update((s) => ({
          ...s,
          brainDumpItems: (s.brainDumpItems || []).map((b) =>
            b.id === id
              ? { ...b, status: b.destination ? "organized" : "unsorted", updatedAt: new Date().toISOString() }
              : b
          ),
        })),

      organizeBrainDumpItem: (id, destination, removeInboxCopy) =>
        update((s) => {
          if (removeInboxCopy) {
            return {
              ...s,
              brainDumpItems: (s.brainDumpItems || []).filter((b) => b.id !== id),
            };
          }
          return {
            ...s,
            brainDumpItems: (s.brainDumpItems || []).map((b) =>
              b.id === id
                ? {
                    ...b,
                    status: "organized",
                    destination,
                    updatedAt: new Date().toISOString(),
                  }
                : b
            ),
          };
        }),

      unlinkBrainDumpDestination: (id) =>
        update((s) => ({
          ...s,
          brainDumpItems: (s.brainDumpItems || []).map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: "unsorted",
                  destination: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : b
          ),
        })),

      splitBrainDumpItem: (id, parts) =>
        update((s) => {
          const original = (s.brainDumpItems || []).find((b) => b.id === id);
          if (!original) return s;
          const now = new Date().toISOString();
          const newItems: BrainDumpItem[] = parts.map((part) =>
            normalizeBrainDumpItem({
              id: uid(),
              userId: original.userId,
              content: part,
              label: original.label,
              status: "unsorted",
              createdAt: now,
              updatedAt: now,
            })
          );
          const updatedItems = (s.brainDumpItems || []).map((b) =>
            b.id === id ? { ...b, status: "archived" as const, updatedAt: now } : b
          );
          return {
            ...s,
            brainDumpItems: [...newItems, ...updatedItems],
          };
        }),

      // ── Future Me Time Capsule ──────────────────────────────────────────
      saveCapsuleDraft: (draft) => {
        const id = draft.id || `fmc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        update((s) => {
          const existingIndex = (s.timeCapsules || []).findIndex((c) => c.id === id);
          const capsule = normalizeCapsule({
            ...(existingIndex >= 0 ? s.timeCapsules![existingIndex] : {}),
            ...draft,
            id,
            status: "draft",
            updatedAt: now,
          });
          if (existingIndex >= 0) {
            const next = [...(s.timeCapsules || [])];
            next[existingIndex] = capsule;
            return { ...s, timeCapsules: next };
          }
          return { ...s, timeCapsules: [capsule, ...(s.timeCapsules || [])] };
        });
        return id;
      },

      sealCapsuleAction: (id, options) => {
        let success = false;
        update((s) => {
          const existing = (s.timeCapsules || []).find((c) => c.id === id);
          if (!existing || !existing.body.trim()) return s;
          const now = new Date().toISOString();
          const sealedCapsule: FutureMeCapsule = {
            ...existing,
            status: "sealed",
            sealedAt: now,
            updatedAt: now,
            reminderEnabled: options?.reminderEnabled ?? existing.reminderEnabled,
          };
          success = true;
          return {
            ...s,
            timeCapsules: (s.timeCapsules || []).map((c) => (c.id === id ? sealedCapsule : c)),
          };
        });
        return success;
      },

      openCapsuleAction: (id) => {
        let success = false;
        update((s) => {
          const existing = (s.timeCapsules || []).find((c) => c.id === id);
          if (!existing) return s;
          if (existing.status === "opened") return s; // Idempotent
          const now = new Date().toISOString();
          success = true;
          return {
            ...s,
            timeCapsules: (s.timeCapsules || []).map((c) =>
              c.id === id
                ? { ...c, status: "opened", openedAt: c.openedAt || now, updatedAt: now }
                : c
            ),
          };
        });
        return success;
      },

      unsealCapsuleEarlyAction: (id) => {
        let success = false;
        update((s) => {
          const existing = (s.timeCapsules || []).find((c) => c.id === id);
          if (!existing) return s;
          const now = new Date().toISOString();
          success = true;
          return {
            ...s,
            timeCapsules: (s.timeCapsules || []).map((c) =>
              c.id === id
                ? { ...c, status: "opened", openedAt: now, unsealedEarly: true, updatedAt: now }
                : c
            ),
          };
        });
        return success;
      },

      deleteCapsuleAction: (id) => {
        update((s) => ({
          ...s,
          timeCapsules: (s.timeCapsules || []).filter((c) => c.id !== id),
        }));
      },

      linkCapsuleReplyAction: (capsuleId, journalId) => {
        update((s) => ({
          ...s,
          timeCapsules: (s.timeCapsules || []).map((c) =>
            c.id === capsuleId ? { ...c, replyJournalId: journalId, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      // ── My Week in Bloom Keepsakes (Strictly 0 XP) ───────────────────────
      saveWeekInBloomKeepsake: (keepsakeData, saveToJournal) => {
        let resultingId = keepsakeData.id;
        update((s) => {
          const id = keepsakeData.id || `bloom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
          resultingId = id;
          const now = new Date().toISOString();
          const existingIndex = (s.weekInBloomKeepsakes || []).findIndex((k) => k.id === id);

          let journalEntryId = keepsakeData.savedToJournalEntryId;
          let nextJournal = s.journal;

          if (saveToJournal) {
            const title = keepsakeData.title || (s.prefs?.language === "ar" ? "أسبوعي يزهر 🌷" : "My Week in Bloom 🌷");
            const bodyLines: string[] = [
              `# ${title}`,
              `**Week:** ${keepsakeData.weekStartDate} — ${keepsakeData.weekEndDate}`,
              "",
            ];
            (keepsakeData.blocks || []).forEach((b) => {
              if (!b.visible) return;
              if (b.type === "accomplishments" && Array.isArray(b.content) && b.content.length > 0) {
                bodyLines.push(`### Accomplishments`);
                b.content.forEach((item: string) => bodyLines.push(`- ${item}`));
                bodyLines.push("");
              } else if (b.type === "lovely_moment" && b.content) {
                bodyLines.push(`### Lovely Moment\n${b.content}\n`);
              } else if (b.type === "lesson" && b.content) {
                bodyLines.push(`### Lesson\n${b.content}\n`);
              } else if (b.type === "gratitude" && b.content) {
                bodyLines.push(`### Gratitude\n${b.content}\n`);
              } else if (b.type === "next_intention" && b.content) {
                bodyLines.push(`### Next Week Intention\n${b.content}\n`);
              } else if (b.type === "supported_habit" && b.content?.title) {
                bodyLines.push(`### Habit: ${b.content.title}\n${b.content.note || ""}\n`);
              } else if (b.type === "focus_study" && b.content?.minutes) {
                bodyLines.push(`### ${b.content.label}: ${b.content.minutes} min\n`);
              }
            });

            const jBody = bodyLines.join("\n");
            if (journalEntryId) {
              nextJournal = nextJournal.map((j) => (j.id === journalEntryId ? { ...j, title, body: jBody } : j));
            } else {
              journalEntryId = uid();
              const newEntry: JournalEntry = {
                id: journalEntryId,
                date: keepsakeData.weekEndDate || todayKey(),
                time: new Date().toTimeString().slice(0, 5),
                title,
                body: jBody,
                template: "free",
                tags: ["WeekInBloom", "Keepsake"],
                locked: true,
                createdAt: now,
                updatedAt: now,
              };
              nextJournal = [newEntry, ...nextJournal];
            }
          }

          const keepsake: WeekInBloomKeepsake = normalizeWeekInBloomKeepsake({
            ...(existingIndex >= 0 ? s.weekInBloomKeepsakes![existingIndex] : {}),
            ...keepsakeData,
            id,
            savedToJournalEntryId: journalEntryId,
            updatedAt: now,
            createdAt: existingIndex >= 0 ? s.weekInBloomKeepsakes![existingIndex].createdAt : now,
          });

          if (existingIndex >= 0) {
            const next = [...(s.weekInBloomKeepsakes || [])];
            next[existingIndex] = keepsake;
            return { ...s, journal: nextJournal, weekInBloomKeepsakes: next };
          }
          return {
            ...s,
            journal: nextJournal,
            weekInBloomKeepsakes: [keepsake, ...(s.weekInBloomKeepsakes || [])],
          };
        });
        return resultingId!;
      },

      deleteWeekInBloomKeepsake: (id) => {
        update((s) => ({
          ...s,
          weekInBloomKeepsakes: (s.weekInBloomKeepsakes || []).filter((k) => k.id !== id),
        }));
      },

      duplicateWeekInBloomKeepsake: (id) => {
        let newId = "";
        update((s) => {
          const source = (s.weekInBloomKeepsakes || []).find((k) => k.id === id);
          if (!source) return s;
          newId = `bloom-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
          const now = new Date().toISOString();
          const duplicate: WeekInBloomKeepsake = {
            ...source,
            id: newId,
            title: source.title ? `${source.title} (Copy)` : "My Week in Bloom (Copy)",
            isDraft: true,
            savedToJournalEntryId: undefined,
            createdAt: now,
            updatedAt: now,
          };
          return {
            ...s,
            weekInBloomKeepsakes: [duplicate, ...(s.weekInBloomKeepsakes || [])],
          };
        });
        return newId;
      },

      // ── Self-care Bingo Boards (Strictly 0 extra XP) ─────────────────────
      saveBingoBoard: (boardData) => {
        let resultingId = boardData.id || "";
        update((s) => {
          const id = boardData.id || `bingo_${boardData.weekStartDate || todayKey()}_${boardData.size || 3}x${boardData.size || 3}_${Date.now().toString(36)}`;
          resultingId = id;
          const now = new Date().toISOString();
          const existingIndex = (s.selfCareBingoBoards || []).findIndex((b) => b.id === id);

          const normalized = normalizeBingoBoard(
            {
              ...(existingIndex >= 0 ? s.selfCareBingoBoards![existingIndex] : {}),
              ...boardData,
              id,
              updatedAt: now,
              createdAt: existingIndex >= 0 ? s.selfCareBingoBoards![existingIndex].createdAt : now,
            },
            boardData.weekStartDate,
            boardData.weekEndDate
          );

          if (existingIndex >= 0) {
            const next = [...(s.selfCareBingoBoards || [])];
            next[existingIndex] = normalized;
            return { ...s, selfCareBingoBoards: next };
          }
          return {
            ...s,
            selfCareBingoBoards: [normalized, ...(s.selfCareBingoBoards || [])],
          };
        });
        return resultingId;
      },

      deleteBingoBoard: (boardId) => {
        update((s) => ({
          ...s,
          selfCareBingoBoards: (s.selfCareBingoBoards || []).filter((b) => b.id !== boardId),
        }));
      },

      toggleBingoTile: (boardId, tileId, customDate) => {
        update((s) => {
          const boards = s.selfCareBingoBoards || [];
          const boardIndex = boards.findIndex((b) => b.id === boardId);
          if (boardIndex < 0) return s;

          const board = boards[boardIndex];
          const tile = board.tiles.find((t) => t.id === tileId);
          if (!tile || tile.isDecorativeCenter) return s;

          const nowIso = new Date().toISOString();
          const tz = s.wellnessSettings?.timezone;
          const today = todayKey(tz);
          const actionDate = customDate || today;

          // Future logging restriction: cannot log for future dates
          if (actionDate > today) return s;

          const willBeDone = !tile.completed;
          let planItems = s.selfCarePlanItems || [];
          let addedXp = 0;
          let newLedger = s.xpLedger || [];
          let habits = s.habits || [];
          let routines = s.routines || {};
          let tasks = s.tasks || [];

          let updatedPlanItemId = tile.planItemId;

          if (tile.activityId) {
            const activity = (s.selfCareActivities || []).find((a) => a.id === tile.activityId);

            if (willBeDone) {
              // Check if plan item already exists for this activity on actionDate
              let planItem = planItems.find(
                (p) => p.activityId === tile.activityId && p.localDate === actionDate
              );
              if (planItem) {
                updatedPlanItemId = planItem.id;
                planItems = planItems.map((p) =>
                  p.id === planItem!.id
                    ? { ...p, status: "completed" as const, completedAt: nowIso, updatedAt: nowIso }
                    : p
                );
              } else {
                const newPlanId = `plan_${tile.activityId}_${actionDate}_${uid().slice(0, 5)}`;
                updatedPlanItemId = newPlanId;
                planItems = [
                  {
                    id: newPlanId,
                    userId: s.user.id,
                    activityId: tile.activityId,
                    localDate: actionDate,
                    status: "completed" as const,
                    completedAt: nowIso,
                    sourceType: activity?.sourceType || "custom",
                    sourceId: activity?.sourceId,
                    order: planItems.length,
                    createdAt: nowIso,
                    updatedAt: nowIso,
                  },
                  ...planItems,
                ];
              }

              // Centralized XP deduplication (10 XP if custom activity, 0 if habit/routine or duplicate)
              if (!activity || activity.sourceType === "custom") {
                const idempotencyKey = `care:${tile.activityId}:${actionDate}`;
                if (!newLedger.some((e) => e.idempotencyKey === idempotencyKey)) {
                  addedXp = 10;
                  newLedger = [
                    ...newLedger,
                    {
                      id: uid(),
                      userId: s.user.id,
                      sourceType: "selfcare",
                      sourceId: tile.activityId,
                      amount: 10,
                      localDate: actionDate,
                      idempotencyKey,
                      createdAt: nowIso,
                    },
                  ];
                }
              }

              // Cross-page sync for habit/routine/task
              if (activity) {
                if (activity.sourceType === "habit" && activity.sourceId) {
                  habits = habits.map((h) => {
                    if (h.id === activity.sourceId) {
                      return {
                        ...h,
                        history: {
                          ...(h.history || {}),
                          [actionDate]: {
                            value: h.targetValue || 1,
                            completed: true,
                            completedAt: nowIso,
                          },
                        },
                      };
                    }
                    return h;
                  });
                }
                if (activity.sourceType === "routine" && activity.sourceId) {
                  Object.keys(routines).forEach((rKey) => {
                    routines[rKey] = routines[rKey].map((st: any) =>
                      st.id === activity.sourceId ? { ...st, done: true } : st
                    );
                  });
                }
                if (activity.sourceType === "task" && activity.sourceId) {
                  tasks = tasks.map((t) =>
                    t.id === activity.sourceId ? { ...t, done: true, completedAt: nowIso } : t
                  );
                }
              }
            } else {
              // Undoing completion: revert plan item to pending
              if (updatedPlanItemId) {
                planItems = planItems.map((p) =>
                  p.id === updatedPlanItemId
                    ? { ...p, status: "pending" as const, completedAt: undefined, updatedAt: nowIso }
                    : p
                );
              }
            }
          }

          // Update tile inside board
          const updatedTiles: SelfCareBingoTile[] = board.tiles.map((t) =>
            t.id === tileId
              ? {
                  ...t,
                  completed: willBeDone,
                  completedAt: willBeDone ? nowIso : undefined,
                  completedDate: willBeDone ? actionDate : undefined,
                  currentValue: willBeDone ? t.targetValue : 0,
                  planItemId: willBeDone ? updatedPlanItemId : undefined,
                }
              : t
          );

          const updatedBoard: SelfCareBingoBoard = {
            ...board,
            tiles: updatedTiles,
            updatedAt: nowIso,
          };

          const nextBoards = [...boards];
          nextBoards[boardIndex] = updatedBoard;

          return withAchievements({
            ...s,
            selfCareBingoBoards: nextBoards,
            selfCarePlanItems: planItems,
            habits,
            routines,
            tasks,
            xp: s.xp + addedXp,
            xpLedger: newLedger,
          });
        });
      },

      updateBingoTileProgress: (boardId, tileId, value, customDate) => {
        update((s) => {
          const boards = s.selfCareBingoBoards || [];
          const boardIndex = boards.findIndex((b) => b.id === boardId);
          if (boardIndex < 0) return s;

          const board = boards[boardIndex];
          const tile = board.tiles.find((t) => t.id === tileId);
          if (!tile || tile.isDecorativeCenter) return s;

          const nowIso = new Date().toISOString();
          const tz = s.wellnessSettings?.timezone;
          const today = todayKey(tz);
          const actionDate = customDate || today;

          // Future logging restriction
          if (actionDate > today) return s;

          const clampedValue = Math.max(0, value);
          const willBeDone = clampedValue >= tile.targetValue;

          const updatedTiles: SelfCareBingoTile[] = board.tiles.map((t) =>
            t.id === tileId
              ? {
                  ...t,
                  currentValue: clampedValue,
                  completed: willBeDone,
                  completedAt: willBeDone ? nowIso : undefined,
                  completedDate: willBeDone ? actionDate : undefined,
                }
              : t
          );

          const updatedBoard: SelfCareBingoBoard = {
            ...board,
            tiles: updatedTiles,
            updatedAt: nowIso,
          };

          const nextBoards = [...boards];
          nextBoards[boardIndex] = updatedBoard;

          return {
            ...s,
            selfCareBingoBoards: nextBoards,
          };
        });
      },

      repeatBingoBoardForWeek: (sourceBoardId, targetWeekStart, targetWeekEnd, overwriteExisting) => {
        let resultingId = "";
        update((s) => {
          const source = (s.selfCareBingoBoards || []).find((b) => b.id === sourceBoardId);
          if (!source) return s;

          const existingIndex = (s.selfCareBingoBoards || []).findIndex(
            (b) => b.weekStartDate === targetWeekStart && b.size === source.size
          );

          if (existingIndex >= 0 && !overwriteExisting) {
            resultingId = s.selfCareBingoBoards![existingIndex].id;
            return s;
          }

          const newId = `bingo_${targetWeekStart}_${source.size}x${source.size}_${Date.now().toString(36)}`;
          resultingId = newId;
          const now = new Date().toISOString();

          // Reset all completion states for target week
          const freshTiles: SelfCareBingoTile[] = source.tiles.map((t) => ({
            ...t,
            completed: false,
            completedAt: undefined,
            completedDate: undefined,
            planItemId: undefined,
            currentValue: 0,
          }));

          const duplicatedBoard: SelfCareBingoBoard = {
            ...source,
            id: newId,
            weekStartDate: targetWeekStart,
            weekEndDate: targetWeekEnd,
            tiles: freshTiles,
            createdAt: now,
            updatedAt: now,
          };

          if (existingIndex >= 0 && overwriteExisting) {
            const next = [...(s.selfCareBingoBoards || [])];
            next[existingIndex] = duplicatedBoard;
            return { ...s, selfCareBingoBoards: next };
          }

          return {
            ...s,
            selfCareBingoBoards: [duplicatedBoard, ...(s.selfCareBingoBoards || [])],
          };
        });
        return resultingId;
      },

      // Someday Garden (Strictly 0 new XP)
      addSomedayWish: (wish) => {
        const id = wish.id || generateWishId();
        update((s) => {
          const existingWishes = s.somedayWishes || [];
          const normalized = normalizeSomedayWish({
            ...wish,
            id,
            order: existingWishes.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          return {
            ...s,
            somedayWishes: [normalized, ...existingWishes],
          };
        });
        return id;
      },

      updateSomedayWish: (id, updates) => {
        update((s) => {
          const existingWishes = s.somedayWishes || [];
          const index = existingWishes.findIndex((w) => w.id === id);
          if (index < 0) return s;
          const current = existingWishes[index];
          const updated = normalizeSomedayWish({
            ...current,
            ...updates,
            id: current.id,
            updatedAt: new Date().toISOString(),
          });
          const nextWishes = [...existingWishes];
          nextWishes[index] = updated;
          return { ...s, somedayWishes: nextWishes };
        });
      },

      deleteSomedayWish: (id) => {
        update((s) => ({
          ...s,
          somedayWishes: (s.somedayWishes || []).filter((w) => w.id !== id),
        }));
      },

      archiveSomedayWish: (id) => {
        update((s) => {
          const existingWishes = s.somedayWishes || [];
          const index = existingWishes.findIndex((w) => w.id === id);
          if (index < 0) return s;
          const nextWishes = [...existingWishes];
          nextWishes[index] = {
            ...nextWishes[index],
            archivedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { ...s, somedayWishes: nextWishes };
        });
      },

      restoreSomedayWish: (id) => {
        update((s) => {
          const existingWishes = s.somedayWishes || [];
          const index = existingWishes.findIndex((w) => w.id === id);
          if (index < 0) return s;
          const nextWishes = [...existingWishes];
          nextWishes[index] = {
            ...nextWishes[index],
            archivedAt: undefined,
            updatedAt: new Date().toISOString(),
          };
          return { ...s, somedayWishes: nextWishes };
        });
      },

      reorderSomedayWishes: (orderedIds) => {
        update((s) => {
          const existingWishes = s.somedayWishes || [];
          const map = new Map(existingWishes.map((w) => [w.id, w]));
          const nextWishes: SomedayWish[] = [];
          orderedIds.forEach((id, idx) => {
            const item = map.get(id);
            if (item) {
              nextWishes.push({ ...item, order: idx });
              map.delete(id);
            }
          });
          map.forEach((item) => {
            nextWishes.push({ ...item, order: nextWishes.length });
          });
          return { ...s, somedayWishes: nextWishes };
        });
      },

      linkWishToGoal: (wishId, goalId) => {
        update((s) => {
          const existingWishes = s.somedayWishes || [];
          const index = existingWishes.findIndex((w) => w.id === wishId);
          if (index < 0) return s;
          const nextWishes = [...existingWishes];
          nextWishes[index] = {
            ...nextWishes[index],
            linkedGoalId: goalId,
            status: "linked_goal",
            updatedAt: new Date().toISOString(),
          };
          return { ...s, somedayWishes: nextWishes };
        });
      },

      unlinkWishGoal: (wishId) => {
        update((s) => {
          const existingWishes = s.somedayWishes || [];
          const index = existingWishes.findIndex((w) => w.id === wishId);
          if (index < 0) return s;
          const nextWishes = [...existingWishes];
          nextWishes[index] = {
            ...nextWishes[index],
            linkedGoalId: undefined,
            status: "dreaming",
            updatedAt: new Date().toISOString(),
          };
          return { ...s, somedayWishes: nextWishes };
        });
      },

      convertWishToGoal: (wishId, goalData) => {
        const goalId = goalData.id || uid();
        update((s) => {
          const newGoal = normalizeGoal({
            ...goalData,
            id: goalId,
            status: "active",
            progress: goalData.progress || 0,
            target: goalData.target || "Someday",
            targetDate: goalData.targetDate || todayKey(),
            milestones: goalData.milestones || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          const existingWishes = s.somedayWishes || [];
          const wishIndex = existingWishes.findIndex((w) => w.id === wishId);
          let nextWishes = existingWishes;
          if (wishIndex >= 0) {
            nextWishes = [...existingWishes];
            nextWishes[wishIndex] = {
              ...nextWishes[wishIndex],
              linkedGoalId: goalId,
              status: "linked_goal",
              updatedAt: new Date().toISOString(),
            };
          }

          return withAchievements({
            ...s,
            goals: [newGoal, ...s.goals],
            somedayWishes: nextWishes,
          });
        });
        return goalId;
      },

      addWishToVisionBoard: (wishId, boardId, caption) => {
        let createdItemId = "";
        update((s) => {
          const wish = (s.somedayWishes || []).find((w) => w.id === wishId);
          if (!wish) return s;
          const board = (s.visionBoards || []).find((b) => b.id === boardId);
          if (!board) return s;

          createdItemId = uid();
          const existingItems = s.visionBoardItems || [];
          const newItem: VisionBoardItem = {
            id: createdItemId,
            boardId,
            type: "wish",
            title: wish.title,
            content: wish.description,
            imageUrl: wish.imageUrl,
            caption: caption || wish.personalReason || wish.title,
            linkedGoalId: wish.linkedGoalId,
            order: existingItems.filter((i) => i.boardId === boardId).length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const existingRefs = wish.destinationRefs || [];
          const hasRef = existingRefs.some((r) => r.type === "vision_board" && r.id === boardId);
          let nextWishes = s.somedayWishes;
          if (!hasRef) {
            const nextRefs = [
              ...existingRefs,
              {
                type: "vision_board",
                id: boardId,
                title: board.title,
                createdAt: new Date().toISOString(),
              },
            ];
            nextWishes = (s.somedayWishes || []).map((w) => (w.id === wishId ? { ...w, destinationRefs: nextRefs } : w));
          }

          return {
            ...s,
            visionBoardItems: [newItem, ...existingItems],
            somedayWishes: nextWishes,
          };
        });
        return createdItemId;
      },

      saveWheelRecord: (record) => {
        let recordId = record.id || "";
        update((s) => {
          const ym = record.yearMonth;
          const userCustomAreas = s.wheelCustomization?.customAreas;
          const existingList = s.wheelOfBecomingRecords || [];
          const existingIndex = existingList.findIndex((r) => r.yearMonth === ym);
          const normalized = normalizeWheelRecord(
            {
              ...(existingIndex >= 0 ? existingList[existingIndex] : {}),
              ...record,
              id: existingIndex >= 0 ? existingList[existingIndex].id : record.id,
            },
            ym,
            userCustomAreas
          );
          recordId = normalized.id;

          let nextRecords: WheelOfBecomingRecord[];
          if (existingIndex >= 0) {
            nextRecords = [...existingList];
            nextRecords[existingIndex] = normalized;
          } else {
            nextRecords = [normalized, ...existingList];
          }

          return {
            ...s,
            wheelOfBecomingRecords: nextRecords,
          };
        });
        return recordId;
      },

      updateWheelCustomization: (settings) => {
        update((s) => ({
          ...s,
          wheelCustomization: {
            ...(s.wheelCustomization || {}),
            ...settings,
          },
        }));
      },

      linkGoalToWheel: (yearMonth, goalId) => {
        update((s) => {
          const list = s.wheelOfBecomingRecords || [];
          const idx = list.findIndex((r) => r.yearMonth === yearMonth);
          if (idx < 0) return s;
          const updated = [...list];
          updated[idx] = {
            ...updated[idx],
            linkedGoalId: goalId,
            updatedAt: new Date().toISOString(),
          };
          return {
            ...s,
            wheelOfBecomingRecords: updated,
          };
        });
      },

      unlinkGoalFromWheel: (yearMonth) => {
        update((s) => {
          const list = s.wheelOfBecomingRecords || [];
          const idx = list.findIndex((r) => r.yearMonth === yearMonth);
          if (idx < 0) return s;
          const updated = [...list];
          updated[idx] = {
            ...updated[idx],
            linkedGoalId: undefined,
            updatedAt: new Date().toISOString(),
          };
          return {
            ...s,
            wheelOfBecomingRecords: updated,
          };
        });
      },

      saveAiConversation: (convo) => {
        update((s) => {
          const list = s.aiConversations || [];
          const idx = list.findIndex((c) => c.id === convo.id);
          const normalized = normalizeAiConversation({
            ...(idx >= 0 ? list[idx] : {}),
            ...convo,
            updatedAt: new Date().toISOString(),
          });
          let nextList: AiConversation[];
          if (idx >= 0) {
            nextList = [...list];
            nextList[idx] = normalized;
          } else {
            nextList = [normalized, ...list];
          }
          return {
            ...s,
            aiConversations: nextList,
          };
        });
      },

      deleteAiConversation: (id) => {
        update((s) => ({
          ...s,
          aiConversations: (s.aiConversations || []).filter((c) => c.id !== id),
        }));
      },

      renameAiConversation: (id, newTitle) => {
        update((s) => {
          const list = s.aiConversations || [];
          const idx = list.findIndex((c) => c.id === id);
          if (idx < 0) return s;
          const nextList = [...list];
          nextList[idx] = {
            ...nextList[idx],
            title: newTitle.trim() || nextList[idx].title,
            updatedAt: new Date().toISOString(),
          };
          return {
            ...s,
            aiConversations: nextList,
          };
        });
      },

      clearAiConversations: () => {
        update((s) => ({
          ...s,
          aiConversations: [],
        }));
      },

      updateAiContextConsent: (consent) => {
        update((s) => ({
          ...s,
          aiContextConsent: normalizeAiContextConsent({
            ...(s.aiContextConsent || DEFAULT_CONTEXT_SCOPE),
            ...consent,
            updatedAt: new Date().toISOString(),
          }),
        }));
      },

      revokeAiContextConsent: () => {
        update((s) => ({
          ...s,
          aiContextConsent: {
            ...DEFAULT_CONTEXT_SCOPE,
            granted: false,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      useAiCredit: (amount = 1) => {
        let success = false;
        update((s) => {
          const current = typeof s.aiCredits === "number" ? s.aiCredits : 50;
          if (current >= amount) {
            success = true;
            return {
              ...s,
              aiCredits: current - amount,
            };
          }
          return s;
        });
        return success;
      },

      addAiCredits: (amount: number) => {
        update((s) => {
          const current = typeof s.aiCredits === "number" ? s.aiCredits : 50;
          return {
            ...s,
            aiCredits: Math.max(0, current + amount),
          };
        });
      },

      setAiPersona: (persona: "feminine" | "masculine") => {
        update((s) => ({
          ...s,
          aiPersona: persona,
        }));
      },

      updateAiSettings: (settings: Partial<AiSettings>) => {
        update((s) => ({
          ...s,
          aiSettings: {
            ...(s.aiSettings || DEFAULT_AI_SETTINGS),
            ...settings,
          },
        }));
      },
    }),
    [state, update, withAchievements],
  );


  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
