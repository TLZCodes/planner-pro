import type { AppState, Task, Habit, Goal, JournalEntry } from "./store";

export interface GuestDataCategoryCount {
  id: string;
  key: string;
  labelEn: string;
  labelAr: string;
  nameEn: string;
  nameAr: string;
  emoji: string;
  count: number;
}

export interface GuestDataSummary {
  hasData: boolean;
  totalRecords: number;
  totalItems: number;
  categories: GuestDataCategoryCount[];
}

export type GuestDataInspectionResult = GuestDataSummary;

/**
 * Inspects AppState to detect existing data created during guest mode.
 */
export function detectGuestData(state: AppState): GuestDataSummary {
  const tasksCount = state.tasks?.length || 0;
  const habitsCount = state.habits?.length || 0;
  const routinesCount =
    Object.values(state.routines || {}).reduce((acc, steps) => acc + (steps?.length || 0), 0) +
    (state.customRoutines?.length || 0);
  const goalsCount = state.goals?.length || 0;
  const journalCount = state.journal?.length || 0;
  const bujoCount = (state as any).bujoEntries?.length || 0;
  const wellnessCount =
    (state.hydrationEvents?.length || 0) + (state.sleepRecords?.length || 0);
  const selfCareCount =
    (state.selfCareActivities?.length || 0) + (state.selfCarePlanItems?.length || 0);
  const learningCount =
    ((state as any).books?.length || 0) + ((state as any).studySessions?.length || 0);
  const financeCount =
    (state.financialTransactions?.length || 0) + (state.financeAccounts?.length || 0);
  const businessCount =
    (state.businessProjects?.length || 0) + (state.businessInvoices?.length || 0);
  const travelCount = state.travelTrips?.length || 0;
  const brainDumpCount = (state as any).brainDumpItems?.length || 0;
  const xpCount = state.xp || 0;
  const badgesCount = state.unlockedBadges?.length || 0;

  const rawCategories = [
    { id: "tasks", key: "tasks", labelEn: "Tasks", labelAr: "المهام", nameEn: "Tasks", nameAr: "المهام", emoji: "✅", count: tasksCount },
    { id: "brainDump", key: "brainDump", labelEn: "Brain Dump", labelAr: "مساحة الأفكار", nameEn: "Brain Dump", nameAr: "مساحة الأفكار", emoji: "🧠", count: brainDumpCount },
    { id: "habits", key: "habits", labelEn: "Habits", labelAr: "العادات", nameEn: "Habits", nameAr: "العادات", emoji: "🌱", count: habitsCount },
    { id: "routines", key: "routines", labelEn: "Routines", labelAr: "الروتينات", nameEn: "Routines", nameAr: "الروتينات", emoji: "✨", count: routinesCount },
    { id: "goals", key: "goals", labelEn: "Goals", labelAr: "الأهداف", nameEn: "Goals", nameAr: "الأهداف", emoji: "🎯", count: goalsCount },
    { id: "journal", key: "journal", labelEn: "Journal", labelAr: "اليوميات", nameEn: "Journal", nameAr: "اليوميات", emoji: "📖", count: journalCount },
    { id: "bujo", key: "bujo", labelEn: "Bullet Journal", labelAr: "دفتر التخطيط (Bujo)", nameEn: "Bullet Journal", nameAr: "دفتر التخطيط (Bujo)", emoji: "🎨", count: bujoCount },
    { id: "wellness", key: "wellness", labelEn: "Wellness", labelAr: "العافية والصحة", nameEn: "Wellness", nameAr: "العافية والصحة", emoji: "💧", count: wellnessCount },
    { id: "selfcare", key: "selfcare", labelEn: "Self-Care", labelAr: "العناية الذاتية", nameEn: "Self-Care", nameAr: "العناية الذاتية", emoji: "🧖‍♀️", count: selfCareCount },
    { id: "learning", key: "learning", labelEn: "Learning", labelAr: "التعلم والقراءة", nameEn: "Learning", nameAr: "التعلم والقراءة", emoji: "📚", count: learningCount },
    { id: "finance", key: "finance", labelEn: "Finance", labelAr: "المالية والميزانية", nameEn: "Finance", nameAr: "المالية والميزانية", emoji: "💸", count: financeCount },
    { id: "business", key: "business", labelEn: "Business", labelAr: "الأعمال والمشاريع", nameEn: "Business", nameAr: "الأعمال والمشاريع", emoji: "💼", count: businessCount },
    { id: "travel", key: "travel", labelEn: "Travel", labelAr: "السفر والرحلات", nameEn: "Travel", nameAr: "السفر والرحلات", emoji: "✈️", count: travelCount },
    { id: "gamification", key: "gamification", labelEn: "XP & Badges", labelAr: "نقاط الخبرة والأوسمة", nameEn: "XP & Badges", nameAr: "نقاط الخبرة والأوسمة", emoji: "🏆", count: badgesCount + (xpCount > 0 ? 1 : 0) },
  ];

  const categories = rawCategories.filter((c) => c.count > 0);
  const totalRecords = categories.reduce((sum, c) => sum + c.count, 0);

  return {
    hasData: totalRecords > 0,
    totalRecords,
    totalItems: totalRecords,
    categories,
  };
}

