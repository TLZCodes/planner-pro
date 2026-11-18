/**
 * AYXA Muse Pro — Feminine AI Voice Engine (TTS & Speech-to-Text)
 * Provides natural feminine voice synthesis (Arabic & English) and live voice dictation.
 */

export function cleanTextForSpeech(markdownText: string): string {
  if (!markdownText) return "";
  return (
    markdownText
      // Remove structured JSON blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove markdown headings, bold, italics, blockquotes
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      // Replace bullet markers with natural pause
      .replace(/^\s*[-*•]\s+/gm, ". ")
      // Strip decorative symbols & excessive emojis that sound awkward in TTS
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}♡✨🌸👑🌙🌷🎀📋⚡🪙🔒]/gu, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Selects the best natural feminine voice for Arabic or English
 */
export function selectBestFeminineVoice(
  voices: SpeechSynthesisVoice[],
  isAr: boolean
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const targetLangPrefix = isAr ? "ar" : "en";
  const langVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(targetLangPrefix)
  );

  const pool = langVoices.length > 0 ? langVoices : voices;

  // Preferred feminine voice names across iOS, macOS, Windows, Android, Chrome
  const preferredFemaleKeywords = isAr
    ? [
        "zariyah",
        "salma",
        "fatima",
        "hala",
        "amira",
        "laila",
        "mariam",
        "hoda",
        "noura",
        "rana",
        "female",
        "google العربية",
      ]
    : [
        "aria",
        "jenny",
        "sonia",
        "libby",
        "samantha",
        "victoria",
        "karen",
        "moira",
        "tessa",
        "ava",
        "allison",
        "siri",
        "google us english",
        "google uk english female",
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

export function stopAiVoice(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore synthesis cancel errors
    }
  }
}

export function speakAiText(params: {
  text: string;
  lang: "ar" | "en";
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}): void {
  if (!isSpeechSynthesisSupported()) {
    params.onError?.();
    return;
  }

  const cleaned = cleanTextForSpeech(params.text);
  if (!cleaned) {
    params.onEnd?.();
    return;
  }

  stopAiVoice();

  // Detect if the reply itself is primarily Arabic characters
  const arabicCharCount = (cleaned.match(/[\u0600-\u06FF]/g) || []).length;
  const isTextArabic = arabicCharCount > 12 || params.lang === "ar";

  const runSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(cleaned);
    const voices = window.speechSynthesis.getVoices();
    const chosenVoice = selectBestFeminineVoice(voices, isTextArabic);

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang;
    } else {
      utterance.lang = isTextArabic ? "ar-SA" : "en-US";
    }

    // Soft, warm, natural feminine cadence
    utterance.pitch = 1.05;
    utterance.rate = 0.98;
    utterance.volume = 1;

    utterance.onstart = () => params.onStart?.();
    utterance.onend = () => params.onEnd?.();
    utterance.onerror = () => params.onError?.();

    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      runSpeak();
    };
    setTimeout(runSpeak, 200);
  } else {
    runSpeak();
  }
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
  lang: "ar" | "en";
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
    recognition.lang = params.lang === "ar" ? "ar-SA" : "en-US";
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
