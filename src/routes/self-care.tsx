import { createFileRoute } from "@tanstack/react-router";
import SelfcarePage from "./selfcare";

export const Route = createFileRoute("/self-care")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  component: SelfcarePage,
});
