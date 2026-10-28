# CHATGPT CONTEXT: AYXA PLANNER PRO

This document is prepared specifically for ChatGPT and AI code assistants to understand the AYXA Planner Pro architecture, data models, recent fixes, and operating boundaries before reviewing or suggesting any code modifications.

---

## 1. What This Project Is
**AYXA Planner Pro** is a high-end, aesthetic, privacy-first lifestyle planner and life-balance hub designed for modern Muslim women. It blends daily time management with Islamic spiritual routines, wellness habits, bullet journaling, vision boards, goal tracking, finance, study/bookshelf sessions, and guided weekly/monthly reflections.

---

## 2. Tech Stack
- **Framework:** React 19 (`^19.0.0`) with TypeScript (`5.9.3`)
- **Fullstack / SSR:** TanStack Start (`^1.168.32`) with TanStack Router (`^1.170.18`)
- **Styling:** Tailwind CSS v4 (`^4.2.1`), Radix UI, Lucide React icons
- **State & Storage:** Custom offline-first store (`src/lib/store.tsx`) using `localStorage` (`ayxa-app-state-v2`) and Dexie.js (IndexedDB); optional Cloud Firestore for authenticated cloud backups
- **Mobile Distribution:** Capacitor 8.5 (Android & iOS native asset synchronization)
- **Edge Deployment:** Nitro (`cloudflare-module` preset)
- **Build Tool:** Vite 8.1.5

---

## 3. Architecture
- **Offline-First & Local-First:** The app runs 100% locally in guest mode without requiring login or network connectivity. User data is written synchronously to local state and debounced to `localStorage`.
- **Pure Functional Engines:** Domain business logic is decoupled from React views into pure TypeScript engines (`weeklyHabitEngine.ts`, `weeklyResetEngine.ts`, `futureMeEngine.ts`, `guestMigrationEngine.ts`), making them 100% unit-testable in Node.js without DOM mocks.
- **Single Shell Navigation:** The app uses `MobileShell.tsx` to handle bottom navigation and overlays, preventing screen flickering and state destruction on route changes.
- **Bilingual & RTL-First:** The entire app natively supports Arabic RTL and English LTR using `src/lib/i18n.tsx`.

---

## 4. Important Files
- `src/lib/store.tsx`: The primary reactive store, TypeScript interfaces (`Task`, `Habit`, `JournalEntry`, `Goal`, `VisionBoard`), normalization functions, and persistence hydration logic.
- `src/lib/weeklyHabitEngine.ts`: Canonical habit progress engine (`computeWeeklyProgress`), week start offsets, day status resolution, and future day exclusion rules.
- `src/lib/weeklyResetEngine.ts`: Aggregator for weekly review metrics, canonical reflection prompts, and markdown export compiler.
- `src/lib/futureMeEngine.ts`: Future Me Time Capsule calendar math (leap-year safe), opening date eligibility, and public view masking (`maskSealedCapsuleForPublicView`).
- `src/routes/journal.tsx`: The central journaling hub featuring the horizontally scrollable 6-tab strip and sub-views (Daily Journal, Barakah Jar, Week in Bloom, Weekly Reset, Wheel of Becoming, Time Capsule).
- `src/components/journal/reset/ResetOverviewStep.tsx`: The Weekly Reset habit summary overview step displaying full numerator/denominator and localized sentences.
- `src/components/vision/VisionBoardCollection.tsx`: Vision board gallery view with single coherent empty-state card.
- `src/components/journal/capsule/FutureMeCapsuleView.tsx`: Complete view for sealed letters, countdown chips, and letter composition.

---

