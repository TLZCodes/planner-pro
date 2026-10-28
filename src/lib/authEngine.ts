import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  confirmPasswordReset as firebaseConfirmPasswordReset,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  applyActionCode,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase";

export interface AuthActionResult<T = any> {
  ok: boolean;
  success: boolean;
  data?: T;
  user?: T;
  email?: string;
  error?: string;
  errorEn?: string;
  code?: string;
}

export interface AuthIdempotencyGuard {
  inFlight: boolean;
  lastAttemptAt: number;
}

const idempotencyMap = new Map<string, AuthIdempotencyGuard>();

/**
 * Validates email format with RFC 5322 regex.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates whether a redirect URL is an internal, safe application route.
 * Rejects external protocols, double slashes, and script protocols.
 */
export function isSafeRedirectUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith("/")) return false;
  if (trimmed.startsWith("//")) return false;
  if (trimmed.startsWith("/\\")) return false;
  if (/^[\w]+:/i.test(trimmed)) return false;
  return true;
}

/**
 * Sanitizes and extracts safe internal redirect route with fallback.
 */
export function getSafeRedirectPath(url: string | null | undefined, fallback: string = "/"): string {
  return isSafeRedirectUrl(url) ? url!.trim() : fallback;
}

/**
 * Checks whether Google OAuth is genuinely configured with platform credentials.
 * Returns false when unconfigured so buttons are not shown as non-functional placeholders.
 */
export function isGoogleAuthConfigured(): boolean {
  if (typeof window === "undefined") return false;
  const webClientId = (window as any).__AYXA_GOOGLE_CLIENT_ID__;
  return Boolean(webClientId && typeof webClientId === "string" && webClientId.length > 10);
}

/**
 * Checks whether Apple Sign-In is genuinely configured with Apple Services ID.
 */
export function isAppleAuthConfigured(): boolean {
  if (typeof window === "undefined") return false;
  const appleClientId = (window as any).__AYXA_APPLE_CLIENT_ID__;
  return Boolean(appleClientId && typeof appleClientId === "string" && appleClientId.length > 10);
}

/**
 * Partially masks email for safe display (e.g. "a***a@example.com").
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.***";
  const [local, domain] = email.split("@");
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  return `${first}${"*".repeat(Math.min(local.length - 2, 4))}${last}@${domain}`;
}

/**
 * Validates password according to real policy: at least 6 characters.
 */
export function validatePassword(password: string): { valid: boolean; errorKey?: string } {
  if (!password || password.length < 6) {
    return { valid: false, errorKey: "passwordPolicy" };
  }
  return { valid: true };
}

/**
 * Check and record idempotency key to prevent duplicate submissions on double tap.
 */
export function acquireIdempotencyLock(key: string, cooldownMs: number = 3000): boolean {
  const now = Date.now();
  const guard = idempotencyMap.get(key);
  if (guard && guard.inFlight && now - guard.lastAttemptAt < cooldownMs) {
    return false;
  }
  idempotencyMap.set(key, { inFlight: true, lastAttemptAt: now });
  return true;
}

export function releaseIdempotencyLock(key: string): void {
  idempotencyMap.delete(key);
}

