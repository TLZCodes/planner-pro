import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { BookHeart, CheckSquare, Home, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { AppFooter } from "@/components/AppFooter";

const SECONDARY_MORE_ROUTES = [
  "/routines",
  "/habits",
  "/goals",
  "/focus",
  "/inbox",
  "/finance",
  "/learning",
  "/business",
  "/travel",
  "/wellness",
  "/selfcare",
  "/pixels",
  "/gamification",
  "/achievements",
  "/challenges",
  "/islamic",
  "/deen",
  "/bujo",
  "/settings",
  "/image-editor",
];

const AUTH_AND_FULLSCREEN_ROUTES = [
  "/login",
  "/signup",
  "/setup",
  "/welcome",
  "/onboarding",
  "/auth",
];

export function MobileShell({
  children,
  hideTabs,
  hideHeader,
  hideFooter,
}: {
  children: ReactNode;
  hideTabs?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t, dir } = useLang();
  const { state } = useApp();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const handleViewportResize = () => {
      if (window.visualViewport) {
        setIsKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.78);
      }
    };
    window.visualViewport.addEventListener("resize", handleViewportResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleViewportResize);
    };
  }, []);

  const isAuthRoute = AUTH_AND_FULLSCREEN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
  const shouldHideTabs = Boolean(hideTabs || isAuthRoute || isKeyboardOpen || state.activeFocusSession?.status === "active");

  useEffect(() => {
    const theme = state.prefs?.theme || "rose";
    const themes: Record<string, { from: string; to: string; primary: string }> = {
      rose: { from: "#ff75a0", to: "#ff1493", primary: "#ff1493" },
      emerald: { from: "#064e3b", to: "#10b981", primary: "#10b981" },
      lavender: { from: "#bfa8ff", to: "#7c4dff", primary: "#7c4dff" },
      gold: { from: "#ffd769", to: "#c79e26", primary: "#d4af37" },
      mint: { from: "#66ee98", to: "#059669", primary: "#059669" },
      ocean: { from: "#38bdf8", to: "#0284c7", primary: "#0284c7" },
    };
    const current = themes[theme] || themes.rose;
    document.documentElement.style.setProperty("--theme-from", current.from);
    document.documentElement.style.setProperty("--theme-to", current.to);
    document.documentElement.style.setProperty("--hotpink", current.primary);

    // Appearance Mode (System / Light / Dark)
    const mode = state.prefs?.appearanceMode || "system";
    const applyDarkMode = (isDark: boolean) => {
      document.documentElement.classList.toggle("dark", isDark);
    };

    if (mode === "dark") {
      applyDarkMode(true);
    } else if (mode === "light") {
      applyDarkMode(false);
    } else {
      if (typeof window !== "undefined" && window.matchMedia) {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        applyDarkMode(mediaQuery.matches);
        const handleChange = (e: MediaQueryListEvent) => {
          applyDarkMode(e.matches);
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      }
    }
  }, [state.prefs?.theme, state.prefs?.appearanceMode]);

  useEffect(() => {
    const acc = state.prefs?.accessibility;
    const doc = document.documentElement;
    doc.setAttribute("data-text-scale", acc?.textScale || "normal");
    doc.setAttribute("data-reduce-motion", acc?.reduceMotion ? "true" : "false");
    doc.setAttribute("data-high-contrast", acc?.highContrast ? "true" : "false");
    doc.setAttribute("data-reduce-transparency", acc?.reduceTransparency ? "true" : "false");
    doc.setAttribute("data-reduced-gamification", acc?.reducedGamification ? "true" : "false");
  }, [state.prefs?.accessibility]);

  const isSecondaryMoreActive = SECONDARY_MORE_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));

  const tabs = [
    { to: "/", label: t("home"), icon: Home, isActive: pathname === "/" },
    { to: "/tasks", label: t("tasks"), icon: CheckSquare, isActive: pathname === "/tasks" || pathname.startsWith("/tasks/") },
    { to: "/ai", label: t("ai"), icon: Sparkles, fab: true, isActive: pathname === "/ai" || pathname.startsWith("/ai/") },
    { to: "/journal", label: t("journal"), icon: BookHeart, isActive: pathname === "/journal" || pathname.startsWith("/journal/") },
    { to: "/more", label: t("more"), icon: LayoutGrid, isActive: pathname === "/more" || isSecondaryMoreActive },
  ];

  return (
    <div dir={dir} className="min-h-screen bg-[#e5d7df] text-ink transition-colors dark:bg-[#120812] flex justify-center">
      <div
        className={cn(
          "relative w-full max-w-[430px] min-h-screen bg-canvas shadow-2xl pt-[env(safe-area-inset-top,0px)]",
          shouldHideTabs ? "pb-0" : "pb-[calc(76px+env(safe-area-inset-bottom,12px))]"
        )}
      >
        {/* Main Content Area */}
        <div className="min-h-screen flex flex-col justify-between">
          <div className="flex-1 w-full">{children}</div>
          {hideFooter === false && <AppFooter />}
        </div>

        {/* Fixed Bottom Navigation Bar - z-30 so all modals (z-50+) cover it completely */}
        {!shouldHideTabs && (
          <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-[430px] z-30 flex h-[74px] items-center justify-around border-t border-border/80 bg-card px-3 pb-[env(safe-area-inset-bottom,6px)] shadow-[0_-6px_20px_rgba(0,0,0,0.12)] font-sans pointer-events-auto">
            {tabs.map(({ to, label, icon: Icon, fab, isActive }) => {
              if (fab) {
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-label={label}
                    className="cursor-pointer pointer-events-auto grad-theme animate-float-soft -mt-7 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-rose-md transition-transform active:scale-90 focus:outline-none"
                  >
                    <Icon size={26} />
                  </Link>
                );
              }
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "cursor-pointer pointer-events-auto flex w-16 flex-col items-center gap-1 text-[11px] font-extrabold transition-all py-1",
                    isActive ? "-translate-y-0.5 text-hotpink" : "text-ink-light hover:text-ink"
                  )}
                >
                  <Icon size={22} className={isActive ? "animate-pop text-hotpink" : undefined} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
