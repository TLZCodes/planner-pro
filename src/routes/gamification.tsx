import { createFileRoute } from "@tanstack/react-router";
import { ProgressPage } from "./progress";

export const Route = createFileRoute("/gamification")({
  head: () => ({
    meta: [
      { title: "My Progress ✨ — AYXA Planner Pro" },
      {
        name: "description",
        content:
          "Centralized progression, numeric levels, growth tiers, XP activity ledger, challenges and badges.",
      },
    ],
  }),
  component: ProgressPage,
});
