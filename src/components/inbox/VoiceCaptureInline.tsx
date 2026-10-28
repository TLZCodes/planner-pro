import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, Trash2, Volume2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { formatAudioSeconds } from "@/lib/brainDumpEngine";

interface VoiceCaptureInlineProps {
  onAudioReady: (audioDataUrl: string, durationSec: number, transcript?: string) => void;
  onDiscard?: () => void;
  initialAudioUrl?: string;
  initialDurationSec?: number;
  className?: string;
}

export function VoiceCaptureInline({
  onAudioReady,
  onDiscard,
  initialAudioUrl,
  initialDurationSec = 0,
  className,
}: VoiceCaptureInlineProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [audioDuration, setAudioDuration] = useState<number>(initialDurationSec);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Stop recording on unmount or navigation
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMsg(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg(
        isAr
          ? "المتصفح لا يدعم التسجيل الصوتي المباشر."
          : "Audio recording is not supported in this browser."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone hardware indicator
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });

        // Convert blob to base64 Data URI for durable persistence across reloads & offline
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setAudioUrl(base64Data);
          setAudioDuration(recordSeconds);
          onAudioReady(base64Data, recordSeconds, speechTranscript.trim() || undefined);
        };
        reader.readAsDataURL(audioBlob);
      };

      // Optional Web Speech Recognition for live transcribing
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognizer = new SpeechRecognition();
          recognizer.continuous = true;
          recognizer.interimResults = true;
          recognizer.lang = isAr ? "ar-SA" : "en-US";
          recognizer.onresult = (event: any) => {
            let finalTranscript = "";
            for (let i = 0; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + " ";
              }
            }
            if (finalTranscript) {
              setSpeechTranscript(finalTranscript.trim());
            }
          };
          recognizer.onerror = () => {
            // Web speech error can safely be silent, playable audio is saved regardless
          };
          recognizer.start();
          speechRecognitionRef.current = recognizer;
        } catch {
          // ignore
        }
      }

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg(
          isAr
            ? "تم رفض الإذن باستخدام الميكروفون. يرجى تفعيله من إعدادات المتصفح."
            : "Microphone permission was denied. Please allow microphone access."
        );
      } else {
        setErrorMsg(
          isAr
            ? "تعذر بدء التسجيل الصوتي. تأكدي من توصيل الميكروفون."
            : "Could not start audio recording. Check microphone settings."
        );
      }
    }
  }, [isAr, onAudioReady, recordSeconds, speechTranscript]);

  const stopRecording = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  }, []);

  const handleDiscard = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setAudioUrl(null);
    setAudioDuration(0);
    setSpeechTranscript("");
    setIsRecording(false);
    setRecordSeconds(0);
    if (onDiscard) onDiscard();
  }, [onDiscard]);

  const togglePlayPreview = useCallback(() => {
    if (!audioUrl) return;
    if (!audioElementRef.current) {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [audioUrl, isPlaying]);

  return (
    <div className={cn("rounded-2xl p-3 border transition-all", className)}>
      {errorMsg && (
        <div className="mb-2.5 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isRecording && !audioUrl && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#FF1493] dark:bg-pink-950/40 dark:hover:bg-pink-900/60 font-semibold text-xs border border-pink-200 dark:border-pink-800 transition-all active:scale-95 cursor-pointer"
          >
            <Mic size={16} />
            <span>{isAr ? "تسجيل ملاحظة صوتية" : "Record voice note"}</span>
          </button>
          <span className="text-[11px] text-muted-foreground">
            {isAr ? "ميكروفون المتصفح الآمن" : "Browser microphone"}
          </span>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center justify-between gap-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl p-3 border border-rose-200 dark:border-rose-900 animate-pulse">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-rose-800 dark:text-rose-200">
              {isAr ? "جارٍ التسجيل..." : "Recording..."}
            </span>
            <span className="font-mono text-xs font-bold text-rose-900 dark:text-rose-100 bg-white/80 dark:bg-black/30 px-2 py-0.5 rounded-md">
              {formatAudioSeconds(recordSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-200/50 active:scale-95 cursor-pointer"
              title={isAr ? "إلغاء" : "Discard"}
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm cursor-pointer active:scale-95"
            >
              <Square size={14} className="fill-current" />
              <span>{isAr ? "تم" : "Done"}</span>
            </button>
          </div>
        </div>
      )}

      {!isRecording && audioUrl && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3 bg-pink-50/50 dark:bg-pink-950/30 rounded-xl p-2.5 border border-pink-200/70 dark:border-pink-900/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayPreview}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF1493] text-white shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? (isAr ? "إيقاف" : "Pause") : (isAr ? "تشغيل" : "Play")}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
              </button>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#2b1727] dark:text-pink-100 flex items-center gap-1">
                  <Volume2 size={13} className="text-[#FF1493]" />
                  <span>{isAr ? "ملاحظة صوتية جاهزة" : "Voice Note Recorded"}</span>
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {formatAudioSeconds(audioDuration || recordSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleDiscard}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all cursor-pointer"
              >
                <Trash2 size={14} />
                <span>{isAr ? "حذف التسجيل" : "Discard"}</span>
              </button>
            </div>
          </div>

          {speechTranscript && (
            <div className="text-[11px] text-muted-foreground bg-white/70 dark:bg-card/70 p-2 rounded-lg border border-pink-100 dark:border-pink-900/40">
              <span className="font-semibold text-pink-700 dark:text-pink-300">
                {isAr ? "النص المقترح:" : "Suggested text:"}{" "}
              </span>
              <span>{speechTranscript}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
