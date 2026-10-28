/**
 * Astronomical Prayer Times & Islamic Calendar Engine
 * Powered by adhan (Batoul Apps) for verified offline calculations.
 */
import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  PrayerTimes,
  Madhab,
  HighLatitudeRule,
  Qibla,
} from "adhan";

export interface GlobalCity {
  id: string;
  nameEn: string;
  nameAr: string;
  countryEn: string;
  countryAr: string;
  latitude: number;
  longitude: number;
  timezone: string;
  defaultMethod: string;
}

export const GLOBAL_CITIES: GlobalCity[] = [
  // Holy & Gulf
  { id: "makkah", nameEn: "Makkah", nameAr: "مكة المكرمة", countryEn: "Saudi Arabia", countryAr: "المملكة العربية السعودية", latitude: 21.4225, longitude: 39.8262, timezone: "Asia/Riyadh", defaultMethod: "UmmAlQura" },
  { id: "madinah", nameEn: "Madinah", nameAr: "المدينة المنورة", countryEn: "Saudi Arabia", countryAr: "المملكة العربية السعودية", latitude: 24.4672, longitude: 39.6024, timezone: "Asia/Riyadh", defaultMethod: "UmmAlQura" },
  { id: "riyadh", nameEn: "Riyadh", nameAr: "الرياض", countryEn: "Saudi Arabia", countryAr: "المملكة العربية السعودية", latitude: 24.7136, longitude: 46.6753, timezone: "Asia/Riyadh", defaultMethod: "UmmAlQura" },
  { id: "jeddah", nameEn: "Jeddah", nameAr: "جدة", countryEn: "Saudi Arabia", countryAr: "المملكة العربية السعودية", latitude: 21.5433, longitude: 39.1728, timezone: "Asia/Riyadh", defaultMethod: "UmmAlQura" },
  { id: "dubai", nameEn: "Dubai", nameAr: "دبي", countryEn: "UAE", countryAr: "الإمارات", latitude: 25.2048, longitude: 55.2708, timezone: "Asia/Dubai", defaultMethod: "Dubai" },
  { id: "abudhabi", nameEn: "Abu Dhabi", nameAr: "أبوظبي", countryEn: "UAE", countryAr: "الإمارات", latitude: 24.4539, longitude: 54.3773, timezone: "Asia/Dubai", defaultMethod: "Dubai" },
  { id: "doha", nameEn: "Doha", nameAr: "الدوحة", countryEn: "Qatar", countryAr: "قطر", latitude: 25.2854, longitude: 51.5310, timezone: "Asia/Qatar", defaultMethod: "Qatar" },
  { id: "kuwait", nameEn: "Kuwait City", nameAr: "مدينة الكويت", countryEn: "Kuwait", countryAr: "الكويت", latitude: 29.3759, longitude: 47.9774, timezone: "Asia/Kuwait", defaultMethod: "Kuwait" },
  { id: "manama", nameEn: "Manama", nameAr: "المنامة", countryEn: "Bahrain", countryAr: "البحرين", latitude: 26.2285, longitude: 50.5860, timezone: "Asia/Bahrain", defaultMethod: "UmmAlQura" },
  { id: "muscat", nameEn: "Muscat", nameAr: "مسقط", countryEn: "Oman", countryAr: "عُمان", latitude: 23.5880, longitude: 58.3829, timezone: "Asia/Muscat", defaultMethod: "UmmAlQura" },

  // North Africa & Levant
  { id: "casablanca", nameEn: "Casablanca", nameAr: "الدار البيضاء", countryEn: "Morocco", countryAr: "المغرب", latitude: 33.5731, longitude: -7.5898, timezone: "Africa/Casablanca", defaultMethod: "MuslimWorldLeague" },
  { id: "rabat", nameEn: "Rabat", nameAr: "الرباط", countryEn: "Morocco", countryAr: "المغرب", latitude: 34.0209, longitude: -6.8416, timezone: "Africa/Casablanca", defaultMethod: "MuslimWorldLeague" },
  { id: "marrakech", nameEn: "Marrakech", nameAr: "مراكش", countryEn: "Morocco", countryAr: "المغرب", latitude: 31.6295, longitude: -7.9811, timezone: "Africa/Casablanca", defaultMethod: "MuslimWorldLeague" },
  { id: "cairo", nameEn: "Cairo", nameAr: "القاهرة", countryEn: "Egypt", countryAr: "مصر", latitude: 30.0444, longitude: 31.2357, timezone: "Africa/Cairo", defaultMethod: "Egyptian" },
  { id: "alexandria", nameEn: "Alexandria", nameAr: "الإسكندرية", countryEn: "Egypt", countryAr: "مصر", latitude: 31.2001, longitude: 29.9187, timezone: "Africa/Cairo", defaultMethod: "Egyptian" },
  { id: "tunis", nameEn: "Tunis", nameAr: "تونس", countryEn: "Tunisia", countryAr: "تونس", latitude: 36.8065, longitude: 10.1815, timezone: "Africa/Tunis", defaultMethod: "MuslimWorldLeague" },
  { id: "algiers", nameEn: "Algiers", nameAr: "الجزائر", countryEn: "Algeria", countryAr: "الجزائر", latitude: 36.7538, longitude: 3.0588, timezone: "Africa/Algiers", defaultMethod: "MuslimWorldLeague" },
  { id: "amman", nameEn: "Amman", nameAr: "عمّان", countryEn: "Jordan", countryAr: "الأردن", latitude: 31.9454, longitude: 35.9284, timezone: "Asia/Amman", defaultMethod: "UmmAlQura" },
  { id: "beirut", nameEn: "Beirut", nameAr: "بيروت", countryEn: "Lebanon", countryAr: "لبنان", latitude: 33.8938, longitude: 35.5018, timezone: "Asia/Beirut", defaultMethod: "Egyptian" },
  { id: "jerusalem", nameEn: "Jerusalem", nameAr: "القدس الشريف", countryEn: "Palestine", countryAr: "فلسطين", latitude: 31.7683, longitude: 35.2137, timezone: "Asia/Jerusalem", defaultMethod: "Egyptian" },

  // Asia & Turkey
  { id: "istanbul", nameEn: "Istanbul", nameAr: "إسطنبول", countryEn: "Turkey", countryAr: "تركيا", latitude: 41.0082, longitude: 28.9784, timezone: "Europe/Istanbul", defaultMethod: "Turkey" },
  { id: "ankara", nameEn: "Ankara", nameAr: "أنقرة", countryEn: "Turkey", countryAr: "تركيا", latitude: 39.9334, longitude: 32.8597, timezone: "Europe/Istanbul", defaultMethod: "Turkey" },
  { id: "kualalumpur", nameEn: "Kuala Lumpur", nameAr: "كوالالمبور", countryEn: "Malaysia", countryAr: "ماليزيا", latitude: 3.1390, longitude: 101.6869, timezone: "Asia/Kuala_Lumpur", defaultMethod: "MuslimWorldLeague" },
  { id: "jakarta", nameEn: "Jakarta", nameAr: "جاكرتا", countryEn: "Indonesia", countryAr: "إندونيسيا", latitude: -6.2088, longitude: 106.8456, timezone: "Asia/Jakarta", defaultMethod: "MuslimWorldLeague" },
  { id: "karachi", nameEn: "Karachi", nameAr: "كراتشي", countryEn: "Pakistan", countryAr: "باكستان", latitude: 24.8607, longitude: 67.0011, timezone: "Asia/Karachi", defaultMethod: "Karachi" },
  { id: "lahore", nameEn: "Lahore", nameAr: "لاهور", countryEn: "Pakistan", countryAr: "باكستان", latitude: 31.5204, longitude: 74.3587, timezone: "Asia/Karachi", defaultMethod: "Karachi" },
  { id: "dhaka", nameEn: "Dhaka", nameAr: "دكا", countryEn: "Bangladesh", countryAr: "بنغلاديش", latitude: 23.8103, longitude: 90.4125, timezone: "Asia/Dhaka", defaultMethod: "Karachi" },
  { id: "singapore", nameEn: "Singapore", nameAr: "سنغافورة", countryEn: "Singapore", countryAr: "سنغافورة", latitude: 1.3521, longitude: 103.8198, timezone: "Asia/Singapore", defaultMethod: "Singapore" },

  // Europe & Americas
  { id: "london", nameEn: "London", nameAr: "لندن", countryEn: "United Kingdom", countryAr: "المملكة المتحدة", latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London", defaultMethod: "MuslimWorldLeague" },
  { id: "paris", nameEn: "Paris", nameAr: "باريس", countryEn: "France", countryAr: "فرنسا", latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris", defaultMethod: "MuslimWorldLeague" },
  { id: "berlin", nameEn: "Berlin", nameAr: "برلين", countryEn: "Germany", countryAr: "ألمانيا", latitude: 52.5200, longitude: 13.4050, timezone: "Europe/Berlin", defaultMethod: "MuslimWorldLeague" },
  { id: "madrid", nameEn: "Madrid", nameAr: "مدريد", countryEn: "Spain", countryAr: "إسبانيا", latitude: 40.4168, longitude: -3.7038, timezone: "Europe/Madrid", defaultMethod: "MuslimWorldLeague" },
  { id: "newyork", nameEn: "New York", nameAr: "نيويورك", countryEn: "United States", countryAr: "الولايات المتحدة", latitude: 40.7128, longitude: -74.0060, timezone: "America/New_York", defaultMethod: "NorthAmerica" },
  { id: "toronto", nameEn: "Toronto", nameAr: "تورونتو", countryEn: "Canada", countryAr: "كندا", latitude: 43.6532, longitude: -79.3832, timezone: "America/Toronto", defaultMethod: "NorthAmerica" },
  { id: "losangeles", nameEn: "Los Angeles", nameAr: "لوس أنجلوس", countryEn: "United States", countryAr: "الولايات المتحدة", latitude: 34.0522, longitude: -118.2437, timezone: "America/Los_Angeles", defaultMethod: "NorthAmerica" },
  { id: "sydney", nameEn: "Sydney", nameAr: "سيدني", countryEn: "Australia", countryAr: "أستراليا", latitude: -33.8688, longitude: 151.2093, timezone: "Australia/Sydney", defaultMethod: "MuslimWorldLeague" }
];

export const CALCULATION_METHODS: { id: string; nameEn: string; nameAr: string }[] = [
  { id: "UmmAlQura", nameEn: "Umm al-Qura (Makkah)", nameAr: "أم القرى (مكة المكرمة)" },
  { id: "MuslimWorldLeague", nameEn: "Muslim World League (MWL)", nameAr: "رابطة العالم الإسلامي" },
  { id: "Egyptian", nameEn: "Egyptian General Authority", nameAr: "الهيئة المصرية العامة للمساحة" },
  { id: "Karachi", nameEn: "University of Islamic Sciences, Karachi", nameAr: "جامعة العلوم الإسلامية بكراتشي" },
  { id: "NorthAmerica", nameEn: "ISNA (North America)", nameAr: "الجمعية الإسلامية لأمريكا الشمالية" },
  { id: "Dubai", nameEn: "Dubai (Awqaf)", nameAr: "دبي (الشؤون الإسلامية)" },
  { id: "Kuwait", nameEn: "Kuwait Ministry of Awqaf", nameAr: "وزارة الأوقاف الكويتية" },
  { id: "Qatar", nameEn: "Qatar Ministry of Awqaf", nameAr: "وزارة الأوقاف القطرية" },
  { id: "MoonsightingCommittee", nameEn: "Moonsighting Committee", nameAr: "لجنة تحري الهلال" },
  { id: "Turkey", nameEn: "Diyanet (Turkey)", nameAr: "رئاسة الشؤون الدينية التركية" },
  { id: "Singapore", nameEn: "MUIS (Singapore)", nameAr: "مجلس الشؤون الإسلامية بسنغافورة" }
];

export function getCalculationParameters(methodId: string): CalculationParameters {
  switch (methodId) {
    case "UmmAlQura":
      return CalculationMethod.UmmAlQura();
    case "Egyptian":
      return CalculationMethod.Egyptian();
    case "Karachi":
      return CalculationMethod.Karachi();
    case "NorthAmerica":
      return CalculationMethod.NorthAmerica();
    case "Dubai":
      return CalculationMethod.Dubai();
    case "Kuwait":
      return CalculationMethod.Kuwait();
    case "Qatar":
      return CalculationMethod.Qatar();
    case "MoonsightingCommittee":
      return CalculationMethod.MoonsightingCommittee();
    case "Turkey":
      return CalculationMethod.Turkey();
    case "Singapore":
      return CalculationMethod.Singapore();
    case "MuslimWorldLeague":
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

export interface PrayerTimeResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  currentPrayer: "none" | "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
  nextPrayer: "none" | "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";
  timeForNextPrayer: Date | null;
  qiblaBearing: number;
}

export function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
  methodId: string = "UmmAlQura",
  asrMadhab: "shafi" | "hanafi" = "shafi"
): PrayerTimeResult {
  const coords = new Coordinates(latitude, longitude);
  const params = getCalculationParameters(methodId);

  if (asrMadhab === "hanafi") {
    params.madhab = Madhab.Hanafi;
  } else {
    params.madhab = Madhab.Shafi;
  }
  params.highLatitudeRule = HighLatitudeRule.TwilightAngle;

  const prayerTimes = new PrayerTimes(coords, date, params);
  const qibla = Qibla(coords);

  const currentPrayerName = (prayerTimes.currentPrayer() || "none") as PrayerTimeResult["currentPrayer"];
  const rawNext = prayerTimes.nextPrayer();
  let nextPrayerName: PrayerTimeResult["nextPrayer"] = "fajr";
  let timeForNext: Date | null = null;

  if (rawNext && rawNext !== "none") {
    nextPrayerName = rawNext as PrayerTimeResult["nextPrayer"];
    timeForNext = prayerTimes.timeForPrayer(rawNext);
  } else {
    // Past Isha -> Transition smoothly to tomorrow's Fajr
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = new PrayerTimes(coords, tomorrow, params);
    nextPrayerName = "fajr";
    timeForNext = tomorrowTimes.fajr;
  }

  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    currentPrayer: currentPrayerName,
    nextPrayer: nextPrayerName,
    timeForNextPrayer: timeForNext,
    qiblaBearing: Math.round(qibla),
  };
}

/**
 * Returns clean localized display name for prayers
 */
export function getPrayerDisplayName(prayer: string, isAr: boolean = false): string {
  const map: Record<string, { en: string; ar: string }> = {
    fajr: { en: "Fajr", ar: "الفجر" },
    sunrise: { en: "Sunrise", ar: "الشروق" },
    dhuhr: { en: "Dhuhr", ar: "الظهر" },
    asr: { en: "Asr", ar: "العصر" },
    maghrib: { en: "Maghrib", ar: "المغرب" },
    isha: { en: "Isha", ar: "العشاء" },
    none: { en: "Fajr", ar: "الفجر" },
  };
  const key = (prayer || "fajr").toLowerCase();
  const entry = map[key] || { en: prayer, ar: prayer };
  return isAr ? entry.ar : entry.en;
}

/**
 * Formats a Date object into a readable 12-hour or 24-hour localized time string
 */
export function formatPrayerTime(date: Date | null | undefined, is24h: boolean = false): string {
  if (!date || isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !is24h,
  });
}

/**
 * Formats remaining time until next prayer as "2h 15m" or "45m"
 */
export function formatRemainingTime(targetDate: Date | null | undefined, isAr: boolean = false): string {
  if (!targetDate) return isAr ? "غير محدد" : "N/A";
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  if (diffMs <= 0) return isAr ? "حان وقت الصلاة" : "Now";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours > 0) {
    return isAr ? `${hours} س ${mins} د` : `${hours}h ${mins}m`;
  }
  return isAr ? `${mins} دقيقة` : `${mins} min`;
}

/**
 * Converts a Gregorian Date to localized Hijri Date with optional user offset
 */
export function getHijriDate(date: Date = new Date(), dayAdjustment: number = 0, isAr: boolean = false): string {
  try {
    const adjustedDate = new Date(date);
    if (dayAdjustment !== 0) {
      adjustedDate.setDate(adjustedDate.getDate() + dayAdjustment);
    }
    const formatter = new Intl.DateTimeFormat(isAr ? "ar-SA-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatter.format(adjustedDate);
  } catch {
    // Fallback if Intl islamic calendar is unsupported
    return isAr ? "التاريخ الهجري" : "Hijri Date";
  }
}
