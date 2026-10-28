import test from "node:test";
import assert from "node:assert/strict";

class OverlayManager {
  constructor() {
    this.stack = [];
  }
  register(handler) {
    this.unregister(handler.id);
    this.stack.push({ priority: 0, ...handler });
    this.stack.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return () => this.unregister(handler.id);
  }
  unregister(id) {
    this.stack = this.stack.filter((h) => h.id !== id);
  }
  hasActiveOverlay() {
    return this.stack.length > 0;
  }
  handleBack() {
    if (this.stack.length === 0) return false;
    const top = this.stack.shift();
    if (!top) return false;
    return top.onDismiss() !== false;
  }
}

test("OverlayManager: registers and pops in LIFO priority order", () => {
  const manager = new OverlayManager();
  let dismissed = [];
  manager.register({ id: "modal-1", onDismiss: () => dismissed.push(1), priority: 1 });
  manager.register({ id: "modal-2", onDismiss: () => dismissed.push(2), priority: 2 });
  assert.equal(manager.hasActiveOverlay(), true);
  const handled1 = manager.handleBack();
  assert.equal(handled1, true);
  assert.deepEqual(dismissed, [2]);
  const handled2 = manager.handleBack();
  assert.equal(handled2, true);
  assert.deepEqual(dismissed, [2, 1]);
  assert.equal(manager.hasActiveOverlay(), false);
});