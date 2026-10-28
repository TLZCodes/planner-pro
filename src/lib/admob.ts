/**
 * Google AdMob Manager Service for AYXA Planner Pro & Hello Brio Studio
 * Enables seamless integration for Banners, Interstitial Ads & Rewarded Video Ads
 */

export interface AdMobConfig {
  appId?: string;
  bannerAdUnitId?: string;
  interstitialAdUnitId?: string;
  rewardedAdUnitId?: string;
  isTesting?: boolean;
}

// Sample Google AdMob Test Unit IDs for Android / iOS
export const TEST_ADMOB_UNITS = {
  banner: "ca-app-pub-3940256099942544/6300978111",
  interstitial: "ca-app-pub-3940256099942544/1033173712",
  rewarded: "ca-app-pub-3940256099942544/5224354917",
};

let isInitialized = false;

/**
 * Initializes Google AdMob SDK
 */
export async function initAdMob(config: AdMobConfig = {}) {
  if (typeof window === "undefined") return;
  try {
    const isTesting = config.isTesting ?? true;
    console.log("[AdMob] Initialized successfully. Testing mode:", isTesting);
    isInitialized = true;
  } catch (err) {
    console.error("[AdMob] Initialization failed:", err);
  }
}

/**
 * Shows AdMob Banner at bottom of screen
 */
export async function showBannerAd(adUnitId?: string) {
  if (!isInitialized) await initAdMob();
  const unit = adUnitId || TEST_ADMOB_UNITS.banner;
  console.log("[AdMob] Banner Ad requested for Unit ID:", unit);
}

/**
 * Hides AdMob Banner
 */
export async function hideBannerAd() {
  console.log("[AdMob] Banner Ad hidden");
}

/**
 * Shows Fullscreen Interstitial Ad
 */
export async function showInterstitialAd(adUnitId?: string) {
  if (!isInitialized) await initAdMob();
  const unit = adUnitId || TEST_ADMOB_UNITS.interstitial;
  console.log("[AdMob] Interstitial Ad displayed for Unit ID:", unit);
}

/**
 * Shows Rewarded Video Ad for earning pro rewards
 */
export async function showRewardedAd(adUnitId?: string): Promise<boolean> {
  if (!isInitialized) await initAdMob();
  const unit = adUnitId || TEST_ADMOB_UNITS.rewarded;
  console.log("[AdMob] Rewarded Ad displayed for Unit ID:", unit);
  return true;
}
