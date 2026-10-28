/**
 * Finance Security & Lock Manager
 * SHA-256 Web Crypto PIN Hashing & WebAuthn Biometrics
 */

const PIN_SALT = "ayxa_finance_salt_v1_secure_key";

/**
 * Computes SHA-256 hash of a PIN using standard Web Crypto API.
 */
export async function hashPin(pin: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    // Basic fallback for non-crypto environments
    let hash = 0;
    const str = pin + PIN_SALT;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(16);
  }

  const enc = new TextEncoder();
  const data = enc.encode(pin + PIN_SALT);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Checks if biometric authentication (Face ID / Touch ID / Fingerprint) is supported on device.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch {
    return false;
  }
  return false;
}

// In-memory unlocked state for current app session
let isUnlockedSession = false;
let lastUnlockedAt = 0;

export function isFinanceSessionUnlocked(autoLockMinutes = 5): boolean {
  if (!isUnlockedSession) return false;
  if (autoLockMinutes <= 0) return true;
  const now = Date.now();
  const elapsedMinutes = (now - lastUnlockedAt) / (1000 * 60);
  if (elapsedMinutes > autoLockMinutes) {
    isUnlockedSession = false;
    return false;
  }
  return true;
}

export function setFinanceSessionUnlocked(unlocked: boolean): void {
  isUnlockedSession = unlocked;
  lastUnlockedAt = unlocked ? Date.now() : 0;
}
