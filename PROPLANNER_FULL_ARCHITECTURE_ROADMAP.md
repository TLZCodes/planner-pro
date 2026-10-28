# 🚀 AYXA Planner Pro & Hello Brio Studio
## Comprehensive Technical Architecture, Subsystem Reference & Agent Enhancement Roadmap

> **Version**: 2.4.0 (Production Release Candidate)  
> **Platform**: Cross-Platform Web SPA & Native Android (Capacitor Bridge)  
> **Target Audience**: AI Agents, System Architects, Core Developers  

---

## 📐 1. System Overview & Technology Stack

AYXA Planner Pro is an ultra-modern, high-performance daily productivity suite and digital bullet journal designed for mobile devices, tablets, and web browsers. It combines structured planning tools (Eisenhower matrix, habit trackers, study center, business projects, travel planner, Islamic Salah/Quran trackers) with an unrestricted, interactive **Pastel Hand-Drawn Canvas & Bullet Journal Studio**.

```mermaid
graph TD
    User([User Device / WebView]) --> MobileShell[MobileShell & Navigation Guard]
    MobileShell --> AuthGuard{Authenticated / Guest?}
    AuthGuard -->|No| LoginRoute[/login - Auth Page]
    AuthGuard -->|Yes| Router[TanStack Router Engine]
    
    Router --> Dashboard[/ - Main Dashboard]
    Router --> BujoStudio[BujoCanvasEditor - IFrame Bridge]
    Router --> Modules[Productivity & AI Modules]
    
    BujoStudio --> CanvasHTML[public/bujo-app.html - DOM/SVG Engine]
    CanvasHTML --> LocalStorage[(LocalStorage State Engine)]
    
    Modules --> StoreLib[src/lib/store.ts - App State]
    Modules --> AdMobLib[src/lib/admob.ts - Google AdMob SDK]
    Modules --> NotifLib[src/lib/notify.ts - Local Notifications]
    Modules --> AISdk[src/routes/ai.tsx - AI Assistant]
```

### Core Technologies
- **Frontend Framework**: React 19 + TanStack Start (SSR/SPA) + TanStack Router
- **Build Engine & Bundler**: Vite 8 + Nitro Server Engine
- **Styling & Design System**: TailwindCSS v4 + Custom Glassmorphism CSS + Google Fonts (Caveat, Pacifico, Amiri, Playfair Display, DM Sans)
- **Native Mobile Bridge**: Capacitor 6 (`@capacitor/core`, `@capacitor/android`, `@capacitor/app`)
- **Monetization & Ads**: Google AdMob Integration Layer (`src/lib/admob.ts`)
- **Notifications**: Local Notifications & Web Notification API (`src/lib/notify.ts`)
- **AI Logic**: Vercel AI SDK (`@ai-sdk/react`, `@ai-sdk/openai-compatible`)

---

## 🏗️ 2. Frontend Architecture & Component Matrix

### 2.1 Navigation & Layout (`src/components/MobileShell.tsx`)
- **Route Exclusion Scoping**: Automatically detects unauthenticated routes (`/login`, `/signup`) and suppresses bottom navigation and top headers to prevent navigation traps.
- **Bottom Navigation Dock**: Quick access to Dashboard (`/`), Tasks (`/tasks`), Habits (`/habits`), Focus (`/focus`), and More Menu (`/more`).
- **Responsive Viewport**: Adapts dynamically across mobile smartphones, foldable displays, tablets, and desktop browsers with max-width container constraints (`540px` mobile container).

---

### 2.2 Pastel Bullet Journal & Canvas Studio (`public/bujo-app.html` & `BujoCanvasEditor.tsx`)
The Bullet Journal Studio is implemented as a high-performance, responsive HTML5 + SVG + DOM canvas iframe, providing smooth 60 FPS drag, rotate, resize, and draw interactions.

#### Interactive Block Matrix
| Block Type | Class / Structure | Customization Capabilities |
| :--- | :--- | :--- |
| **♡ Weekday Ribbon Banner ♡** | `.b-banner-day` | Inline text editing, 1-tap pastel color swatches (Mint, Pink, Yellow, Lavender) |
| **🎗️ Header Ribbon Banner** | `.b-ribbon` | 3D unrolled ribbon banner, editable title text, background colors |
| **📔 Spiral Binder Notepad** | `.b-spiral-note` | Real spiral binder rings, lined page, multi-line `textarea` note editing |
| **📝 Washi-Taped To-Do List** | `.b-washi-todo` | Pink tape accent, custom task list, toggleable round checkboxes |
| **📌 Stacked Sticky Card** | `.b-card-stacked` | Double-offset 3D sticky card, inline handwritten text editing |
| **🥇 Numbered Ribbon Badges** | `.b-badge-num` | Ribbon tail priority badge, editable numbers (1-9) or custom labels |
| **🌿 Hand-Drawn Leaf Vine** | `.b-divider-vine` | Sketched leaf vine section separator, editable emoji patterns |
| **🏹 Sketched Arrow Line** | `.b-divider-arrow` | Decorative arrow divider line, inline text formatting |
| **🌸 Doodles & Stamps Matrix** | `.b-sticker` | Retro camera 📷, coffee cup ☕, pencil ✏️, envelope 💌, stamp frame 🖼️, etc. |
| **🕌 Salah Tracker** | `.b-islamic-salah` | Daily 5 prayers check grid with Arabic calligraphy header |
| **📖 Quran Log** | `.b-quran` | Daily Surah reading notes with Amiri typography |

