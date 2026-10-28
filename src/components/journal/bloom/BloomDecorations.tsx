import React from "react";

export function WashiTapeSvg({
  color = "rgba(244, 63, 94, 0.25)",
  className = "",
  style = {},
}: {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`h-5 w-24 rounded-xs shadow-2xs backdrop-blur-[1px] transform -rotate-2 select-none pointer-events-none ${className}`}
      style={{
        backgroundColor: color,
        borderLeft: "2px dashed rgba(255,255,255,0.6)",
        borderRight: "2px dashed rgba(255,255,255,0.6)",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function TulipFlowerSvg({
  className = "w-6 h-6",
  color = "#FB7185",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Stem */}
      <path
        d="M16 16C16 23 15 28 15 28"
        stroke="#10B981"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Leaf */}
      <path
        d="M15.5 22C18 20 22 20 23 17"
        stroke="#34D399"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Tulip Petals */}
      <path
        d="M16 5C13 5 10 9 10 14C10 17 12 18 16 18C20 18 22 17 22 14C22 9 19 5 16 5Z"
        fill={color}
        fillOpacity="0.85"
      />
      <path
        d="M16 6C17 9 19 12 19 15C19 17 18 18 16 18C14 18 13 17 13 15C13 12 15 9 16 6Z"
        fill="#FFFFFF"
        fillOpacity="0.4"
      />
      <path
        d="M11 11C13 13 14 16 14 17"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />
    </svg>
  );
}

export function PaperClipSvg({
  className = "w-4 h-8",
  color = "#CBD5E1",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 10V22C5 25 7 27 9 27C11 27 13 25 13 22V6C13 3 10 1 7 1C4 1 2 3 2 6V24C2 28 6 31 10 31C14 31 15 28 15 24"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SparkleStarSvg({
  className = "w-4 h-4",
  color = "#F59E0B",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C12 7 7 12 0 12C7 12 12 17 12 24C12 17 17 12 24 12C17 12 12 7 12 0Z" />
    </svg>
  );
}

export function AyxaStampSvg({
  className = "w-14 h-14",
  color = "#E11D48",
  isAr = false,
}: {
  className?: string;
  color?: string;
  isAr?: boolean;
}) {
  return (
    <div
      className={`rounded-full border-2 border-dashed flex flex-col items-center justify-center p-1 text-center select-none pointer-events-none transform -rotate-12 ${className}`}
      style={{ borderColor: color, color }}
      aria-hidden="true"
    >
      <span className="text-[7px] font-black tracking-widest uppercase">
        {isAr ? "أيكسا" : "AYXA"}
      </span>
      <span className="text-[10px] leading-none my-0.5">🌷</span>
      <span className="text-[6px] font-bold tracking-tight">
        {isAr ? "أسبوعي يزهر" : "IN BLOOM"}
      </span>
    </div>
  );
}
