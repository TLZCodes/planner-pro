import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, UserPlus, LogIn, UserCheck, Shield, Globe } from "lucide-react";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { LegalModal } from "@/components/auth/LegalModal";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — AYXA Planner" },
      {
        name: "description",
        content: "Welcome to AYXA Planner. Create your account, sign in, or continue as a guest.",
      },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const { ready, state, continueAsGuest } = useApp();
  const { t, lang, setLang, dir } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<"terms" | "privacy">("terms");

  // If already authenticated and completed setup, go directly to Home
  useEffect(() => {
    if (!ready) return;
    if (state.session && state.setupDone) {
      navigate({ to: "/", replace: true });
    }
  }, [ready, state.session, state.setupDone, navigate]);

  const handleContinueAsGuest = () => {
    continueAsGuest();
    navigate({ to: "/onboarding" });
  };

  const openTerms = () => {
    setLegalTab("terms");
    setLegalOpen(true);
  };

  const openPrivacy = () => {
    setLegalTab("privacy");
    setLegalOpen(true);
  };

  return (
    <div
      dir={dir}
      className="min-h-screen w-full bg-background text-foreground flex flex-col justify-between selection:bg-rose-200 selection:text-rose-900 relative overflow-x-hidden font-sans"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-rose-400/15 blur-3xl" />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-emerald-400/12 blur-3xl" />
      </div>

      {/* Top Header: Language Switcher (strictly text, no national flags) */}
      <header className="w-full max-w-md mx-auto px-6 pt-5 pb-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl grad-theme flex items-center justify-center text-white font-black text-base shadow-rose-xs">
            A
          </div>
          <span className="font-bold text-sm tracking-tight font-display text-foreground">
            AYXA Planner
          </span>
        </div>

        {/* Explicit text language switch (NO flags) */}
        <button
          type="button"
          onClick={() => setLang(isAr ? "en" : "ar")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-md border border-border/60 text-xs font-semibold text-foreground/90 hover:bg-card active:scale-95 transition-all shadow-xs"
          aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
        >
          <Globe className="h-3.5 w-3.5 text-primary" />
          <span>{isAr ? "English" : "العربية"}</span>
        </button>
      </header>

      {/* Main Hero & Actions */}
      <main className="w-full max-w-md mx-auto px-6 py-4 flex-1 flex flex-col justify-center">
        {/* Hero Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary mb-3">
            <Sparkles className="h-3 w-3" />
            <span>{t("becomingHer")}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display leading-tight mb-2">
            {t("welcomeTitle")}
          </h1>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t("welcomeSubtitle")}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 w-full">
          {/* 1. Create Account */}
          <button
            type="button"
            onClick={() => navigate({ to: "/auth/sign-up" })}
            className="w-full py-3.5 px-5 rounded-2xl grad-theme text-white text-sm font-bold shadow-rose-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t("createAccount")}</span>
          </button>

          {/* 2. Sign In */}
          <button
            type="button"
            onClick={() => navigate({ to: "/auth/sign-in" })}
            className="w-full py-3 px-5 rounded-2xl bg-card/90 hover:bg-card border border-border/80 text-foreground text-xs font-bold shadow-xs active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4 text-primary" />
            <span>{t("signIn")}</span>
          </button>

          {/* Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <span className="relative bg-background px-3 text-[11px] font-medium text-muted-foreground">
              {isAr ? "أو" : "or"}
            </span>
          </div>

          {/* 3. Continue as Guest */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="w-full py-3 px-5 rounded-2xl bg-muted/50 hover:bg-muted/70 border border-border/60 text-foreground text-xs font-semibold active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span>{t("continueAsGuest")}</span>
            </button>

            {/* Honest Local Storage Disclosure */}
            <p className="text-[10px] text-muted-foreground text-center mt-2 px-2 leading-tight">
              {t("guestModeDisclosure")}
            </p>
          </div>
        </div>
      </main>

      {/* Footer Legal Links */}
      <footer className="w-full max-w-md mx-auto px-6 py-4 text-center text-[11px] text-muted-foreground z-10">
        <p className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>{isAr ? "بمتابعتكِ، فإنكِ توافقين على" : "By continuing, you agree to our"}</span>
          <button
            type="button"
            onClick={openTerms}
            className="underline text-foreground/80 hover:text-primary font-medium"
          >
            {t("termsOfService")}
          </button>
          <span>{isAr ? "و" : "and"}</span>
          <button
            type="button"
            onClick={openPrivacy}
            className="underline text-foreground/80 hover:text-primary font-medium"
          >
            {t("privacyPolicy")}
          </button>
        </p>
      </footer>

      {/* Legal Dialog */}
      <LegalModal open={legalOpen} onOpenChange={setLegalOpen} defaultTab={legalTab} />
    </div>
  );
}
