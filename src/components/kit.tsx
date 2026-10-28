import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("min-h-full bg-canvas pb-28", className)}>{children}</div>;
}

export function PageHeader({
  title,
  right,
  subtitle,
  showBack = true,
  fallbackUrl = "/",
  onBack,
  gradient,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  showBack?: boolean;
  fallbackUrl?: string;
  onBack?: () => void;
  gradient?: boolean;
}) {
  const navigate = useNavigate();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    const tsrIndex = typeof window !== "undefined" ? (window.history.state?.__TSR_index ?? 0) : 0;
    if (tsrIndex > 0) {
      window.history.back();
    } else {
      navigate({ to: (fallbackUrl || "/") as any });
    }
  };

  return (
    <header
      className={cn(
        "relative px-4 pt-6 pb-4 transition-colors overflow-visible",
        gradient
          ? "grad-theme text-white shadow-rose-md"
          : "bg-card/40 border-b border-border/50 text-ink",
      )}
    >
      {gradient && (
        <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20 blur-xl" />
      )}
      <div className="flex items-center justify-between gap-3 overflow-visible">
        <div className="flex items-center gap-3 min-w-0 overflow-visible">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Back"
              className={cn(
                "cursor-pointer flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-90 shrink-0 shadow-sm",
                gradient
                  ? "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                  : "bg-surface/90 text-ink hover:bg-surface border border-border/80",
              )}
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180 transition-transform" />
            </button>
          )}
          <div className="min-w-0 overflow-visible py-0.5">
            <h1
              className={cn(
                "font-display text-[27px] font-normal tracking-wider leading-[1.3] overflow-visible pb-1",
                gradient ? "text-white drop-shadow-sm" : "text-ink",
              )}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className={cn(
                  "text-xs font-bold tracking-normal mt-0.5",
                  gradient ? "text-white/90" : "text-ink-light",
                )}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}

export function SectionHeader({
  title,
  href,
  action = "See all",
}: {
  title: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 pt-6 pb-3">
      <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
      {href ? (
        <Link to={href} className="text-[13px] font-medium text-hotpink">
          {action} →
        </Link>
      ) : null}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-md bg-card p-4 shadow-rose", className)}>{children}</div>;
}

export function PillTag({
  children,
  tone = "lavender",
  className,
}: {
  children: ReactNode;
  tone?: "lavender" | "rose" | "mint" | "gold" | "ghost" | "danger";
  className?: string;
}) {
  const tones: Record<string, string> = {
    lavender: "bg-lavender text-rosegold",
    rose: "bg-hotpink/15 text-hotpink",
    mint: "bg-mint/50 text-islamic",
    gold: "bg-gold/20 text-gold",
    ghost: "bg-ghost text-ink-light",
    danger: "bg-danger/15 text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GradientButton({
  children,
  onClick,
  className,
  variant = "rose",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "rose" | "gold" | "mint";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const map = { rose: "grad-theme", gold: "grad-gold", mint: "grad-mint" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-[52px] w-full items-center justify-center rounded-full text-[15px] font-semibold text-white shadow-rose-md transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        map[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export type PillItem = string | { key: string; label: string };

export function FilterPills({
  items,
  pills,
  value,
  active,
  onChange,
}: {
  items?: (string | { key: string; label: string })[];
  pills?: (string | { key: string; label: string })[];
  value?: string;
  active?: string;
  onChange: (v: any) => void;
}) {
  const list = pills || items || [];
  const currentValue = active !== undefined ? active : value;

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
      {list.map((item) => {
        const key = typeof item === "string" ? item : item.key;
        const label = typeof item === "string" ? item : item.label;
        const isSelected = key === currentValue;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer",
              isSelected
                ? "grad-theme text-white shadow-rose font-bold"
                : "bg-ghost text-ink-light hover:text-ink",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function ProgressBar({
  value,
  className,
  barClass = "grad-theme",
}: {
  value: number;
  className?: string;
  barClass?: string;
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-ghost", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700", barClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 140,
  stroke = 12,
  label,
  caption,
  color = "url(#roseGrad)",
  track = "var(--ghost)",
  labelClass,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  caption?: string;
  color?: string;
  track?: string;
  labelClass?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="roseGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6b9d" />
            <stop offset="100%" stopColor="#c0396b" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe29a" />
            <stop offset="100%" stopColor="#d4a853" />
          </linearGradient>
          <linearGradient id="mintGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bfffd4" />
            <stop offset="100%" stopColor="#52a47a" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, value)) / 100}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("font-mono text-[28px] font-bold text-ink", labelClass)}>
          {label ?? `${value}%`}
        </span>
        {caption ? <span className="text-[12px] text-ink-light">{caption}</span> : null}
      </div>
    </div>
  );
}

export function StreakBadge({ count, label = "days" }: { count: number; label?: string }) {
  return (
    <span className="grad-gold inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white shadow-rose">
      🔥 {count} {label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  caption,
  accent = "mint",
}: {
  label: string;
  value: string;
  caption: string;
  accent?: "mint" | "gold" | "violet";
}) {
  const bar = {
    mint: "bg-islamic",
    gold: "bg-gold",
    violet: "bg-rosegold",
  }[accent];
  return (
    <div className="relative w-[130px] shrink-0 overflow-hidden rounded-md bg-card p-3 shadow-rose">
      <span className={cn("absolute top-0 left-0 h-full w-1", bar)} />
      <p className="label-xs text-ink-light">{label}</p>
      <p className="font-mono text-[22px] font-bold text-ink">{value}</p>
      <p className="text-[11px] text-ink-light">{caption}</p>
    </div>
  );
}

export function GlassCard({
  children,
  className,
  gradient = "grad-theme",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  gradient?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-lg p-4 text-white shadow-rose-md",
        gradient,
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/20 blur-xl" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function QuickActionCard({
  emoji,
  icon: Icon,
  grad,
  label,
  tint,
  to,
}: {
  emoji?: string;
  icon?: any;
  grad?: string;
  label: string;
  tint?: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-between gap-2.5 rounded-2xl bg-card p-3 shadow-rose border border-pink-100/70 dark:border-pink-900/40 hover:border-pink-300 transition-all duration-300 active:scale-95 text-center group"
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl p-2.5 text-xl shadow-md transition-transform duration-300 group-hover:scale-110 shrink-0 ring-1 ring-white/30",
          grad ? `bg-gradient-to-br ${grad}` : "",
        )}
        style={!grad && tint ? { background: tint } : undefined}
      >
        {Icon ? <Icon className="h-6 w-6 stroke-[2.2]" /> : <span>{emoji}</span>}
      </div>
      <span className="text-[12px] font-extrabold text-ink truncate w-full font-caption quick-action-label">
        {label}
      </span>
    </Link>
  );
}

export function Script({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-script text-[20px] font-semibold text-ink-light", className)}>
      {children}
    </p>
  );
}
