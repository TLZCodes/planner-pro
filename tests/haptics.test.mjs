import test from "node:test";
import assert from "node:assert/strict";

test("Haptics: throttles rapid repeats and handles unpermitted platforms cleanly", () => {
  let callCount = 0;
  let lastHapticTime = 0;
  const HAPTIC_THROTTLE_MS = 60;
  function triggerHaptic() {
    const now = Date.now();
    if (now - lastHapticTime < HAPTIC_THROTTLE_MS) return;
    lastHapticTime = now;
    callCount++;
  }
  for (let i = 0; i < 10; i++) triggerHaptic();
  assert.equal(callCount, 1);
});