/**
 * AYXA Muse Pro — Multilingual & Multi-Dialect Feminine AI Voice Engine
 * Supports:
 * - All Arabic Dialects (Moroccan Darija, Saudi/Gulf, Egyptian, Levantine, Emirati, Algerian/Tunisian, Iraqi, Fusha)
 * - International Languages (French, Spanish, German, Turkish, Italian, Portuguese, Russian, English, etc.)
 * - Hybrid Cloud Neural Audio Stream (/api/tts + Google GTX Neural Audio) + Native Feminine TTS
 *   so Arabic and all foreign languages play out loud 100% reliably even on Windows PCs without OS language packs!
 */

export interface AiDialectOption {
  id: string;
  bcp47: string;
  flag: string;
  labelAr: string;
  labelEn: string;
  promptInstruction: string;
}

export const AI_DIALECT_OPTIONS: AiDialectOption[] = [
  {
    id: "auto",
    bcp47: "ar-SA",
    flag: "🌍",
    labelAr: "تلقائي ذكي (يتحدث بنفس لغتكِ أو لهجتكِ)",
    labelEn: "Smart Auto-Detect (Matches your language/dialect)",
    promptInstruction:
      "Automatically detect the exact language OR Arabic dialect the user writes in (whether Standard Arabic, Moroccan Darija, Saudi/Gulf, Egyptian, Levantine, Algerian/Tunisian, Iraqi, French, Spanish, German, Turkish, Italian, or English) and reply fluently in that exact same language or dialect!",
  },
  {
    id: "ar-fusha",
    bcp47: "ar-SA",
    flag: "🕌",
    labelAr: "العربية الفصحى الراقية",
    labelEn: "Modern Standard Arabic (Fusha)",
    promptInstruction:
      "Reply in elegant, warm, modern Standard Arabic (العربية الفصحى الراقية) with sisterly feminine addressing.",
  },
  {
    id: "ar-MA",
    bcp47: "ar-MA",
    flag: "🇲🇦",
    labelAr: "الدارجة المغربية (Moroccan Darija)",
    labelEn: "Moroccan Darija (الدارجة المغربية)",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Moroccan Darija (الدارجة المغربية الأنثوية اللطيفة، مثل: الزين ديالي، حبيبتي، غادي نرتبو نهارك، بالصحة والراحة، بشوية عليك).",
  },
  {
    id: "ar-SA",
    bcp47: "ar-SA",
    flag: "🇸🇦",
    labelAr: "اللهجة السعودية والخليجية",
    labelEn: "Saudi & Khaleeji Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Saudi / Khaleeji feminine Arabic (اللهجة السعودية والخليجية اللطيفة، مثل: يا قلبي، أبشري، ولا يهمك، بنرتب يومك بكل هدوء).",
  },
  {
    id: "ar-EG",
    bcp47: "ar-EG",
    flag: "🇪🇬",
    labelAr: "اللهجة المصرية",
    labelEn: "Egyptian Arabic Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Egyptian feminine Arabic (اللهجة المصرية اللطيفة، مثل: يا قمر، حبيبتي، يلا نرتب يومك، خطوة بخطوة ومن غير أي ضغط).",
  },
  {
    id: "ar-LB",
    bcp47: "ar-LB",
    flag: "🇱🇧",
    labelAr: "اللهجة الشامية (لبنانية / سورية)",
    labelEn: "Levantine (Lebanese / Syrian)",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Levantine (Lebanese/Syrian) feminine Arabic (اللهجة الشامية اللطيفة، مثل: تكرم عينك يا حلوة، رح نرتب يومك برواق وهدوء).",
  },
  {
    id: "ar-AE",
    bcp47: "ar-AE",
    flag: "🇦🇪",
    labelAr: "اللهجة الإماراتية",
    labelEn: "Emirati Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Emirati feminine Arabic (اللهجة الإماراتية الراقية، مثل: فالج طيب يا الغلا، بنرتب جدولج بكل راحة).",
  },
  {
    id: "ar-DZ",
    bcp47: "ar-DZ",
    flag: "🇩🇿",
    labelAr: "اللهجة الجزائرية والتونسية",
    labelEn: "Algerian & Tunisian Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Algerian/Tunisian feminine Arabic (اللهجة الجزائرية والتونسية اللطيفة، مثل: حنونة، يعيشك، راح نرتبو نهارك بالعقل وبكل راحة).",
  },
  {
    id: "ar-IQ",
    bcp47: "ar-IQ",
    flag: "🇮🇶",
    labelAr: "اللهجة العراقية",
    labelEn: "Iraqi Dialect",
    promptInstruction:
      "Reply naturally and warmly in authentic, sweet Iraqi feminine Arabic (اللهجة العراقية اللطيفة، مثل: عيوني، تدللين حبيبتي، راح نرتب يومج بهدوء).",
  },
  {
    id: "fr-FR",
    bcp47: "fr-FR",
    flag: "🇫🇷",
    labelAr: "الفرنسية (Français)",
    labelEn: "Français (French)",
    promptInstruction:
      "Reply fluently in chic, warm, sisterly French (Français).",
  },
  {
    id: "es-ES",
    bcp47: "es-ES",
    flag: "🇪🇸",
    labelAr: "الإسبانية (Español)",
    labelEn: "Español (Spanish)",
    promptInstruction:
      "Reply fluently in warm, empowering, sisterly Spanish (Español).",
  },
  {
    id: "de-DE",
    bcp47: "de-DE",
    flag: "🇩🇪",
    labelAr: "الألمانية (Deutsch)",
    labelEn: "Deutsch (German)",
    promptInstruction:
      "Reply fluently in warm, mindful, structured German (Deutsch).",
  },
  {
    id: "tr-TR",
    bcp47: "tr-TR",
    flag: "🇹🇷",
    labelAr: "التركية (Türkçe)",
    labelEn: "Türkçe (Turkish)",
    promptInstruction:
      "Reply fluently in warm, sisterly Turkish (Türkçe).",
  },
  {
    id: "it-IT",
    bcp47: "it-IT",
    flag: "🇮🇹",
    labelAr: "الإيطالية (Italiano)",
    labelEn: "Italiano (Italian)",
    promptInstruction:
      "Reply fluently in warm, elegant Italian (Italiano).",
  },
  {
    id: "en-US",
    bcp47: "en-US",
    flag: "🇺🇸",
    labelAr: "الإنجليزية (English)",
    labelEn: "English",
    promptInstruction:
      "Reply fluently in warm, aesthetic, sisterly English.",
  },
];

