/**
 * AYXA Planner Pro — Google Play & App Store Monetization Engine
 * Powered by RevenueCat (@revenuecat/purchases-capacitor) + Google Play Billing.
 *
 * Setup for Production Earning:
 * 1. Create a free RevenueCat project (https://app.revenuecat.com) and connect your Google Play Console app (`com.ayxaplanner.app`).
 * 2. Create Entitlement ID: `ayxa_pro`
 * 3. Create Google Play Products & attach them to the `default` Offering:
 *    - `ayxa_pro_monthly`  ($4.99 / month)
 *    - `ayxa_pro_yearly`   ($29.99 / year — 7-day free trial)
 *    - `ayxa_pro_lifetime` ($59.99 one-time)
 * 4. Add your RevenueCat Public Android API key to `.env`:
 *    VITE_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxx
 *    VITE_REVENUECAT_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxx
 */

import { Capacitor } from "@capacitor/core";

export const AYXA_PRO_ENTITLEMENT_ID = "ayxa_pro";

export type ProPlanId = "monthly" | "yearly" | "lifetime";

export type ProFeatureKey =
  | "unlimited_ai"
  | "luxury_themes"
  | "business_studio"
  | "travel_studio"
  | "cloud_backup";

export interface ProPlanOffering {
  id: ProPlanId;
  productId: string;
  rcPackageType: "MONTHLY" | "ANNUAL" | "LIFETIME";
  titleEn: string;
  titleAr: string;
  priceString: string;
  periodEn: string;
  periodAr: string;
  badgeEn?: string;
  badgeAr?: string;
  subtextEn: string;
  subtextAr: string;
  hasFreeTrial?: boolean;
  /** Native RevenueCat package object when loaded on Android/iOS */
  nativePackage?: any;
}

export interface ProSubscriptionState {
  isPro: boolean;
  planId?: ProPlanId | null;
  expiresAt?: string | null;
  isTrial?: boolean;
  source?: "google_play" | "app_store" | "preview" | "none";
  updatedAt?: string;
}

export const DEFAULT_PRO_PLANS: ProPlanOffering[] = [
  {
    id: "yearly",
    productId: "ayxa_pro_yearly",
    rcPackageType: "ANNUAL",
    titleEn: "Yearly Glow Pass",
    titleAr: "الباقة السنوية الملكية",
    priceString: "$29.99",
    periodEn: "/ year",
    periodAr: "/ سنة",
    badgeEn: "BEST VALUE · SAVE 50%",
    badgeAr: "الأكثر توفيراً · خصم 50%",
    subtextEn: "7-day free trial · Just $2.49/month",
    subtextAr: "تجربة مجانية 7 أيام · فقط 2.49$ شهرياً",
    hasFreeTrial: true,
  },
  {
    id: "monthly",
    productId: "ayxa_pro_monthly",
    rcPackageType: "MONTHLY",
    titleEn: "Monthly Pro",
    titleAr: "الباقة الشهرية",
    priceString: "$4.99",
    periodEn: "/ month",
    periodAr: "/ شهر",
    subtextEn: "Flexible monthly · Cancel anytime",
    subtextAr: "مرونة شهرية · يمكنكِ الإلغاء في أي وقت",
    hasFreeTrial: false,
  },
  {
    id: "lifetime",
    productId: "ayxa_pro_lifetime",
    rcPackageType: "LIFETIME",
    titleEn: "Royal Lifetime",
    titleAr: "العضوية الدائمة مدى الحياة",
    priceString: "$59.99",
    periodEn: "one-time",
    periodAr: "دفعة واحدة",
    badgeEn: "PAY ONCE · OWN FOREVER",
    badgeAr: "ادفعي مرة واحدة للأبد 👑",
    subtextEn: "All future updates & AI upgrades included",
    subtextAr: "تشمل جميع التحديثات والمزايا المستقبلية",
    hasFreeTrial: false,
  },
];

export const FREE_THEMES = ["rose"] as const;
export const PRO_THEMES = ["emerald", "lavender", "gold", "mint", "ocean"] as const;

export function isThemeLocked(themeId: string, isPro: boolean): boolean {
  if (isPro) return false;
  return (PRO_THEMES as readonly string[]).includes(themeId);
}

export function canAccessProFeature(feature: ProFeatureKey, isPro: boolean): boolean {
  if (isPro) return true;
  // Core planner (Tasks, Habits, Routines, Goals, Deen, Journal, Wellness, Learning, Finance) is 100% Free!
  // Premium Pro features require AYXA Pro:
  return !["unlimited_ai", "luxury_themes", "business_studio", "travel_studio", "cloud_backup"].includes(
    feature
  );
}

let isConfigured = false;

function getRevenueCatApiKey(): string {
  const platform = Capacitor.getPlatform();
  const env = (import.meta as any)?.env || {};
  if (platform === "ios") {
    return env.VITE_REVENUECAT_IOS_KEY || "";
  }
  return env.VITE_REVENUECAT_ANDROID_KEY || "";
}

export function isNativeBillingConfigured(): boolean {
  if (!Capacitor.isNativePlatform()) return false;
  const key = getRevenueCatApiKey();
  return Boolean(key && !key.includes("xxxx") && key.length > 10);
}

/**
 * Initializes RevenueCat on native Android/iOS platforms.
 * Safe no-op on Web/SSR.
 */
