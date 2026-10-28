import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { LegalModal } from "@/components/auth/LegalModal";
import { GuestDataTransferModal } from "@/components/auth/GuestDataTransferModal";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import {
  signUpWithEmail,
  validateEmail,
  validatePassword,
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
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/auth/sign-up")({
  head: () => ({
    meta: [
      { title: "Create Account — AYXA Planner" },
      {
        name: "description",
        content: "Create your AYXA Planner account to securely sync your plans, goals, and reflections.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  const { ready, state, signUp, applyGuestMigration } = useApp();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Legal modal states
  const [legalOpen, setLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<"terms" | "privacy">("terms");

  // Guest data inspection & migration states
  const [guestInspection, setGuestInspection] = useState<GuestDataInspectionResult | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<{
    uid: string;
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (state.session && !state.user?.isGuest && state.setupDone) {
      navigate({ to: "/", replace: true });
    }
  }, [ready, state.session, state.user, state.setupDone, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError(isAr ? "يرجى كتابة اسمكِ أو لقبكِ المفضل 🌸" : "Please enter your name or nickname 🌸");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError(t("invalidEmail"));
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setError(t(passCheck.errorKey || "passwordLengthError"));
      return;
    }

    if (!agreedToTerms) {
      setError(
        isAr
          ? "يرجى الموافقة على شروط الخدمة وسياسة الخصوصية للمتابعة."
          : "Please agree to the Terms of Service and Privacy Policy to continue."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await signUpWithEmail(cleanName, cleanEmail, password);

      if (!res.success) {
        setLoading(false);
        setError(res.error ? (isAr ? res.error : res.errorEn || res.error) : t("errorOccurred"));
        return;
      }

      // Check if device holds prior guest data
      const inspection = inspectGuestData(state);
      if (inspection.hasData) {
        setPendingUserData({
          uid: res.user?.uid || "usr_" + Date.now(),
          email: cleanEmail,
          name: cleanName,
        });
        setGuestInspection(inspection);
        setTransferModalOpen(true);
        setLoading(false);
        return;
      }

      // No prior guest data: complete sign-up immediately
      signUp({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      setLoading(false);
      navigate({ to: "/onboarding" });
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
    navigate({ to: "/onboarding" });
  };

  return (
    <AuthShell
      title={t("createAccountTitle")}
      subtitle={t("createAccountSubtitle")}
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

        {/* Display Name Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground/90 block">
            {t("fullName")}
          </label>
          <div className="relative flex items-center">
            <UserIcon className="absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("fullNamePlaceholder")}
              className="w-full h-11 ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 rounded-2xl bg-muted/40 border border-border/80 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Email Address Field (Entered Only Once) */}
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
          <label className="text-xs font-semibold text-foreground/90 block">
            {t("password")}
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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
          <p className="text-[10px] text-muted-foreground">
            {isAr ? "٦ أحرف على الأقل، ويفضل مزيج من الحروف والأرقام" : "At least 6 characters with mixed letters & numbers"}
          </p>
        </div>

        {/* Terms and Privacy Consent Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <button
            type="button"
            role="checkbox"
            aria-checked={agreedToTerms}
            onClick={() => setAgreedToTerms(!agreedToTerms)}
            className={`mt-0.5 h-4 w-4 shrink-0 rounded-md border transition-all flex items-center justify-center ${
              agreedToTerms
                ? "grad-theme border-transparent text-white"
                : "border-border bg-card"
            }`}
          >
            {agreedToTerms && <Check className="h-3 w-3 stroke-[3]" />}
          </button>
          <span className="text-[11px] text-muted-foreground leading-snug">
            {t("agreeToTerms")}{" "}
            <button
              type="button"
              onClick={() => {
                setLegalTab("terms");
                setLegalOpen(true);
              }}
              className="underline text-foreground font-medium hover:text-primary"
            >
              {t("termsOfService")}
            </button>{" "}
            {isAr ? "و" : "and"}{" "}
            <button
              type="button"
              onClick={() => {
                setLegalTab("privacy");
                setLegalOpen(true);
              }}
              className="underline text-foreground font-medium hover:text-primary"
            >
              {t("privacyPolicy")}
            </button>
          </span>
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
              <span>{t("createAccountButton")}</span>
              {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </>
          )}
        </button>

        {/* Social auth only when genuinely configured (Both currently false) */}
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

        {/* Switch to Sign In */}
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/auth/sign-in" })}
              className="text-primary font-bold hover:underline"
            >
              {t("signInLink")}
            </button>
          </p>
        </div>
      </form>

      {/* Legal Modal */}
      <LegalModal open={legalOpen} onOpenChange={setLegalOpen} defaultTab={legalTab} />

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
