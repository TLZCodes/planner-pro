import { createFileRoute } from "@tanstack/react-router";
import { BadgesPage } from "./badges";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Badges & Achievements — AYXA Planner Pro" },
      {
        name: "description",
        content: "Authoritative achievement collection backed by your real personal progress.",
      },
    ],
  }),
  component: BadgesPage,
});
