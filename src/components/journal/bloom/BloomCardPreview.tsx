import React from "react";
import {
  type WeekInBloomKeepsake,
  type WeekInBloomBlock,
  type BloomLayout,
  type BloomTheme,
  BLOOM_THEMES,
  formatDurationLabel,
} from "@/lib/weekInBloomEngine";
import {
  WashiTapeSvg,
  TulipFlowerSvg,
  PaperClipSvg,
  SparkleStarSvg,
  AyxaStampSvg,
} from "./BloomDecorations";
import { Sparkles, Heart, CheckCircle2, Clock, BookOpen, Compass, Image as ImageIcon } from "lucide-react";

interface BloomCardPreviewProps {
  keepsake: WeekInBloomKeepsake;
  isAr?: boolean;
  aspectRatio?: "portrait" | "square";
  innerRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export function BloomCardPreview({
  keepsake,
  isAr = false,
  aspectRatio = "portrait",
  innerRef,
  className = "",
}: BloomCardPreviewProps) {
  const theme = BLOOM_THEMES[keepsake.theme] || BLOOM_THEMES.blush;
  const blocks = keepsake.blocks.filter((b) => b.visible);

  const photoBlock = blocks.find((b) => b.type === "photo" && b.content?.url);
  const accomplishmentsBlock = blocks.find((b) => b.type === "accomplishments");
  const lovelyMomentBlock = blocks.find((b) => b.type === "lovely_moment");
  const habitBlock = blocks.find((b) => b.type === "supported_habit");
  const focusBlock = blocks.find((b) => b.type === "focus_study");
  const lessonBlock = blocks.find((b) => b.type === "lesson");
  const gratitudeBlock = blocks.find((b) => b.type === "gratitude");
  const intentionBlock = blocks.find((b) => b.type === "next_intention");

  const defaultTitle = isAr ? "أسبوعي يزهر 🌷" : "My Week in Bloom 🌷";
  const displayTitle = keepsake.title.trim() || defaultTitle;

  return (
    <div
      ref={innerRef}
      className={`relative w-full overflow-hidden transition-all duration-300 rounded-3xl shadow-sm border ${
        aspectRatio === "square" ? "aspect-square" : "min-h-[580px]"
      } ${className}`}
      style={{
        backgroundColor: theme.bgHex,
        borderColor: theme.borderHex,
        color: theme.textHex,
      }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Background soft aura */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-35 pointer-events-none"
        style={{ backgroundColor: theme.tagBgHex }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-35 pointer-events-none"
        style={{ backgroundColor: theme.tagBgHex }}
        aria-hidden="true"
      />

      {/* Decorative top washi tape in scrapbook mode */}
      {keepsake.layout === "scrapbook" && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <WashiTapeSvg color={theme.washiHex} />
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 p-5 sm:p-7 flex flex-col h-full justify-between">
        {/* Header: Title, Date Range & Stamp */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base">🌷</span>
              <span
                className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: theme.tagBgHex,
                  color: theme.accentHex,
                }}
              >
                {isAr ? "لحظات الأسبوع" : "Weekly Keepsake"}
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-black tracking-tight leading-snug break-words"
              style={{ color: theme.textHex }}
            >
              {displayTitle}
            </h2>
            {keepsake.showDateRange && (
              <p className="text-xs font-semibold opacity-75 mt-0.5 flex items-center gap-1.5">
                <span>🗓️</span>
                <span>
                  {keepsake.weekStartDate} — {keepsake.weekEndDate}
                </span>
              </p>
            )}
          </div>

          {/* Aesthetic postal stamp */}
          {keepsake.layout === "scrapbook" && (
            <AyxaStampSvg
              color={theme.accentHex}
              isAr={isAr}
              className="w-12 h-12 shrink-0 opacity-80"
            />
          )}
        </div>

        {/* Dynamic Layout Router */}
        {keepsake.layout === "minimal" ? (
          <MinimalLayoutContent
            theme={theme}
            isAr={isAr}
            photoBlock={photoBlock}
            accomplishmentsBlock={accomplishmentsBlock}
            lovelyMomentBlock={lovelyMomentBlock}
            habitBlock={habitBlock}
            focusBlock={focusBlock}
            lessonBlock={lessonBlock}
            gratitudeBlock={gratitudeBlock}
            intentionBlock={intentionBlock}
          />
        ) : keepsake.layout === "photo_diary" ? (
          <PhotoDiaryLayoutContent
            theme={theme}
            isAr={isAr}
            photoBlock={photoBlock}
            accomplishmentsBlock={accomplishmentsBlock}
            lovelyMomentBlock={lovelyMomentBlock}
            habitBlock={habitBlock}
            focusBlock={focusBlock}
            lessonBlock={lessonBlock}
            gratitudeBlock={gratitudeBlock}
            intentionBlock={intentionBlock}
          />
        ) : (
          <ScrapbookLayoutContent
            theme={theme}
            isAr={isAr}
            photoBlock={photoBlock}
            accomplishmentsBlock={accomplishmentsBlock}
            lovelyMomentBlock={lovelyMomentBlock}
            habitBlock={habitBlock}
            focusBlock={focusBlock}
            lessonBlock={lessonBlock}
            gratitudeBlock={gratitudeBlock}
            intentionBlock={intentionBlock}
          />
        )}

        {/* Footer: Optional AYXA Signature */}
        {keepsake.showAyxaSignature && (
          <div
            className="mt-5 pt-3 border-t flex items-center justify-between text-[10.5px] font-bold opacity-60"
            style={{ borderColor: theme.borderHex }}
          >
            <div className="flex items-center gap-1">
              <span>🌸</span>
              <span>AYXA Planner Pro</span>
            </div>
            <span>{isAr ? "أسبوعي يزهر ♡" : "Bloom Keepsake ♡"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout 1: Bloom Scrapbook Content
// ─────────────────────────────────────────────────────────────────────────────

function ScrapbookLayoutContent({
  theme,
  isAr,
  photoBlock,
  accomplishmentsBlock,
  lovelyMomentBlock,
  habitBlock,
  focusBlock,
  lessonBlock,
  gratitudeBlock,
  intentionBlock,
}: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-auto">
      {/* Photo Frame if available */}
      {photoBlock?.content?.url && (
        <div
          className="relative sm:col-span-2 bg-white p-2.5 pb-4 rounded-2xl shadow-2xs border border-pink-100 flex flex-col items-center transform -rotate-0.5"
          style={{ borderColor: theme.borderHex }}
        >
          <div className="w-full h-44 sm:h-52 overflow-hidden rounded-xl bg-pink-50/50 flex items-center justify-center">
            <img
              src={photoBlock.content.url}
              alt={photoBlock.content.description || "Week in bloom photo"}
              className="w-full h-full object-cover"
              style={{
                objectPosition: photoBlock.content.focalPoint || "center",
              }}
            />
          </div>
          {photoBlock.content.caption && (
            <p className="text-xs font-semibold mt-2.5 text-center text-ink-light px-2 italic">
              “{photoBlock.content.caption}”
            </p>
          )}
        </div>
      )}

      {/* Accomplishments Card */}
      {accomplishmentsBlock &&
        Array.isArray(accomplishmentsBlock.content) &&
        accomplishmentsBlock.content.length > 0 && (
          <div
            className="p-3.5 rounded-2xl bg-white/95 border shadow-2xs flex flex-col justify-between"
            style={{ borderColor: theme.borderHex }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs">✨</span>
              <h4 className="text-xs font-extrabold uppercase tracking-wide">
                {accomplishmentsBlock.titleCustom ||
                  (isAr ? "إنجازات أودّ تذكّرها" : "Accomplishments")}
              </h4>
            </div>
            <ul className="space-y-1.5 text-xs font-medium">
              {accomplishmentsBlock.content.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-rose-400 text-xs shrink-0 mt-0.5">🌸</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Lovely Moment Card */}
      {lovelyMomentBlock && lovelyMomentBlock.content && (
        <div
          className="p-3.5 rounded-2xl bg-white/95 border shadow-2xs flex flex-col justify-between"
          style={{ borderColor: theme.borderHex }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs">🤍</span>
            <h4 className="text-xs font-extrabold uppercase tracking-wide">
              {lovelyMomentBlock.titleCustom ||
                (isAr ? "لحظة جميلة" : "A Lovely Moment")}
            </h4>
          </div>
          <p className="text-xs font-medium leading-relaxed italic">
            “{lovelyMomentBlock.content}”
          </p>
        </div>
      )}

      {/* Habit & Focus Badges Grid */}
      {(habitBlock?.content?.title || focusBlock?.content?.minutes) && (
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {habitBlock?.content?.title && (
            <div
              className="p-3 rounded-2xl flex items-center gap-2.5 border bg-white/90"
              style={{ borderColor: theme.borderHex }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: theme.tagBgHex, color: theme.accentHex }}
              >
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-ink-light block">
                  {isAr ? "عادة دعمتني" : "Habit That Supported Me"}
                </span>
                <p className="text-xs font-extrabold truncate">
                  {habitBlock.content.title}
                </p>
                {habitBlock.content.note && (
                  <p className="text-[10.5px] text-ink-light truncate mt-0.5">
                    {habitBlock.content.note}
                  </p>
                )}
              </div>
            </div>
          )}

          {focusBlock?.content?.minutes && (
            <div
              className="p-3 rounded-2xl flex items-center gap-2.5 border bg-white/90"
              style={{ borderColor: theme.borderHex }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: theme.tagBgHex, color: theme.accentHex }}
              >
                <Clock size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-ink-light block">
                    {focusBlock.content.label || (isAr ? "وقت التركيز" : "Focus Time")}
                  </span>
                  {focusBlock.content.isSoFar && (
                    <span
                      className="text-[9px] font-bold px-1.5 rounded-full"
                      style={{ backgroundColor: theme.tagBgHex, color: theme.accentHex }}
                    >
                      {isAr ? "حتى اليوم" : "Through today"}
                    </span>
                  )}
                </div>
                <p className="text-xs font-black">
                  {formatDurationLabel(focusBlock.content.minutes, isAr)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lesson / Gratitude / Next Intention Cards */}
      {(lessonBlock?.content || gratitudeBlock?.content || intentionBlock?.content) && (
        <div className="sm:col-span-2 space-y-2.5">
          {lessonBlock?.content && (
            <div
              className="p-3 rounded-2xl bg-white/80 border text-xs leading-relaxed"
              style={{ borderColor: theme.borderHex }}
            >
              <span className="font-extrabold block mb-0.5 text-[11px] opacity-80">
                🌿 {lessonBlock.titleCustom || (isAr ? "ما تعلّمته هذا الأسبوع" : "A Lesson From The Week")}
              </span>
              <span>{lessonBlock.content}</span>
            </div>
          )}

          {gratitudeBlock?.content && (
            <div
              className="p-3 rounded-2xl bg-white/80 border text-xs leading-relaxed"
              style={{ borderColor: theme.borderHex }}
            >
              <span className="font-extrabold block mb-0.5 text-[11px] opacity-80">
                🌸 {gratitudeBlock.titleCustom || (isAr ? "شيء أشعر بالامتنان له" : "Gratitude")}
              </span>
              <span>{gratitudeBlock.content}</span>
            </div>
          )}

          {intentionBlock?.content && (
            <div
              className="p-3 rounded-2xl bg-white/80 border text-xs leading-relaxed"
              style={{ borderColor: theme.borderHex }}
            >
              <span className="font-extrabold block mb-0.5 text-[11px] opacity-80">
                🕊️ {intentionBlock.titleCustom || (isAr ? "نيّتي للأسبوع القادم" : "Intention For Next Week")}
              </span>
              <span>{intentionBlock.content}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout 2: Soft Minimal Content
// ─────────────────────────────────────────────────────────────────────────────

function MinimalLayoutContent({
  theme,
  isAr,
  photoBlock,
  accomplishmentsBlock,
  lovelyMomentBlock,
  habitBlock,
  focusBlock,
  lessonBlock,
  gratitudeBlock,
  intentionBlock,
}: any) {
  return (
    <div className="space-y-4 my-auto">
      {/* Photo Frame clean subtle border */}
      {photoBlock?.content?.url && (
        <div className="w-full h-44 sm:h-52 overflow-hidden rounded-2xl border border-border/80 bg-white shadow-2xs">
          <img
            src={photoBlock.content.url}
            alt={photoBlock.content.description || "Week in bloom photo"}
            className="w-full h-full object-cover"
            style={{ objectPosition: photoBlock.content.focalPoint || "center" }}
          />
        </div>
      )}

      {/* Editorial Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accomplishmentsBlock &&
          Array.isArray(accomplishmentsBlock.content) &&
          accomplishmentsBlock.content.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border border-border/60">
              <span
                className="text-[10px] font-extrabold tracking-wider uppercase block mb-2"
                style={{ color: theme.accentHex }}
              >
                {accomplishmentsBlock.titleCustom ||
                  (isAr ? "إنجازات أودّ تذكّرها" : "Accomplishments")}
              </span>
              <ul className="space-y-1.5 text-xs font-semibold">
                {accomplishmentsBlock.content.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[10px] opacity-40 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        {lovelyMomentBlock && lovelyMomentBlock.content && (
          <div className="p-4 rounded-2xl bg-white border border-border/60 flex flex-col justify-between">
            <span
              className="text-[10px] font-extrabold tracking-wider uppercase block mb-2"
              style={{ color: theme.accentHex }}
            >
              {lovelyMomentBlock.titleCustom || (isAr ? "لحظة جميلة" : "Lovely Moment")}
            </span>
            <p className="text-xs font-medium leading-relaxed italic">
              “{lovelyMomentBlock.content}”
            </p>
          </div>
        )}
      </div>

      {/* Quiet stats banner */}
      {(habitBlock?.content?.title || focusBlock?.content?.minutes) && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/70 border border-border/40 text-xs font-bold">
          {habitBlock?.content?.title && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface">
              <span>🌱</span>
              <span className="opacity-75">{isAr ? "عادة:" : "Habit:"}</span>
              <span>{habitBlock.content.title}</span>
            </div>
          )}
          {focusBlock?.content?.minutes && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface">
              <span>⏱️</span>
              <span className="opacity-75">
                {focusBlock.content.label}:
              </span>
              <span>
                {formatDurationLabel(focusBlock.content.minutes, isAr)}
                {focusBlock.content.isSoFar && ` (${isAr ? "حتى اليوم" : "so far"})`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Gentle takeaways */}
      {(lessonBlock?.content || gratitudeBlock?.content || intentionBlock?.content) && (
        <div className="p-3.5 rounded-2xl bg-white border border-border/60 text-xs space-y-2">
          {lessonBlock?.content && (
            <p>
              <strong className="font-extrabold text-[11px] block text-ink-light">
                {isAr ? "الدرس المستفاد" : "Key Lesson"}
              </strong>
              {lessonBlock.content}
            </p>
          )}
          {gratitudeBlock?.content && (
            <p>
              <strong className="font-extrabold text-[11px] block text-ink-light">
                {isAr ? "الامتنان" : "Gratitude"}
              </strong>
              {gratitudeBlock.content}
            </p>
          )}
          {intentionBlock?.content && (
            <p>
              <strong className="font-extrabold text-[11px] block text-ink-light">
                {isAr ? "النية القادمة" : "Next Intention"}
              </strong>
              {intentionBlock.content}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout 3: Photo Diary Content
// ─────────────────────────────────────────────────────────────────────────────

function PhotoDiaryLayoutContent({
  theme,
  isAr,
  photoBlock,
  accomplishmentsBlock,
  lovelyMomentBlock,
  habitBlock,
  focusBlock,
  lessonBlock,
  gratitudeBlock,
  intentionBlock,
}: any) {
  return (
    <div className="space-y-3.5 my-auto">
      {/* Big Hero Polaroid Frame */}
      <div
        className="w-full bg-white p-3 pb-4 rounded-3xl shadow-sm border"
        style={{ borderColor: theme.borderHex }}
      >
        <div className="w-full h-56 sm:h-64 overflow-hidden rounded-2xl bg-pink-50 flex items-center justify-center">
          {photoBlock?.content?.url ? (
            <img
              src={photoBlock.content.url}
              alt={photoBlock.content.description || "Photo of the week"}
              className="w-full h-full object-cover"
              style={{ objectPosition: photoBlock.content.focalPoint || "center" }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-ink-light p-4 text-center">
              <ImageIcon size={32} className="stroke-[1.5] mb-1.5 opacity-50" />
              <p className="text-xs font-bold">
                {isAr ? "أضيفي صورة الأسبوع هنا 🌸" : "Add photo of the week here 🌸"}
              </p>
            </div>
          )}
        </div>
        {photoBlock?.content?.caption && (
          <p className="text-xs font-semibold mt-2.5 text-center text-ink italic px-2">
            “{photoBlock.content.caption}”
          </p>
        )}
      </div>

      {/* Diary Notes Card */}
      <div
        className="p-4 rounded-2xl bg-white border space-y-2.5"
        style={{ borderColor: theme.borderHex }}
      >
        {lovelyMomentBlock?.content && (
          <div>
            <span
              className="text-[10.5px] font-black uppercase tracking-wider block mb-1"
              style={{ color: theme.accentHex }}
            >
              {isAr ? "لحظة الأسبوع 🤍" : "Moment of the Week 🤍"}
            </span>
            <p className="text-xs font-medium leading-relaxed italic">
              “{lovelyMomentBlock.content}”
            </p>
          </div>
        )}

        {accomplishmentsBlock &&
          Array.isArray(accomplishmentsBlock.content) &&
          accomplishmentsBlock.content.length > 0 && (
            <div className="pt-2 border-t border-border/40">
              <span className="text-[10.5px] font-black uppercase tracking-wider block mb-1 text-ink-light">
                {isAr ? "إنجازات عشتها ✨" : "Lived Accomplishments ✨"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {accomplishmentsBlock.content.map((item: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface border border-border/60"
                  >
                    🌸 {item}
                  </span>
                ))}
              </div>
            </div>
          )}

        {(habitBlock?.content?.title || focusBlock?.content?.minutes) && (
          <div className="pt-2 border-t border-border/40 flex items-center gap-3 text-xs font-bold">
            {habitBlock?.content?.title && (
              <span>🌱 {habitBlock.content.title}</span>
            )}
            {focusBlock?.content?.minutes && (
              <span>
                ⏱️ {formatDurationLabel(focusBlock.content.minutes, isAr)}
              </span>
            )}
          </div>
        )}

        {(lessonBlock?.content || gratitudeBlock?.content || intentionBlock?.content) && (
          <div className="pt-2 border-t border-border/40 text-xs space-y-1.5 leading-relaxed text-ink-light">
            {lessonBlock?.content && <p>🌿 {lessonBlock.content}</p>}
            {gratitudeBlock?.content && <p>🌸 {gratitudeBlock.content}</p>}
            {intentionBlock?.content && <p>🕊️ {intentionBlock.content}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
