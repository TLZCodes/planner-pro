import React from "react";
import { ArrowLeft, ArrowRight, Globe } from "lucide-react";
import { useLang } from "@/lib/i18n";

interface AuthShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  brandTagline?: boolean;
}

export function AuthShell({
  children,
  title,
  subtitle,
  showBack = false,
  onBack,
  brandTagline = true,
}: AuthShellProps) {
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    }
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
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-rose-400/12 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      {/* Top Bar: Back & Language Switcher (strictly text, no national flags) */}
      <header className="w-full max-w-md mx-auto px-5 py-4 flex items-center justify-between z-10">
        <div>
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="h-10 w-10 rounded-full bg-card/80 backdrop-blur-md border border-border/60 flex items-center justify-center text-foreground hover:bg-card active:scale-95 transition-all shadow-xs"
              aria-label={isAr ? "الرجوع" : "Back"}
            >
              {isAr ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            </button>
          ) : (
            <div className="h-10 w-10" />
          )}
        </div>

        {/* Language switch button (explicit text, no flags) */}
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

      {/* Main Content Area */}
      <main className="w-full max-w-md mx-auto px-5 py-2 flex-1 flex flex-col justify-center">
        {(title || subtitle || brandTagline) && (
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <span className="grad-theme h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-rose-sm">
                A
              </span>
            </div>
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="w-full bg-card/90 backdrop-blur-xl border border-border/60 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {children}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-md mx-auto px-5 py-4 text-center text-[11px] text-muted-foreground/80 z-10">
        <p className="font-medium">
          AYXA Planner • {isAr ? "نحو أفضل نسخة منكِ، كل يوم 🌸" : "Becoming her, one day at a time 🌸"}
        </p>
      </footer>
    </div>
  );
}
