import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";

interface AuthCallbackSearchParams {
  mode?: string;
  oobCode?: string;
  apiKey?: string;
  continueUrl?: string;
}

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>): AuthCallbackSearchParams => ({
    mode: typeof search.mode === "string" ? search.mode : undefined,
    oobCode: typeof search.oobCode === "string" ? search.oobCode : undefined,
    apiKey: typeof search.apiKey === "string" ? search.apiKey : undefined,
    continueUrl: typeof search.continueUrl === "string" ? search.continueUrl : undefined,
  }),
  head: () => ({
    meta: [{ title: "Processing — AYXA Planner" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { mode, oobCode } = useSearch({ from: "/auth/callback" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!mode || !oobCode) {
      navigate({ to: "/welcome", replace: true });
      return;
    }

    switch (mode) {
      case "resetPassword":
        navigate({
          to: "/auth/reset-password",
          search: { oobCode },
          replace: true,
        });
        break;

      case "verifyEmail":
        navigate({
          to: "/auth/verify-email",
          search: { oobCode },
          replace: true,
        });
        break;

      default:
        navigate({ to: "/", replace: true });
        break;
    }
  }, [mode, oobCode, navigate]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="h-10 w-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin mb-4" />
      <p className="text-xs text-muted-foreground font-medium">
        Validating secure credentials...
      </p>
    </div>
  );
}
