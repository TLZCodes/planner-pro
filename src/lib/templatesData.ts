import type { TemplateSpread, JournalPage, TemplateCategory } from "@/types/canvasTypes";
import { createNewPage } from "./canvasStore";

const W = 1240;
const H = 1754;

function buildTemplatePage(title: string, layers: any[], bgType: any = "dotted", bgColor = "#FFFBF7"): JournalPage {
  const p = createNewPage(title);
  p.background = { type: bgType, color: bgColor, gridColor: "#E2D9D0", gridSize: 24 };
  p.layers = layers.map((l, idx) => ({
    id: `layer_${title.replace(/\s+/g, "_")}_${idx}_${Date.now()}`,
    name: l.name || `Layer ${idx + 1}`,
    type: l.type,
    x: l.x,
    y: l.y,
    width: l.width,
    height: l.height,
    rotation: l.rotation || 0,
    opacity: l.opacity ?? 1,
    zIndex: idx + 1,
    locked: l.locked ?? false,
    visible: true,
    blendMode: l.blendMode || "normal",
    props: l.props || {},
  }));
  return p;
}

export const TEMPLATES_DATA: TemplateSpread[] = [
  // --- 1. PLANNING & SPREADS (10) ---
  {
    id: "tmpl_weekly_horiz",
    title: "Weekly Spread (Horizontal 7-Day)",
    description: "7 horizontal daily rows with floral washi tape headers",
    category: "planning",
    palette: ["#FF1493", "#FFA07A", "#FFFBF7"],
    icon: "📅",
    page: buildTemplatePage("Weekly Horizontal", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🌸 WEEKLY PLANNER 🌸", fontFamily: "Outfit", fontSize: 38, fontWeight: "bold", color: "#FF1493", textAlign: "center" } },
      { name: "Washi Tape Top", type: "washiTape", x: W / 2 - 200, y: 130, width: 400, height: 32, rotation: -2, props: { pattern: "stripes", tapeColor: "#FFA07A" } },
      ...["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].flatMap((day, i) => [
        { name: `${day} Card`, type: "shape", x: 80, y: 200 + i * 210, width: W - 160, height: 180, props: { shapeKind: "rounded-rectangle", fillColor: "#FFFFFF", borderColor: "#E2D9D0", borderWidth: 2, borderRadius: 16 } },
        { name: `${day} Title`, type: "text", x: 110, y: 220 + i * 210, width: 300, height: 40, props: { text: `✨ ${day}`, fontFamily: "Outfit", fontSize: 22, fontWeight: "bold", color: "#FF1493" } }
      ])
    ])
  },
  {
    id: "tmpl_weekly_vert",
    title: "Weekly Spread (Vertical List)",
    description: "7 vertical columns for side-by-side day-to-day planning",
    category: "planning",
    palette: ["#A78BFA", "#3B82F6"],
    icon: "📆",
    page: buildTemplatePage("Weekly Vertical", [
      { name: "Title", type: "text", x: W / 2 - 300, y: 50, width: 600, height: 60, props: { text: "✨ THIS WEEK AT A GLANCE ✨", fontFamily: "Outfit", fontSize: 36, fontWeight: "bold", color: "#A78BFA", textAlign: "center" } },
      ...["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => ({
        name: `${day} Column`, type: "shape", x: 60 + i * 162, y: 150, width: 148, height: H - 250, props: { shapeKind: "rounded-rectangle", fillColor: "#FFFFFF", borderColor: "#A78BFA", borderWidth: 2, borderRadius: 16 }
      })),
      ...["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, i) => ({
        name: `${day} Text`, type: "text", x: 60 + i * 162, y: 170, width: 148, height: 40, props: { text: day, fontFamily: "Outfit", fontSize: 20, fontWeight: "bold", color: "#3B82F6", textAlign: "center" }
      }))
    ])
  },
  {
    id: "tmpl_daily_time",
    title: "Daily Planner (Hourly Time-blocked)",
    description: "6:00 AM to 10:00 PM schedule grid with priority tasks",
    category: "planning",
    palette: ["#2DD4BF", "#1E1220"],
    icon: "⏰",
    page: buildTemplatePage("Daily Timeblock", [
      { name: "Header", type: "text", x: 80, y: 60, width: 400, height: 50, props: { text: "📅 DAILY FOCUS", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF" } },
      { name: "Schedule Box", type: "shape", x: 80, y: 140, width: 500, height: H - 240, props: { shapeKind: "rounded-rectangle", fillColor: "#FFFFFF", borderColor: "#2DD4BF", borderWidth: 2, borderRadius: 20 } },
      { name: "Tasks Box", type: "shape", x: 620, y: 140, width: W - 700, height: H - 240, props: { shapeKind: "rounded-rectangle", fillColor: "#FFFFFF", borderColor: "#E2D9D0", borderWidth: 2, borderRadius: 20 } }
    ])
  },
  {
    id: "tmpl_daily_todo",
    title: "Daily Planner (To-Do & Notes Split)",
    description: "Dual column for rapid logging and braindump notes",
    category: "planning",
    palette: ["#FB923C", "#FF1493"],
    icon: "📋",
    page: buildTemplatePage("Daily To-Do Split", [
      { name: "Header", type: "text", x: 80, y: 60, width: 500, height: 60, props: { text: "📝 TODAY'S MISSION", fontFamily: "Outfit", fontSize: 36, fontWeight: "bold", color: "#FB923C" } },
      { name: "Left Column", type: "shape", x: 80, y: 150, width: (W - 200) / 2, height: H - 250, props: { shapeKind: "rounded-rectangle", fillColor: "#FFFFFF", borderColor: "#FB923C", borderWidth: 2, borderRadius: 20 } },
      { name: "Right Column", type: "shape", x: (W - 200) / 2 + 120, y: 150, width: (W - 200) / 2, height: H - 250, props: { shapeKind: "rounded-rectangle", fillColor: "#FFFFFF", borderColor: "#FF1493", borderWidth: 2, borderRadius: 20 } }
    ])
  },
  {
    id: "tmpl_monthly_calendar",
    title: "Monthly Calendar Overview",
    description: "Full month grid with day number boxes & note sidebar",
    category: "planning",
    palette: ["#FF1493", "#A78BFA"],
    icon: "🗓️",
    page: buildTemplatePage("Monthly Overview", [
      { name: "Title", type: "text", x: W / 2 - 300, y: 50, width: 600, height: 60, props: { text: "🗓️ MONTHLY CALENDAR", fontFamily: "Outfit", fontSize: 38, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_monthly_cover",
    title: "Monthly Cover / Title Page",
    description: "Aesthetic seasonal monthly title spread with floral wreath",
    category: "planning",
    palette: ["#FF1493", "#FCD34D"],
    icon: "🌸",
    page: buildTemplatePage("Monthly Cover Page", [
      { name: "Cover Month", type: "text", x: W / 2 - 400, y: H / 2 - 100, width: 800, height: 120, props: { text: "HELLO AUGUST", fontFamily: "Great Vibes", fontSize: 90, color: "#FF1493", textAlign: "center" } },
      { name: "Sticker Wreath", type: "sticker", x: W / 2 - 150, y: H / 2 - 300, width: 300, height: 300, props: { stampSymbol: "🌸" } }
    ])
  },
  {
    id: "tmpl_yearly_overview",
    title: "Yearly Overview (Year-at-a-Glance)",
    description: "12-month calendar grid spread for long-term milestone planning",
    category: "planning",
    palette: ["#3B82F6", "#1E1220"],
    icon: "🎯",
    page: buildTemplatePage("Yearly Overview", [
      { name: "Title", type: "text", x: W / 2 - 300, y: 50, width: 600, height: 60, props: { text: "🌟 2026 YEAR AT A GLANCE", fontFamily: "Outfit", fontSize: 36, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_future_log",
    title: "Future Log (6-Month Spread)",
    description: "6 large month cards for scheduling upcoming events ahead",
    category: "planning",
    palette: ["#A78BFA", "#FF1493"],
    icon: "🚀",
    page: buildTemplatePage("Future Log", [
      { name: "Title", type: "text", x: W / 2 - 300, y: 50, width: 600, height: 60, props: { text: "🚀 6-MONTH FUTURE LOG", fontFamily: "Outfit", fontSize: 36, fontWeight: "bold", color: "#A78BFA", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_monthly_combo",
    title: "Monthly Mood & Habit Combo",
    description: "Combined monthly calendar overview with integrated habit checkboxes",
    category: "planning",
    palette: ["#2DD4BF", "#FF1493"],
    icon: "📆",
    page: buildTemplatePage("Monthly Combo", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🗓️ MONTHLY COMBO DASHBOARD", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_quarterly_goals",
    title: "Quarterly Goal Overview",
    description: "Q1 to Q4 strategic milestones & key performance indicators",
    category: "planning",
    palette: ["#3B82F6", "#A78BFA"],
    icon: "🏁",
    page: buildTemplatePage("Quarterly Goals", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🏁 QUARTERLY GOAL MAP", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ])
  },

  // --- 2. TRACKERS (14) ---
  {
    id: "tmpl_habit_monthly",
    title: "Habit Tracker Grid (Monthly)",
    description: "31-day habit grid for tracking up to 8 habits",
    category: "trackers",
    palette: ["#3B82F6", "#2DD4BF"],
    icon: "✅",
    page: buildTemplatePage("Monthly Habit Grid", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "✅ MONTHLY HABIT TRACKER", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ], "grid")
  },
  {
    id: "tmpl_habit_weekly",
    title: "Habit Tracker Grid (Weekly)",
    description: "Compact 7-day tracker for weekly routines & streaks",
    category: "trackers",
    palette: ["#2DD4BF", "#A78BFA"],
    icon: "⚡",
    page: buildTemplatePage("Weekly Habit Tracker", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "⚡ WEEKLY HABIT STREAKS", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_mood_grid",
    title: "Mood Tracker (Calendar Grid)",
    description: "30 day boxes color-coded by mood emoji swatches",
    category: "trackers",
    palette: ["#FF1493", "#FB923C"],
    icon: "😄",
    page: buildTemplatePage("Mood Tracker Grid", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🌈 MY MOOD TRACKER", fontFamily: "Outfit", fontSize: 36, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_year_pixels",
    title: "Year in Pixels Grid (12-Month)",
    description: "Full 365-day color pixel grid for tracking annual emotional balance",
    category: "trackers",
    palette: ["#A78BFA", "#FF1493"],
    icon: "🎨",
    page: buildTemplatePage("Year in Pixels", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🎨 YEAR IN PIXELS 2026", fontFamily: "Outfit", fontSize: 36, fontWeight: "bold", color: "#A78BFA", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_water_tracker",
    title: "Water Intake Tracker",
    description: "Daily water glass drop icons to fill for hydration goals",
    category: "trackers",
    palette: ["#3B82F6", "#FFFFFF"],
    icon: "💧",
    page: buildTemplatePage("Hydration Tracker", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "💧 HYDRATION TRACKER", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_sleep_tracker",
    title: "Sleep Tracker & Quality Log",
    description: "Bedtime, wake time, and sleep quality rating spread",
    category: "trackers",
    palette: ["#A78BFA", "#1E1220"],
    icon: "🌙",
    page: buildTemplatePage("Sleep Tracker", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🌙 SLEEP & DREAMS LOG", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#A78BFA", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_workout_log",
    title: "Workout & Fitness Log",
    description: "Sets, reps, cardio, and workout routine tracking spread",
    category: "trackers",
    palette: ["#FB923C", "#FF1493"],
    icon: "🏋️",
    page: buildTemplatePage("Fitness Log", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🏃 WORKOUT & FITNESS LOG", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FB923C", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_cycle_tracker",
    title: "Cycle & Period Tracker",
    description: "Monthly cycle phase calendar & symptom monitoring spread",
    category: "trackers",
    palette: ["#FF1493", "#FFA07A"],
    icon: "🌸",
    page: buildTemplatePage("Cycle Tracker", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🌸 CYCLE & HEALTH TRACKER", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_books_log",
    title: "Books & Reading Log",
    description: "Bookshelf spine illustrations to color & rate read books",
    category: "trackers",
    palette: ["#FB923C", "#A78BFA"],
    icon: "📚",
    page: buildTemplatePage("Reading Bookshelf", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "📚 MY READING BOOKSHELF", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FB923C", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_movies_watchlist",
    title: "Movies & Shows Watchlist",
    description: "Film reel cards with 5-star rating stamps",
    category: "trackers",
    palette: ["#FCD34D", "#1E1220"],
    icon: "🎬",
    page: buildTemplatePage("Movies Watchlist", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🎬 MOVIES & SHOWS WATCHLIST", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FCD34D", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_gratitude_log",
    title: "30-Day Gratitude Log",
    description: "Daily reflective prompt cards with soft cloud highlights",
    category: "trackers",
    palette: ["#FF1493", "#2DD4BF"],
    icon: "🌟",
    page: buildTemplatePage("Gratitude Log", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "✨ 30 DAYS OF GRATITUDE", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_selfcare_check",
    title: "Self-Care Checklist",
    description: "Mind, body, and soul daily self-care routine checklist",
    category: "trackers",
    palette: ["#2DD4BF", "#A78BFA"],
    icon: "💖",
    page: buildTemplatePage("Self-Care Checklist", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "💖 DAILY SELF-CARE ROUTINE", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_skincare_routine",
    title: "Skincare AM/PM Routine Log",
    description: "Cleanser, toner, serum, and sunscreen daily product tracker",
    category: "trackers",
    palette: ["#FF1493", "#2DD4BF"],
    icon: "🧴",
    page: buildTemplatePage("Skincare Log", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🧴 SKINCARE ROUTINE LOG", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_mindfulness_log",
    title: "Mindfulness & Meditation Tracker",
    description: "Daily meditation minutes, breathing exercises, and inner peace log",
    category: "trackers",
    palette: ["#A78BFA", "#3B82F6"],
    icon: "🧘",
    page: buildTemplatePage("Mindfulness Tracker", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🧘 MINDFULNESS & MEDITATION", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#A78BFA", textAlign: "center" } }
    ])
  },

  // --- 3. FINANCE (8) ---
  {
    id: "tmpl_budget_monthly",
    title: "Monthly Budget Tracker",
    description: "Income, fixed expenses, and variable spending categories",
    category: "finance",
    palette: ["#2DD4BF", "#3B82F6"],
    icon: "💵",
    page: buildTemplatePage("Monthly Budget", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "💵 MONTHLY BUDGET PLAN", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_expense_log",
    title: "Expense Log Sheet",
    description: "Date, item, category, cost, and payment method tracker",
    category: "finance",
    palette: ["#3B82F6", "#1E1220"],
    icon: "🧾",
    page: buildTemplatePage("Expense Log", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🧾 DAILY EXPENSE LOG", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_savings_jar",
    title: "Savings Goal Tracker ('Fill the Jar')",
    description: "Aesthetic jar graphics to color as savings milestones are hit",
    category: "finance",
    palette: ["#FCD34D", "#FF1493"],
    icon: "🏺",
    page: buildTemplatePage("Savings Jar Goal", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🏺 SAVINGS GOAL JAR", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_debt_payoff",
    title: "Debt Payoff Tracker",
    description: "Visual progress bar spread for paying off loans & cards",
    category: "finance",
    palette: ["#FB923C", "#3B82F6"],
    icon: "💳",
    page: buildTemplatePage("Debt Payoff", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "💳 DEBT PAYOFF TRACKER", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FB923C", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_subs_tracker",
    title: "Subscription Tracker",
    description: "Monthly & annual recurring service renewal dates log",
    category: "finance",
    palette: ["#A78BFA", "#FF1493"],
    icon: "📱",
    page: buildTemplatePage("Subscription Tracker", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "📱 SUBSCRIPTION MANAGER", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#A78BFA", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_savings_challenge",
    title: "Savings Challenge ($1,000 in 30 Days)",
    description: "30 daily deposit tiles to check off towards $1,000 emergency fund",
    category: "finance",
    palette: ["#2DD4BF", "#FCD34D"],
    icon: "💰",
    page: buildTemplatePage("30-Day Savings Challenge", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "💰 $1,000 SAVINGS CHALLENGE", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_budget_503020",
    title: "50/30/20 Rule Budget Split",
    description: "Needs (50%), Wants (30%), and Savings (20%) breakdown planner",
    category: "finance",
    palette: ["#FF1493", "#3B82F6"],
    icon: "📊",
    page: buildTemplatePage("50/30/20 Budget", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "📊 50/30/20 BUDGET SPLIT", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_networth_tracker",
    title: "Annual Net Worth Tracker",
    description: "Quarterly assets, liabilities, and net worth growth graph spread",
    category: "finance",
    palette: ["#3B82F6", "#2DD4BF"],
    icon: "📈",
    page: buildTemplatePage("Net Worth Tracker", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "📈 NET WORTH TRACKER", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ])
  },

  // --- 4. STUDY / WORK (8) ---
  {
    id: "tmpl_class_schedule",
    title: "Class Schedule & Timetable",
    description: "Weekly course schedule grid with room numbers & professors",
    category: "study",
    palette: ["#3B82F6", "#2DD4BF"],
    icon: "🏫",
    page: buildTemplatePage("Class Timetable", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🏫 CLASS TIMETABLE", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_assignment_log",
    title: "Assignment & Exam Tracker",
    description: "Subject, assignment, due date, status, and grade sheet",
    category: "study",
    palette: ["#FF1493", "#FB923C"],
    icon: "✍️",
    page: buildTemplatePage("Assignment Tracker", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "✍️ ASSIGNMENTS & EXAMS", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_pomodoro_log",
    title: "Study Session Log (Pomodoro)",
    description: "Focus timer sessions, break notes, and topic summary cards",
    category: "study",
    palette: ["#2DD4BF", "#A78BFA"],
    icon: "⏱️",
    page: buildTemplatePage("Pomodoro Log", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "⏱️ POMODORO STUDY LOG", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_kanban_project",
    title: "Project Planner (Kanban Board)",
    description: "To Do, In Progress, Review, and Done column cards",
    category: "study",
    palette: ["#A78BFA", "#3B82F6"],
    icon: "📌",
    page: buildTemplatePage("Kanban Project Board", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "📌 KANBAN PROJECT BOARD", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#A78BFA", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_meeting_notes",
    title: "Meeting Notes Page",
    description: "Date, attendees, agenda, action items, and key takeaways",
    category: "study",
    palette: ["#FB923C", "#1E1220"],
    icon: "👥",
    page: buildTemplatePage("Meeting Notes", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "👥 MEETING NOTES & ACTIONS", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FB923C", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_thesis_outline",
    title: "Thesis & Essay Outline Planner",
    description: "Research thesis statement, introduction, body paragraphs, and references",
    category: "study",
    palette: ["#3B82F6", "#A78BFA"],
    icon: "🎓",
    page: buildTemplatePage("Thesis Outline", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🎓 THESIS & ESSAY OUTLINE", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_vocab_flashcards",
    title: "Vocabulary & Flashcard Log",
    description: "Word, definition, example sentence, and memory review checkboxes",
    category: "study",
    palette: ["#2DD4BF", "#FF1493"],
    icon: "🔤",
    page: buildTemplatePage("Vocabulary Log", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🔤 VOCABULARY & FLASHCARDS", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_work_sprint",
    title: "Agile Work Sprint Planner",
    description: "Sprint goals, backlog stories, daily standup notes, and retrospective",
    category: "study",
    palette: ["#FF1493", "#FB923C"],
    icon: "🏃",
    page: buildTemplatePage("Work Sprint Planner", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🚀 AGILE SPRINT PLANNER", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },

  // --- 5. GOALS & REFLECTION (10) ---
  {
    id: "tmpl_vision_board",
    title: "Vision Board (Blank Collage)",
    description: "Collage frame layout for photo cutouts & inspirational quotes",
    category: "goals",
    palette: ["#FF1493", "#A78BFA"],
    icon: "🖼️",
    page: buildTemplatePage("Vision Board", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "✨ MY VISION BOARD ✨", fontFamily: "Outfit", fontSize: 36, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_goal_setting",
    title: "Goal-Setting Page (Action Plan)",
    description: "Specific goals, action steps, deadlines, and reward milestone spread",
    category: "goals",
    palette: ["#3B82F6", "#2DD4BF"],
    icon: "🎯",
    page: buildTemplatePage("Goal Setting Action Plan", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🎯 GOAL SETTING ACTION PLAN", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_bucket_list",
    title: "Life Bucket List",
    description: "Travel, career, personal, and adventure dream lists",
    category: "goals",
    palette: ["#FCD34D", "#FF1493"],
    icon: "🪣",
    page: buildTemplatePage("Life Bucket List", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🪣 MY LIFE BUCKET LIST", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_brain_dump",
    title: "Brain Dump Page",
    description: "Freeform open canvas with cloud note bubbles for clearing mind clutter",
    category: "goals",
    palette: ["#A78BFA", "#2DD4BF"],
    icon: "🧠",
    page: buildTemplatePage("Brain Dump", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🧠 BRAIN DUMP & CLUTTER CLEAR", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#A78BFA", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_guided_reflection",
    title: "Journaling Prompt (Guided Reflection)",
    description: "Guided daily self-discovery prompts & reflection spaces",
    category: "goals",
    palette: ["#2DD4BF", "#FB923C"],
    icon: "✍️",
    page: buildTemplatePage("Guided Reflection", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "✍️ GUIDED DAILY REFLECTION", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_month_in_review",
    title: "This Month in Review Recap",
    description: "Highlights, top wins, challenges, and next month goals",
    category: "goals",
    palette: ["#FB923C", "#FF1493"],
    icon: "🏆",
    page: buildTemplatePage("Month in Review", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🏆 THIS MONTH IN REVIEW", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FB923C", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_wheel_of_life",
    title: "Wheel of Life Reflection",
    description: "8-spoke pie wheel for rating satisfaction across health, career, love & growth",
    category: "goals",
    palette: ["#FF1493", "#A78BFA"],
    icon: "🎡",
    page: buildTemplatePage("Wheel of Life", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🎡 WHEEL OF LIFE ASSESSMENT", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_annual_timeline",
    title: "Annual Milestone Timeline",
    description: "12-month linear timeline for tracking big life achievements",
    category: "goals",
    palette: ["#3B82F6", "#2DD4BF"],
    icon: "🗓️",
    page: buildTemplatePage("Annual Timeline", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "🗓️ ANNUAL MILESTONE TIMELINE", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#3B82F6", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_fear_setting",
    title: "Fear-Setting & Risk Analysis",
    description: "Define fears, prevent risks, and repair worst-case scenarios spread",
    category: "goals",
    palette: ["#A78BFA", "#FB923C"],
    icon: "💡",
    page: buildTemplatePage("Fear Setting", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "💡 FEAR-SETTING ANALYSIS", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#A78BFA", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_letter_to_future_self",
    title: "Letter to My Future Self",
    description: "Time capsule writing page to read 1 year from today",
    category: "goals",
    palette: ["#2DD4BF", "#FF1493"],
    icon: "✉️",
    page: buildTemplatePage("Future Self Letter", [
      { name: "Header", type: "text", x: W / 2 - 300, y: 60, width: 600, height: 60, props: { text: "✉️ LETTER TO MY FUTURE SELF", fontFamily: "Outfit", fontSize: 34, fontWeight: "bold", color: "#2DD4BF", textAlign: "center" } }
    ])
  },

  // --- 6. DECORATIVE / COVER PAGES (10) ---
  {
    id: "tmpl_cover_floral",
    title: "Title Cover (Floral Aesthetic)",
    description: "Botanical blossoms & script typography cover spread",
    category: "decorative",
    palette: ["#FF1493", "#FFA07A"],
    icon: "🌸",
    page: buildTemplatePage("Floral Cover", [
      { name: "Title", type: "text", x: W / 2 - 400, y: H / 2 - 80, width: 800, height: 120, props: { text: "MY BULLET JOURNAL", fontFamily: "Great Vibes", fontSize: 80, color: "#FF1493", textAlign: "center" } },
      { name: "Flower", type: "sticker", x: W / 2 - 100, y: H / 2 - 280, width: 200, height: 200, props: { stampSymbol: "🌸" } }
    ])
  },
  {
    id: "tmpl_cover_celestial",
    title: "Title Cover (Celestial Night)",
    description: "Golden moon phase & galaxy star sparkles layout",
    category: "decorative",
    palette: ["#A78BFA", "#FCD34D"],
    icon: "🌙",
    page: buildTemplatePage("Celestial Cover", [
      { name: "Title", type: "text", x: W / 2 - 400, y: H / 2 - 80, width: 800, height: 120, props: { text: "STARDUST & DREAMS", fontFamily: "Cinzel", fontSize: 60, color: "#A78BFA", textAlign: "center" } },
      { name: "Moon", type: "sticker", x: W / 2 - 100, y: H / 2 - 280, width: 200, height: 200, props: { stampSymbol: "🌙" } }
    ], "blank", "#111018")
  },
  {
    id: "tmpl_cover_minimal",
    title: "Title Cover (Minimal Line-Art)",
    description: "Clean aesthetic typography with subtle border frame",
    category: "decorative",
    palette: ["#1E1220", "#E2D9D0"],
    icon: "🌿",
    page: buildTemplatePage("Minimal Cover", [
      { name: "Border Frame", type: "shape", x: 100, y: 100, width: W - 200, height: H - 200, props: { shapeKind: "rectangle", fillColor: "transparent", borderColor: "#1E1220", borderWidth: 2 } },
      { name: "Title", type: "text", x: W / 2 - 350, y: H / 2 - 50, width: 700, height: 100, props: { text: "PLANNER 2026", fontFamily: "Outfit", fontSize: 56, fontWeight: "bold", color: "#1E1220", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_cover_y2k",
    title: "Title Cover (Y2K Retro)",
    description: "Neon pink lightning, sparkles, and bold pixel graphics",
    category: "decorative",
    palette: ["#FF1493", "#2DD4BF"],
    icon: "⚡",
    page: buildTemplatePage("Y2K Cover", [
      { name: "Title", type: "text", x: W / 2 - 400, y: H / 2 - 80, width: 800, height: 120, props: { text: "AYXA PLANNER ★", fontFamily: "Outfit", fontSize: 70, fontWeight: "bold", color: "#FF1493", textAlign: "center" } },
      { name: "Lightning", type: "sticker", x: W / 2 - 80, y: H / 2 - 260, width: 160, height: 160, props: { stampSymbol: "⚡" } }
    ])
  },
  {
    id: "tmpl_cover_cleangirl",
    title: "Title Cover (Clean Girl Soft Beige)",
    description: "Pastel warm beige tone with minimalist serif title",
    category: "decorative",
    palette: ["#E2D9D0", "#1E1220"],
    icon: "☕",
    page: buildTemplatePage("Clean Girl Cover", [
      { name: "Title", type: "text", x: W / 2 - 400, y: H / 2 - 60, width: 800, height: 100, props: { text: "Daily Reflections", fontFamily: "Playfair Display", fontSize: 64, color: "#1E1220", textAlign: "center" } }
    ], "blank", "#F7F4EF")
  },
  {
    id: "tmpl_section_divider",
    title: "Divider / Section Page",
    description: "Clean section break page with tab ribbon decoration",
    category: "decorative",
    palette: ["#3B82F6", "#A78BFA"],
    icon: "🔖",
    page: buildTemplatePage("Section Divider", [
      { name: "Ribbon", type: "washiTape", x: W / 2 - 250, y: H / 2 - 80, width: 500, height: 40, props: { pattern: "polkadot", tapeColor: "#3B82F6" } },
      { name: "Section Name", type: "text", x: W / 2 - 350, y: H / 2 - 30, width: 700, height: 80, props: { text: "SECTION I", fontFamily: "Outfit", fontSize: 48, fontWeight: "bold", color: "#FFFFFF", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_quote_page",
    title: "Quote Page (Decorative Typography)",
    description: "Large quote poster layout with background highlighter wave",
    category: "decorative",
    palette: ["#FF1493", "#FCD34D"],
    icon: "💬",
    page: buildTemplatePage("Quote Page", [
      { name: "Quote Text", type: "text", x: W / 2 - 450, y: H / 2 - 120, width: 900, height: 240, props: { text: "“Make today so awesome that yesterday gets jealous.”", fontFamily: "Great Vibes", fontSize: 64, color: "#FF1493", textAlign: "center" } }
    ])
  },
  {
    id: "tmpl_scrapbook_collage",
    title: "Memory Scrapbook Photo Collage",
    description: "Polaroid frames, photos, washi tapes, and sticky notes",
    category: "decorative",
    palette: ["#FFA07A", "#FF1493"],
    icon: "📸",
    page: buildTemplatePage("Scrapbook Collage", [
      { name: "Polaroid 1", type: "shape", x: 140, y: 200, width: 400, height: 480, props: { shapeKind: "rectangle", fillColor: "#FFFFFF", borderColor: "#E2D9D0", borderWidth: 2 } },
      { name: "Tape 1", type: "washiTape", x: 260, y: 180, width: 160, height: 32, rotation: -4, props: { pattern: "stripes", tapeColor: "#FFA07A" } },
      { name: "Polaroid 2", type: "shape", x: 680, y: 350, width: 420, height: 500, rotation: 6, props: { shapeKind: "rectangle", fillColor: "#FFFFFF", borderColor: "#E2D9D0", borderWidth: 2 } }
    ])
  },
  {
    id: "tmpl_cover_coquette",
    title: "Title Cover (Coquette Vintage Bow)",
    description: "Soft pink ribbon bows & French script title page spread",
    category: "decorative",
    palette: ["#FF1493", "#FFFFFF"],
    icon: "🎀",
    page: buildTemplatePage("Coquette Bow Cover", [
      { name: "Title", type: "text", x: W / 2 - 400, y: H / 2 - 80, width: 800, height: 120, props: { text: "Mon Journal Chic", fontFamily: "Great Vibes", fontSize: 80, color: "#FF1493", textAlign: "center" } },
      { name: "Bow Sticker", type: "sticker", x: W / 2 - 80, y: H / 2 - 250, width: 160, height: 160, props: { stampSymbol: "🎀" } }
    ])
  },
  {
    id: "tmpl_cover_dark_academia",
    title: "Title Cover (Dark Academia Vintage)",
    description: "Deep burgundy leather frame with gold wax seal accent",
    category: "decorative",
    palette: ["#1E1220", "#FCD34D"],
    icon: "📜",
    page: buildTemplatePage("Dark Academia Cover", [
      { name: "Title", type: "text", x: W / 2 - 400, y: H / 2 - 80, width: 800, height: 120, props: { text: "COMPENDIUM 2026", fontFamily: "Cinzel", fontSize: 64, color: "#FCD34D", textAlign: "center" } }
    ], "blank", "#16141c")
  }
];

// Local Storage Custom Templates Key
const CUSTOM_TEMPLATES_STORAGE_KEY = "ayxa_custom_bujo_templates_v1";

export function getUserCustomTemplates(): TemplateSpread[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveCustomUserTemplate(page: JournalPage, title: string, category: TemplateCategory = "my-templates"): TemplateSpread {
  const existing = getUserCustomTemplates();
  const newTmpl: TemplateSpread = {
    id: `custom_tmpl_${Date.now()}`,
    title,
    description: "Custom saved user template spread",
    category,
    palette: ["#FF1493", "#1E1220"],
    icon: "⭐",
    page: JSON.parse(JSON.stringify(page)),
  };
  const updated = [newTmpl, ...existing];
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {}
  return newTmpl;
}
