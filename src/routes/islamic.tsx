import { createFileRoute } from "@tanstack/react-router";
import { DeenPage } from "./deen";

export const Route = createFileRoute("/islamic")({
  head: () => ({
    meta: [
      { title: "ديني والعبادات 🌙 — AYXA Planner Pro" },
      { name: "description", content: "مخطط ومتابع الورد القرآني، مواقيت الصلاة الفلكية، الأذكار، والتسبيح والصدقات." }
    ],
  }),
  component: DeenPage,
});
