import React from "react";
import {
  deriveJarVisualTokens,
  type PaperColor,
  type FlowerStyle,
  MAX_VISIBLE_TOKENS,
} from "@/lib/barakahJarEngine";

interface BarakahJarSvgProps {
  notes: Array<{
    id: string;
    paperColor?: PaperColor;
    flowerStyle?: FlowerStyle;
  }>;
  className?: string;
  onJarClick?: () => void;
  isAr?: boolean;
}

export const BarakahJarSvg: React.FC<BarakahJarSvgProps> = ({
  notes,
  className = "",
  onJarClick,
  isAr = false,
}) => {
  const { tokens, isAggregated, exactCount } = deriveJarVisualTokens(notes);

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onClick={onJarClick}
      role="img"
      aria-label={
        isAr
          ? `جرّة النِّعم تحتوي على ${exactCount} نعمة`
          : `Barakah Jar containing ${exactCount} blessings`
      }
    >
      <svg
        viewBox="0 0 200 240"
        className="w-48 h-56 max-w-full drop-shadow-md transition-transform duration-300 hover:scale-[1.02]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glass Jar Body Gradient */}
          <linearGradient id="jarGlassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="30%" stopColor="#fdf2f8" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#f5f3ff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>

          {/* Glass Rim Gradient */}
          <linearGradient id="jarRimGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#fda4af" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.3" />
          </linearGradient>

          {/* Cork Lid Gradient */}
          <linearGradient id="corkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#b45309" stopOpacity="0.75" />
          </linearGradient>

          {/* Glass Highlight Gradient */}
          <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Jar Base Shadow */}
        <ellipse cx="100" cy="224" rx="60" ry="10" fill="currentColor" className="text-pink-900/10 dark:text-pink-300/10" />

        {/* Jar Glass Outer Silhouette */}
        {/* Lid Top & Cork */}
        <rect x="74" y="24" width="52" height="14" rx="4" fill="url(#corkGradient)" />
        <line x1="78" y1="31" x2="122" y2="31" stroke="#92400e" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

        {/* Jar Neck / Rim */}
        <rect x="68" y="38" width="64" height="12" rx="4" fill="url(#jarRimGradient)" stroke="#fda4af" strokeWidth="1.5" />
        {/* Soft Twine / Ribbon wrapped around neck */}
        <path d="M 68 44 Q 100 48 132 44" stroke="#e11d48" strokeWidth="2" fill="none" opacity="0.8" />
        <circle cx="100" cy="48" r="4" fill="#fb7185" />
        <path d="M 100 48 Q 96 56 94 62" stroke="#e11d48" strokeWidth="1.5" fill="none" />
        <path d="M 100 48 Q 104 57 107 63" stroke="#e11d48" strokeWidth="1.5" fill="none" />

        {/* Jar Main Glass Chamber */}
        <path
          d="M 72 48
             C 60 52, 42 70, 40 95
             L 38 185
             C 38 212, 54 220, 100 220
             C 146 220, 162 212, 162 185
             L 160 95
             C 158 70, 140 52, 128 48
             Z"
          fill="url(#jarGlassGradient)"
          stroke="#f472b6"
          strokeWidth="2.5"
          className="dark:stroke-pink-400"
          strokeLinejoin="round"
        />

        {/* Inner Glass Contour Backing */}
        <path
          d="M 74 52
             C 64 56, 46 72, 44 95
             L 42 182
             C 42 208, 58 215, 100 215
             C 142 215, 158 208, 158 182
             L 156 95
             C 154 72, 136 56, 126 52
             Z"
          fill="#fdf2f8"
          fillOpacity="0.3"
          className="dark:fill-purple-950/20"
        />

        {/* Visual Tokens: Folded Papers & Flower Petals */}
        {tokens.map((token) => (
          <g
            key={token.id}
            transform={`translate(${token.x}, ${token.y}) rotate(${token.rotation})`}
          >
            {token.isFlower ? (
              // Floating / resting flower petal
              <text
                x="0"
                y="0"
                fontSize="14"
                textAnchor="middle"
                dominantBaseline="central"
                className="pointer-events-none select-none filter drop-shadow-xs"
              >
                {token.emoji}
              </text>
            ) : (
              // Folded pastel paper note (origami star / folded slip)
              <g className="filter drop-shadow-xs">
                {/* Folded paper slip with subtle crease */}
                <rect
                  x="-10"
                  y="-7"
                  width="20"
                  height="14"
                  rx="3"
                  fill={token.colorHex}
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
                <line
                  x1="-7"
                  y1="-2"
                  x2="7"
                  y2="-2"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  opacity="0.8"
                />
                <line
                  x1="-5"
                  y1="2"
                  x2="5"
                  y2="2"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  opacity="0.6"
                />
              </g>
            )}
          </g>
        ))}

        {/* Glass Front Reflections / Highlights */}
        {/* Left vertical light beam highlight */}
        <path
          d="M 46 95
             C 44 125, 44 165, 46 195
             C 48 196, 52 196, 54 195
             C 52 165, 52 125, 54 95
             Z"
          fill="url(#highlightGradient)"
          opacity="0.7"
        />

        {/* Right curved rim shine */}
        <path
          d="M 152 90
             C 154 115, 154 145, 153 170
             C 151 170, 149 170, 148 170
             C 149 145, 149 115, 148 90
             Z"
          fill="#ffffff"
          opacity="0.35"
        />

        {/* Bottom base inner highlight */}
        <ellipse cx="100" cy="214" rx="48" ry="4" fill="#ffffff" opacity="0.4" />
      </svg>

      {/* Decorative label on the glass jar */}
      <div className="absolute top-[48%] flex flex-col items-center pointer-events-none">
        <div className="bg-white/85 dark:bg-card/90 backdrop-blur-xs px-3 py-1 rounded-full border border-pink-200/90 dark:border-pink-800/80 shadow-2xs text-center flex items-center gap-1.5">
          <span className="text-[11px] font-black text-rose-950 dark:text-rose-100 tracking-tight">
            {isAr ? "جرّة النِّعم" : "Barakah Jar"}
          </span>
          <span className="inline-flex items-center justify-center bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full min-w-[18px]">
            {exactCount}
          </span>
        </div>
        {isAggregated && (
          <span className="text-[9px] font-bold text-ink-light bg-surface/90 px-2 py-0.5 rounded-full mt-1 border border-border/50">
            {isAr
              ? `عرض ${MAX_VISIBLE_TOKENS} من ${exactCount}`
              : `Showing ${MAX_VISIBLE_TOKENS} of ${exactCount}`}
          </span>
        )}
      </div>
    </div>
  );
};
