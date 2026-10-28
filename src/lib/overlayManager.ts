export interface OverlayHandler {
  id: string;
  onDismiss: () => boolean | void;
  priority?: number; // Higher priority is dismissed first
}

class OverlayManager {
  private stack: OverlayHandler[] = [];

  register(handler: OverlayHandler): () => void {
    this.unregister(handler.id);
    this.stack.push({
      priority: 0,
      ...handler,
    });
    this.stack.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return () => this.unregister(handler.id);
  }

  unregister(id: string): void {
    this.stack = this.stack.filter((h) => h.id !== id);
  }

  hasActiveOverlay(): boolean {
    return this.stack.length > 0;
  }

  handleBack(): boolean {
    if (this.stack.length === 0) return false;
    const top = this.stack.shift();
    if (!top) return false;
    try {
      const handled = top.onDismiss();
      return handled !== false;
    } catch (err) {
      console.warn('Error dismissing overlay:', err);
      return true;
    }
  }

  clear(): void {
    this.stack = [];
  }
}

export const overlayManager = new OverlayManager();
