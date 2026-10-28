export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

let lastHapticTime = 0;
const HAPTIC_THROTTLE_MS = 60;

/**
 * Safe, non-blocking haptic feedback utility.
 * Never awaits or blocks the caller, gracefully handles absence of permissions or native support.
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  const now = Date.now();
  if (now - lastHapticTime < HAPTIC_THROTTLE_MS) {
    return; // Throttle rapid repeats
  }
  lastHapticTime = now;

  try {
    // Check if running on native Capacitor with Haptics plugin
    const Cap = (typeof window !== 'undefined' && (window as any).Capacitor) ? (window as any).Capacitor : null;
    if (Cap && Cap.isNativePlatform && Cap.isPluginAvailable && Cap.isPluginAvailable('Haptics')) {
      const Haptics = Cap.Plugins?.Haptics;
      if (Haptics) {
        if (type === 'selection') {
          Haptics.selectionStart?.().catch(() => {});
        } else if (type === 'success' || type === 'warning' || type === 'error') {
          Haptics.notification?.({ type: type.toUpperCase() }).catch(() => {});
        } else {
          Haptics.impact?.({ style: type.toUpperCase() }).catch(() => {});
        }
        return;
      }
    }

    // Harmless web no-op / non-blocking fallback
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(type === 'heavy' ? 30 : 15);
      } catch {
        // Silently ignore sandbox restrictions
      }
    }
  } catch {
    // Completely non-blocking
  }
}

export function safeVibrate(_pattern: number | number[] = 25): void {
  triggerHaptic('light');
}
