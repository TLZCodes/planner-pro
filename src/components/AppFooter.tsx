import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUp,
  Globe,
  ShieldCheck,
  Sparkles,
  Heart,
  Home,
  CheckSquare,
  BookHeart,
  Sparkle,
  Calendar,
  Compass,
  Briefcase,
  Wallet,
  GraduationCap,
  Plane,
  Moon,
  Smile,
  Activity,
  Award,
  Settings as SettingsIcon,
  Flame,
  Grid,
} from "lucide-react";
import { useLang } from "@/lib/i18n";

export function AppFooter() {
  const { lang, dir, toggle } = useLang();
  const isAr = lang === "ar";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navGroups = [
    {
      title: isAr ? "التدفق اليومي" : "Daily Flow",
      links: [
        { to: "/", label: isAr ? "الرئيسية" : "Home", icon: Home },
        { to: "/tasks", label: isAr ? "المهام الذكية" : "Tasks", icon: CheckSquare },
        { to: "/ai", label: isAr ? "المخطط الذكي" : "AI Planner", icon: Sparkles },
        { to: "/journal", label: isAr ? "المفكرة واليوميات" : "Journal", icon: BookHeart },
        { to: "/routines", label: isAr ? "الروتين اليومي" : "Routines", icon: Sparkle },
      ],
    },
    {
      title: isAr ? "التركيز والأهداف" : "Focus & Goals",
      links: [
        { to: "/focus", label: isAr ? "مؤقت التركيز" : "Focus Timer", icon: Compass },
        { to: "/goals", label: isAr ? "خطة الأهداف" : "Goals Plan", icon: Award },
        { to: "/habits", label: isAr ? "متابع العادات" : "Habits Tracker", icon: Flame },
        { to: "/bujo", label: isAr ? "البوليت جورنال" : "Bullet Journal", icon: Calendar },
        { to: "/pixels", label: isAr ? "سنة في مربعات" : "Year in Pixels", icon: Grid },
      ],
    },
    {
      title: isAr ? "المال والأعمال" : "Finance & Business",
      links: [
        { to: "/finance", label: isAr ? "ماليتي وحساباتي" : "My Finances", icon: Wallet },
        { to: "/business", label: isAr ? "أعمالي ومشاريعي" : "My Business", icon: Briefcase },
        { to: "/learning", label: isAr ? "الدراسة والتعلم" : "Studies & Learning", icon: GraduationCap },
        { to: "/travel", label: isAr ? "تخطيط السفر" : "Travel Planner", icon: Plane },
        { to: "/deen", label: isAr ? "ديني وعبادتي" : "My Deen 🌙", icon: Moon },
      ],
    },
    {
      title: isAr ? "العافية والراحة" : "Wellness & Care",
      links: [
        { to: "/wellness", label: isAr ? "الصحة والنشاط" : "Wellness", icon: Activity },
        { to: "/selfcare", label: isAr ? "عنايتي بنفسي" : "Self-Care", icon: Smile },
        { to: "/achievements", label: isAr ? "الإنجازات والأوسمة" : "Achievements", icon: Award },
        { to: "/settings", label: isAr ? "الإعدادات والتفضيلات" : "Settings", icon: SettingsIcon },
      ],
    },
  ];

  return (
    <footer
      dir={dir}
      role="contentinfo"
      aria-label={isAr ? "تذييل الصفحة" : "Page Footer"}
      className="relative w-full border-t border-border/70 bg-gradient-to-b from-card/40 via-card/80 to-card px-5 pt-8 pb-8 text-ink font-sans transition-colors mt-auto select-none"
    >
      {/* ── Top Decorative Sparkle Badge ── */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
        <span className="flex h-7 items-center gap-1.5 rounded-full bg-card border border-border px-3.5 text-xs font-bold text-hotpink shadow-xs">
          <Sparkles size={13} className="text-hotpink animate-pulse" />
          <span>AYXA Planner Pro</span>
        </span>
      </div>

      {/* ── Brand & Feminine Motto ── */}
      <div className="text-center pt-2 pb-6 space-y-1.5 border-b border-border/40">
        <div className="inline-flex items-center gap-1.5 font-script text-2xl text-hotpink">
          <span>Amina &amp; Ayxa</span>
          <Heart size={16} className="fill-hotpink/20 text-hotpink" />
        </div>
        <p className="text-xs font-medium text-ink-light max-w-[340px] mx-auto leading-relaxed">
          {isAr
            ? "رفيقتكِ اللطيفة للتخطيط الواعي، والإنتاجية الهادئة، والتوازن اليومي المستمر ✨"
            : "Your mindful sanctuary for intentional living, quiet productivity, and daily serenity ✨"}
        </p>
      </div>

      {/* ── Quick Navigation Directory (4 Responsive Columns) ── */}
      <div className="py-6 grid grid-cols-2 gap-6 border-b border-border/40">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2.5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-ink/70">
              {group.title}
            </h4>
            <ul className="space-y-1.5">
              {group.links.map((link) => {
                const Icon = link.icon;
                const isCurrent = pathname === link.to || (link.to !== "/" && pathname.startsWith(link.to + "/"));
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all hover:text-hotpink hover:translate-x-0.5 active:scale-95 ${
                        isCurrent ? "text-hotpink font-bold" : "text-ink-light"
                      }`}
                    >
                      <Icon size={12} className={isCurrent ? "text-hotpink" : "text-ink-light/70"} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Privacy & Trust Banner ── */}
      <div className="py-4 my-2 flex items-center justify-between gap-3 rounded-2xl bg-surface/50 border border-border/50 px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={16} />
          </div>
          <div className="text-[11px] leading-snug">
            <p className="font-bold text-ink">
              {isAr ? "خصوصية تامة وبدون تتبع" : "100% Private & Local-First"}
            </p>
            <p className="text-ink-light text-[10px]">
              {isAr
                ? "بياناتكِ ومذكراتكِ محفوظة بالكامل على جهازكِ"
                : "All entries remain safely stored on this device"}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-ink-light bg-card border border-border/60 px-2 py-1 rounded-lg shrink-0">
          v2.5.0
        </span>
      </div>

      {/* ── Bottom Controls: Back to Top, Language & Copyright ── */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-light">
        <p className="text-[11px] font-medium text-center sm:text-start">
          © {new Date().getFullYear()} AYXA Planner Pro.{" "}
          <span className="text-hotpink">
            {isAr ? "صُنع بكل محبة 🌸" : "Crafted with love 🌸"}
          </span>
        </p>

        <div className="flex items-center gap-2">
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={toggle}
            className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1.5 text-[11px] font-bold text-ink hover:border-hotpink active:scale-95 transition-all shadow-xs"
            title={isAr ? "تغيير اللغة إلى الإنجليزية" : "Switch language to Arabic"}
          >
            <Globe size={13} className="text-hotpink" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>

          {/* Scroll to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-card border border-border px-3 py-1.5 text-[11px] font-bold text-ink hover:border-hotpink active:scale-95 transition-all shadow-xs"
            title={isAr ? "العودة لأعلى الصفحة" : "Back to Top"}
          >
            <ArrowUp size={13} className="text-hotpink" />
            <span>{isAr ? "للأعلى" : "Top"}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default AppFooter;
