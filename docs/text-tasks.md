# Text Tasks

Every string the edit draws over the recording is listed here. Text is composited
locally with ffmpeg `drawtext` — it is **not** requested from any generation model, and no
text is ever drawn on top of the application's own interface.

Two kinds of text appear in the master:

1. **Module label** — drawn on a hot-pink bar in the 84px strip *below* the app, in white.
2. **Card artwork** — the opening and closing cards are rendered locally as HTML with the
   product's own fonts and design tokens. Their words are part of the card artwork, so the
   edit draws nothing on them.

There is no product mark drawn over the frame: the app itself is the subject, and it fills the
frame from the top edge to the label bar.

## Module labels

| Stop | Exact text | Placement | Context |
|---|---|---|---|
| 02 | `Home — your day at a glance` | on the label bar under the app, centred | Home dashboard. |
| 03 | `Tasks — top three, then the rest` | on the label bar under the app, centred | Tasks, three-tier list. |
| 04 | `AI Planner — intent becomes a plan` | on the label bar under the app, centred | AI planner conversation. |
| 05 | `Routines — morning to night` | on the label bar under the app, centred | Routines and Ideal Day. |
| 06 | `Ideal Week — plan between the prayers` | on the label bar under the app, centred | Ideal Week template view. |
| 07 | `Between the Prayers — six real windows` | on the label bar under the app, centred | Prayer-relative planning mode. |
| 08 | `Habits — a fair weekly matrix` | on the label bar under the app, centred | Habit matrix. |
| 09 | `Goals — ambition broken into steps` | on the label bar under the app, centred | Goals list. |
| 10 | `Vision Board — a scrapbook of intent` | on the label bar under the app, centred | Vision board collage. |
| 11 | `Focus — deep work with ambience` | on the label bar under the app, centred | Focus timer. |
| 12 | `My Deen — prayer, Quran, Athkar` | on the label bar under the app, centred | My Deen hub. |
| 13 | `Journal — private entries` | on the label bar under the app, centred | Journal entry list. |
| 14 | `Weekly Reset — the four-step review` | on the label bar under the app, centred | Weekly Reset studio. |
| 15 | `Learning — subjects, books, flashcards` | on the label bar under the app, centred | Learning hub. |
| 16 | `Business — projects, clients, invoices` | on the label bar under the app, centred | Business workspace. |
| 17 | `Finance — budgets and savings` | on the label bar under the app, centred | Finance overview. |
| 18 | `Travel — trips and packing` | on the label bar under the app, centred | Travel planner. |
| 19 | `Wellness — water, sleep, movement` | on the label bar under the app, centred | Wellness hub. |
| 20 | `Self-care — rituals and pauses` | on the label bar under the app, centred | Self-care workspace. |
| 21 | `Year in Pixels — your year in colour` | on the label bar under the app, centred | Year in Pixels grid. |
| 22 | `Bullet Journal — a pastel canvas` | on the label bar under the app, centred | Bullet journal canvas. |
| 23 | `Challenges — disciplined protocols` | on the label bar under the app, centred | Challenges list. |
| 24 | `Progress & Badges — growth you can see` | on the label bar under the app, centred | Progress and badges. |
| 25 | `Settings — language, theme, export` | on the label bar under the app, centred | Settings. |
| 26 | `Arabic — the whole app mirrored RTL` | on the label bar under the app, centred | Home in Arabic, mirrored. |
| 27 | `Back to English` | on the label bar under the app, centred | Return to the English Home. |

## Text carried inside the local HTML cards

Not drawn by `drawtext`: these are part of the card rendering itself.

| Stop | Exact text | Placement | Context |
|---|---|---|---|
| 01 | `AYXA Planner Pro` | upper third, centred | Wordmark on the opening card. |
| 01 | `a planner for the whole of you` | upper third, script face | Handwritten line above the wordmark. |
| 01 | `A working tour of the live app` | upper third, below the rule | What the client is about to watch. |
| 01 | `English & Arabic · Your data stays on your device` | footer, centred | Two promises the app actually keeps. |
| 28 | `with you, gently` | inside the device, centred | Closing card sentiment. |
| 28 | `begin your own week` | lower third, script face | Closing invitation. |
| 28 | `AYXA Planner Pro` | lower third, centred | Wordmark return. |
| 28 | `Open the app and start with today.` | lower third, below the rule | The one instruction the tour ends on. |

## Notes

- Labels are drawn in `edit/fonts/segoeuib.ttf`. The font path must stay **relative**: a
  drive-letter colon in `fontfile=` is parsed as the next filter option and ffmpeg rejects the
  whole graph.
- No label contains a colon, comma, quote or percent sign, because `drawtext` treats those as
  syntax. The generator refuses such a label rather than emitting a broken graph.
- No emoji or Arabic is drawn with `drawtext`: it does no complex-script shaping.
  The Arabic stop proves the mirrored layout **visually**, from the app's own rendering.
