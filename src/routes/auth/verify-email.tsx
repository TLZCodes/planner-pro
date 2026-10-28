import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useApp } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import {
  verifyEmailWithCode,
  resendVerificationEmail,
  maskEmail,
} from "@/lib/authEngine";
import {
  MailCheck,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface VerifyEmailSearchParams {
  oobCode?: string;
}

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: (search: Record<string, unknown>): VerifyEmailSearchParams => ({
    oobCode: typeof search.oobCode === "string" ? search.oobCode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify Email — AYXA Planner" },
      {
        name: "description",
        content: "Verify your email address for your AYXA Planner account.",
      },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { oobCode } = useSearch({ from: "/auth/verify-email" });
  const { state, updateUser } = useApp();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  const [verifying, setVerifying] = useState(!!oobCode);
  const [verified, setVerified] = useState(state.user?.emailVerified ?? false);
  const [error, setError] = useState<string | null>(null);

  // Resend cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Auto-verify if oobCode is passed in URL
  useEffect(() => {
    if (!oobCode) return;

    let isMounted = true;
    setVerifying(true);

    verifyEmailWithCode(oobCode)
      .then((res) => {
        if (!isMounted) return;
        setVerifying(false);
        if (res.success) {
          setVerified(true);
          updateUser({ emailVerified: true });
        } else {
          setError(res.error ? (isAr ? res.error : res.errorEn || res.error) : t("codeExpiredOrInvalid"));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setVerifying(false);
        setError(err?.message || t("codeExpiredOrInvalid"));
      });

    return () => {
      isMounted = false;
    };
  }, [oobCode, isAr, t, updateUser]);

  // Countdown effect for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    setResendMessage(null);

    try {
      const res = await resendVerificationEmail();
      setResending(false);

      if (res.success) {
        setResendCooldown(60);
        setResendMessage(t("verificationResent"));
      } else {
        setError(res.error ? (isAr ? res.error : res.errorEn || res.error) : t("errorOccurred"));
      }
    } catch (err: any) {
      setResending(false);
      setError(err?.message || t("errorOccurred"));
    }
  };

  const userEmail = state.user?.email || "";

  return (
    <AuthShell
      title={t("verifyEmailTitle")}
      subtitle={t("verifyEmailSubtitle")}
      showBack
      onBack={() => navigate({ to: "/" })}
    >
      {verifying ? (
        <div className="py-8 text-center space-y-3">
          <div className="inline-block h-8 w-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
          <p className="text-xs text-muted-foreground">{t("loading")}</p>
        </div>
      ) : verified ? (
        <div className="text-center py-4 space-y-4">
          <div className="h-14 w-14 rounded-full grad-theme flex items-center justify-center text-white mx-auto shadow-rose-sm">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {t("emailVerifiedSuccess")}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("emailVerifiedSuccessDesc")}
            </p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => navigate({ to: state.setupDone ? "/" : "/onboarding" })}
              className="w-full h-11 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t("continueToApp")}</span>
              {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-2">
          {/* Status Icon */}
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
              <MailCheck className="h-7 w-7" />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("checkYourInbox")}{" "}
              <span className="font-semibold text-foreground dir-ltr inline-block">
                {userEmail ? maskEmail(userEmail) : ""}
              </span>
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/25 flex items-start gap-2.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Success Notification */}
          {resendMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>{resendMessage}</span>
            </div>
          )}

          {/* Resend Button */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={resendCooldown > 0 || resending}
              onClick={handleResend}
              className="w-full h-11 rounded-2xl bg-card border border-border/80 text-foreground hover:bg-muted text-xs font-semibold active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
              <span>
                {resendCooldown > 0
                  ? `${t("resendCodeCooldown")} (${resendCooldown}s)`
                  : t("resendVerification")}
              </span>
            </button>

            {/* Continue / Skip Button */}
            <button
              type="button"
              onClick={() => navigate({ to: state.setupDone ? "/" : "/onboarding" })}
              className="w-full h-11 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t("continueToApp")}</span>
              {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
