import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/overview")({
  server: {
    handlers: {
      GET: async () => {
        const appData = {
          name: "AYXA Planner Pro",
          version: "2.1.0-beta",
          description: "All-in-one aesthetic life planner & AI companion for mindful Muslim women and ambitious planners.",
          features: [
            "AI Agent Companion (Feminine 'Ayxa' 🌸 & Masculine 'Anis' 🌿) with credit protection levels (Saver, Balanced, Deep Pro)",
            "Home Dashboard with integrated AI Companion status card & quick access",
            "Tasks Management with subtasks, tags, priorities, and direct AI task breakdown shortcut",
            "Habits Tracker (Daily, Weekly, Streaks, Micro-habits)",
            "Between the Prayers Planning (Syncing tasks with Fajr, Dhuhr, Asr, Maghrib, Isha)",
            "Routines Studio (Ideal Day, Ideal Week, Morning & Evening rituals)",
            "Goals & Milestones with progress tracking",
            "Vision Board & Someday Garden for long-term aspirations",
            "Focus Studio (Pomodoro timer, ambient sounds, focus sessions)",
            "Learning & Bookshelf with interactive flashcards",
            "Wellness & Hydration tracking with Self-Care Bingo",
            "Journal & Weekly Reset Studio with Islamic reflections and Barakah Jar",
            "Wheel of Becoming for multi-dimensional life balance assessment"
          ],
          aiIntegration: {
            identity: "White-labeled in-house AYXA AI Agent (all underlying model names completely masked)",
            modes: ["saver (1 credit - direct bullets)", "balanced (1 credit - guided plan)", "deep (2 credits - comprehensive master plan)"],
            tones: ["barakah (Islamic mindfulness)", "gentle (self-compassion)", "action (high execution)"],
            tokenEconomics: "50 welcome credits, guarded against overspending with low-credit notifications"
          },
          techStack: {
            framework: "TanStack Start / React 19 / TypeScript",
            styling: "Tailwind CSS + Glassmorphism aesthetic tokens",
            platforms: "Web (PWA), Android (Capacitor APK), iOS (Capacitor)"
          }
        };

        return new Response(JSON.stringify(appData, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
  }
});