#### Canvas Manipulation Tools
1. **Selection & Dragging**: Single touch/pointer drag with live coordinate updates.
2. **Resize Handle (`↗`)**: Touch-scaled width and height recalculation with minimum boundary safeguards.
3. **Rotate Handle (`⟳`)**: Dynamic angle calculation (`Math.atan2`) for 360° rotation.
4. **Freehand Drawing Pen (`✏️`)**: SVG path renderer generating smoothed vector curves (`pointsToPath`).
5. **Undo / Redo Stack**: 25-level deep snapshot stack preserving block states and stroke vectors.
6. **Image Upload (`🖼️`)**: FileReader Base64 image import onto canvas with border frame styling.

---

### 2.3 Productivity Modules & Features
- **Dashboard (`src/routes/index.tsx`)**: Daily overview, habit quick-complete, upcoming tasks, quick action launcher.
- **Tasks & Matrix (`src/routes/tasks.tsx`)**: Eisenhower Matrix (Do First, Schedule, Delegate, Don't Do), priority filtering, due dates.
- **Habits & Streaks (`src/routes/habits.tsx`)**: Weekly grid habit tracker, streak counter, completion metrics.
- **Focus & Pomodoro (`src/routes/focus.tsx`)**: Countdown timer, ambient white noise sounds, session statistics.
- **Academic Center (`src/routes/learning.tsx`)**: Course management, assignment trackers, grade calculators, study notes.
- **Business & Projects (`src/routes/business.tsx`)**: Kanban boards, project timelines, revenue/expense tracking.
- **Travel Planner (`src/routes/travel.tsx`)**: Packing checklists, itinerary builder, budget manager.
- **Self-Care & Mood (`src/routes/selfcare.tsx` & `pixels.tsx`)**: Daily mood ring, gratitude journal, water intake logger.
- **AI Planning Assistant (`src/routes/ai.tsx`)**: Conversational AI for generating weekly schedules, task breakdowns, and advice.

---

## ⚙️ 3. Backend, Data Layer & Monetization

### 3.1 State Management & Persistence (`src/lib/store.ts`)
- **Primary Engine**: React State + LocalStorage auto-sync layer (`proplanner_bujo_v17`).
- **Hydration Safety**: Guarantees zero SSR hydration mismatches by wrapping initial loads in client-side checks.
- **JSON Export / Import**: Built-in serialization allowing users to back up or restore complete planner data.

### 3.2 Authentication & Security (`src/routes/login.tsx`)
- **Guest Mode Support**: Unauthenticated users can choose "Continue as Guest" to immediately access all planner features.
- **Firebase Auth Bridge**: Structured for seamless Google Sign-In, Email/Password auth, and Cloud Firestore user profile sync.
- **Route Guard Protection**: Unauthenticated launches redirect directly to `/login`, bypassing onboarding carousels.

### 3.3 Google AdMob Monetization (`src/lib/admob.ts`)
- **Banner Ads**: `showBannerAd(adUnitId?)` & `hideBannerAd()` triggers for bottom banner placements.
- **Interstitial Ads**: `showInterstitialAd(adUnitId?)` for full-screen transition ads.
- **Rewarded Video Ads**: `showRewardedAd(adUnitId?)` for unlocking premium sticker packs and advanced AI prompts.
- **Test Mode**: Pre-configured with official Google AdMob Test Unit IDs (`ca-app-pub-3940256099942544/...`).

### 3.4 Local Notifications Engine (`src/lib/notify.ts`)
- **Web & Native Bridge**: Uses HTML5 Notification API for web preview and Capacitor Local Notifications for native Android/iOS.
- **Daily Reminders Dispatcher**: `runDailyReminders()` automatically triggers daily task summaries, water reminders, daily quotes, and Dhikr notifications at user-defined reminder times.

---

## 📱 4. Android Build & Deployment Pipeline

To package the web SPA into a standalone, offline-ready Android APK:

```bash
# 1. Build the Vite/Nitro static Web SPA
npm run build

# 2. Inject Vite JS/CSS bundles into static SPA entry point
node scratch/build_spa.cjs

# 3. Copy public assets & bujo-app.html to Android WebView assets
node -e "require('fs').copyFileSync('public/bujo-app.html', '.output/public/bujo-app.html');"
npx cap copy android

# 4. Compile Android Debug APK
cmd.exe /c "cd android && gradlew.bat assembleDebug"
```

**Generated APK Output Path**:  
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔮 5. Roadmap & Instructions for Autonomous AI Agents

When delegating future enhancements to subagents or developer teams, follow these specialized guidelines:

### Task 1: Cloud Firestore Multi-Device Sync
- **Location**: `src/lib/store.ts` & `src/lib/firebase.ts`
- **Objective**: Implement real-time listener (`onSnapshot`) on Firestore document `users/{uid}/planner/bujo_data` to automatically sync canvas elements across multiple devices.
- **Rule**: Retain local storage as the fallback cache for offline availability.

### Task 2: Live Google AdMob Production Key Injection
- **Location**: `src/lib/admob.ts`
- **Objective**: Replace test unit IDs with production AdMob App ID and Ad Unit IDs stored in environment variables (`import.meta.env.VITE_ADMOB_BANNER_ID`).

### Task 3: Vector PDF Export for Bullet Journal Spreads
- **Location**: `public/bujo-app.html` & `src/components/canvas/BujoCanvasEditor.tsx`
- **Objective**: Add `jsPDF` or `html2canvas` library to export the active canvas spread as a high-resolution printable 300 DPI PDF document.

### Task 4: Push Notifications via Firebase Cloud Messaging (FCM)
- **Location**: `src/lib/notify.ts` & `@capacitor/push-notifications`
- **Objective**: Upgrade local notifications to server-triggered FCM push notifications for automated daily habit check-ins and shared task updates.

---

*Document compiled and verified by Google Antigravity AI Engineering Team.*
