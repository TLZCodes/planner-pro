import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { GuestDataTransferModal } from "@/components/auth/GuestDataTransferModal";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import {
  signInWithEmail,
  validateEmail,
  isSafeRedirectUrl,
  isGoogleAuthConfigured,
  isAppleAuthConfigured,
} from "@/lib/authEngine";
import {
  inspectGuestData,
  type GuestDataInspectionResult,
  type GuestMigrationStrategy,
} from "@/lib/guestMigrationEngine";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  LogIn,
} from "lucide-react";

interface SignInSearchParams {
  redirect?: string;
}

export const Route = createFileRoute("/auth/sign-in")({
  validateSearch: (search: Record<string, unknown>): SignInSearchParams => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In — AYXA Planner" },
      {
        name: "description",
        content: "Sign in to your AYXA Planner account to access your routines, habits, and goals.",
      },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { redirect } = useSearch({ from: "/auth/sign-in" });
  const { ready, state, signIn, applyGuestMigration } = useApp();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guest migration states
  const [guestInspection, setGuestInspection] = useState<GuestDataInspectionResult | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<{
    uid: string;
    email: string;
    name: string;
  } | null>(null);

  // If already authenticated and setupDone, redirect to destination
  useEffect(() => {
    if (!ready) return;
    if (state.session && !state.user?.isGuest && state.setupDone) {
      const target = redirect && isSafeRedirectUrl(redirect) ? redirect : "/";
      navigate({ to: target, replace: true });
    }
  }, [ready, state.session, state.user, state.setupDone, redirect, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setError(t("invalidEmail"));
      return;
    }

    if (!password) {
      setError(isAr ? "يرجى كتابة كلمة المرور." : "Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const res = await signInWithEmail(cleanEmail, password);

      if (!res.success) {
        setLoading(false);
        setError(res.error ? (isAr ? res.error : res.errorEn || res.error) : t("errorOccurred"));
        return;
      }

      // Check if device holds prior guest data to offer migration
      const inspection = inspectGuestData(state);
      if (inspection.hasData) {
        setPendingUserData({
          uid: res.user?.uid || "usr_" + Date.now(),
          email: cleanEmail,
          name: res.user?.displayName || cleanEmail.split("@")[0],
        });
        setGuestInspection(inspection);
        setTransferModalOpen(true);
        setLoading(false);
        return;
      }

      // Sync state and navigate
      signIn(cleanEmail, password);
      setLoading(false);

      const target = redirect && isSafeRedirectUrl(redirect) ? redirect : "/";
      navigate({ to: target, replace: true });
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || t("errorOccurred"));
    }
  };

  const handleMigrationStrategy = (strategy: GuestMigrationStrategy) => {
    if (strategy === "cancel") {
      setTransferModalOpen(false);
      return;
    }

    if (pendingUserData) {
      applyGuestMigration(
        pendingUserData.uid,
        pendingUserData.email,
        pendingUserData.name,
        strategy
      );
    }

    setTransferModalOpen(false);
    const target = redirect && isSafeRedirectUrl(redirect) ? redirect : "/";
    navigate({ to: target, replace: true });
  };

  return (
    <AuthShell
      title={t("signInTitle")}
      subtitle={t("signInSubtitle")}
      showBack
      onBack={() => navigate({ to: "/welcome" })}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/25 flex items-start gap-2.5 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/90 block">
            {t("emailAddress")}
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="w-full h-11 ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 rounded-2xl bg-muted/40 border border-border/80 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/90">
              {t("password")}
            </label>
            <button
              type="button"
              onClick={() => navigate({ to: "/auth/forgot-password" })}
              className="text-[11px] text-primary font-medium hover:underline"
            >
              {t("forgotPasswordLink")}
            </button>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              className="w-full h-11 ltr:pl-10 rtl:pr-10 ltr:pr-10 rtl:pl-10 rounded-2xl bg-muted/40 border border-border/80 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute ltr:right-3 rtl:left-3 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>{t("signInButton")}</span>
            </>
          )}
        </button>

        {/* Social auth only when genuinely configured */}
        {(isGoogleAuthConfigured() || isAppleAuthConfigured()) && (
          <div className="pt-2 space-y-2">
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-border/60" />
              <span className="absolute bg-card px-2 text-[10px] text-muted-foreground">
                {isAr ? "أو" : "or"}
              </span>
            </div>
            {isGoogleAuthConfigured() && (
              <button
                type="button"
                className="w-full h-10 rounded-2xl bg-muted/50 border border-border/70 text-xs font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted"
              >
                {t("continueWithGoogle")}
              </button>
            )}
            {isAppleAuthConfigured() && (
              <button
                type="button"
                className="w-full h-10 rounded-2xl bg-muted/50 border border-border/70 text-xs font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted"
              >
                {t("continueWithApple")}
              </button>
            )}
          </div>
        )}

        {/* Switch to Sign Up */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            {t("dontHaveAccount")}{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/auth/sign-up" })}
              className="text-primary font-bold hover:underline"
            >
              {t("signUpLink")}
            </button>
          </p>
        </div>
      </form>

      {/* Guest Data Transfer Modal */}
      <GuestDataTransferModal
        open={transferModalOpen}
        inspection={guestInspection}
        onSelectStrategy={handleMigrationStrategy}
        loading={loading}
      />
    </AuthShell>
  );
}
