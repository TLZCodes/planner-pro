// Writes the remaining asset passports for the AYXA Planner Pro educational
// showcase: four props and the twenty-three captured screen locations.
//
// Obeying asset-passport: one authoritative passport per asset, an exhaustive
// canonical descriptor in complete prose, a reference-sheet prompt containing the
// descriptor verbatim, a reference-files section, and a stress-test matrix
// awaiting verdicts. Status stays `draft`; only stress-test may set `locked`.
//
// Existing passports are never overwritten, so verdicts and lock decisions added
// later survive a re-run. Run: node scripts/studio/build-passports.mjs

import fs from "fs";
import path from "path";

const PROPS_DIR = path.resolve("assets/props");
const LOC_DIR = path.resolve("assets/locations");

const LOCATION_COLOUR_NOTE =
  "Dominant colour is the cream blush ground `#fff8fa` carrying white paper cards `#ffffff` on a slightly pinker surface `#ffeef4`; the secondary colour is the dark plum text and hairline borders read at `#2b1727`, appearing as the ink on every card; the accent colour is the surface's own, used only on the active control, the progress figure or the primary action.";

const LIGHT_NOTE =
  "Light character is soft, even and high-key with no visible key direction: the screen is self-lit and perfectly flat, with no cast shadow inside the interface, no vignette, no glare, and no reflection. The built-in grade is a gentle warm-neutral lift with the blacks held just above pure black so plum text stays soft rather than crushing, greens kept slightly desaturated, and skin-adjacent pinks held below clipping so blush never blooms.";