export function cleanTextForSpeech(markdownText: string): string {
  if (!markdownText) return "";
  return (
    markdownText
      // Remove structured JSON blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove markdown headings, bold, italics, inline code
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      // Replace bullet markers with natural pause
      .replace(/^\s*[-*•]\s+/gm, ". ")
      // Strip decorative emojis & symbols
      .replace(/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}♡✨🌸👑🌙🌷🎀📋⚡🪙🔒۞]/gu, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Automatically detects the language code (ar, fr, es, de, tr, it, pt, ru, en) of any text
 */
export function detectTextLanguage(text: string, fallbackLang = "ar"): string {
  if (!text) return fallbackLang;

  // 1. Arabic script detection
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabicChars > 4) return "ar";

  // 2. Cyrillic (Russian)
  if (/[\u0400-\u04FF]/.test(text)) return "ru";

  const lower = ` ${text.toLowerCase()} `;

  // 3. French markers
  if (
    /[éèêëàâùûçœ]/i.test(text) &&
    /\b(je|tu|nous|vous|pour|avec|dans|est|sont|une|journée|plan|objectif|routine|bonjour|merci|ma|belle)\b/i.test(
      lower
    )
  ) {
    return "fr";
  }
  if (
    /\b(bonjour|voici|journée|habitudes|objectifs|prends|temps|douceur|avec|pour|ton|ta|tes)\b/i.test(
      lower
    )
  ) {
    return "fr";
  }

  // 4. Spanish markers
  if (
    /[ñ¿¡]/i.test(text) ||
    /\b(hola|para|con|una|día|objetivos|rutina|hábitos|hermosa|gracias|puedes|vamos|tiempo)\b/i.test(
      lower
    )
  ) {
    return "es";
  }

  // 5. German markers
  if (
    /[äöüß]/i.test(text) ||
    /\b(hallo|und|für|mit|dein|deine|heute|tag|ziele|gewohnheiten|routine|schritt|ruhe)\b/i.test(
      lower
    )
  ) {
    return "de";
  }

  // 6. Turkish markers
  if (
    /[ğüşöçıİ]/i.test(text) &&
    /\b(merhaba|için|bir|gün|hedef|rutin|güzel|ile)\b/i.test(lower)
  ) {
    return "tr";
  }

  // 7. Italian markers
  if (
    /\b(ciao|bella|giornata|obiettivi|abitudini|per|con|una|della|passo)\b/i.test(
      lower
    )
  ) {
    return "it";
  }

  return "en";
}

/**
 * Splits long text into natural sentence chunks <= 170 chars for smooth neural audio streaming
 */
