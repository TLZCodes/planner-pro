// Shared scene dataset for the AYXA Planner Pro educational showcase studio.
// One entry per scene. Consumed by the shot-card generator and the video builder,
// so the narration that is spoken is the same narration recorded in the cards.

export const FILM = {
  title: "AYXA Planner Pro",
  subtitle: "A guided tour of every module",
  studioRoot: ".",
  fps: 30,
  dissolveMs: 380,
};

export const SCENES = [
  {
    id: "sc01",
    chapter: null,
    location: "@brand_intro",
    route: null,
    shots: [
      {
        suffix: "a",
        description:
          "Cold open on the brand mark. The wordmark settles into place over the blush ground while the accent rule draws beneath it.",
        goal: "Establish the product identity and the promise of a complete tour.",
        task: "reveal",
        runs: 11,
        complexity: "low",
      },
      {
        suffix: "b",
        description:
          "The phone frame rises into place on the empty ground and the Home screen fades up inside it, holding, ready to be described.",
        goal: "Hand the viewer a device before any feature is explained.",
        task: "introduce",
        runs: 10,
        complexity: "low",
      },
    ],
    narration: [
      "This is AYXA Planner Pro — a complete, bilingual planner that runs on your phone and on the web.",
      "In the next few minutes we will walk through every module, one screen at a time, and show you exactly what each one is for.",
    ],
  },
  {
    id: "sc02",
    chapter: "1 · Home — your day at a glance",
    location: "@screen_home",
    route: "/",
    shots: [
      {
        suffix: "a",
        description:
          "Slow push-in on the Home dashboard. The greeting, today's plan, dhikr card, statistics and routine progress are all legible and undisturbed.",
        goal: "Teach that Home is a read-only summary, not a data-entry screen.",
        task: "orient",
        runs: 13,
        complexity: "low",
      },
    ],
    narration: [
      "Home is your summary, not your workbench. At the top you get a time-aware greeting and today's plan. Below it sit a dhikr reminder, your statistics, and the progress of today's routines.",
      "Nothing here needs to be filled in. You read it once in the morning and you know exactly where your day stands.",
    ],
  },
  {
    id: "sc03",
    chapter: "2 · Tasks — top three, then the rest",
    location: "@screen_tasks",
    route: "/tasks",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Tasks screen. The top-three focus block is visible above the time-scheduled list, with the anytime list below it.",
        goal: "Explain the three-tier task structure and the completion behaviour.",
        task: "tour",
        runs: 14,
        complexity: "medium",
      },
    ],
    narration: [
      "Tasks uses three tiers. Your top three are chosen deliberately, so the most important work is never buried.",
      "Then come tasks with a specific time, then everything else with no time yet. Ticking a task records the completion date, and that date is what every weekly review later reads.",
    ],
  },
  {
    id: "sc04",
    chapter: "3 · AI Planner — intent becomes a plan",
    location: "@screen_ai",
    route: "/ai",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the AI planner conversation. The composer and the resulting structured suggestions are both readable.",
        goal: "Show that the AI produces structure the user still approves.",
        task: "demonstrate",
        runs: 13,
        complexity: "medium",
      },
    ],
    narration: [
      "The AI Planner turns a sentence into structure. You describe your day in plain language, and it proposes tasks, times and categories.",
      "You stay in control: nothing is created until you accept it, and the assistant never rewrites records you already have.",
    ],
  },
  {
    id: "sc05",
    chapter: "4 · Routines — morning to night",
    location: "@screen_routines",
    route: "/routines",
    shots: [
      {
        suffix: "a",
        description:
          "Tilt down the routines tab row, then hold on the Ideal Day hero banner showing the completion percentage and the step list beneath.",
        goal: "Explain that routines are reusable templates the user edits once.",
        task: "unpack",
        runs: 14,
        complexity: "medium",
      },
    ],
    narration: [
      "Routines are reusable rhythms. Morning, evening, and a full Ideal Day that runs from waking to sleep.",
      "Each step can carry a fixed time or be anchored to a prayer, so the routine shifts with the real prayer times instead of a hard-coded clock. Guided mode then walks you through it a step at a time.",
    ],
  },
  {
    id: "sc06",
    chapter: "5 · Ideal Week — plan between the prayers",
    location: "@screen_ideal_week",
    route: "/routines?key=ideal-week",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Ideal Week view. The template and dated-plan switch, the seven day strip, and the day-type pill on the selected day are all legible.",
        goal: "Teach the separation between a template, a preview, and an applied plan.",
        task: "distinguish",
        runs: 15,
        complexity: "high",
      },
      {
        suffix: "b",
        description:
          "Switch to the prayer-relative timeline. Six non-overlapping periods are listed with prayer times and any items placed inside them.",
        goal: "Show how planning works without clock times.",
        task: "reveal",
        runs: 13,
        complexity: "high",
      },
    ],
    narration: [
      "Ideal Week is the weekly layer of routines. You build one template, assign a day type to each day, then view it as a dated plan for a specific week.",
      "Applying a week creates real tasks only after you confirm a full preview, and editing the template later never rewrites a week you already applied.",
      "There is also a Between the Prayers mode. It resolves six non-overlapping windows from your real prayer times, so you can plan by rhythm instead of by clock.",
    ],
  },
  {
    id: "sc07",
    chapter: "6 · Habits — a fair weekly matrix",
    location: "@screen_habits",
    route: "/habits",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Habits matrix. The week grid, per-habit rows and the weekly progress figure are all readable.",
        goal: "Explain that habit progress is measured fairly, not as a raw ratio.",
        task: "clarify",
        runs: 13,
        complexity: "medium",
      },
    ],
    narration: [
      "Habits live in a weekly matrix. Each habit knows which days it is actually scheduled for, so a habit you only practise three times a week is not marked as failing the other four.",
      "Future days are excluded from the current week's percentage, paused and skipped days are respected, and a habit you have not started yet simply is not due.",
    ],
  },
  {
    id: "sc08",
    chapter: "7 · Goals — ambition broken into steps",
    location: "@screen_goals",
    route: "/goals",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Goals list with an expanded goal card showing milestones, progress and the next action line.",
        goal: "Show how a large ambition becomes trackable work.",
        task: "decompose",
        runs: 13,
        complexity: "medium",
      },
    ],
    narration: [
      "Goals take something large and break it down. Each goal holds milestones, a progress method, a target date and a single next action.",
      "Progress can be counted by milestones, by a number you increment, or set manually — and check-ins keep a dated history of how it moved.",
    ],
  },
  {
    id: "sc09",
    chapter: "8 · Vision Board — a scrapbook of intent",
    location: "@screen_vision",
    route: "/goals?tab=vision",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Vision Board collage. Photos, stickers and an affirmation are arranged on the pastel canvas.",
        goal: "Show the creative surface and its explicit zero-reward rule.",
        task: "present",
        runs: 12,
        complexity: "medium",
      },
    ],
    narration: [
      "The Vision Board is a scrapbook. You place photos, stickers and affirmations, and you can link a card to a goal you already have.",
      "Deliberately, this screen awards no points at all. It is a place to think, not a place to score.",
    ],
  },
  {
    id: "sc10",
    chapter: "9 · Focus — deep work with ambience",
    location: "@screen_focus",
    route: "/focus",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Focus timer with the session dial and the ambient sound selector visible.",
        goal: "Explain deep-work sessions and how the time is later reused.",
        task: "demonstrate",
        runs: 12,
        complexity: "low",
      },
    ],
    narration: [
      "Focus runs deep-work and Pomodoro sessions with an ambient sound bed underneath.",
      "The time you log here is real recorded time, which means your weekly review can show how much focused work actually happened — not how much you intended.",
    ],
  },
  {
    id: "sc11",
    chapter: "10 · My Deen — prayer, Quran, Athkar",
    location: "@screen_deen",
    route: "/deen",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the My Deen today view, then let the section tabs for Quran, Athkar, Prayers, Tasbih and Sadaqah be visible.",
        goal: "Show that faith tracking is private, unrelated to rewards, and drives real scheduling.",
        task: "establish",
        runs: 14,
        complexity: "medium",
      },
    ],
    narration: [
      "My Deen covers prayer times, a Quran wird with all one hundred and fourteen surahs, Athkar, an electronic Tasbih and Sadaqah.",
      "Prayer times are calculated on your device from your location, and they feed the rest of the app — routines and Ideal Week both anchor to them. Practice is recorded, never ranked.",
    ],
  },
  {
    id: "sc12",
    chapter: "11 · Journal & Weekly Reset",
    location: "@screen_journal",
    route: "/journal",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Journal entry list with a locked entry visible, then let the Weekly Reset studio open onto its overview step.",
        goal: "Explain journal privacy and the four-step weekly review.",
        task: "unfold",
        runs: 15,
        complexity: "high",
      },
    ],
    narration: [
      "The Journal holds free entries, gratitude pages and templates, and any entry can be locked so it stays private.",
      "Weekly Reset is the same Journal, one week wide. It moves through four steps: an overview of what the records actually show, your reflection, next week's priorities, and a review before you finish. Stats are labelled 'so far' mid-week, and nothing is invented to fill a gap.",
    ],
  },
  {
    id: "sc13",
    chapter: "12 · Learning — subjects, books, flashcards",
    location: "@screen_learning",
    route: "/learning",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Learning hub with the subject list and the study heatmap in frame.",
        goal: "Show study planning, reading and spaced repetition in one place.",
        task: "walk-through",
        runs: 13,
        complexity: "medium",
      },
    ],
    narration: [
      "Learning groups subjects, a book library, and flashcard decks that use spaced repetition.",
      "Every session you log feeds a study heatmap, so revision planning is based on the time you really spent rather than how hard the week felt.",
    ],
  },
  {
    id: "sc14",
    chapter: "13 · Business — projects, clients, invoices",
    location: "@screen_business",
    route: "/business",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Business overview with project milestones, the client ledger and revenue visible.",
        goal: "Show that the business workspace links to the money ledger.",
        task: "trace",
        runs: 13,
        complexity: "medium",
      },
    ],
    narration: [
      "Business is a small studio workspace. Projects carry milestones, clients have a ledger, and offers turn into invoices.",
      "When an invoice is paid, the payment is recorded against a real account — so your business revenue and your personal budget are never two disconnected stories.",
    ],
  },
  {
    id: "sc15",
    chapter: "14 · Finance — budgets and savings",
    location: "@screen_finance",
    route: "/finance",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Finance overview with accounts, budgets and a savings goal visible.",
        goal: "Explain double-entry discipline and privacy masking.",
        task: "explain",
        runs: 13,
        complexity: "medium",
      },
    ],
    narration: [
      "Finance tracks accounts, transactions, budgets, savings goals and recurring bills.",
      "Amounts are stored in minor units so the arithmetic stays exact, and you can mask figures when using the app around other people. Nothing syncs anywhere you did not ask it to.",
    ],
  },
  {
    id: "sc16",
    chapter: "15 · Travel — trips and packing",
    location: "@screen_travel",
    route: "/travel",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Travel planner with the trip header, itinerary days and packing checklist visible.",
        goal: "Show trip planning that connects to the budget.",
        task: "outline",
        runs: 12,
        complexity: "low",
      },
    ],
    narration: [
      "Travel plans a trip day by day: an itinerary, a packing checklist and a booking list.",
      "Bookings can be paid from a real account, which is how the travel fund stops being a guess and becomes a number you can actually trust.",
    ],
  },
  {
    id: "sc17",
    chapter: "16 · Wellness — water, sleep, movement",
    location: "@screen_wellness",
    route: "/wellness",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Wellness hub with hydration, sleep and activity panels all visible.",
        goal: "Present the body-and-mood hub as one connected read model.",
        task: "consolidate",
        runs: 12,
        complexity: "low",
      },
    ],
    narration: [
      "Wellness keeps hydration, sleep, steps, workouts and nutrition together.",
      "Water in particular is shared, not duplicated — the same record drives the habit board and the wellness screen, so the two can never disagree.",
    ],
  },
  {
    id: "sc18",
    chapter: "17 · Self-care — rituals and pauses",
    location: "@screen_selfcare",
    route: "/selfcare",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Self-care workspace with a skincare ritual, a mind pause and a check-in card visible.",
        goal: "Show a gentle category that never becomes a chore list.",
        task: "showcase",
        runs: 12,
        complexity: "low",
      },
    ],
    narration: [
      "Self-care is the gentle corner of the app: skincare rituals, short mind pauses and light check-ins.",
      "The check-in asks what you actually need right now and suggests something that fits the time you have, which is why it can recommend doing less rather than more.",
    ],
  },
  {
    id: "sc19",
    chapter: "18 · Year in Pixels — your year in colour",
    location: "@screen_pixels",
    route: "/year-in-pixels",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Year in Pixels grid with mood-coloured cells filled across the year.",
        goal: "Show a year of mood as a single readable image.",
        task: "visualise",
        runs: 12,
        complexity: "low",
      },
    ],
    narration: [
      "Year in Pixels turns a whole year of mood into one image. Each cell is a day, coloured by how that day actually felt.",
      "It is the fastest way to see that a hard fortnight sat between two good months, which is much harder to feel from a list of notes.",
    ],
  },
  {
    id: "sc20",
    chapter: "19 · Bullet Journal — a pastel canvas",
    location: "@screen_bujo",
    route: "/bujo",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Bullet Journal canvas with a grid page, handwriting and a sticker strip visible.",
        goal: "Show free-form creation that fits the planner's identity.",
        task: "compose",
        runs: 12,
        complexity: "medium",
      },
    ],
    narration: [
      "The Bullet Journal is a pastel canvas: grids, ruled pages, handwriting and stickers.",
      "It exists because not every thought belongs in a structured field, and a planner that cannot be drawn on stops feeling like yours.",
    ],
  },
  {
    id: "sc21",
    chapter: "20 · Challenges — disciplined protocols",
    location: "@screen_challenges",
    route: "/challenges",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Challenges list with a running multi-day protocol and its day tracker visible.",
        goal: "Explain structured challenges and the honesty of the day counter.",
        task: "commit",
        runs: 12,
        complexity: "medium",
      },
    ],
    narration: [
      "Challenges run fixed protocols over seven, thirty, seventy-five or ninety days, with a day tracker for each one.",
      "A challenge tracks what you did. It does not pretend a missed day did not happen, because a streak that lies is worse than no streak.",
    ],
  },
  {
    id: "sc22",
    chapter: "21 · Progress & Badges — growth you can see",
    location: "@screen_progress",
    route: "/progress",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Progress screen with the level bar and quest list, then let the Badges gallery fill the frame.",
        goal: "Explain the reward system and its boundaries.",
        task: "reward",
        runs: 13,
        complexity: "medium",
      },
    ],
    narration: [
      "Progress shows your level, your experience history and daily quests; Badges is the gallery of everything you have earned.",
      "Rewards are given for consistent real action, and the ledger is written so the same action can never be paid twice — which is what keeps the number meaningful.",
    ],
  },
  {
    id: "sc23",
    chapter: "22 · More & Settings — your way",
    location: "@screen_more",
    route: "/more",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the More hub with its grouped module directory, then let Settings open on themes and language.",
        goal: "Show that the app adapts to the user, not the reverse.",
        task: "customise",
        runs: 13,
        complexity: "medium",
      },
    ],
    narration: [
      "More is the directory: every module, grouped by what it is for, and you can pin favourites or hide what you do not use.",
      "Settings changes colour themes, language, currency, time zone and reminder behaviour, and it can export or restore all of your data as a file you own.",
    ],
  },
  {
    id: "sc24",
    chapter: "23 · Arabic & English, both directions",
    location: "@screen_home_rtl",
    route: "/",
    shots: [
      {
        suffix: "a",
        description:
          "Hold on the Home dashboard in Arabic. The whole layout is mirrored, with right-aligned text and reversed navigation order.",
        goal: "Prove the Arabic experience is a real first-class layout, not a translation layer.",
        task: "mirror",
        runs: 12,
        complexity: "medium",
      },
      {
        suffix: "b",
        description:
          "Return to the wordmark on the blush ground as the phone frame settles and the closing line appears.",
        goal: "Close the tour and hand the viewer the first step.",
        task: "close",
        runs: 10,
        complexity: "low",
      },
    ],
    narration: [
      "Every screen you have seen exists in Arabic as well as English, mirrored properly from right to left — same features, same data, same layout logic.",
      "That is AYXA Planner Pro. Open the app, start with today, and let the rest of it fill in as your week takes shape.",
    ],
  },
];

export function shotsOf(scene) {
  return scene.shots.map((s) => ({ ...s, shotId: `${scene.id}${s.suffix}`, scene }));
}

export function flatShots() {
  return SCENES.flatMap(shotsOf);
}
