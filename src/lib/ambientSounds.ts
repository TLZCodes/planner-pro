/**
 * Procedural Web Audio Ambient Soundscape Generator — AYXA Planner Pro
 * 100% offline, procedural sound generator with zero external network requests.
 * Uses Web Audio API pink/brown noise and biquad filter modulation.
 */

export interface AmbientSoundDefinition {
  id: string;
  nameEn: string;
  nameAr: string;
  emoji: string;
  descriptionEn: string;
  descriptionAr: string;
}

export const AMBIENT_SOUND_CATALOG: AmbientSoundDefinition[] = [
  {
    id: "rain",
    nameEn: "Soft Rain",
    nameAr: "مطر ناعم",
    emoji: "🌧️",
    descriptionEn: "Gentle drops falling on leaves for steady relaxation.",
    descriptionAr: "قطرات مطر هادئة تساعد على الاسترخاء والتركيز.",
  },
  {
    id: "waves",
    nameEn: "Ocean Waves",
    nameAr: "أمواج البحر",
    emoji: "🌊",
    descriptionEn: "Rhythmic rolling shoreline waves.",
    descriptionAr: "أمواج شاطئية إيقاعية لتهدئة الذهن.",
  },
  {
    id: "forest",
    nameEn: "Deep Forest",
    nameAr: "غابة هادئة",
    emoji: "🌲",
    descriptionEn: "Gentle woodland breeze and rustling leaves.",
    descriptionAr: "نسيم الغابة وأوراق الشجر لصفاء الذهن.",
  },
  {
    id: "fireplace",
    nameEn: "Cozy Fireplace",
    nameAr: "مدفأة دافئة",
    emoji: "🔥",
    descriptionEn: "Warm wood-burning fireplace crackles.",
    descriptionAr: "صوت الخشب الدافئ للشعور بالراحة.",
  },
  {
    id: "pink_noise",
    nameEn: "Focus Pink Noise",
    nameAr: "ضجيج وردي للتركيز",
    emoji: "🧘‍♀️",
    descriptionEn: "Balanced 1/f noise scientifically proven to enhance focus.",
    descriptionAr: "ترددات متوازنة مثبتة علميًا لزيادة الانتباه والإنتاجية.",
  },
];

class AmbientAudioManager {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: AudioNode | null = null;
  private modulationInterval: number | null = null;
  private currentVolume: number = 0.5;

  private getAudioContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private createPinkNoiseBuffer(ctx: AudioContext, seconds: number = 4): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.76160 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // normalise volume
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public play(type: string, volume: number = 0.5) {
    if (typeof window === "undefined") return;

    if (this.currentType === type && this.gainNode) {
      // Already playing, just update volume
      this.setVolume(volume);
      return;
    }

    this.stop();

    try {
      const ctx = this.getAudioContext();
      this.currentVolume = volume;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.01, volume * 0.25), ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.gainNode = masterGain;

      const noiseBuffer = this.createPinkNoiseBuffer(ctx, 4);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();

      if (type === "rain") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);
        noiseSource.connect(filter);
        filter.connect(masterGain);
      } else if (type === "waves") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        noiseSource.connect(filter);
        filter.connect(masterGain);

        // Modulate gain smoothly like ocean waves (4-second cycle)
        let waveTime = 0;
        this.modulationInterval = window.setInterval(() => {
          if (!this.gainNode || !this.ctx) return;
          waveTime += 0.1;
          const waveFactor = (Math.sin(waveTime * 1.2) + 1) / 2; // 0 to 1
          const targetGain = Math.max(0.02, this.currentVolume * 0.3 * (0.3 + 0.7 * waveFactor));
          this.gainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
        }, 100);
      } else if (type === "forest") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1200, ctx.currentTime);
        filter.Q.setValueAtTime(2.0, ctx.currentTime);
        noiseSource.connect(filter);
        filter.connect(masterGain);
      } else if (type === "fireplace") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        noiseSource.connect(filter);
        filter.connect(masterGain);
      } else {
        // pink_noise
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3000, ctx.currentTime);
        noiseSource.connect(filter);
        filter.connect(masterGain);
      }

      noiseSource.start();
      this.sourceNode = noiseSource;
      this.currentType = type;
    } catch {
      // AudioContext failure fallback
      this.currentType = null;
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.currentVolume * 0.25, this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    if (this.modulationInterval) {
      clearInterval(this.modulationInterval);
      this.modulationInterval = null;
    }
    if (this.sourceNode) {
      try {
        (this.sourceNode as AudioBufferSourceNode).stop();
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
    this.currentType = null;
  }

  public getCurrentType(): string | null {
    return this.currentType;
  }
}

export const ambientSoundManager = new AmbientAudioManager();
