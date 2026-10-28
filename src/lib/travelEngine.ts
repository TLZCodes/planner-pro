import type { FinancialTransaction } from "./financeEngine";

export type TripStatus = "wishlist" | "planning" | "booked" | "in_progress" | "completed" | "archived";

export type ActivityType =
  | "flight"
  | "accommodation"
  | "transport"
  | "activity"
  | "food"
  | "shopping"
  | "rest"
  | "custom";

export type BookingType =
  | "flight"
  | "accommodation"
  | "train"
  | "bus"
  | "car_rental"
  | "local_transport"
  | "activity"
  | "restaurant"
  | "other";

export type BookingStatus = "planned" | "reserved" | "confirmed" | "cancelled";
export type PaymentStatus = "not_paid" | "partially_paid" | "paid" | "refunded";

export type ChecklistCategory =
  | "documents"
  | "bookings"
  | "packing"
  | "health"
  | "money"
  | "before_leaving"
  | "during_travel"
  | "custom";

export type DocumentType =
  | "passport"
  | "visa"
  | "insurance"
  | "ticket"
  | "booking_confirmation"
  | "emergency_contacts"
  | "other";

export type DocumentStatus = "valid" | "expiring_soon" | "expired" | "not_required" | "in_progress";

export type DesiredSeason = "spring" | "summer" | "autumn" | "winter" | "flexible";
export type PriorityLevel = "high" | "medium" | "low";