export async function initializeBilling(appUserId?: string): Promise<boolean> {
  if (!isNativeBillingConfigured()) return false;
  if (isConfigured) return true;

  try {
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const apiKey = getRevenueCatApiKey();
    await Purchases.configure({
      apiKey,
      ...(appUserId && !appUserId.startsWith("guest_") ? { appUserID: appUserId } : {}),
    });
    isConfigured = true;
    return true;
  } catch (err) {
    console.warn("[AYXA Billing] RevenueCat init skipped:", err);
    return false;
  }
}

function extractEntitlementState(customerInfo: any): ProSubscriptionState {
  const activeEntitlement = customerInfo?.entitlements?.active?.[AYXA_PRO_ENTITLEMENT_ID];
  if (!activeEntitlement) {
    return {
      isPro: false,
      planId: null,
      expiresAt: null,
      isTrial: false,
      source: "none",
      updatedAt: new Date().toISOString(),
    };
  }

  const prodId = String(activeEntitlement.productIdentifier || "").toLowerCase();
  const planId: ProPlanId = prodId.includes("life")
    ? "lifetime"
    : prodId.includes("year") || prodId.includes("annual")
      ? "yearly"
      : "monthly";

  return {
    isPro: true,
    planId,
    expiresAt: activeEntitlement.expirationDate || null,
    isTrial: activeEntitlement.periodType === "TRIAL",
    source: Capacitor.getPlatform() === "ios" ? "app_store" : "google_play",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Fetches live localized prices from Google Play / App Store via RevenueCat,
 * falling back cleanly to DEFAULT_PRO_PLANS on Web or before RevenueCat keys are added.
 */
export async function fetchProOfferings(): Promise<ProPlanOffering[]> {
  if (!isNativeBillingConfigured()) {
    return DEFAULT_PRO_PLANS;
  }

  try {
    await initializeBilling();
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const offerings = await Purchases.getOfferings();
    const current = offerings?.current;
    if (!current || !Array.isArray(current.availablePackages) || current.availablePackages.length === 0) {
      return DEFAULT_PRO_PLANS;
    }

    return DEFAULT_PRO_PLANS.map((plan) => {
      const matchedPkg = current.availablePackages.find(
        (pkg: any) =>
          pkg.packageType === plan.rcPackageType ||
          pkg.product?.identifier === plan.productId
      );
      if (!matchedPkg) return plan;
      return {
        ...plan,
        priceString: matchedPkg.product?.priceString || plan.priceString,
        nativePackage: matchedPkg,
      };
    });
  } catch (err) {
    console.warn("[AYXA Billing] Falling back to default plans:", err);
    return DEFAULT_PRO_PLANS;
  }
}

/**
 * Checks whether the user currently has an active Google Play / App Store Pro entitlement.
 */
export async function checkProEntitlement(): Promise<ProSubscriptionState | null> {
  if (!isNativeBillingConfigured()) return null;

  try {
    await initializeBilling();
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const { customerInfo } = await Purchases.getCustomerInfo();
    return extractEntitlementState(customerInfo);
  } catch {
    return null;
  }
}

/**
 * Purchases an AYXA Pro plan via Google Play Billing / Apple IAP (via RevenueCat).
 * On web preview without native billing, returns a clean preview activation result.
 */
export async function purchaseProPlan(
  plan: ProPlanOffering
): Promise<{
  success: boolean;
  cancelled?: boolean;
  subscription?: ProSubscriptionState;
  error?: string;
}> {
  if (isNativeBillingConfigured()) {
    try {
      await initializeBilling();
      const { Purchases } = await import("@revenuecat/purchases-capacitor");

      let targetPackage = plan.nativePackage;
      if (!targetPackage) {
        const refreshed = await fetchProOfferings();
        targetPackage = refreshed.find((p) => p.id === plan.id)?.nativePackage;
      }

      if (!targetPackage) {
        return {
          success: false,
          error: "Google Play product is not active yet. Please verify your RevenueCat offering.",
        };
      }

      const result = await Purchases.purchasePackage({ aPackage: targetPackage });
      const subState = extractEntitlementState(result.customerInfo);
      return {
        success: subState.isPro,
        subscription: subState,
        error: subState.isPro ? undefined : "Entitlement not active after purchase.",
      };
    } catch (err: any) {
      const msg = String(err?.message || "");
      const cancelled = Boolean(err?.userCancelled) || msg.toLowerCase().includes("cancel");
      return {
        success: false,
        cancelled,
        error: cancelled ? undefined : msg || "Purchase could not be completed.",
      };
    }
  }

  // Web / Local Preview Mode — lets the app owner test the entire Pro upgrade UX before publishing
  const expires =
    plan.id === "lifetime"
      ? null
      : new Date(
          Date.now() + (plan.id === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000
        ).toISOString();

  return {
    success: true,
    subscription: {
      isPro: true,
      planId: plan.id,
      expiresAt: expires,
      isTrial: Boolean(plan.hasFreeTrial),
      source: "preview",
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Restores existing Google Play / App Store purchases (Required by Google Play & Apple Review).
 */
export async function restoreProPurchases(): Promise<{
  success: boolean;
  isPro: boolean;
  subscription?: ProSubscriptionState;
  error?: string;
}> {
  if (!isNativeBillingConfigured()) {
    return {
      success: true,
      isPro: false,
      error: "Restore purchases is available on Google Play / App Store builds.",
    };
  }

  try {
    await initializeBilling();
    const { Purchases } = await import("@revenuecat/purchases-capacitor");
    const { customerInfo } = await Purchases.restorePurchases();
    const subState = extractEntitlementState(customerInfo);
    return {
      success: true,
      isPro: subState.isPro,
      subscription: subState,
    };
  } catch (err: any) {
    return {
      success: false,
      isPro: false,
      error: err?.message || "Could not restore purchases right now.",
    };
  }
}