export const inspectGuestData = detectGuestData;

export type MigrationStrategy =
  | "keep_local"
  | "use_account_only"
  | "keep_and_merge"
  | "account_only"
  | "review_conflicts"
  | "cancel";

export type GuestMigrationStrategy = MigrationStrategy;

/**
 * Safely migrates or converts local guest data to an authenticated account identity.
 */
export function migrateGuestDataToUser(
  currentState: AppState,
  targetUserId: string,
  targetEmail: string,
  targetName: string,
  strategy: MigrationStrategy
): AppState {
  if (strategy === "cancel") {
    return currentState;
  }

  if (strategy === "use_account_only" || strategy === "account_only") {
    return {
      ...currentState,
      user: {
        ...currentState.user,
        id: targetUserId,
        email: targetEmail.trim().toLowerCase(),
        name: targetName.trim() || targetEmail.split("@")[0],
        isGuest: false,
        setupDone: true,
        authType: "authenticated",
      },
      session: true,
      tasks: [],
      habits: [],
      goals: [],
      journal: [],
      hydrationEvents: [],
      sleepRecords: [],
      selfCareActivities: [],
      selfCarePlanItems: [],
      xp: 0,
      xpLedger: [],
      unlockedBadges: [],
      badgeAwards: [],
    };
  }

  // Strategy: "keep_local" or "keep_and_merge" -> attach and re-key all existing records safely
  const updatedUser = {
    ...currentState.user,
    id: targetUserId,
    email: targetEmail.trim().toLowerCase(),
    name: targetName.trim() || currentState.user.name || targetEmail.split("@")[0],
    isGuest: false,
    setupDone: true,
    authType: "authenticated" as const,
  };

  // Re-key daily moods
  const updatedMoods = { ...currentState.dailyMoods };
  Object.keys(updatedMoods).forEach((k) => {
    if (updatedMoods[k]) {
      updatedMoods[k] = { ...updatedMoods[k], userId: targetUserId };
    }
  });

  return {
    ...currentState,
    user: updatedUser,
    session: true,
    dailyMoods: updatedMoods,
    yearInPixelsSettings: {
      ...currentState.yearInPixelsSettings,
      userId: targetUserId,
    } as any,
    userProgressSettings: {
      ...currentState.userProgressSettings,
      userId: targetUserId,
    } as any,
    badgeSettings: {
      ...currentState.badgeSettings,
      userId: targetUserId,
    } as any,
    wellnessSettings: {
      ...currentState.wellnessSettings,
      userId: targetUserId,
    } as any,
  };
}
