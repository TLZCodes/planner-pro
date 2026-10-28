# Breakdown

Educational showcase film for **AYXA Planner Pro** — a bilingual (English / Arabic) feminine
planner PWA + Android app. This is a **screen-based explainer**, not a live-action film:
every "location" is a real application screen captured from the running app, and every
"character" is a persistent UI surface with a locked visual identity.

## Scenes

| Scene ID | Summary | Location | Time of day | Characters | Props | Shot-card file | Status |
|---|---|---|---|---|---|---|---|
| sc01 | Cold open. Brand identity, promise, and what the film will teach. | `@brand_intro` | n/a (graphic) | `@brand_mark` | `@phone_frame` | `sc01-shot-cards.md` | draft |
| sc02 | Orientation. The Home dashboard read left to right: greeting, today's plan, dhikr, stats, routines. | `@screen_home` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc02-shot-cards.md` | draft |
| sc03 | Tasks. Top-three focus, time-scheduled list, anytime list, completion behaviour. | `@screen_tasks` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame`, `@stylus` | `sc03-shot-cards.md` | draft |
| sc04 | AI Planner. Conversational planning that turns intent into structured tasks. | `@screen_ai` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc04-shot-cards.md` | draft |
| sc05 | Routines and Ideal Day. Morning, evening, morning-to-night master day plan, guided mode. | `@screen_routines` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame`, `@stylus` | `sc05-shot-cards.md` | draft |
| sc06 | My Ideal Week and Between the Prayers. Template vs dated plan, day types, prayer-anchored periods. | `@screen_ideal_week` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame`, `@stylus` | `sc06-shot-cards.md` | draft |
| sc07 | Habits. Streak matrix, fair weekly progress, habit bundles. | `@screen_habits` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc07-shot-cards.md` | draft |
| sc08 | Goals. Ambitions broken into milestones, key results and next actions. | `@screen_goals` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc08-shot-cards.md` | draft |
| sc09 | Vision Board. Pastel scrapbook collage with affirmations linked to real goals. | `@screen_vision` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame`, `@stylus` | `sc09-shot-cards.md` | draft |
| sc10 | Focus. Deep work and Pomodoro with ambient sound. | `@screen_focus` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc10-shot-cards.md` | draft |
| sc11 | My Deen. Prayer times, Quran wird, Athkar, Tasbih, Sadaqah, good deeds. | `@screen_deen` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc11-shot-cards.md` | draft |
| sc12 | Journal and Weekly Reset Studio. Free journal, gratitude, locked entries, four-step weekly review. | `@screen_journal` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame`, `@stylus` | `sc12-shot-cards.md` | draft |
| sc13 | Learning. Subjects, book library, flashcards with spaced repetition, study heatmap. | `@screen_learning` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc13-shot-cards.md` | draft |
| sc14 | Business. Projects, clients, offers, invoices and revenue. | `@screen_business` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc14-shot-cards.md` | draft |
| sc15 | Finance. Accounts, transactions, budgets, savings goals, recurring bills. | `@screen_finance` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc15-shot-cards.md` | draft |
| sc16 | Travel. Trip planning, itinerary, packing checklists, booking payments. | `@screen_travel` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc16-shot-cards.md` | draft |
| sc17 | Wellness. Hydration, sleep, steps, workouts and mood on one hub. | `@screen_wellness` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc17-shot-cards.md` | draft |
| sc18 | Self-care. Skincare rituals, mind pauses, gentle check-ins. | `@screen_selfcare` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc18-shot-cards.md` | draft |
| sc19 | Year in Pixels. 365-day colour tapestry of mood. | `@screen_pixels` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc19-shot-cards.md` | draft |
| sc20 | Bullet Journal. Pastel grid canvas with stickers and handwriting. | `@screen_bujo` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame`, `@stylus` | `sc20-shot-cards.md` | draft |
| sc21 | Challenges. 7, 30, 75-Hard and 90-day protocols with day tracking. | `@screen_challenges` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc21-shot-cards.md` | draft |
| sc22 | Progress and Badges. XP, level tiers, quests, achievement badges. | `@screen_progress` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc22-shot-cards.md` | draft |
| sc23 | More hub and Settings. Module directory, themes, language, currency, backup. | `@screen_more` | n/a (UI) | `@shell_bottom_nav`, `@card_paper` | `@phone_frame` | `sc23-shot-cards.md` | draft |
| sc24 | Arabic RTL proof and outro. Same experience mirrored and a call to begin. | `@screen_home_rtl` | n/a (UI) | `@brand_mark`, `@shell_bottom_nav` | `@phone_frame` | `sc24-shot-cards.md` | draft |

