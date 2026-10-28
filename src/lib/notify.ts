import { dhikrOfDay, quoteOfDay } from "./content";

export type NotifPermission = "default" | "granted" | "denied" | "unsupported";

export function notifSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notifStatus(): NotifPermission {
  if (!notifSupported()) return "unsupported";
  return Notification.permission as NotifPermission;
}

export async function requestNotifPermission(): Promise<NotifPermission> {
  if (!notifSupported()) return "unsupported";
  const res = await Notification.requestPermission();
  return res as NotifPermission;
}

export function showNotif(title: string, body: string) {
  try {
    if (!notifSupported()) return false;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
    try {
      new Notification(title, { body, icon: "/favicon.ico" });
      return true;
    } catch {
      // In some Android WebViews, Notification exists but cannot be instantiated
      return false;
    }
  } catch {
    return false;
  }
}

const SENT_KEY = "ayxa-notif-sent";

function alreadySentToday(kind: string) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(SENT_KEY) : null;
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return map[kind] === today;
  } catch {
    return false;
  }
}

function markSent(kind: string) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(SENT_KEY) : null;
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    map[kind] = today;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SENT_KEY, JSON.stringify(map));
    }
  } catch {
    /* ignore storage write failures */
  }
}

type Prefs = {
  reminderTime: string;
  quoteNotif: boolean;
  dhikrNotif: boolean;
  taskNotif: boolean;
};

/** Fires the daily quote / dhikr / task reminders once per day, at or after the chosen time. */
export function runDailyReminders(prefs?: Prefs, pendingTasks: number = 0) {
  try {
    if (!prefs || !notifSupported() || Notification.permission !== "granted") return;
    const [h, m] = (prefs.reminderTime || "08:00").split(":").map(Number);
    const now = new Date();
    const due = now.getHours() * 60 + now.getMinutes() >= (h ?? 8) * 60 + (m ?? 0);
    if (!due) return;

    if (prefs.quoteNotif && !alreadySentToday("quote")) {
      const q = quoteOfDay();
      if (showNotif("Quote of the day 🌸", q.en)) markSent("quote");
    }
    if (prefs.dhikrNotif && !alreadySentToday("dhikr")) {
      const d = dhikrOfDay();
      if (showNotif("Dhikr reminder 🤍", `${d.ar} — ${d.en}`)) markSent("dhikr");
    }
    if (prefs.taskNotif && pendingTasks > 0 && !alreadySentToday("tasks")) {
      if (showNotif("Your plan for today ✨", `${pendingTasks} task(s) waiting for you.`))
        markSent("tasks");
    }
  } catch {
    /* silent catch to guarantee zero unhandled runtime issues */
  }
}
