import { db } from "../db";

type Domain = "tasks" | "journals" | "habits" | "routines" | "goals" | "finances" | "wellness" | "study" | "user" | "prefs" | "misc";

const pendingWrites = new Map<Domain, any>();
const writeTimers = new Map<Domain, any>();
const DEBOUNCE_MS = 200;

export function scheduleAsyncWrite(domain: Domain, data: any) {
  pendingWrites.set(domain, data);
  if (writeTimers.has(domain)) {
    clearTimeout(writeTimers.get(domain));
  }
  const timer = setTimeout(async () => {
    writeTimers.delete(domain);
    await flushDomainWrite(domain);
  }, DEBOUNCE_MS);
  writeTimers.set(domain, timer);
}

export async function flushDomainWrite(domain: Domain) {
  const data = pendingWrites.get(domain);
  if (!data) return;
  pendingWrites.delete(domain);

  try {
    switch (domain) {
      case "tasks":
        await db.tasks.clear();
        if (Array.isArray(data) && data.length) {
          const valid = data.filter((t) => t && t.id);
          if (valid.length) await db.tasks.bulkPut(valid);
        }
        break;
      case "journals":
        await db.journals.clear();
        if (Array.isArray(data) && data.length) {
          const valid = data.filter((j) => j && j.id);
          if (valid.length) await db.journals.bulkPut(valid);
        }
        break;
      case "habits":
        await db.habits.clear();
        if (Array.isArray(data) && data.length) {
          const valid = data.filter((h) => h && h.id);
          if (valid.length) await db.habits.bulkPut(valid);
        }
        break;
      case "routines":
        await db.routines.clear();
        if (Array.isArray(data) && data.length) {
          const valid = data.filter((r) => r && r.id);
          if (valid.length) await db.routines.bulkPut(valid);
        }
        break;
      case "goals":
        await db.goals.clear();
        if (Array.isArray(data) && data.length) {
          const valid = data.filter((g) => g && g.id);
          if (valid.length) await db.goals.bulkPut(valid);
        }
        break;
      case "finances":
        if (data && Array.isArray(data.transactions)) {
          await db.finances.clear();
          const valid = data.transactions.filter((tx: any) => tx && tx.id);
          if (valid.length) await db.finances.bulkPut(valid);
        }
        break;
      case "wellness":
        if (Array.isArray(data)) {
          await db.wellness.clear();
          const valid = data.map((w: any, idx: number) => ({
            ...w,
            date: w.date || w.id || `wellness-${idx}`,
          }));
          if (valid.length) await db.wellness.bulkPut(valid);
        }
        break;
      case "study":
        if (Array.isArray(data)) {
          await db.studySessions.clear();
          const valid = data.map((s: any, idx: number) => ({
            ...s,
            id: s.id || `study-${idx}`,
          }));
          if (valid.length) await db.studySessions.bulkPut(valid);
        }
        break;
      case "user":
        if (data && typeof data === "object") {
          await db.user.put({ ...data, id: "current" });
        }
        break;
      case "prefs":
        if (data && typeof data === "object") {
          await db.preferences.put({ ...data, id: "current" });
        }
        break;
      case "misc":
        if (data) {
          if (Array.isArray(data.challenges)) {
            await db.challenges.clear();
            const valid = data.challenges.map((c: any, idx: number) => ({ ...c, id: c.id || `ch-${idx}` }));
            if (valid.length) await db.challenges.bulkPut(valid);
          }
          if (Array.isArray(data.achievements)) {
            await db.achievements.clear();
            const valid = data.achievements.map((a: any, idx: number) => ({ ...a, id: a.id || `ach-${idx}` }));
            if (valid.length) await db.achievements.bulkPut(valid);
          }
          if (Array.isArray(data.books)) {
            await db.books.clear();
            const valid = data.books.map((b: any, idx: number) => ({ ...b, id: b.id || `book-${idx}` }));
            if (valid.length) await db.books.bulkPut(valid);
          }
          if (Array.isArray(data.trips)) {
            await db.trips.clear();
            const valid = data.trips.map((t: any, idx: number) => ({ ...t, id: t.id || `trip-${idx}` }));
            if (valid.length) await db.trips.bulkPut(valid);
          }
          if (Array.isArray(data.customCategories)) {
            await db.customCategories.clear();
            const valid = data.customCategories.filter(Boolean).map((c: any) => ({
              name: typeof c === "string" ? c : c.name || String(c),
            }));
            if (valid.length) await db.customCategories.bulkPut(valid);
          }
        }
        break;
    }
  } catch (err) {
    console.warn("Async write handled cleanly for domain " + domain, err);
  }
}

export async function flushAllPendingWrites() {
  const domains = Array.from(pendingWrites.keys());
  await Promise.all(domains.map((d) => flushDomainWrite(d)));
}