// ─── Locations ────────────────────────────────────────────────────────────────
// Each entry: tag, scene, route, title, and the exhaustive descriptor prose.
const LOCATIONS = [
  {
    tag: "@screen_home",
    scene: "sc02",
    route: "/",
    title: "Home dashboard",
    layout:
      "A single vertical scroll column with 18 pixels of side gutter at a 412 pixel viewport width. The column runs, top to bottom: a time-aware greeting line with the user's name on a second line; a dhikr or reminder card immediately beneath it; a horizontally scrolling quick-action rail of squircle icon buttons; the today's-plan card group, where each task is one full-width paper card with a leading completion circle, a title line and a right-aligned time chip with an optional category tag beneath it; a statistics grid of four compact tiles in two rows of two showing completed tasks, habit streak, focus minutes and study minutes; and a routines progress card group, where each routine is one card with its name, a thin progress rule and a completion percentage.",
    fixed:
      "Fixed objects are the greeting block, the dhikr card, the quick-action rail, the task card group, the two-by-two statistics grid and the routine progress cards. The quick-action rail is the only horizontally scrollable element on the screen, and it clips its own overflow rather than the page's.",
    landmarks:
      "Spatial landmarks are the greeting at the top of the scroll, the dhikr card as the second element, and the statistics grid as the boundary between the day's plan and the routine progress. There is no persistent header bar and no back control: this is a root destination, reachable only from the bottom navigation.",
    scale:
      "Scale is a 412 by 915 device-independent pixel viewport photographed at twice density. Paper cards are 24 to 32 pixel radius with a one-pixel hairline border and a very low elevation shadow, and they sit in a single column with 12 pixels of vertical gap between siblings.",
    surfaces:
      "Surfaces are flat, untextured and unmoving: paper cards with no visible grain at capture resolution, a hairline border at roughly 6% plum, and no inner shadow. Weathering is absent by design; nothing on this screen is scuffed, torn, folded or stained, because the film's screens are the product as it actually renders.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_tasks",
    scene: "sc03",
    route: "/tasks",
    title: "Tasks",
    layout:
      "A vertical scroll column of task groups separated by small uppercase group headers. The first group is the top-three focus block, containing exactly three cards, each with a leading prioritised checkbox, a title, an optional time chip and the category tag. The second group is the time-scheduled list, ordered ascending by optional time, with the time chip visible on every card. The third group is the anytime list, whose cards show no time chip at all. A completed group may follow, and completed cards are rendered with a reduced-opacity title and a struck-through line.",
    fixed:
      "Fixed objects are the group headers, the top-three block, the time-scheduled list, the anytime list and the completion affordance on every card. A floating primary action sits above the bottom navigation on the trailing edge for creating a task.",
    landmarks:
      "Spatial landmarks are the top-three header as the topmost boundary of the list, the transition from time-scheduled to anytime cards as the middle divider, and the floating action as the trailing-edge anchor.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Cards are full width within an 18 pixel gutter, 24 pixel radius, with 10 pixels of vertical gap inside a group and 22 pixels between groups.",
    surfaces:
      "Surfaces are flat white paper cards with hairline borders; no visible grain, no inner shadow, no texture. Completed cards are the same card with a slightly muted fill rather than a different material. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_ai",
    scene: "sc04",
    route: "/ai",
    title: "AI planner conversation",
    layout:
      "A conversation column with message bubbles alternating between user and assistant, each bubble being a paper card with a 24 pixel radius and a maximum width of roughly 78% of the viewport, aligned to the trailing edge for the user and the leading edge for the assistant. Below the message list, and fixed to the bottom edge of the scroll area, sits a composer card containing a multiline text field with placeholder text and a circular send action. Structured proposals sent by the assistant appear inside assistant bubbles as an embedded list of rows, each row showing a proposed title, an optional proposed time and a proposed category tag, with the acceptance affordance rendered on the proposal itself.",
    fixed:
      "Fixed objects are the message list, the composer card, the circular send action and the embedded proposal rows. The composer is pinned rather than scrolled, and the proposal rows are the only interactive elements inside a bubble.",
    landmarks:
      "Spatial landmarks are the leading-edge versus trailing-edge bubble alignment as the conversation's axis, and the composer as the pinned baseline.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Bubbles carry 24 pixel radius with 10 pixels of gap between turns; the composer is a single full-width card with a 28 pixel radius.",
    surfaces:
      "Surfaces are flat paper bubbles with hairline borders and no gradient, no glow and no artificial shimmer on the assistant side. The assistant bubble is not visually magical: no sparkle overlays, no animated typing indicator, no neon border. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_routines",
    scene: "sc05",
    route: "/routines",
    title: "Routines and Ideal Day",
    layout:
      "A horizontally scrollable tab row runs directly beneath the top of the screen, holding one pill per routine with a short label and a small emoji. Beneath the tab row sits a hero banner card for the selected routine: a large card carrying the routine's title, a completion percentage rendered large, a thin progress rule, and a small secondary line describing the routine's span. Below the hero, the step list runs as a single column of rows, where each row contains a time or prayer anchor on the leading edge, an emoji, the step title, and a trailing completion control. Section headers divide the steps into morning, day, afternoon, evening and night groupings when the routine spans the whole day.",
    fixed:
      "Fixed objects are the routine tab row, the hero banner, the per-section headers and the step rows. The guided-mode affordance is attached to the hero banner rather than floating, and a routine creation action sits at the trailing end of the tab row.",
    landmarks:
      "Spatial landmarks are the tab row as the screen's top boundary, the hero banner as the mid-frame anchor, and the first section header as the beginning of the step sequence.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. The hero banner is a full-width card at 28 pixel radius; step rows sit in a grouped card with 24 pixel radius and 2 pixel separators between rows.",
    surfaces:
      "Surfaces are pastel paper cards, flat and untextured, with decorative linework deliberately placed behind the card layer and never over content. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_ideal_week",
    scene: "sc06",
    route: "/routines?key=ideal-week",
    title: "Ideal Week and Between the Prayers",
    layout:
      "A header block opens the screen with the title and a short subtitle. Directly beneath it sits a view switcher holding two adjacent actions, one for the reusable template and one for the dated week plan. Below the switcher a planning-mode selector holds three adjacent actions: time of day, clock time, and between the prayers, with the active mode filled and the inactive modes on the surface fill. Beneath the mode selector sits a seven-cell day strip, each cell carrying a weekday abbreviation, the day's date and a small day-type pill, with the selected cell visually raised. The remainder of the screen holds the selected day's plan for the active mode: in time of day mode, period groups with items inside them; in clock mode, rows with a start time and an optional duration; in between-the-prayers mode, six period cards listed in order, each carrying a prayer-relative label, the two resolved prayer times for the selected date and any items placed inside it.",
    fixed:
      "Fixed objects are the view switcher, the mode selector, the seven-cell day strip and the selected day's plan region. A reset-to-starter affordance sits in the header on the trailing edge, and an apply action appears only in the dated-plan view.",
    landmarks:
      "Spatial landmarks are the view switcher as the boundary between template and dated plan, the mode selector as the boundary between the three planning grammars, the day strip as the week's spine, and the six period cards as the prayer-relative sequence.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Day-strip cells are roughly 52 by 62 pixels; period cards are full width at 22 pixel radius with 10 pixels of gap.",
    surfaces:
      "Surfaces are pastel paper cards on the blush ground, flat and untextured, with the decorative accent held to small motifs at the card corners. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_habits",
    scene: "sc07",
    route: "/habits",
    title: "Habits",
    layout:
      "A view switcher opens the screen, offering a daily list and a weekly board. In the weekly board, a seven-column grid is the dominant object: the leading column is the habit column, holding each habit's emoji and name in a stacked row, and the remaining seven columns are the week's days, each cell being a small rounded square that is filled when the habit is due and completed, outlined when due and not completed, and left empty when the habit is not scheduled for that day. A per-habit row may additionally carry a small progress figure in the trailing cell of the habit column. Above the grid sits a week-range header with navigation to the previous and next week, and below the grid sit the preference cards that control first day of week, grouping, density and which side panels are shown.",
    fixed:
      "Fixed objects are the view switcher, the week-range header, the grid's leading habit column, the seven day columns, and the preference cards. A habit creation action sits above the bottom navigation.",
    landmarks:
      "Spatial landmarks are the week-range header as the top boundary, the habit column as the grid's left edge and reading anchor, and the weekly progress figure as the grid's summary.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Grid cells are 26 to 30 pixel rounded squares with 4 pixel gaps; the habit column is roughly 118 pixels wide so a two-word name remains readable.",
    surfaces:
      "Surfaces are a paper card holding the grid, with each cell drawn flat. The paper theme is selectable and changes the card fill rather than the material. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_goals",
    scene: "sc08",
    route: "/goals",
    title: "Goals",
    layout:
      "A vertical list of goal cards, each card a paper surface carrying an emoji, a title, an area tag, a thin progress bar, a numeric progress figure on the trailing edge, a target label, and a next-action line rendered as a distinct sub-row with a small arrow cue. An expanded goal card additionally reveals a milestone list, where each milestone is a checkable row with a title and an optional due date, and a check-in affordance that opens a dated progress entry. A tab row may sit above the list separating active, focus and completed goals.",
    fixed:
      "Fixed objects are the goal cards, the per-card progress rule, the next-action sub-row, the expanded milestone list and the check-in affordance. A goal creation action sits above the bottom navigation.",
    landmarks:
      "Spatial landmarks are the goal title at the head of each card, the progress rule as the card's midline, and the next-action row as the card's foot.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Goal cards are full width within an 18 pixel gutter at 26 pixel radius; the progress rule is 6 pixels tall.",
    surfaces:
      "Surfaces are flat paper cards, with the milestone rows inset as a slightly recessed sub-surface inside the parent card. No texture, no gradient. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_vision",
    scene: "sc09",
    route: "/goals?tab=vision",
    title: "Vision Board",
    layout:
      "A pastel canvas holding freely arranged scrapbook cards rather than a strict grid. Each card is a paper tile carrying one of four contents: a photograph, a short text or affirmation, a wish, or a card explicitly linked to a goal, in which case it also shows that goal's title and a compact progress indicator. Cards are individually rotated by between minus three and plus three degrees, carry a caption strip beneath the content, and are decorated with one of a small set of motifs, being a flower, a star, a bow, a sparkle or a heart, plus an occasional torn washi strip in pink, lavender, butter, mint or a striped pattern. The board's own header holds its title, its time horizon and a small settings affordance; a board switcher may appear when more than one board exists.",
    fixed:
      "Fixed objects are the board canvas, the freely placed cards, the per-card caption strips and motif decorations, the washi strips, the board header, and an add-item action pinned above the bottom navigation.",
    landmarks:
      "Spatial landmarks are the board header at the top, the cards' individual rotations as the canvas's visual grain, and the linked-goal cards as the board's tie back to structured planning.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Cards vary in size by content, from roughly 150 by 150 pixels for a square photograph to roughly 300 by 130 pixels for a text card, with 12 pixels of typical overlap-free spacing.",
    surfaces:
      "Surfaces are paper tiles with torn or straight edges, subtle rotation, and washi and motif decoration placed behind and beside the content rather than over it. Weathering is deliberate and limited: torn edges and slight rotation, never grunge, never stains, never anything that reduces text contrast.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_focus",
    scene: "sc10",
    route: "/focus",
    title: "Focus",
    layout:
      "A session dial dominates the upper half of the screen: a large ring whose track is drawn at low opacity and whose progress arc is drawn in the accent, with the remaining or elapsed time rendered large inside the ring as numerals, accompanied by a smaller line naming the current phase. Beneath the dial sits a row of mode and preset controls, then a source selector that binds the session to a task, a subject, a goal, a business project or nothing at all, then a card holding the ambient sound selector, whose rows each carry a sound name and a playing control. Session controls sit at the foot of the screen, with a primary start action taking the accent fill.",
    fixed:
      "Fixed objects are the dial, the phase label, the mode controls, the source selector, the ambient sound card and the session controls at the foot.",
    landmarks:
      "Spatial landmarks are the dial as the screen's centre of gravity, the source selector as the line that ties the session to the rest of the app, and the sound card as the lower anchor.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. The dial is roughly 260 pixels in diameter with a ring stroke of 14 pixels; preset controls are pill shaped at 14 pixel radius.",
    surfaces:
      "Surfaces are a calm paper card behind the dial and a flat card behind the sound rows, with a single warm accent used on the progress arc and the primary action. No glow, no pulsation, no texture. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_deen",
    scene: "sc11",
    route: "/deen",
    title: "My Deen",
    layout:
      "A today view opens the screen: a next-prayer card shows the upcoming prayer's name, its time and a countdown, followed by a horizontal row of the day's five prayer times, each in its own compact tile with the prayer name above the time. Below that sits a Quran-wird progress card showing pages read against a daily target, then an Athkar card offering morning and evening sets, then a Tasbih counter card with a large numeral and a phrase, then a Sadaqah card, then a good-deeds list whose rows are checkable for the current day. A horizontally scrollable tab row above the today view separates today, Quran, Athkar, Prayers, Tasbih, Sadaqah and good deeds.",
    fixed:
      "Fixed objects are the section tab row, the next-prayer card, the five prayer-time tiles, the Quran progress card, the Athkar card, the Tasbih counter, the Sadaqah card and the good-deeds rows. A settings affordance for calculation method, madhab, location and Hijri adjustment sits in the header.",
    landmarks:
      "Spatial landmarks are the next-prayer card as the screen's first read, the row of five prayer tiles as the day's spine, and the section tab row as the navigation above all of it.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Prayer-time tiles are roughly 66 by 74 pixels; the Tasbih numeral is rendered at display size inside a card of roughly 210 pixels height.",
    surfaces:
      "Surfaces are warm neutral paper cards with a soft green accent used sparingly on the Qur'anic and prayer elements. Flat, untextured, and deliberately quieter than the rest of the film: no celebratory treatment, no metallic ornament, no photographic imagery of people or places. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour:
      "Dominant colour is the cream ground `#fff8fa` with white paper cards `#ffffff`; the secondary colour is the dark plum text `#2b1727`; the accent colour is a soft desaturated green used only on the prayer and Qur'an elements. Green is held below clipping so it reads as calm rather than as a signal.",
  },
  {
    tag: "@screen_journal",
    scene: "sc12",
    route: "/journal",
    title: "Journal",
    layout:
      "A tab row separates free entries from templates and from the weekly reset. In the entry list, each entry is a paper card carrying the date on its leading edge, the entry's title, a first-line excerpt of the body, a mood emoji, a small energy indicator and any tags as compact chips. A locked entry is the same card with its body replaced by a quiet sealed state and a small lock indicator, and it carries no excerpt, no mood emoji and no tags. A search or filter affordance sits near the header, and a compose action floats above the bottom navigation. The weekly reset tab, when open, replaces the list with a four-step studio whose current step is shown by a step indicator, and whose body region holds the active step's content.",
    fixed:
      "Fixed objects are the tab row, the entry cards, the locked-entry sealed state, the compose action and, on the weekly reset tab, the step indicator.",
    landmarks:
      "Spatial landmarks are the tab row as the boundary between journaling and reviewing, the locked card as the privacy marker, and the step indicator as the weekly reset's position.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Entry cards are full width at 24 pixel radius with 12 pixels of gap; the step indicator is a row of four equal cells.",
    surfaces:
      "Surfaces are flat paper cards, with the locked card rendered on a slightly muted fill so its sealed state is legible without any padlock imagery beyond a small indicator. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_learning",
    scene: "sc13",
    route: "/learning",
    title: "Learning hub",
    layout:
      "A tab row opens the screen across subjects, books, flashcards and plan. Beneath it, the subject list runs as a column of cards, each carrying an emoji, a title, a thin progress rule showing study time against a weekly target, and the tracked minutes as numerals. A study heatmap sits below the subject list: a grid of one cell per day over the recent period, each cell shaded according to logged study minutes, with weekday labels along the leading edge and a small legend beneath. A book library section follows, where each book is a card carrying its cover emoji, title, author and a page-progress rule. Flashcard decks appear as cards carrying a deck name, a due count and a new count, with a review affordance.",
    fixed:
      "Fixed objects are the tab row, the subject cards, the study heatmap, the legend, the book cards and the flashcard deck cards.",
    landmarks:
      "Spatial landmarks are the tab row at the top, the progress rule inside each subject card as its midline, and the heatmap as the screen's proof of real logged time.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Heatmap cells are 14 pixel rounded squares with 4 pixel gaps; subject cards are full width at 24 pixel radius.",
    surfaces:
      "Surfaces are flat paper cards with a single soft blue accent reserved for the heatmap's shading ramp. No texture, no gradient, no photograph. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_business",
    scene: "sc14",
    route: "/business",
    title: "Business workspace",
    layout:
      "A tab row separates an overview from projects, clients, offers and invoices. The overview opens with a summary band of compact tiles showing project count, active client count, open invoice value and paid value. Beneath the band sits a project list, each project a card carrying its name, a progress rule, a progress percentage, a target date and its next milestone. A client section follows, each client a row with a name, a company, a status tag and a trailing follow-up date, and an invoice section lists invoices with their number, client, total, paid amount and a status pill.",
    fixed:
      "Fixed objects are the tab row, the summary tiles, the project cards with their milestone lines, the client rows and the invoice rows with their status pills. Creation actions for projects, clients, offers and invoices sit above the bottom navigation.",
    landmarks:
      "Spatial landmarks are the tab row at the top, the summary band as the screen's first read, and the invoice status pills as the tie between business work and money.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Summary tiles are laid out two per row; project and client cards are full width at 22 to 24 pixel radius.",
    surfaces:
      "Surfaces are ledger-clean flat paper cards with a restrained gold accent used only on monetary figures and status pills. No celebratory treatment, no confetti, no glow. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_finance",
    scene: "sc15",
    route: "/finance",
    title: "Finance",
    layout:
      "A tab row separates an overview from transactions, budgets, savings and settings. The overview opens with a net position card showing total assets, total liabilities and the net figure, each on its own line. Beneath it sits an account list, each account a row carrying its icon, name, type and current balance on the trailing edge. A budget card follows, carrying the month, an overall progress rule against the overall limit, and per-category rules for the categories that have limits. A savings section lists savings goals with their target, contributed amount and a progress rule. A privacy affordance for masking displayed amounts sits in the header.",
    fixed:
      "Fixed objects are the tab row, the net position card, the account rows, the budget card with its category rules, the savings goal rows and the masking affordance.",
    landmarks:
      "Spatial landmarks are the net position card as the screen's first read, the account rows as the balance spine, and the budget card as the month's boundary.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. The net position card is full width at 26 pixel radius; balance figures are rendered as the largest numerals on the screen.",
    surfaces:
      "Surfaces are ledger-clean flat paper cards with a mint accent used on positive figures and on the budget rules. Amounts are rendered in the same type as every other figure so no amount shouts. No currency symbols are oversized and no figure is decorated. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_travel",
    scene: "sc16",
    route: "/travel",
    title: "Travel planner",
    layout:
      "A tab row separates trips from a bucket list. The trips view opens with a trip header card carrying the trip title, the origin and primary city, the date range, the traveller count and a status tag, with a compact budget summary beneath. An itinerary section follows, grouped by day: each day is a sub-header with its local date and title, and beneath it the day's items are rows carrying a start time, an item title, an optional location name and a type indicator. A packing checklist section follows, where categories hold checkable rows with a title and a quantity, and a booking list closes the screen with each booking showing its provider, its dates, its estimated amount and a payment status tag.",
    fixed:
      "Fixed objects are the tab row, the trip header card, the per-day itinerary sub-headers and item rows, the packing checklist categories, and the booking rows with their payment status tags.",
    landmarks:
      "Spatial landmarks are the trip header at the top, the day sub-headers as the itinerary's spine, and the booking payment tags as the tie to the finance ledger.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. The trip header is the tallest card on the screen at roughly 190 pixels; itinerary item rows sit in grouped cards with 2 pixel separators.",
    surfaces:
      "Surfaces are flat paper cards with a powder-blue accent on the trip header and a small hand-drawn route motif placed behind the header text, never over it. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_wellness",
    scene: "sc17",
    route: "/wellness",
    title: "Wellness hub",
    layout:
      "A tab row separates today from trackers, movement and insights. The today view opens with a hydration panel showing a container-progress visual with consumed millilitres against the target, followed by a quick-add row of glass and bottle amounts. A sleep panel follows, showing the most recent night's duration, its quality rating and its wake date. A movement panel follows with the day's step count and any logged workouts as rows carrying the activity type, duration and intensity. A mood panel closes the view, showing the day's mood emoji, its energy level and a compact entry control.",
    fixed:
      "Fixed objects are the tab row, the hydration panel with its container visual, the quick-add row, the sleep panel, the movement panel and the mood panel.",
    landmarks:
      "Spatial landmarks are the hydration panel as the screen's first read, the sleep panel as the middle anchor, and the mood panel as the foot.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Panels are full-width cards at 26 pixel radius; the hydration container visual is roughly 56 pixels tall.",
    surfaces:
      "Surfaces are soft mint and powder-blue panels on the cream ground, each panel drawing from one shared border and one shared radius so the four read as a family rather than four separate tools. No texture, no gradient beyond the container fill. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_selfcare",
    scene: "sc18",
    route: "/selfcare",
    title: "Self-care workspace",
    layout:
      "A tab row separates today from activities, ideas and history. The today view opens with a check-in card that asks what the day needs and how much time is available, showing the two choices as compact selectable chips. Beneath it, the day's plan items are listed as rows, each carrying an emoji, an activity title, a planned duration and a completion state that may be pending, completed or skipped, with skipped rows rendered distinctly so a skipped ritual is visibly a decision rather than a failure. A ritual card follows, holding the skincare and body-care steps for the day. An ideas section closes the view with a browsable list of gentle suggestions, each carrying a title and an estimated duration.",
    fixed:
      "Fixed objects are the tab row, the check-in card, the plan item rows with their three completion states, the ritual card and the ideas list.",
    landmarks:
      "Spatial landmarks are the check-in card as the screen's first read, the plan rows as the day's list, and the skipped row as the deliberate visual proof that skipping is honoured.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Cards are full width at 26 pixel radius with 12 pixels of gap; check-in chips are pill shaped.",
    surfaces:
      "Surfaces are the softest palette in the film: blush and lavender on cream, with decorative motifs used more freely than anywhere else, always behind content. No texture that reduces contrast. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_pixels",
    scene: "sc19",
    route: "/year-in-pixels",
    title: "Year in Pixels",
    layout:
      "A tab row separates year, month and insights. The year view is a dense grid of one cell per day of the year, arranged in columns of days and rows of months, each cell a small rounded square filled with the mood colour recorded for that day and left as an empty outlined cell when no mood was recorded. A mood legend sits beneath or beside the grid, listing each mood name against its swatch, and a summary row may show the distribution across moods. A settings affordance opens palette and cell-shape options and an export action.",
    fixed:
      "Fixed objects are the tab row, the day grid, the empty cells that represent unrecorded days, the mood legend and the mood distribution summary.",
    landmarks:
      "Spatial landmarks are the grid's left edge as the reading anchor, the month boundaries as the grid's structure, and the legend as the colour key that makes the mosaic readable.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Grid cells are 9 to 12 pixel rounded squares with 2 to 3 pixel gaps so a full year fits the width; the legend swatches match the cell size.",
    surfaces:
      "Surfaces are a flat mosaic of pastel mood colours held directly on the cream ground with no card behind the grid, so the pattern is the only object. No texture, no gradient, no border around the whole mosaic. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_bujo",
    scene: "sc20",
    route: "/bujo",
    title: "Bullet Journal",
    layout:
      "A full-height canvas holds a page rendered at the viewport's width, and the page itself carries one of several rules: a dot grid, a square grid, ruled lines or blank. Content on the page is drawn freehand or typed and includes headings, lists, boxed sections and hand-drawn rules, together with placed stickers and a torn washi strip where the author has used one. A tool bar sits above or below the page holding pen, highlighter, eraser and selection tools, along with a small colour set drawn from the film's pastel palette; a sticker strip sits adjacent to the tool bar, showing the available motifs as small tiles.",
    fixed:
      "Fixed objects are the page canvas with its rule, the tool bar, the colour set and the sticker strip. The page scrolls vertically; the tool bar is pinned.",
    landmarks:
      "Spatial landmarks are the page's own rule as its texture, the tool bar as the working edge, and the sticker strip as the decorative source.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. The dot grid runs at roughly 22 pixel spacing; sticker tiles are roughly 44 pixels square.",
    surfaces:
      "Surfaces are pastel paper with dotted rules, a torn washi strip and small flower motifs, all placed behind the writing so nothing reduces the legibility of what is written. Weathering is intentional and bounded: a torn edge and a hand-drawn line, never grunge, never a stained or aged page.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_challenges",
    scene: "sc21",
    route: "/challenges",
    title: "Challenges",
    layout:
      "A list of available protocols opens the screen, offering seven-day, thirty-day, seventy-five-day and ninety-day lengths as cards, each carrying the protocol's title, its length, a one-line description and a selection action. Beneath the catalogue, a running protocol card shows the active challenge's title, its start date, its total length and its day tracker: a grid of one cell per day, where completed days are filled, the current day is marked distinctly, and future days are drawn as empty outlined cells. A set of that day's tasks sits beneath the tracker, each a checkable row, and a progress figure states the completed days against the total.",
    fixed:
      "Fixed objects are the protocol catalogue cards, the running protocol card, the day tracker grid, the day's task rows and the progress figure.",
    landmarks:
      "Spatial landmarks are the catalogue at the top, the running protocol card as the screen's centre, and the day tracker with its current-day marker as the honesty anchor.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Tracker cells are 22 to 26 pixel rounded squares with 4 pixel gaps; protocol cards are full width at 24 pixel radius.",
    surfaces:
      "Surfaces are flat paper cards with a bold accent used only on the protocol title and the current-day marker, and a deliberately neutral grid for the tracker so a missed day is neither hidden nor punished visually. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_progress",
    scene: "sc22",
    route: "/progress",
    title: "Progress and Badges",
    layout:
      "A tab row separates an overview from activity and badges. The overview opens with a level card carrying the current tier name, the level number, and a horizontal experience bar showing progress into the current level with the remaining amount stated as numerals. A quest list follows, each quest a row carrying its title, its reward amount and a completion state, followed by a recent-experience list where each event is a row carrying its label, its amount and its date. The badges view is a gallery: each badge is a paper tile carrying its emblem, its name and its award date, arranged in a grid, with earned badges fully rendered and unearned badges held at reduced contrast.",
    fixed:
      "Fixed objects are the tab row, the level card with its experience bar, the quest rows, the recent-experience rows, and the badge gallery tiles.",
    landmarks:
      "Spatial landmarks are the level card as the screen's first read, the quest rows as the current opportunity, and the badge gallery as the accumulated record.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. The experience bar is 10 pixels tall; badge tiles are laid out three per row at roughly 112 pixels square.",
    surfaces:
      "Surfaces are flat paper cards, with the experience bar in a restrained accent and the badge gallery on paper tiles so the rewards read as keepsakes rather than as slot-machine lights. No confetti, no rays, no metallic sheen, no pulsation. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_more",
    scene: "sc23",
    route: "/more",
    title: "More hub and Settings",
    layout:
      "The More hub is a directory: module cards grouped under category headers, where each card carries an emoji or icon, the module's title, a one-line description and a dynamic stat line that reflects the user's own records. Cards are laid out two per row in a responsive grid, and pinned modules may be hoisted to a featured group at the top. The Settings section opens as grouped rows, each group holding labelled rows with trailing controls: a theme selector offering the app's colour themes, a language selector offering English and Arabic with its text direction, a region group holding time zone and currency, a reminders group holding notification behaviour, and a data group holding export and restore as file operations.",
    fixed:
      "Fixed objects are the category headers, the module cards with their stat lines, the pinned group, and the Settings group rows with their trailing controls.",
    landmarks:
      "Spatial landmarks are the category headers as the directory's structure, the module cards as its entries, and the language and theme rows as the tie between the app and the film's own closing argument.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Module cards are roughly 178 by 158 pixels in a two-column grid with 12 pixels of gap; Settings rows sit in grouped cards with 2 pixel separators.",
    surfaces:
      "Surfaces are the app's own directory styling: grouped flat paper cards, one accent per category header, and no additional graphic layer added by the film. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
  {
    tag: "@screen_home_rtl",
    scene: "sc24",
    route: "/ (Arabic)",
    title: "Home dashboard, mirrored",
    layout:
      "Structurally identical to `@screen_home` and mirrored about the vertical axis. The scroll column's gutter is symmetric so the mirror is not merely a text alignment change: the greeting and its second line are right-aligned with their leading edge at the right gutter, the dhikr card's internal content is right-aligned, the quick-action rail scrolls right to left with its first item at the right edge, each task card has its completion circle at the right edge and its time chip at the left, the statistics grid preserves its two-by-two arrangement with each tile's numerals right-aligned, and the routine progress cards place their percentage at the left. The bottom navigation is mirrored: Home sits at the right end of the bar and More at the left, with the raised centre action still centred.",
    fixed:
      "Fixed objects are the mirrored greeting block, the dhikr card, the quick-action rail, the task card group, the statistics grid, the routine progress cards, and the mirrored five-slot bottom navigation.",
    landmarks:
      "Spatial landmarks are the greeting at the top right as the reading entry point, the mirrored task cards as the clearest evidence of true mirroring rather than translation, and the reversed bottom navigation as the persistent shell's own mirror.",
    scale:
      "Scale is the same 412 by 915 viewport at twice density. Card sizes, radii and gaps are numerically identical to `@screen_home`; only the horizontal order and the text alignment differ.",
    surfaces:
      "Surfaces are the identical visual system to the English screens: same cream ground, same white paper, same hairline borders, same radii. The only change is direction. Weathering is absent.",
    grade: LIGHT_NOTE,
    colour: LOCATION_COLOUR_NOTE,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────
const PROPS = [
  {
    tag: "@card_paper",
    version: "v1",
    scenes: "sc02–sc23",
    seeds: "`generations/sc02/sc02a-v1.png`, `generations/sc12/sc12a-v1.png`, `generations/sc20/sc20a-v1.png`",
    descriptor:
      "The full-width paper card that holds almost all content in the film. Form: a single rounded rectangle with a corner radius between 24 and 32 device-independent pixels depending on the card's rank, largest for primary panels and smallest for nested sub-surfaces. Scale: the card always spans the screen width minus an 18 pixel gutter on each side, so its width is roughly 376 device-independent pixels at a 412 pixel viewport. Material: an opaque flat paper fill at pure white `#ffffff` over a background surface of `#ffeef4` on a ground of `#fff8fa`, with no transparency, no blur and no blend mode. Finish: matte with a one-pixel solid border at roughly 6% opacity in the plum ink colour `#2b1727`, plus one very low elevation shadow of 2 pixels vertical offset and an 8 pixel blur at about 4% opacity, so the card lifts from the ground by less than a millimetre. A nested or recessed sub-surface inside a card uses the surface fill `#ffeef4` instead of white so hierarchy is carried by tone rather than by a heavier border. Markings: none. No printed label, no rule, no perforation, no corner fold, no tab and no index marker is ever drawn on the card itself. Wear: none, anywhere, at any point in the film; the cards are the product as it renders, not a photographed notebook. Moving parts: none. Distinctive details: the border and the shadow are the only two treatments, and they are applied identically on every card so the interface reads as one stationery system rather than a mixed set.",
  },
  {
    tag: "@brand_mark",
    version: "v1",
    scenes: "sc01, sc24",
    seeds: "`generations/sc01/sc01a-v1.png`, `generations/sc24/sc24b-v1.png`",
    descriptor:
      "The identity treatment that opens and closes the film. Form: two stacked text lines, the first being the word AYXA set in a high-contrast serif display face at heavy weight, and the second being the words Planner Pro set in the same face at a smaller size and with slightly wider letter spacing, both lines centred on a shared axis and both set in the dark plum ink colour `#2b1727`. Beneath the wordmark sits a single horizontal accent rule, 4 device-independent pixels tall with fully rounded ends and a width of roughly one third of the wordmark's own width. The rule's fill is a hard-stop linear gradient running from blush `#ffd6e7` through the brand pink `#ff1493` and out into lavender `#e6e6fa`, left to right, with no transparency at either end and no soft falloff. Scale: at the cold open the first line is set at roughly 47 device-independent pixels and the second at roughly 35; at the outro the first line is roughly 37. Markings: none beyond the two lines and the rule. Finish: flat, untextured, no glow, no outline, no drop shadow behind the type and no reflection of the rule. Wear: none. Moving parts: none; the only motion the mark ever receives is the rule drawing from its left end to its right end, and the type settling by a few pixels during the cold open. Distinctive details: the mark is never accompanied by a logo device, never placed on a photographic background, and never given a gradient or an outlined variant.",
  },
  {
    tag: "@shell_bottom_nav",
    version: "v1",
    scenes: "sc02–sc23",
    seeds: "`generations/sc02/sc02a-v1.png`, `generations/sc24/sc24a-v1.png`",
    descriptor:
      "The persistent five-slot navigation bar that is present on every captured screen except the two graphic title cards. Form: a single full-width bar pinned to the bottom edge, roughly 74 device-independent pixels tall, with a one-pixel hairline along its top edge at roughly 8% plum opacity and a background fill of white at 93% opacity so the page beneath is very faintly visible through it. The bar holds exactly five slots at even spacing with 16 pixels of horizontal padding at each end: slot one is the dashboard, slot two is the task list, slot three is the assistant and is drawn as a raised centre action, slot four is the journal, and slot five is the directory. Each flat slot is a rounded square of roughly 26 device-independent pixels at a 9 pixel radius holding a single line icon in the plum ink colour, becoming the brand pink `#ff1493` with a pink-tinted backdrop when active. The centre slot is larger: a rounded square of roughly 38 device-independent pixels at a 14 pixel radius, filled with the brand pink `#ff1493`, holding a white icon and sitting slightly proud of the bar's own top edge. Scale: five slots, always five, never fewer and never more. Markings: no labels are drawn beneath the icons at this size, and no badge or dot is present on any slot. Finish: the flat slots are matte with no border; the centre action is flat pink with no gloss, no glow and no gradient. Wear: none. Moving parts: none within a captured still; the active state is a fill and colour change only, never a slide or a bounce. Distinctive details: when the interface is mirrored to Arabic the five slots reverse their order so the dashboard sits at the right end and the directory at the left, while the centre action stays centred.",
  },
  {
    tag: "@stylus",
    version: "v1",
    scenes: "sc03, sc05, sc06, sc12, sc20",
    seeds: "`generations/sc20/sc20a-v1.png`, `generations/sc06/sc06a-v1.png`",
    descriptor:
      "The hand-made accent layer used sparingly to keep the interface feeling written in rather than filled in. Form: four motif families, each drawn as a simple flat vector shape with a uniform stroke and no fill gradient. The first family is a dashed or dotted rule, drawn as a repeated round-cap dash at roughly 3 device-independent pixels thick with 5 pixels of dash and 6 pixels of gap. The second is a torn washi strip, a rectangle roughly 118 by 26 device-independent pixels with a slightly irregular short edge and a repeating diagonal stripe pattern at 50% opacity over a pastel fill, tilted between 6 and 7 degrees either way. The third is a small five-petal flower, drawn as five round petals around a small centre, at roughly 26 device-independent pixels across. The fourth is a four-point sparkle, drawn as a concave diamond, at roughly 20 device-independent pixels across, with smaller instances at 15. Colours: strip and flower and sparkle are drawn only in blush `#ffd6e7`, lavender `#e6e6fa`, butter `#fff1b8`, mint `#98ff98` or powder `#bfe3ff`, always at between 40% and 50% opacity. Placement: the entire layer sits behind and beside content. No motif is ever drawn over a glyph, a numeral, a control, a progress rule or a card border. Wear: none beyond the deliberate torn edge of the strip. Moving parts: none. Distinctive details: the accent is present on fewer than half the screens and always covers less than five percent of the frame, which is what keeps it reading as stationery rather than as decoration.",
  },
];

function refSheetPrompt(tag, descriptor) {
  return [
    "Show the same asset on a neutral grey background in these five views: front, three-quarter, profile, back, and close detail.",
    "",
    descriptor,
    "",
    `Keep the sheet to \`${tag}\` alone on the neutral grey ground. No location, no other prop, no surrounding furniture, no narrative action and no dramatic staging. Do not add any text, label, badge, brand name or caption to the sheet or to the asset. If the asset is a captured screen, do not redraw its interface: reproduce the exact layout, colour values and radii stated above and nothing else.`,
  ].join("\n");
}

function stressMatrix(kind, pairings) {
  const rows = [];
  pairings.forEach((p, i) => {
    rows.push(
      `| ${kind === "location" ? `Frame ${i + 1}` : `View ${i + 1}`} | ${p.angle} | ${p.size} | ${p.light} | ${p.paired} | ${p.prompt} | pending | pending |`,
    );
  });
  return [
    "## Stress test",
    "",
    "Gate: for a location or prop the completed matrix is presented for an explicit pass decision.",
    "Status stays `draft` until that decision is recorded here.",
    "",
    "| Test | Angle | Shot size | Scene lighting | Paired asset | Prompt | Result | Verdict |",
    "|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    `Lock decision: **pending**. ${kind === "location" ? "Ten frames are listed." : "Ten views are listed."} Verdicts and output paths are recorded in the \`Result\` and \`Verdict\` cells as each item is reviewed against this passport.`,
    "",
  ].join("\n");
}

const ANGLES = ["Front on, straight to the plane", "Front on, 8° high", "Front on, 8° low", "Slight three-quarter to the left", "Slight three-quarter to the right", "Tight on the upper third", "Tight on the lower third", "Centred, wider so the margins read", "Centred, tighter so edge spacing reads", "Front on, matched to the neighbouring shot's framing"];

function defaultPairings(target) {
  const shared = [
    "`@phone_frame`", "`@card_paper`", "`@shell_bottom_nav`", "`@card_paper`",
    "`@phone_frame`", "`@card_paper`", "`@shell_bottom_nav`", "`@card_paper`",
    "`@phone_frame`", "`@card_paper`",
  ];
  return ANGLES.map((angle, i) => ({
    angle,
    size: i < 2 ? "Full screen" : i < 5 ? "Full screen" : i < 7 ? "Upper or lower half" : "Full screen",
    light: "Soft even high-key UI light, no key direction (the scene's actual lighting)",
    paired: shared[i],
    prompt: `Two-shot: the captured \`${target}\` screen inside \`@phone_frame\`, paired with \`${shared[i]}\`. Static composition, no action.`,
  }));
}

function writePassport(dir, filename, body) {
  const target = path.join(dir, filename);
  if (fs.existsSync(target)) {
    console.log(`kept   ${path.relative(process.cwd(), target)} (already exists)`);
    return false;
  }
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, body, "utf8");
  console.log(`wrote  ${path.relative(process.cwd(), target)}`);
  return true;
}

function main() {
  fs.mkdirSync(PROPS_DIR, { recursive: true });
  fs.mkdirSync(LOC_DIR, { recursive: true });
  let written = 0;

  PROPS.forEach((p) => {
    const descriptor = p.descriptor;
    const body = [
      `# ${p.tag} — version ${p.version}`,
      "Status: draft",
      "Type: prop",
      `Scenes: ${p.scenes}`,
      `Seed files: ${p.seeds}`,
      "",
      "## Canonical descriptor",
      "",
      descriptor,
      "",
      "## Reference-sheet prompt",
      "",
      refSheetPrompt(p.tag, descriptor),
      "",
      "## Reference files",
      "",
      `- ${p.seeds}`,
      "",
      stressMatrix("prop", defaultPairings(p.tag)),
    ].join("\n");
    if (writePassport(PROPS_DIR, `${p.tag.replace(/^@/, "")}-${p.version}.md`, body)) written += 1;
  });

  ["sc03", "sc05", "sc06"].forEach(() => {}); // stylus pairing already covered by defaultPairings

  LOCATIONS.forEach((l) => {
    const descriptor = [
      `${l.title}. Layout: ${l.layout}`,
      `Fixed architecture: ${l.fixed}`,
      `Spatial landmarks: ${l.landmarks}`,
      `Scale: ${l.scale}`,
      `Surfaces and weathering: ${l.surfaces}`,
      l.colour,
      l.grade,
    ].join(" ");
    const body = [
      `# ${l.tag} — version v1`,
      "Status: draft",
      "Type: location",
      `Scenes: ${l.scene}`,
      `Seed files: \`generations/${l.scene}/${l.scene}a-v1.png\``,
      "",
      "## Canonical descriptor",
      "",
      descriptor,
      "",
      "## Reference-sheet prompt",
      "",
      refSheetPrompt(l.tag, descriptor),
      "",
      "## Reference files",
      "",
      `- \`generations/${l.scene}/${l.scene}a-v1.png\` — the captured screen, approved for identity, layout, palette and grade.`,
      `- Route captured: \`${l.route}\` against the running application at the dev server.`,
      "",
      stressMatrix("location", defaultPairings(l.tag)),
    ].join("\n");

    const filename = `${l.tag.replace(/^@screen_/, "screen_")}-v1.md`;
    if (writePassport(LOC_DIR, filename, body)) written += 1;
  });

  console.log("");
  console.log(`Passports written this run: ${written}`);
  console.log(`Props in registry: ${PROPS.length + 1} (including @phone_frame, written separately)`);
  console.log(`Locations in registry: ${LOCATIONS.length}`);
}

main();
