import { createFileRoute } from "@tanstack/react-router";
import { YearInPixelsPage } from "./year-in-pixels";

export const Route = createFileRoute("/pixels")({
  head: () => ({
    meta: [
      { title: "Year in Pixels — AYXA Planner Pro" },
      {
        name: "description",
        content: "Track your whole year in real 12-month calendar grids — one gentle pixel for every day.",
      },
    ],
  }),
  component: YearInPixelsPage,
});

export default YearInPixelsPage;
