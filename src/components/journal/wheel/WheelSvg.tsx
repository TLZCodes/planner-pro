import React from "react";
import {
  type WheelOfBecomingRecord,
  generateWheelSvgGeometry,
} from "@/lib/wheelOfBecomingEngine";

interface WheelSvgProps {
  record: WheelOfBecomingRecord;
  selectedAreaId?: string | null;
  onSelectArea?: (areaId: string) => void;
  isAr?: boolean;
  className?: string;
}

export function WheelSvg({
  record,
  selectedAreaId,
  onSelectArea,
  isAr = false,
  className = "",
}: WheelSvgProps) {
  const size = 320;
  const center = size / 2;
  const maxRadius = 125;

  const { wedges, polygonPoints, activeAreas, hasSufficientData } =
    generateWheelSvgGeometry(record, maxRadius, center);

  // 10 concentric circles for scale 1..10
  const concentricLevels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[320px] aspect-square overflow-visible touch-manipulation drop-shadow-xs"
        role="img"
        aria-label={
          isAr
            ? "دائرة التوازن: رسم بياني دائري لتقييم جوانب الحياة"
            : "Wheel of Becoming: Radial circular chart of personal satisfaction areas"
        }
      >
        <defs>
          <radialGradient id="wheelCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF9F6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFF0F3" stopOpacity="0.4" />
          </radialGradient>
        </defs>

        {/* Background circular glow */}
        <circle
          cx={center}
          cy={center}
          r={maxRadius}
          fill="url(#wheelCenterGlow)"
        />

        {/* Concentric Guide Circles (1 to 10) */}
        {concentricLevels.map((lvl) => {
          const r = (maxRadius * lvl) / 10;
          const isOuter = lvl === 10;
          const isMid = lvl === 5;
          return (
            <circle
              key={lvl}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={isOuter ? "#E5D5D3" : isMid ? "#ECDAD7" : "#F5EBE9"}
              strokeWidth={isOuter ? 1.5 : isMid ? 1 : 0.75}
              strokeDasharray={isOuter ? undefined : "3 3"}
            />
          );
        })}

        {/* Concentric scale numeric labels along the vertical axis */}
        {[2, 4, 6, 8, 10].map((lvl) => {
          const r = (maxRadius * lvl) / 10;
          return (
            <text
              key={lvl}
              x={center + 3}
              y={center - r + 3}
              fill="#A89297"
              fontSize="7.5"
              fontWeight="bold"
              className="pointer-events-none select-none font-sans"
            >
              {lvl}
            </text>
          );
        })}

        {/* Radial Spokes dividing sectors */}
        {wedges.map((w) => {
          const x2 = center + maxRadius * Math.cos(w.startAngle);
          const y2 = center + maxRadius * Math.sin(w.startAngle);
          return (
            <line
              key={`spoke-${w.area.id}`}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#ECDAD7"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Unrated Area Placeholders (dashed hollow boundary) */}
        {wedges
          .filter((w) => !w.isRated)
          .map((w) => {
            const isSelected = selectedAreaId === w.area.id;
            return (
              <path
                key={`unrated-wedge-${w.area.id}`}
                d={w.pathD}
                fill={isSelected ? `${w.area.color}15` : "transparent"}
                stroke={isSelected ? w.area.color : "#E5D5D3"}
                strokeWidth={isSelected ? 1.5 : 0.8}
                strokeDasharray="3 3"
                className="cursor-pointer transition-all hover:opacity-80 active:scale-95"
                onClick={() => onSelectArea?.(w.area.id)}
                role="button"
                tabIndex={0}
                aria-label={`${isAr ? w.area.nameAr : w.area.nameEn}: ${isAr ? "غير مقيّم" : "Not rated"}`}
              />
            );
          })}

        {/* Rated Slices (Pastel colored wedges scaled to satisfaction value) */}
        {wedges
          .filter((w) => w.isRated)
          .map((w) => {
            const isSelected = selectedAreaId === w.area.id;
            return (
              <g key={`rated-wedge-${w.area.id}`}>
                <path
                  d={w.pathD}
                  fill={w.area.color}
                  fillOpacity={isSelected ? 0.65 : 0.42}
                  stroke={w.area.color}
                  strokeWidth={isSelected ? 2.2 : 1.2}
                  className="cursor-pointer transition-all duration-300 hover:fill-opacity-70 active:scale-98"
                  onClick={() => onSelectArea?.(w.area.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${isAr ? w.area.nameAr : w.area.nameEn}: ${w.rating} / 10`}
                />
              </g>
            );
          })}

        {/* Closed Polygon Connecting Rated Area Midpoints (when sufficient data >= 3) */}
        {hasSufficientData && polygonPoints && (
          <polygon
            points={polygonPoints}
            fill="#FFF9F6"
            fillOpacity="0.25"
            stroke="#E87A90"
            strokeWidth="1.8"
            strokeLinejoin="round"
            className="pointer-events-none transition-all duration-300"
          />
        )}

        {/* Center Pivot Pearl Dot */}
        <circle
          cx={center}
          cy={center}
          r={4.5}
          fill="#FFF9F6"
          stroke="#E87A90"
          strokeWidth="2"
          className="pointer-events-none"
        />

        {/* Area Outer Labels and Indicators */}
        {wedges.map((w) => {
          const isSelected = selectedAreaId === w.area.id;
          const label = isAr ? w.area.nameAr : w.area.nameEn;
          // Determine text anchor based on X position relative to center
          const isRight = w.labelX > center + 10;
          const isLeft = w.labelX < center - 10;
          const textAnchor = isRight ? "start" : isLeft ? "end" : "middle";

          return (
            <g
              key={`label-${w.area.id}`}
              className="cursor-pointer group"
              onClick={() => onSelectArea?.(w.area.id)}
            >
              {/* Outer Value Indicator badge */}
              <text
                x={w.labelX}
                y={w.labelY}
                textAnchor={textAnchor}
                fontSize="9"
                fontWeight={isSelected ? "900" : "700"}
                fill={isSelected ? "#9D174D" : w.isRated ? "#3D1E28" : "#A89297"}
                className="select-none transition-colors group-hover:fill-[#9D174D] font-sans"
              >
                {label}
                {w.isRated ? ` (${w.rating})` : " (—)"}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Explanatory text when fewer than 3 areas are rated */}
      {!hasSufficientData && (
        <div className="mt-2 text-center px-4 py-1.5 rounded-full bg-rose-50/80 border border-rose-200/60 max-w-xs">
          <p className="text-[11px] font-semibold text-[#9D174D]">
            {isAr
              ? "قيّمي 3 جوانب أو أكثر لتكتمل الدائرة 🌸"
              : "Rate 3 or more areas to form a complete wheel 🌸"}
          </p>
        </div>
      )}
    </div>
  );
}
