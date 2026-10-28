import { db, type StoredAttachment } from "./db";

const LEGACY_STORAGE_KEY = "ayxa-state-v1";
const LEGACY_BACKUP_KEY = "ayxa-state-v1-backup";
const MIGRATION_META_KEY = "migration_status";
const CURRENT_MIGRATION_VERSION = 1;

export interface MigrationResult {
  migrated: boolean;
  version: number;
  tasksCount: number;
  journalsCount: number;
  habitsCount: number;
  routinesCount: number;
  goalsCount: number;
  error?: string;
}

export async function runMigration(): Promise<MigrationResult> {
  try {
    if (typeof window === "undefined") {
      return { migrated: false, version: CURRENT_MIGRATION_VERSION, tasksCount: 0, journalsCount: 0, habitsCount: 0, routinesCount: 0, goalsCount: 0 };
    }

    const existingMeta = await db.meta.get(MIGRATION_META_KEY);
    if (existingMeta && existingMeta.value?.version >= CURRENT_MIGRATION_VERSION) {
      const tasksCount = await db.tasks.count();
      const journalsCount = await db.journals.count();
      const habitsCount = await db.habits.count();
      const routinesCount = await db.routines.count();
      const goalsCount = await db.goals.count();
      return {
        migrated: false,
        version: existingMeta.value.version,
        tasksCount,
        journalsCount,
        habitsCount,
        routinesCount,
        goalsCount,
      };
    }

    const rawLegacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!rawLegacy) {
      await db.meta.put({
        key: MIGRATION_META_KEY,
        value: { version: CURRENT_MIGRATION_VERSION, timestamp: new Date().toISOString(), fresh: true },
        updatedAt: new Date().toISOString(),
      });
      return { migrated: true, version: CURRENT_MIGRATION_VERSION, tasksCount: 0, journalsCount: 0, habitsCount: 0, routinesCount: 0, goalsCount: 0 };
    }

    try {
      window.localStorage.setItem(LEGACY_BACKUP_KEY, rawLegacy);
    } catch {
      // Ignore quota errors on backup
    }

    const legacyData = JSON.parse(rawLegacy);
    const tasks = Array.isArray(legacyData.tasks) ? legacyData.tasks : [];
    const journals = Array.isArray(legacyData.journal) ? legacyData.journal : [];
    const habits = Array.isArray(legacyData.habits) ? legacyData.habits : [];
    const routines = Array.isArray(legacyData.routines) ? legacyData.routines : [];
    const goals = Array.isArray(legacyData.goals) ? legacyData.goals : [];
    const challenges = Array.isArray(legacyData.challenges) ? legacyData.challenges : [];
    const achievements = Array.isArray(legacyData.achievements) ? legacyData.achievements : [];
    const books = Array.isArray(legacyData.books) ? legacyData.books : [];
    const trips = Array.isArray(legacyData.trips) ? legacyData.trips : [];
    const finances = legacyData.finances?.transactions && Array.isArray(legacyData.finances.transactions) ? legacyData.finances.transactions : [];
    const customCategories = Array.isArray(legacyData.customCategories) ? legacyData.customCategories.map((c: string) => ({ name: c })) : [];

    const extractedAttachments: StoredAttachment[] = [];
    const sanitizedJournals = journals.map((j: any) => {
      if (Array.isArray(j.attachments)) {
        const cleanedAtts = j.attachments.map((att: any) => {
          if (att.url && (att.url.startsWith("data:") || att.url.startsWith("blob:"))) {
            const attId = att.id || "att-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
            extractedAttachments.push({
              id: attId,
              entryId: j.id,
              type: att.type || "photo",
              mimeType: att.url.startsWith("data:") ? att.url.split(";")[0].replace("data:", "") : "image/jpeg",
              name: att.name || "Attachment",
              data: att.url,
              createdAt: new Date().toISOString(),
            });
            return {
              id: attId,
              type: att.type || "photo",
              name: att.name || "Attachment",
              url: attId,
            };
          }
          return att;
        });
        return { ...j, attachments: cleanedAtts };
      }
      return j;
    });

    await db.transaction("rw", [
      db.tasks,
      db.journals,
      db.attachments,
      db.habits,
      db.routines,
      db.goals,
      db.challenges,
      db.achievements,
      db.books,
      db.trips,
      db.finances,
      db.customCategories,
      db.user,
      db.preferences,
      db.meta,
    ], async () => {
      if (tasks.length) await db.tasks.bulkPut(tasks);
      if (sanitizedJournals.length) await db.journals.bulkPut(sanitizedJournals);
      if (extractedAttachments.length) await db.attachments.bulkPut(extractedAttachments);
      if (habits.length) await db.habits.bulkPut(habits);
      if (routines.length) await db.routines.bulkPut(routines);
      if (goals.length) await db.goals.bulkPut(goals);
      if (challenges.length) await db.challenges.bulkPut(challenges);
      if (achievements.length) await db.achievements.bulkPut(achievements);
      if (books.length) await db.books.bulkPut(books);
      if (trips.length) await db.trips.bulkPut(trips);
      if (finances.length) await db.finances.bulkPut(finances);
      if (customCategories.length) await db.customCategories.bulkPut(customCategories);

      if (legacyData.user) {
        await db.user.put({ ...legacyData.user, id: "current" });
      }
      if (legacyData.prefs) {
        await db.preferences.put({ ...legacyData.prefs, id: "current" });
      }

      await db.meta.put({
        key: MIGRATION_META_KEY,
        value: {
          version: CURRENT_MIGRATION_VERSION,
          timestamp: new Date().toISOString(),
          tasksCount: tasks.length,
          journalsCount: sanitizedJournals.length,
          attachmentsCount: extractedAttachments.length,
        },
        updatedAt: new Date().toISOString(),
      });
    });

    return {
      migrated: true,
      version: CURRENT_MIGRATION_VERSION,
      tasksCount: tasks.length,
      journalsCount: sanitizedJournals.length,
      habitsCount: habits.length,
      routinesCount: routines.length,
      goalsCount: goals.length,
    };
  } catch (err: any) {
    console.error("Migration failed:", err);
    return {
      migrated: false,
      version: 0,
      tasksCount: 0,
      journalsCount: 0,
      habitsCount: 0,
      routinesCount: 0,
      goalsCount: 0,
      error: err?.message || String(err),
    };
  }
}