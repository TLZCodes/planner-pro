import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useLang } from "@/lib/i18n";
import {
  verifyResetCode,
  confirmPasswordReset,
  validatePassword,
} from "@/lib/authEngine";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface ResetPasswordSearchParams {
  oobCode?: string;
}

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearchParams => ({
    oobCode: typeof search.oobCode === "string" ? search.oobCode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Set New Password — AYXA Planner" },
      {
        name: "description",
        content: "Set a new secure password for your AYXA Planner account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { oobCode } = useSearch({ from: "/auth/reset-password" });
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  const [verifying, setVerifying] = useState(true);
  const [codeValid, setCodeValid] = useState(false);
  const [targetEmail, setTargetEmail] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Verify the reset code when component mounts
  useEffect(() => {
    if (!oobCode) {
      setVerifying(false);
      setCodeValid(false);
      setError(t("codeExpiredOrInvalid"));
      return;
    }

    let isMounted = true;
    verifyResetCode(oobCode)
      .then((res) => {
        if (!isMounted) return;
        setVerifying(false);
        if (res.success) {
          setCodeValid(true);
          setTargetEmail(res.email || null);
        } else {
          setCodeValid(false);
          setError(res.error ? (isAr ? res.error : res.errorEn || res.error) : t("codeExpiredOrInvalid"));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setVerifying(false);
        setCodeValid(false);
        setError(err?.message || t("codeExpiredOrInvalid"));
      });

    return () => {
      isMounted = false;
    };
  }, [oobCode, isAr, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setError(t(passCheck.errorKey || "passwordLengthError"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (!oobCode) {
      setError(t("codeExpiredOrInvalid"));
      return;
    }

    setSubmitting(true);

    try {
      const res = await confirmPasswordReset(oobCode, password);
      setSubmitting(false);

      if (!res.success) {
        setError(res.error ? (isAr ? res.error : res.errorEn || res.error) : t("errorOccurred"));
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setSubmitting(false);
      setError(err?.message || t("errorOccurred"));
    }
  };

  return (
    <AuthShell
      title={t("resetPasswordTitle")}
      subtitle={t("resetPasswordSubtitle")}
      showBack
      onBack={() => navigate({ to: "/auth/sign-in" })}
    >
      {verifying ? (
        <div className="py-8 text-center space-y-3">
          <div className="inline-block h-8 w-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
          <p className="text-xs text-muted-foreground">{t("loading")}</p>
        </div>
      ) : success ? (
        <div className="text-center py-4 space-y-4">
          <div className="h-14 w-14 rounded-full grad-theme flex items-center justify-center text-white mx-auto shadow-rose-sm">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {t("passwordResetSuccess")}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("passwordResetSuccessDesc")}
            </p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/auth/sign-in" })}
              className="w-full h-11 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t("backToSignIn")}</span>
              {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      ) : !codeValid ? (
        <div className="text-center py-4 space-y-4">
          <div className="h-14 w-14 rounded-full bg-destructive/15 flex items-center justify-center text-destructive mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {t("codeExpiredOrInvalid")}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error || (isAr ? "رابط إعادة التعيين انتهت صلاحيته أو تم استخدامه سابقاً." : "This reset link has expired or has already been used.")}
            </p>
          </div>

          <div className="pt-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/auth/forgot-password" })}
              className="w-full h-11 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t("requestNewResetLink")}</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {targetEmail && (
            <div className="p-2.5 rounded-2xl bg-muted/50 border border-border text-center text-xs text-muted-foreground">
              {isAr ? "إعادة تعيين كلمة المرور لحساب:" : "Resetting password for:"}{" "}
              <span className="font-semibold text-foreground dir-ltr">{targetEmail}</span>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/25 flex items-start gap-2.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90 block">
              {t("newPassword")}
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("newPasswordPlaceholder")}
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

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90 block">
              {t("confirmNewPassword")}
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute ltr:left-3.5 rtl:right-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("confirmNewPasswordPlaceholder")}
                className="w-full h-11 ltr:pl-10 rtl:pr-10 ltr:pr-4 rtl:pl-4 rounded-2xl bg-muted/40 border border-border/80 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 mt-2 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                <span>{t("saveNewPassword")}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
