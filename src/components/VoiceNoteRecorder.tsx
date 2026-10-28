import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Play, Pause, Trash2, Volume2, Plus, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { GlassCard } from "@/components/kit";

export interface VoiceNote {
  id: string;
  title: string;
  duration: number; // in seconds
  audioUrl?: string;
  date: string;
  category?: string;
}

interface VoiceNoteRecorderProps {
  onSaveVoiceNote?: (note: VoiceNote) => void;
  className?: string;
  category?: string;
}

export function VoiceNoteRecorder({ onSaveVoiceNote, className, category = "General" }: VoiceNoteRecorderProps) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ayxa_voice_notes");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return [
      {
        id: "vn-1",
        title: isAr ? "ملاحظة صوتية: أهداف اليوم والورد" : "Voice Note: Daily Goals & Quran",
        duration: 18,
        date: isAr ? "اليوم 09:30 AM" : "Today 09:30 AM",
        category: "Daily"
      },
      {
        id: "vn-2",
        title: isAr ? "تذكير صلة الرحم والإنفاق" : "Reminder: Family call & Sadaqah",
        duration: 25,
        date: isAr ? "أمس 04:15 PM" : "Yesterday 04:15 PM",
        category: "Reminders"
      }
    ];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ayxa_voice_notes", JSON.stringify(voiceNotes));
    }
  }, [voiceNotes]);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const timerRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem("ayxa_voice_notes", JSON.stringify(voiceNotes));
  }, [voiceNotes]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordSeconds(0);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    const duration = recordSeconds > 0 ? recordSeconds : 12;
    const title = noteTitle.trim() || (isAr ? `تسجيل صوتي ${voiceNotes.length + 1}` : `Voice Recording ${voiceNotes.length + 1}`);

    const newNote: VoiceNote = {
      id: `vn-${Date.now()}`,
      title,
      duration,
      date: isAr ? "الآن" : "Just now",
      category
    };

    setVoiceNotes(prev => [newNote, ...prev]);
    setNoteTitle("");
    if (onSaveVoiceNote) onSaveVoiceNote(newNote);
  };

  const handleTogglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      // Auto pause after duration simulation
      setTimeout(() => {
        setPlayingId(prev => (prev === id ? null : prev));
      }, 4000);
    }
  };

  const handleDeleteNote = (id: string) => {
    setVoiceNotes(prev => prev.filter(n => n.id !== id));
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassCard className={cn("p-5 border-amber-300/60 bg-gradient-to-br from-surface via-pink-50/20 to-amber-50/20 shadow-md", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-[16px] font-extrabold text-ink flex items-center gap-2">
          <Mic className="text-pink-500" size={20} />
          {isAr ? "الملاحظات والمذكرات الصوتية" : "Voice Notes & Audio Recorder"}
        </h3>
        <span className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 border border-pink-200">
          🎙️ {isAr ? "تسجيل فوري" : "Instant Voice"}
        </span>
      </div>

      {/* Recording Control Banner */}
      <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 p-4 text-white shadow-md border border-amber-300/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isRecording ? handleStopRecord : handleStartRecord}
              className={cn(
                "cursor-pointer flex h-13 w-13 items-center justify-center rounded-2xl font-black transition-transform active:scale-95 shadow-lg border-2",
                isRecording 
                  ? "bg-rose-500 border-rose-300 text-white animate-pulse" 
                  : "bg-amber-400 border-amber-200 text-emerald-950 hover:bg-amber-300"
              )}
            >
              {isRecording ? <Square size={22} fill="white" /> : <Mic size={24} />}
            </button>

            <div>
              <span className="text-[11px] font-extrabold text-amber-300 block">
                {isRecording 
                  ? (isAr ? "🔴 جاري التسجيل الصوتي..." : "🔴 Recording Voice...") 
                  : (isAr ? "اضغطي للبدء بتسجيل ملاحظة صوتية" : "Tap Mic to record voice note")}
              </span>
              <span className="font-mono text-[20px] font-black text-white">
                {formatTimer(recordSeconds)}
              </span>
            </div>
          </div>

          {isRecording && (
            <div className="flex items-center gap-1">
              <span className="h-4 w-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-7 w-1 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-5 w-1 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="h-8 w-1 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '450ms' }} />
            </div>
          )}
        </div>

        {/* Note Title Input */}
        <div className="mt-3">
          <input
            type="text"
            value={noteTitle}
            onChange={e => setNoteTitle(e.target.value)}
            placeholder={isAr ? "عنوان أو وصف الملاحظة الصوتية (مثال: نوتة الأهداف اليومية)..." : "Voice note title or description..."}
            className="w-full rounded-xl bg-black/40 border border-white/20 px-3 py-1.5 text-[12.5px] font-semibold text-white placeholder-white/60 focus:border-amber-300 focus:outline-none"
          />
        </div>
      </div>

      {/* Voice Notes List */}
      <div className="mt-5 space-y-2.5">
        <h4 className="text-[12px] font-extrabold text-ink-light flex items-center justify-between">
          <span>{isAr ? "سجل التسجيلات الصوتية المحفوظة:" : "Saved Voice Memos:"}</span>
          <span className="text-[11px] font-bold text-emerald-800">{voiceNotes.length} {isAr ? "تسجيلات" : "notes"}</span>
        </h4>

        {voiceNotes.map(note => {
          const isPlaying = playingId === note.id;

          return (
            <div
              key={note.id}
              className={cn(
                "p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-sm",
                isPlaying 
                  ? "border-pink-400 bg-pink-50/80 ring-2 ring-pink-300" 
                  : "border-emerald-100 bg-surface hover:border-pink-200"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => handleTogglePlay(note.id)}
                  className={cn(
                    "cursor-pointer flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold transition-transform active:scale-90 border shadow-sm",
                    isPlaying ? "bg-pink-500 text-white border-pink-400" : "bg-emerald-100 text-emerald-900 border-emerald-200 hover:bg-emerald-200"
                  )}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>

                <div className="min-w-0">
                  <h5 className="font-serif text-[14px] font-extrabold text-ink truncate">{note.title}</h5>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] font-medium text-ink-light">
                    <span className="flex items-center gap-1 font-mono font-bold text-pink-600">
                      <Clock size={11} /> {formatTimer(note.duration)}
                    </span>
                    <span>· {note.date}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteNote(note.id)}
                className="cursor-pointer p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                aria-label="Delete Voice Note"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