## 5. Important Routes
- `/`: Main dashboard (Today's focus, daily habits, prayer schedule, quick actions)
- `/journal`: Daily Journal, prompts library, stickers, and sub-views:
  - `/journal?tab=reset`: Weekly Reset Studio (6 guided reflection steps)
  - `/journal?tab=capsule`: Future Me Time Capsule
  - `/journal?tab=jar`: Barakah Jar (Blessings visualizer)
  - `/journal?tab=bloom`: My Week in Bloom keepsake builder
  - `/journal?tab=wheel`: Wheel of Becoming monthly balance wheel
- `/habits`: Habits Week board (7-day grid, streaks, completion counts)
- `/goals`: Goals & Milestones, Someday Garden wish list
- `/vision`: Vision Board canvas & layouts
- `/deen`: Prayer times (Adhan calculations), Quran tracker, Tasbih counter, Good Deeds
- `/wellness`: Hydration tracker, Sleep duration, Fitness logs
- `/finance`: Multi-currency accounts, transactions, budget meters
- `/travel`: Trip itineraries, packing checklists, travel documents

---

## 6. Database & Storage Structure
Key in `localStorage`: `"ayxa-app-state-v2"`.
- `user`: User profile (`isGuest: boolean`, name, email, avatar)
- `tasks`: Array of `Task` (`id`, `title`, `done`, `dueDate`, `category`)
- `habits`: Array of `Habit` (`id`, `name`, `scheduledDays`, `targetValue`, `streak`, `history: Record<YYYY-MM-DD, { completed: boolean, value: number }>`)
- `journal`: Array of `JournalEntry` (`id`, `title`, `body`, `templateId`, `mood`, `energy`, `locked`, `isBarakahJar`)
- `timeCapsules`: Array of `FutureMeCapsule` (`id`, `status: 'draft'|'sealed'|'opened'`, `title`, `body`, `openingDate`, `sealingTimezone`, `attachments`)
- `visionBoards`: Array of `VisionBoard` (`id`, `title`, `theme`, `layout`)
- `visionBoardItems`: Array of `VisionBoardItem` (`id`, `boardId`, `type`, `imageUrl`, `quote`, `linkedGoalId`)
- `deenSettings` & `prayerLogs`: Prayer tracking, calculation methods, Hijri adjustments
- `money`, `financeAccounts`, `financialTransactions`: Multi-currency financial balances

---

## 7. Main Features
1. **Habit Board & Weekly Summaries:** Fair progress evaluation excluding future days from current-week denominator.
2. **Weekly Reset Studio:** Gentle weekly reflection with factual metric aggregation (no fabricated numbers).
3. **Journal Navigation:** Horizontally scrollable 6-tab strip with 40px touch targets, zero text wrapping, and active-tab centering.
4. **Future Me Time Capsule:** Letters sealed until future dates with live countdowns and public view masking.
5. **Barakah Jar & Week in Bloom:** Aesthetic keepsake visualizers for gratitude and weekly wins.
6. **Wheel of Becoming:** Monthly 8-area life balance evaluation with unrated vs zero distinction.
7. **Vision Board:** Single empty state, modular layouts, and in-memory previews that create 0 user records.
8. **Deen & Spirituality:** Offline Adhan calculation, Quran reading goals, daily Good Deeds.

---

## 8. Current Known Bugs & Technical Debt
1. **BUG-001 (TypeScript Strict Mode Warnings):** Running standalone `tsc --noEmit` produces minor type errors in legacy models (`XPEvent` union keys, implicit `any` in `business.tsx`). These do not impact production build or runtime.
2. **BUG-002 (Plaintext Storage for Time Capsules):** While `maskSealedCapsuleForPublicView` protects sealed letters in the UI, stored records in `localStorage` are unencrypted JSON. Cryptographic AES encryption is recommended for future hardening.

---

## 9. Recent Fixes
- **Weekly Reset Habit Denominator:** Fixed missing denominator (`4 /`) by exporting `scheduledOccurrences` from `weeklyHabitEngine.ts`. Excluded future days from current week; added localized supporting sentence (`4 completed of 10 scheduled through today` / `4 من أصل 10 عادة مستحقة حتى اليوم`). Handled 0 habits with neutral badge.
- **Journal Tabs Multi-line Wrapping:** Replaced 5-button flex grid with horizontally scrollable strip (`overflow-x-auto no-scrollbar scroll-smooth`). All labels use `whitespace-nowrap shrink-0`. Added auto-scroll into view and edge fade scroll cues.
- **Vision Board Duplicate Actions:** Conditionalized header buttons so empty view renders only one concise card with primary and secondary actions. Previews create 0 user records.
- **Guest Profile Data Sanitization:** Purged hardcoded demo items (tasks, streak 21, study minutes 255, 30 XP) from `defaultState`. Fresh guest profiles start with honest empty states and 0 XP.
- **Future Me Time Capsule Integration:** Added `future_me` template card, added `capsule` tab in Journal, and built complete `FutureMeCapsuleView.tsx` with sealed envelopes, countdown chips, and strict masking.

---

## 10. Test Results
- **Command:** `npm test` (`node --test tests/*.test.mjs`)
- **Status:** **177 / 177 tests passing across 42 suites** (0 failures, 0 skipped, 0 cancelled).
- Regression suite `tests/ayxa-review-fixes.test.mjs` verifies all 5 recent fixes.

---

## 11. Build Results
- **Command:** `npm run build`
- **Status:** **PASS (Exit code 0)**
- Generates client bundle, SSR bundle, Nitro `cloudflare-module` preset, and synchronizes assets to Android and iOS Capacitor directories.

---

## 12. Accessibility (a11y) Status
- Minimum touch target: 40px–44px (`min-h-[40px] px-3.5 py-2`, `h-11`, `h-12`).
- Semantic HTML tags used throughout.
- Decorative icons and stickers have `aria-hidden="true"`.
- Full keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-hotpink`).
- High-contrast plum text (`#331d2c`) on soft blush canvas (`#fffbfd`), exceeding WCAG AA standards.
- Full bilingual Arabic RTL support.

---

## 13. Security Status
- **Zero Exposed Secrets:** No hardcoded private API keys, tokens, or credentials in the repository.
- **Input Sanitization:** User markdown input in reflections and journals is sanitized with DOMPurify.
- **Public Access:** Cloudflare Tunnel exposes the local Vite development server publicly on port 8085 with standard CORS.

---

## 14. Data Preservation Status
- **Strictly Guaranteed:** `loadInitialState()` in `src/lib/store.tsx` hydrates from `localStorage` without deleting, resetting, or overriding existing user records. Empty array fallbacks apply only when keys are absent on fresh profiles.

---

## 15. Accessible URLs for Testing & Review
- **Public Tunnel Base URL:** `https://incoming-europe-columnists-coordinated.trycloudflare.com`
- **Static HTML Audit Report (For Web Browsers & ChatGPT):**  
  `https://incoming-europe-columnists-coordinated.trycloudflare.com/report.html`
- **Raw Markdown Document (For Direct Reading):**  
  `https://incoming-europe-columnists-coordinated.trycloudflare.com/report.md`
- **Plain Text Document (For Direct Reading):**  
  `https://incoming-europe-columnists-coordinated.trycloudflare.com/report.txt`
- **Local Dev Server:** `http://127.0.0.1:8085`

---

## 16. Important Rules for Modifying This Project
1. **Do Not Touch Untouched Master Backup:** `c:\Users\TLZCodes\Desktop\ProPlanner` must remain untouched.
2. **Never Fabricate User Data:** Fresh normal profiles must never receive fake streaks, completions, or unearned XP.
3. **Preserve Existing Records:** Never perform speculative database wipes or resets on existing user profiles.
4. **Preserve AYXA Aesthetic Identity:** Soft blush backgrounds (`#fffbfd`), dark plum text (`#331d2c`), hotpink accents (`#e04770`), and soft pastel cards.
5. **Keep All Tests Green:** Always run `npm test` before concluding any feature change.
