import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { useLang } from "@/lib/i18n";
import { sendPasswordReset, validateEmail, maskEmail } from "@/lib/authEngine";
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — AYXA Planner" },
      {
        name: "description",
        content: "Reset your AYXA Planner password securely.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const isAr = lang === "ar";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!validateEmail(cleanEmail)) {
      setError(t("invalidEmail"));
      return;
    }

    setLoading(true);

    try {
      const res = await sendPasswordReset(cleanEmail);
      setLoading(false);

      if (!res.success) {
        setError(res.error ? (isAr ? res.error : res.errorEn || res.error) : t("errorOccurred"));
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || t("errorOccurred"));
    }
  };

  return (
    <AuthShell
      title={t("forgotPasswordTitle")}
      subtitle={t("forgotPasswordSubtitle")}
      showBack
      onBack={() => navigate({ to: "/auth/sign-in" })}
    >
      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="h-14 w-14 rounded-full grad-theme flex items-center justify-center text-white mx-auto shadow-rose-sm">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">
              {t("resetEmailSent")}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("resetEmailSentDesc")}{" "}
              <span className="font-semibold text-foreground dir-ltr inline-block">
                {maskEmail(email)}
              </span>
            </p>
          </div>

          <div className="pt-3 space-y-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/auth/sign-in" })}
              className="w-full h-11 rounded-2xl grad-theme text-white text-xs font-bold shadow-rose-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t("backToSignIn")}</span>
            </button>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              {isAr ? "لم يصلكِ البريد؟ حاولي ثانية" : "Didn't receive it? Try again"}
            </button>
          </div>
        </div>
      ) : (
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
                <span>{t("sendResetLink")}</span>
                {isAr ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </button>

          {/* Back to sign in */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/auth/sign-in" })}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {t("backToSignIn")}
            </button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