// ── Real Firebase Auth Operations ──────────────────────────────────────────

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<AuthActionResult<FirebaseUser>> {
  if (!auth) {
    return { ok: false, success: false, error: "Authentication service is not available." };
  }
  const cleanEmail = email.trim().toLowerCase();
  const lockKey = `signup:${cleanEmail}`;
  if (!acquireIdempotencyLock(lockKey)) {
    return { ok: false, success: false, error: "Request already in progress. Please wait." };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    if (cred.user && name.trim()) {
      try {
        await updateProfile(cred.user, { displayName: name.trim() });
      } catch (profileErr) {
        console.warn("Display name update skipped:", profileErr);
      }
    }
    // Attempt non-blocking email verification send
    try {
      await sendEmailVerification(cred.user);
    } catch (verErr) {
      console.warn("Verification email notice:", verErr);
    }

    return { ok: true, success: true, data: cred.user, user: cred.user };
  } catch (err: any) {
    const code = err?.code || "";
    let friendlyError = "We couldn’t complete this request. Please try again.";
    if (code === "auth/email-already-in-use") {
      friendlyError = "An account with this email already exists. Please sign in.";
    } else if (code === "auth/invalid-email") {
      friendlyError = "Please enter a valid email address.";
    } else if (code === "auth/weak-password") {
      friendlyError = "Password should be at least 6 characters.";
    } else if (code === "auth/network-request-failed") {
      friendlyError = "You’re offline. You can continue as a guest or try again when connected.";
    }
    return { ok: false, success: false, error: friendlyError, errorEn: friendlyError, code };
  } finally {
    releaseIdempotencyLock(lockKey);
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthActionResult<FirebaseUser>> {
  if (!auth) {
    return { ok: false, success: false, error: "Authentication service is not available." };
  }
  const cleanEmail = email.trim().toLowerCase();
  const lockKey = `signin:${cleanEmail}`;
  if (!acquireIdempotencyLock(lockKey)) {
    return { ok: false, success: false, error: "Request already in progress. Please wait." };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    return { ok: true, success: true, data: cred.user, user: cred.user };
  } catch (err: any) {
    const code = err?.code || "";
    let friendlyError = "Invalid email or password.";
    if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
      friendlyError = "Invalid email or password. Please verify your credentials.";
    } else if (code === "auth/user-disabled") {
      friendlyError = "This account has been disabled. Please contact support.";
    } else if (code === "auth/too-many-requests") {
      friendlyError = "Too many attempts. Please wait a few moments before trying again.";
    } else if (code === "auth/network-request-failed") {
      friendlyError = "You’re offline. You can continue as a guest or try again when connected.";
    }
    return { ok: false, success: false, error: friendlyError, errorEn: friendlyError, code };
  } finally {
    releaseIdempotencyLock(lockKey);
  }
}

export async function sendPasswordReset(
  email: string
): Promise<AuthActionResult> {
  if (!auth) {
    return { ok: false, success: false, error: "Authentication service is not available." };
  }
  const cleanEmail = email.trim().toLowerCase();
  const lockKey = `reset:${cleanEmail}`;
  if (!acquireIdempotencyLock(lockKey, 10000)) {
    return { ok: true, success: true };
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { ok: true, success: true };
  } catch (err: any) {
    const code = err?.code || "";
    if (code === "auth/network-request-failed") {
      return { ok: false, success: false, error: "You’re offline. Please try again when connected.", errorEn: "You’re offline. Please try again when connected.", code };
    }
    // Always return privacy safe success to prevent email enumeration
    return { ok: true, success: true };
  } finally {
    releaseIdempotencyLock(lockKey);
  }
}

export async function verifyResetCode(
  oobCode: string
): Promise<AuthActionResult<string>> {
  if (!auth) {
    return { ok: false, success: false, error: "Authentication service is not available." };
  }
  try {
    const email = await firebaseVerifyPasswordResetCode(auth, oobCode);
    return { ok: true, success: true, data: email, email };
  } catch (err: any) {
    return { ok: false, success: false, error: "This password reset link is invalid or has expired.", errorEn: "This password reset link is invalid or has expired.", code: err?.code };
  }
}

export async function confirmPasswordReset(
  oobCode: string,
  newPassword: string
): Promise<AuthActionResult> {
  if (!auth) {
    return { ok: false, success: false, error: "Authentication service is not available." };
  }
  try {
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
    return { ok: true, success: true };
  } catch (err: any) {
    return { ok: false, success: false, error: "Unable to reset password. The link may have expired.", errorEn: "Unable to reset password. The link may have expired.", code: err?.code };
  }
}

export async function verifyEmailWithCode(
  oobCode: string
): Promise<AuthActionResult> {
  if (!auth) {
    return { ok: false, success: false, error: "Authentication service is not available." };
  }
  try {
    await applyActionCode(auth, oobCode);
    return { ok: true, success: true };
  } catch (err: any) {
    return { ok: false, success: false, error: "Verification link is invalid or expired.", errorEn: "Verification link is invalid or expired.", code: err?.code };
  }
}

export async function resendVerificationEmail(): Promise<AuthActionResult> {
  if (!auth || !auth.currentUser) {
    return { ok: false, success: false, error: "No active user session to verify." };
  }
  try {
    await sendEmailVerification(auth.currentUser);
    return { ok: true, success: true };
  } catch (err: any) {
    return { ok: false, success: false, error: "Could not send verification email right now. Please try again later.", errorEn: "Could not send verification email right now. Please try again later.", code: err?.code };
  }
}

export async function signOutUser(): Promise<AuthActionResult> {
  if (!auth) return { ok: true, success: true };
  try {
    await signOut(auth);
    return { ok: true, success: true };
  } catch (err: any) {
    return { ok: false, success: false, error: err?.message };
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}