export function splitIntoSpeechChunks(text: string, maxLen = 165): string[] {
  const sentences = text
    .split(/(?<=[.!?؟،؛\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      // Split long sentence by words
      const words = sentence.split(/\s+/);
      let sub = "";
      for (const w of words) {
        if ((sub + " " + w).trim().length > maxLen) {
          if (sub) chunks.push(sub.trim());
          sub = w;
        } else {
          sub = (sub + " " + w).trim();
        }
      }
      if (sub) chunks.push(sub.trim());
    } else if ((current + " " + sentence).trim().length > maxLen) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current = (current + " " + sentence).trim();
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

/**
 * Finds a native voice strictly matching the requested language prefix (NEVER falls back to English for Arabic/French/etc.)
 */
export function selectBestFeminineVoice(
  voices: SpeechSynthesisVoice[],
  targetLangCode: string
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const baseLang = targetLangCode.split("-")[0].toLowerCase();
  const exactDialectVoices = voices.filter(
    (v) => v.lang.toLowerCase().replace("_", "-") === targetLangCode.toLowerCase()
  );
  const langVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(baseLang)
  );

  // CRITICAL: If the OS has NO voice for this language (e.g. Windows without Arabic/French pack), return null so Cloud Neural TTS takes over!
  if (langVoices.length === 0) return null;

  const pool = exactDialectVoices.length > 0 ? exactDialectVoices : langVoices;

  const preferredFemaleKeywords = [
    "zariyah",
    "salma",
    "fatima",
    "mouna",
    "layla",
    "amany",
    "amina",
    "reem",
    "hala",
    "amira",
    "laila",
    "mariam",
    "hoda",
    "noura",
    "rana",
    "denise",
    "amelie",
    "elvira",
    "paulina",
    "lucia",
    "katja",
    "vicki",
    "emel",
    "elsa",
    "aria",
    "jenny",
    "sonia",
    "samantha",
    "victoria",
    "karen",
    "ava",
    "siri",
    "google",
    "female",
    "zira",
  ];

  for (const kw of preferredFemaleKeywords) {
    const match = pool.find((v) => v.name.toLowerCase().includes(kw));
    if (match) return match;
  }

  return pool[0] || null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let sharedAudioElement: HTMLAudioElement | null = null;
let activeBlobUrl: string | null = null;
let isAudioCancelled = false;

function getOrCreateSharedAudio(): HTMLAudioElement {
  if (!sharedAudioElement && typeof window !== "undefined") {
    sharedAudioElement = new Audio();
    sharedAudioElement.preload = "auto";
  }
  return sharedAudioElement!;
}

/**
 * Unlocks the shared HTMLAudioElement during a synchronous user click/submit gesture
 * so auto-voice replies after streaming are never blocked by browser autoplay policies.
 */
export function primeAiVoiceOnUserGesture(): void {
  if (typeof window === "undefined") return;
  try {
    const audio = getOrCreateSharedAudio();
    // Tiny silent WAV data URI to unlock the audio element on user tap
    if (audio.paused && !audio.src) {
      audio.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      audio.volume = 0.01;
      const p = audio.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          audio.pause();
          audio.volume = 1.0;
        }).catch(() => {
          audio.volume = 1.0;
        });
      }
    }
  } catch {
    // Ignore gesture unlock errors
  }
}

export function stopAiVoice(): void {
  isAudioCancelled = true;
  if (sharedAudioElement) {
    try {
      sharedAudioElement.onended = null;
      sharedAudioElement.onerror = null;
      sharedAudioElement.pause();
      sharedAudioElement.removeAttribute("src");
    } catch {
      // Ignore audio pause errors
    }
  }
  if (activeBlobUrl && typeof URL !== "undefined") {
    try {
      URL.revokeObjectURL(activeBlobUrl);
    } catch {
      // Ignore revoke errors
    }
    activeBlobUrl = null;
  }
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore synthesis cancel errors
    }
  }
}

/**
 * Plays a paragraph chunk via our Studio-Grade Feminine Neural TTS (/api/tts)
 * using the persistent unlocked HTMLAudioElement.
 */
function playNeuralChunk(
  chunkText: string,
  baseLang: string,
  dialect: string,
  isFirstChunk: boolean
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isAudioCancelled || typeof window === "undefined") {
      resolve();
      return;
    }

    const audio = getOrCreateSharedAudio();
    audio.volume = 1.0;

    const encodedText = encodeURIComponent(chunkText);
    const ttsUrl = `/api/tts?lang=${encodeURIComponent(
      baseLang
    )}&dialect=${encodeURIComponent(dialect || "auto")}&q=${encodedText}`;

    audio.onended = () => {
      resolve();
    };

    audio.onerror = () => {
      reject(new Error("Neural audio stream error"));
    };

    // For the first chunk, assign src and call play() synchronously inside the user click tick
    if (isFirstChunk && chunkText.length <= 750) {
      audio.src = ttsUrl;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((err) => reject(err));
      }
      return;
    }

    // For subsequent or very long chunks, fetch via POST/GET blob and play on the unlocked audio element
    fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: chunkText,
        lang: baseLang,
        dialect: dialect || "auto",
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("audio")) {
          throw new Error("Invalid audio content-type");
        }
        const blob = await res.blob();
        if (isAudioCancelled) {
          resolve();
          return;
        }
        if (activeBlobUrl) {
          try {
            URL.revokeObjectURL(activeBlobUrl);
          } catch {
            // Ignore
          }
        }
        activeBlobUrl = URL.createObjectURL(blob);
        audio.src = activeBlobUrl;
        await audio.play();
      })
      .catch((err) => reject(err));
  });
}