export interface TravelTrip {
  id: string;
  userId?: string;
  title: string;
  primaryCity: string;
  countryCode?: string;
  additionalDestinations?: string[];
  coverStorageReference?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  originTimezone?: string;
  destinationTimezone?: string;
  travelerCount: number;
  status: TripStatus;
  primaryCurrency: string;
  estimatedBudgetMinor: number;
  linkedSavingsGoalId?: string;
  linkedTravelGoalId?: string;
  linkedMoneyGoalId?: string;
  notes?: string;
  completedAt?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelDay {
  id: string;
  tripId: string;
  localDate: string; // YYYY-MM-DD
  timezone: string;
  title?: string;
  note?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryItem {
  id: string;
  tripId: string;
  travelDayId: string;
  bookingId?: string;
  type: ActivityType;
  title: string;
  allDay: boolean;
  startLocalDateTime?: string; // "YYYY-MM-DDTHH:MM"
  endLocalDateTime?: string; // "YYYY-MM-DDTHH:MM"
  timezone: string;
  departureTimezone?: string;
  arrivalTimezone?: string;
  locationName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  estimatedAmountMinor?: number;
  currency?: string;
  note?: string;
  status: "planned" | "confirmed" | "completed" | "cancelled";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TravelBooking {
  id: string;
  tripId: string;
  userId?: string;
  type: BookingType;
  providerName: string;
  confirmationReferenceEncryptedOrProtected?: string;
  startDateTime?: string;
  endDateTime?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  currency: string;
  estimatedAmountMinor: number;
  paidAmountMinor: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  note?: string;
  attachments?: string[];
  linkedFinanceTransactionIds?: string[];
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
}

export interface TravelBookingPaymentLink {
  id: string;
  bookingId: string;
  financeTransactionId: string;
  amountMinor: number;
  currency: string;
  linkedAt: string;
  removedAt?: string;
}

export interface TravelBudgetCategory {
  id: string;
  tripId: string;
  categoryKey: string;
  customName?: string;
  estimatedAmountMinor: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelChecklistItem {
  id: string;
  tripId: string;
  category: ChecklistCategory;
  title: string;
  required: boolean;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  note?: string;
  order: number;
  linkedTaskId?: string;
  contributionMode: "checklist_only" | "sync_task";
  createdAt: string;
  updatedAt: string;
}

export interface TravelDocument {
  id: string;
  tripId?: string;
  userId?: string;
  type: DocumentType;
  displayName: string;
  issuingCountry?: string;
  expiryDate?: string; // YYYY-MM-DD
  status: DocumentStatus;
  secureStorageReference?: string;
  reminderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BucketListItem {
  id: string;
  userId?: string;
  destination: string;
  countryCode?: string;
  coverStorageReference?: string;
  desiredSeason: DesiredSeason;
  targetYear?: number;
  priority: PriorityLevel;
  personalReason?: string;
  estimatedBudgetMinor?: number;
  currency?: string;
  note?: string;
  linkedGoalId?: string;
  convertedTripId?: string;
  status: "active" | "converted" | "archived";
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TravelMemory {
  id: string;
  tripId: string;
  localDate: string; // YYYY-MM-DD
  caption: string;
  reflection?: string;
  securePhotoReference?: string;
  linkedJournalEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelSettings {
  userId?: string;
  travelLockEnabled: boolean;
  biometricEnabled: boolean;
  hideAppSwitcherPreview: boolean;
  hideNotificationDetails: boolean;
  defaultCurrency: string;
  defaultOriginTimezone: string;
  quietHours: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_TRAVEL_SETTINGS: TravelSettings = {
  travelLockEnabled: false,
  biometricEnabled: false,
  hideAppSwitcherPreview: false,
  hideNotificationDetails: false,
  defaultCurrency: "MAD",
  defaultOriginTimezone: "UTC",
  quietHours: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_BUDGET_CATEGORIES = [
  { key: "flights", labelEn: "Flights", labelAr: "الطيران", icon: "Plane" },
  { key: "accommodation", labelEn: "Accommodation", labelAr: "الإقامة والفنادق", icon: "Hotel" },
  { key: "transport", labelEn: "Local Transport", labelAr: "المواصلات والتنقل", icon: "Car" },
  { key: "food", labelEn: "Food & Dining", labelAr: "المطاعم والمأكولات", icon: "Utensils" },
  { key: "activities", labelEn: "Activities & Tours", labelAr: "الأنشطة والجولات", icon: "Ticket" },
  { key: "shopping", labelEn: "Shopping & Souvenirs", labelAr: "التسوق والهدايا", icon: "ShoppingBag" },
  { key: "documents", labelEn: "Visas & Documents", labelAr: "التأشيرات والوثائق", icon: "FileText" },
  { key: "insurance", labelEn: "Travel Insurance", labelAr: "تأمين السفر", icon: "Shield" },
  { key: "emergency", labelEn: "Emergency Buffer", labelAr: "احتياطي للطوارئ", icon: "AlertCircle" },
  { key: "other", labelEn: "Other", labelAr: "أخرى", icon: "MoreHorizontal" },
];

/**
 * Honest Preparation Progress:
 * Completed required checklist items ÷ Total required checklist items
 */
export function calculatePreparationProgress(items: TravelChecklistItem[]): {
  ratio: string;
  completedRequired: number;
  totalRequired: number;
  percentage: number;
  status: "not_set_up" | "in_progress" | "completed";
  optionalCompleted: number;
  optionalTotal: number;
} {
  const required = items.filter((i) => i.required);
  const optional = items.filter((i) => !i.required);

  const completedRequired = required.filter((i) => i.completed).length;
  const totalRequired = required.length;

  const optionalCompleted = optional.filter((i) => i.completed).length;
  const optionalTotal = optional.length;

  if (totalRequired === 0) {
    return {
      ratio: "0/0",
      completedRequired: 0,
      totalRequired: 0,
      percentage: 0,
      status: "not_set_up",
      optionalCompleted,
      optionalTotal,
    };
  }

  const percentage = Math.round((completedRequired / totalRequired) * 100);
  const status = percentage >= 100 ? "completed" : "in_progress";

  return {
    ratio: `${completedRequired}/${totalRequired}`,
    completedRequired,
    totalRequired,
    percentage,
    status,
    optionalCompleted,
    optionalTotal,
  };
}

/**
 * Select Next Adventure:
 * Finds closest future active trip (status in planning, booked, in_progress).
 * Excludes archived and completed trips.
 * If today falls within [startDate, endDate], returns isCurrentTrip: true.
 * If today > endDate, suggests completion.
 */
export function selectNextAdventure(
  trips: TravelTrip[],
  todayStr: string = new Date().toISOString().slice(0, 10)
): {
  trip: TravelTrip | null;
  isCurrentTrip: boolean;
  daysUntil: number;
  needsCompletionPrompt: boolean;
} {
  const activeTrips = trips.filter(
    (t) => t.status !== "archived" && t.status !== "completed" && t.status !== "wishlist"
  );

  if (!activeTrips.length) {
    return { trip: null, isCurrentTrip: false, daysUntil: 0, needsCompletionPrompt: false };
  }

  // Check for currently ongoing trip
  const ongoing = activeTrips.find((t) => t.startDate <= todayStr && t.endDate >= todayStr);
  if (ongoing) {
    return { trip: ongoing, isCurrentTrip: true, daysUntil: 0, needsCompletionPrompt: false };
  }

  // Check for upcoming trips (startDate > todayStr) sorted by startDate ascending
  const upcoming = activeTrips
    .filter((t) => t.startDate > todayStr)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const dStart = new Date(next.startDate + "T00:00:00Z").getTime();
    const dToday = new Date(todayStr + "T00:00:00Z").getTime();
    const diffDays = Math.max(0, Math.ceil((dStart - dToday) / (1000 * 60 * 60 * 24)));
    return { trip: next, isCurrentTrip: false, daysUntil: diffDays, needsCompletionPrompt: false };
  }

  // Check if there is an overdue active trip (endDate < todayStr) that needs completion confirmation
  const pastActive = activeTrips
    .filter((t) => t.endDate < todayStr)
    .sort((a, b) => b.endDate.localeCompare(a.endDate));

  if (pastActive.length > 0) {
    return { trip: pastActive[0], isCurrentTrip: false, daysUntil: 0, needsCompletionPrompt: true };
  }

  return { trip: activeTrips[0], isCurrentTrip: false, daysUntil: 0, needsCompletionPrompt: false };
}

/**
 * Generate Itinerary Days between start and end date
 */
export function generateItineraryDays(
  tripId: string,
  startDate: string,
  endDate: string,
  timezone: string = "UTC"
): Omit<TravelDay, "id" | "createdAt" | "updatedAt">[] {
  if (!startDate || !endDate || startDate > endDate) return [];

  const days: Omit<TravelDay, "id" | "createdAt" | "updatedAt">[] = [];
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");

  let current = new Date(start);
  let order = 0;

  while (current <= end) {
    const localDate = current.toISOString().slice(0, 10);
    days.push({
      tripId,
      localDate,
      timezone,
      order,
    });
    current.setUTCDate(current.getUTCDate() + 1);
    order++;
  }

  return days;
}

/**
 * Detect Overlapping Timed Activities in Itinerary
 */
export interface OverlapConflict {
  itemAId: string;
  itemBId: string;
  titleA: string;
  titleB: string;
  timeA: string;
  timeB: string;
}

export function detectActivityOverlaps(items: ItineraryItem[]): OverlapConflict[] {
  const conflicts: OverlapConflict[] = [];
  const timed = items.filter(
    (i) => !i.allDay && i.status !== "cancelled" && i.startLocalDateTime && i.endLocalDateTime
  );

  for (let i = 0; i < timed.length; i++) {
    for (let j = i + 1; j < timed.length; j++) {
      const a = timed[i];
      const b = timed[j];

      // If they belong to the same day or have overlapping ISO date-times
      if (a.travelDayId === b.travelDayId) {
        const aStart = a.startLocalDateTime!;
        const aEnd = a.endLocalDateTime!;
        const bStart = b.startLocalDateTime!;
        const bEnd = b.endLocalDateTime!;

        // Overlap: max(startA, startB) < min(endA, endB)
        if (aStart < bEnd && bStart < aEnd) {
          conflicts.push({
            itemAId: a.id,
            itemBId: b.id,
            titleA: a.title,
            titleB: b.title,
            timeA: `${aStart.slice(11, 16)} - ${aEnd.slice(11, 16)}`,
            timeB: `${bStart.slice(11, 16)} - ${bEnd.slice(11, 16)}`,
          });
        }
      }
    }
  }

  return conflicts;
}

/**
 * Trip Financial Calculations using Canonical Finance Transactions:
 * - Estimated budget: user-entered planned costs.
 * - Paid: valid linked Finance expenses marked as paid/posted.
 * - Actual spending: posted travel-linked Finance expenses minus valid refunds.
 * - Remaining: estimated budget minus actual spending.
 */
export interface TripFinancialSummary {
  estimatedBudgetMinor: number;
  actualSpendingMinor: number;
  paidAmountMinor: number;
  remainingEstimatedBudgetMinor: number;
  isOverBudget: boolean;
  overBudgetMinor: number;
  categorySpending: Record<string, number>; // categoryKey -> amountMinor
  transactionCount: number;
}

export function calculateTripFinances(
  trip: TravelTrip,
  financeTransactions: FinancialTransaction[],
  budgetCategories: TravelBudgetCategory[] = []
): TripFinancialSummary {
  // Find all posted transactions linked to this trip
  const tripTxs = financeTransactions.filter((tx) => {
    if (tx.status !== "posted") return false;
    const isSource = tx.sourceType === "travel" && tx.sourceId === trip.id;
    const hasTag = (tx.tags || []).some((t) => t.toLowerCase() === `trip:${trip.id}` || t.toLowerCase() === trip.id);
    return isSource || hasTag;
  });

  let totalExpensesMinor = 0;
  let totalRefundsMinor = 0;
  const categorySpending: Record<string, number> = {};

  for (const tx of tripTxs) {
    const netAmountMinor = tx.legs.reduce((acc, leg) => acc + Math.abs(leg.signedAmountMinor), 0);

    if (tx.type === "expense") {
      totalExpensesMinor += netAmountMinor;
      const catKey = tx.categoryId || "other";
      categorySpending[catKey] = (categorySpending[catKey] || 0) + netAmountMinor;
    } else if (tx.type === "refund" || (tx.type === "income" && tx.merchantOrSource?.toLowerCase().includes("refund"))) {
      totalRefundsMinor += netAmountMinor;
    }
  }

  const actualSpendingMinor = Math.max(0, totalExpensesMinor - totalRefundsMinor);
  const estimatedBudgetMinor = trip.estimatedBudgetMinor || 0;
  const remainingEstimatedBudgetMinor = estimatedBudgetMinor - actualSpendingMinor;
  const isOverBudget = remainingEstimatedBudgetMinor < 0;
  const overBudgetMinor = isOverBudget ? Math.abs(remainingEstimatedBudgetMinor) : 0;

  return {
    estimatedBudgetMinor,
    actualSpendingMinor,
    paidAmountMinor: actualSpendingMinor,
    remainingEstimatedBudgetMinor,
    isOverBudget,
    overBudgetMinor,
    categorySpending,
    transactionCount: tripTxs.length,
  };
}

/**
 * Generate External Maps URL safely
 */
export function getExternalMapsUrl(queryOrAddress: string, lat?: number, lng?: number): string {
  if (typeof lat === "number" && typeof lng === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryOrAddress)}`;
}

/**
 * Document Expiry Status Derivation
 */
export function deriveDocumentStatus(
  expiryDateStr?: string,
  todayStr: string = new Date().toISOString().slice(0, 10)
): DocumentStatus {
  if (!expiryDateStr) return "valid";

  if (expiryDateStr < todayStr) {
    return "expired";
  }

  // Expiring soon: within 180 days (6 months standard international validity buffer)
  const dExp = new Date(expiryDateStr + "T00:00:00Z").getTime();
  const dToday = new Date(todayStr + "T00:00:00Z").getTime();
  const diffDays = (dExp - dToday) / (1000 * 60 * 60 * 24);

  if (diffDays <= 180) {
    return "expiring_soon";
  }

  return "valid";
}

/**
 * Curated Checklist Templates
 */
export interface ChecklistTemplateItem {
  category: ChecklistCategory;
  titleEn: string;
  titleAr: string;
  required: boolean;
}

export interface ChecklistTemplate {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  items: ChecklistTemplateItem[];
}

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: "international_trip",
    nameEn: "International Trip",
    nameAr: "سفر دولي",
    descriptionEn: "Essential documents, bookings, and preparations for traveling abroad.",
    descriptionAr: "الوثائق الضرورية، الحجوزات، والتحضيرات الأساسية للسفر خارج البلاد.",
    items: [
      { category: "documents", titleEn: "Check passport validity (6+ months remaining)", titleAr: "التحقق من صلاحية الجواز (أكثر من 6 أشهر)", required: true },
      { category: "documents", titleEn: "Confirm visa or entry permit requirement", titleAr: "التأكد من متطلبات التأشيرة أو تصريح الدخول", required: true },
      { category: "documents", titleEn: "Travel health insurance certificate", titleAr: "شهادة تأمين السفر الصحي", required: true },
      { category: "bookings", titleEn: "Download offline copies of airline tickets", titleAr: "تحميل تذاكر الطيران للعمل دون إنترنت", required: true },
      { category: "bookings", titleEn: "Confirm hotel / accommodation reservation", titleAr: "تأكيد حجز الفندق أو مكان الإقامة", required: true },
      { category: "money", titleEn: "Notify bank or activate international card usage", titleAr: "تفعيل البطاقة البنكية للاستخدام الدولي", required: true },
      { category: "money", titleEn: "Prepare some destination cash", titleAr: "تجهيز مبالغ نقدية بعملة الوجهة", required: false },
      { category: "packing", titleEn: "Universal power adapter and power bank", titleAr: "محول كهربائي عالمي وشاحن متنقل", required: true },
      { category: "packing", titleEn: "Personal medications and first-aid kit", titleAr: "الأدوية الشخصية وحقيبة الإسعافات", required: true },
      { category: "before_leaving", titleEn: "Set up home appliances and secure doors", titleAr: "إغلاق الأجهزة الكهربائية وتأمين المنزل", required: true },
    ],
  },
  {
    id: "weekend_trip",
    nameEn: "Weekend Trip",
    nameAr: "عطلة نهاية الأسبوع",
    descriptionEn: "Lightweight, easy packing for a 2-3 day quick getaway.",
    descriptionAr: "حقيبة خفيفة وتحضيرات سريعة لرحلة قصيرة لمدة يومين أو ثلاثة.",
    items: [
      { category: "bookings", titleEn: "Check transport / car booking details", titleAr: "مراجعة تفاصيل وسيلة النقل أو حجز السيارة", required: true },
      { category: "bookings", titleEn: "Check-in time confirmation with host", titleAr: "تأكيد موعد تسجيل الدخول مع مكان الإقامة", required: true },
      { category: "packing", titleEn: "Comfortable walking shoes & outfits", titleAr: "حذاء مريح وملابس تناسب عطلة نهاية الأسبوع", required: true },
      { category: "packing", titleEn: "Toiletries & mini skincare essentials", titleAr: "مستلزمات العناية الشخصية بحجم صغير", required: true },
      { category: "packing", titleEn: "Device chargers", titleAr: "شواحن الأجهزة", required: true },
      { category: "before_leaving", titleEn: "Download offline maps for the area", titleAr: "تحميل خرائط المنطقة دون اتصال", required: false },
    ],
  },
  {
    id: "road_trip",
    nameEn: "Road Trip",
    nameAr: "رحلة طريق بالسيارة",
    descriptionEn: "Vehicle safety checks, snacks, and offline navigation.",
    descriptionAr: "فحص أمان السيارة، الوجبات الخفيفة، والخرائط بدون إنترنت.",
    items: [
      { category: "before_leaving", titleEn: "Check tire pressure, fluids, and fuel", titleAr: "فحص ضغط الإطارات وسوائل المحرك والوقود", required: true },
      { category: "documents", titleEn: "Driver's license and vehicle registration", titleAr: "رخصة القيادة وأوراق تسجيل السيارة والتأمين", required: true },
      { category: "before_leaving", titleEn: "Download complete offline road route", titleAr: "تحميل مسار الرحلة على الخرائط للعمل دون نت", required: true },
      { category: "packing", titleEn: "Car phone mount & in-car charging cable", titleAr: "حامل الهاتف وسلك الشاحن داخل السيارة", required: true },
      { category: "packing", titleEn: "Road snacks, water, and thermos", titleAr: "مياه ووجبات خفيفة وترمس المشروب الدافئ", required: false },
      { category: "health", titleEn: "Motion sickness remedies & wet wipes", titleAr: "مناديل مبللة وأدوية دوار الحركة", required: false },
    ],
  },
  {
    id: "beach_trip",
    nameEn: "Beach / Warm Getaway",
    nameAr: "رحلة شاطئية أو استجمام",
    descriptionEn: "Sun care, relaxed attire, and water protection.",
    descriptionAr: "حماية من الشمس، ملابس مريحة، وأغراض السباحة والاستجمام.",
    items: [
      { category: "packing", titleEn: "High-protection sunscreen & lip balm", titleAr: "واقي شمس بحماية عالية ومرطب شفاه", required: true },
      { category: "packing", titleEn: "Swimwear, cover-ups, and beach towel", titleAr: "ملابس السباحة ورداء ومنشفة شاطئ", required: true },
      { category: "packing", titleEn: "Sunglasses and wide sun hat", titleAr: "نظارات شمسية وقبعة واقية من الشمس", required: true },
      { category: "packing", titleEn: "Waterproof phone pouch or dry bag", titleAr: "حقيبة مقاومة للماء لحفظ الهاتف والأشياء الثمينة", required: false },
      { category: "health", titleEn: "Soothing aloe vera / after-sun lotion", titleAr: "جل الصبار لتهدئة البشرة بعد الشمس", required: false },
    ],
  },
  {
    id: "work_trip",
    nameEn: "Work / Conference Trip",
    nameAr: "رحلة عمل أو مؤتمر",
    descriptionEn: "Professional attire, presentation tech, and itinerary prep.",
    descriptionAr: "ملابس رسمية، تجهيزات تقنية للعرض، وتنظيم دقيق للمواعيد.",
    items: [
      { category: "packing", titleEn: "Laptop, charger, and display adapters (HDMI/USB-C)", titleAr: "الحاسوب والشاحن ومحولات العرض (HDMI/USB-C)", required: true },
      { category: "documents", titleEn: "Conference badge / invitation credentials", titleAr: "بطاقة المؤتمر أو إثبات الحضور والفعاليات", required: true },
      { category: "packing", titleEn: "Steamed professional outfits & formal shoes", titleAr: "ملابس العمل الرسمية وأحذية مناسبة", required: true },
      { category: "documents", titleEn: "Business cards or digital contact QR", titleAr: "بطاقات العمل أو رمز QR لبيانات التواصل", required: false },
      { category: "money", titleEn: "Receipt folder / pocket for expense tracking", titleAr: "حفظ الفواتير لمطابقة مصاريف العمل لاحقاً", required: true },
    ],
  },
];