## Coverage ledger

Every canonical route in the app maps to exactly one scene. Unmapped routes are listed as
`unresolved` rather than folded into a neighbouring scene.

| Canonical route | Module | Scene |
|---|---|---|
| `/` | Home | sc02 |
| `/tasks` | Tasks | sc03 |
| `/ai` | AI Planner | sc04 |
| `/routines` | Routines & Ideal Day | sc05 |
| `/routines?key=ideal-week` | Ideal Week & Between the Prayers | sc06 |
| `/habits` | Habits | sc07 |
| `/goals` | Goals | sc08 |
| `/goals?tab=vision` | Vision Board | sc09 |
| `/focus` | Focus | sc10 |
| `/deen` | My Deen | sc11 |
| `/journal` | Journal | sc12 |
| `/journal?tab=reset` | Weekly Reset Studio | sc12 |
| `/learning` | Learning | sc13 |
| `/business` | Business | sc14 |
| `/finance` | Finance | sc15 |
| `/travel` | Travel | sc16 |
| `/wellness` | Wellness | sc17 |
| `/selfcare` | Self-care | sc18 |
| `/year-in-pixels` | Year in Pixels | sc19 |
| `/bujo` | Bullet Journal | sc20 |
| `/challenges` | Challenges | sc21 |
| `/progress` | Progress | sc22 |
| `/badges` | Badges | sc22 |
| `/more` | More hub | sc23 |
| `/settings` | Settings | sc23 |

## Shipped deliverable — client walkthrough tour

The breakdown above was written for a narrated 24-scene explainer. What was actually built
and delivered is the **client walkthrough tour**: a silent, driven recording of the whole app.
It reuses the same captured screens and the same routes, so the table above is still the
authority on coverage.

| Stop | Label | Route | Kind |
|---|---|---|---|
| 01 | AYXA Planner Pro | — | local card |
| 02 | Home — your day at a glance | `/` | app |
| 03 | Tasks — top three, then the rest | `/tasks` | app |
| 04 | AI Planner — intent becomes a plan | `/ai` | app |
| 05 | Routines — morning to night | `/routines` | app |
| 06 | Ideal Week — plan between the prayers | `/routines?key=ideal-week` | app |
| 07 | Between the Prayers — six real windows | `/routines?key=ideal-week` → mode switch | app |
| 08 | Habits — a fair weekly matrix | `/habits` | app |
| 09 | Goals — ambition broken into steps | `/goals` | app |
| 10 | Vision Board — a scrapbook of intent | `/goals?tab=vision` | app |
| 11 | Focus — deep work with ambience | `/focus` | app |
| 12 | My Deen — prayer, Quran, Athkar | `/deen` | app |
| 13 | Journal — private entries | `/journal` | app |
| 14 | Weekly Reset — the four-step review | `/journal` → Weekly Reset | app |
| 15 | Learning — subjects, books, flashcards | `/learning` | app |
| 16 | Business — projects, clients, invoices | `/business` | app |
| 17 | Finance — budgets and savings | `/finance` | app |
| 18 | Travel — trips and packing | `/travel` | app |
| 19 | Wellness — water, sleep, movement | `/wellness` | app |
| 20 | Self-care — rituals and pauses | `/selfcare` | app |
| 21 | Year in Pixels — your year in colour | `/year-in-pixels` | app |
| 22 | Bullet Journal — a pastel canvas | `/bujo` | app |
| 23 | Challenges — disciplined protocols | `/challenges` | app |
| 24 | Progress & Badges — growth you can see | `/progress` | app |
| 25 | Settings — language, theme, export | `/settings` | app |
| 26 | Arabic — the whole app mirrored RTL | `/` (ar) | app |
| 27 | Back to English | `/` | app |
| 28 | Start with today | — | local card |

## Resolved

- **Running time.** Every stop is 10–12 seconds of real interaction, except the opening and
  closing cards. The master is 4 min 56 s. Narration was dropped by decision, so no scene is
  timed to a voice track.
- **`@phone_frame`.** The device is not a graphic overlay at all. The recording **is** the
  device: it is scaled to the full frame height and its width is derived from the real capture
  aspect (824×1830). Nothing is stretched and nothing is cropped, so no bezel has to be
  invented. The narrow strip left at each side is filled with the app's own canvas colour.
- **Coverage.** Every canonical route in the ledger above appears in the tour, plus
  Between the Prayers, Weekly Reset and the Arabic layout as their own stops.

