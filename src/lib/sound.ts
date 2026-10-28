/**
 * Notification and Interaction Sound Engine using Web Audio API
 * Generates pure, soothing, gentle crystal chimes and soft bell tones.
 * Guaranteed to work offline in Android WebView, Capacitor & all browsers.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export type SoundType = "chime" | "bell" | "sparkle" | "drop";

export const NOTIFICATION_SOUNDS: { id: SoundType; nameEn: string; nameAr: string; emoji: string }[] = [
  { id: "chime", nameEn: "Crystal Chime", nameAr: "رنين بلوري ناعم", emoji: "🔔" },
  { id: "bell", nameEn: "Peaceful Bell", nameAr: "جرس هادئ ومريح", emoji: "🎐" },
  { id: "sparkle", nameEn: "Aesthetic Sparkle", nameAr: "بريق ساحر لطيف", emoji: "✨" },
  { id: "drop", nameEn: "Gentle Raindrop", nameAr: "قطرة ندى عذبة", emoji: "💧" },
];

export function playNotificationSound(sound: SoundType = "chime", volume = 0.5): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (sound === "chime") {
      // Harmonic gentle 3-tone arpeggio: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.25 * volume, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.95);
      });
    } else if (sound === "bell") {
      // Deep soothing singing bowl / meditation chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(432, now); // 432 Hz healing vibration

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(864, now); // Harmonic octave

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3 * volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.7);
      osc2.stop(now + 1.7);
    } else if (sound === "sparkle") {
      // Rapid shimmering sparkle notes
      const notes = [587.33, 739.99, 880.0, 1174.66, 1479.98, 1760.0];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);

        gain.gain.setValueAtTime(0, now + idx * 0.045);
        gain.gain.linearRampToValueAtTime(0.2 * volume, now + idx * 0.045 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.045 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.55);
      });
    } else if (sound === "drop") {
      // Gentle warm water droplet pluck
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.35 * volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch (err) {
    console.warn("Could not play sound:", err);
  }
}
