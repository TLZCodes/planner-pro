import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/overview")({
  component: OverviewPage,
});

function OverviewPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 20px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#1f2937", lineHeight: "1.6" }}>
      <header style={{ borderBottom: "2px solid #f472b6", paddingBottom: "16px", marginBottom: "24px" }}>
        <h1 style={{ color: "#db2777", margin: "0 0 8px 0", fontSize: "28px" }}>AYXA Planner Pro — Overview & Architecture</h1>
        <p style={{ margin: 0, color: "#4b5563", fontSize: "16px" }}>
          All-in-one aesthetic life planner & AI companion for mindful Muslim women and ambitious planners.
        </p>
      </header>

      <section style={{ marginBottom: "24px", background: "#fdf2f8", padding: "16px 20px", borderRadius: "12px", border: "1px solid #fbcfe8" }}>
        <h2 style={{ color: "#be185d", marginTop: 0, fontSize: "20px" }}>✨ AYXA AI Agent Companion</h2>
        <ul>
          <li><strong>Agent Personas:</strong> 🌸 Ayxa (Feminine, gentle & encouraging) or 🌿 Anis (Masculine, structured & action-oriented).</li>
          <li><strong>Credit Protection System:</strong> 50 welcome credits with smart consumption tiers:
            <ul>
              <li><strong>Saver (1 credit):</strong> Concise, high-impact bulleted answers.</li>
              <li><strong>Balanced (1 credit):</strong> Balanced guidance and daily habit steps.</li>
              <li><strong>Deep Pro (2 credits):</strong> Comprehensive master planning with psychological and scheduling breakdowns.</li>
            </ul>
          </li>
          <li><strong>Tones:</strong> Barakah (Islamic mindfulness & prayer sync), Gentle (self-compassion & rest), Action (momentum & discipline).</li>
          <li><strong>White-labeled:</strong> All underlying AI model identifiers and raw APIs are completely masked from user view.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "#111827", fontSize: "20px" }}>📱 Core Modules & Features</h2>
        <ul style={{ paddingLeft: "20px" }}>
          <li><strong>Home Dashboard:</strong> Energy & mood check-in, habit glance, and AI Companion companion card with 1-click access.</li>
          <li><strong>Tasks:</strong> Categorized by energy level and priorities, with an instant AI Task Breakdown button.</li>
          <li><strong>Between the Prayers:</strong> Daily planner harmonizing personal tasks with prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha).</li>
          <li><strong>Habits Studio:</strong> Weekly boards, streaks, micro-habits, and self-compassionate tracking.</li>
          <li><strong>Routines & Ideal Week:</strong> Morning and evening rituals, night-shift adapters, and ideal week templates.</li>
          <li><strong>Goals & Vision Board:</strong> Milestone tracking, someday garden, and visual aspiration boards.</li>
          <li><strong>Focus Studio:</strong> Pomodoro timer with peaceful soundscapes.</li>
          <li><strong>Learning & Bookshelf:</strong> Book progress tracker and interactive flashcards.</li>
          <li><strong>Wellness & Self-Care:</strong> Hydration logging, sleep tracker, and Self-Care Bingo.</li>
          <li><strong>Journal & Weekly Reset:</strong> Islamic reflections, gratitude notes, Barakah Jar, and Future Me capsule.</li>
          <li><strong>Wheel of Becoming:</strong> 8-dimension holistic life balance wheel.</li>
        </ul>
      </section>

      <section style={{ background: "#f3f4f6", padding: "16px 20px", borderRadius: "12px" }}>
        <h2 style={{ color: "#374151", marginTop: 0, fontSize: "18px" }}>🛠️ Technology Stack</h2>
        <p style={{ margin: 0, fontSize: "14px" }}>
          Built with <strong>TanStack Start (React 19, TypeScript)</strong>, <strong>Tailwind CSS</strong> with aesthetic tokens & glassmorphism, <strong>Capacitor</strong> for Android APK and iOS builds, and PWA offline capabilities.
        </p>
      </section>
    </div>
  );
}