/**
 * Speaks text in Arabic (any dialect: Moroccan Darija, Saudi, Egyptian, Levantine, Emirati, Algerian, Iraqi, Fusha)
 * or any international language (French, Spanish, German, Turkish, Italian, English)
 * using our Studio-Grade Microsoft Edge Natural Feminine Neural Voice Engine (/api/tts).
 */
export function speakAiText(params: {
  text: string;
  lang: string;
  dialect?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}): void {
  const cleaned = cleanTextForSpeech(params.text);
  if (!cleaned) {
    params.onEnd?.();
    return;
  }

  stopAiVoice();
  isAudioCancelled = false;

  // Determine the actual language of the reply text
  const detectedBaseLang = detectTextLanguage(cleaned, params.lang);
  const dialect = params.dialect || "auto";
  const preferredBcp47 =
    dialect !== "auto" && dialect.toLowerCase().startsWith(detectedBaseLang)
      ? dialect
      : detectedBaseLang;

  // Split into large natural paragraphs (up to 680 chars per neural stream)
  const chunks = splitIntoSpeechChunks(cleaned, 680);
  if (chunks.length === 0) {
    params.onEnd?.();
    return;
  }

  params.onStart?.();

  // Start the first chunk synchronously on the user's click gesture
  const firstPromise = playNeuralChunk(chunks[0], detectedBaseLang, dialect, true);

  void (async () => {
    try {
      await firstPromise;
      for (let i = 1; i < chunks.length; i++) {
        if (isAudioCancelled) break;
        await playNeuralChunk(chunks[i], detectedBaseLang, dialect, false);
      }
      if (!isAudioCancelled) {
        params.onEnd?.();
      }
    } catch {
      // Fallback to native speechSynthesis only if offline and a matching OS language voice exists
      if (!isAudioCancelled && isSpeechSynthesisSupported()) {
        const voices = window.speechSynthesis.getVoices();
        const nativeVoice = selectBestFeminineVoice(voices, preferredBcp47);
        if (nativeVoice) {
          setTimeout(() => {
            if (isAudioCancelled) return;
            const utterance = new SpeechSynthesisUtterance(cleaned);
            utterance.voice = nativeVoice;
            utterance.lang = nativeVoice.lang;
            utterance.pitch = 1.05;
            utterance.rate = 0.98;
            utterance.onend = () => params.onEnd?.();
            utterance.onerror = () => params.onError?.();
            window.speechSynthesis.speak(utterance);
          }, 60);
          return;
        }
      }
      params.onError?.();
    }
  })();
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

export interface VoiceRecognitionSession {
  stop: () => void;
}

export function startVoiceRecognition(params: {
  lang: string;
  dialect?: string;
  onTranscript: (text: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (errMessage: string) => void;
}): VoiceRecognitionSession | null {
  if (!isSpeechRecognitionSupported()) {
    params.onError?.("Speech recognition is not supported on this browser.");
    return null;
  }

  try {
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();

    // Use the exact dialect BCP-47 tag if chosen (e.g. ar-MA, ar-SA, ar-EG, fr-FR, es-ES, de-DE)
    const dialectOption = AI_DIALECT_OPTIONS.find((d) => d.id === params.dialect);
    recognition.lang =
      dialectOption && dialectOption.id !== "auto"
        ? dialectOption.bcp47
        : params.lang === "ar"
          ? "ar-SA"
          : "en-US";

    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    let finalAccumulated = "";

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) {
          finalAccumulated += res[0].transcript + " ";
          params.onTranscript(finalAccumulated.trim(), true);
        } else {
          interimTranscript += res[0].transcript;
          params.onTranscript(
            (finalAccumulated + interimTranscript).trim(),
            false
          );
        }
      }
    };

    recognition.onerror = (event: any) => {
      params.onError?.(event?.error || "voice_error");
    };

    recognition.onend = () => {
      params.onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // Ignore stop errors
        }
      },
    };
  } catch (err: any) {
    params.onError?.(err?.message || "Failed to start microphone.");
    return null;
  }
}
