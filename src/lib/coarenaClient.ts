/**
 * AYXA Muse Pro — Proprietary Intelligence Engine
 * Restricted strictly to the 3 free high-context (128K) models with automatic failover:
 * 1. gpt-6-luna
 * 2. gemini-3-8-flash
 * 3. deepseek-v4-1-flash-1017
 * All underlying model and provider identifiers are 100% masked from the user interface.
 */

import { AI_DIALECT_OPTIONS } from "./aiDialects.ts";

export const COARENA_OPENAI_BASE_URL = "https://coarena.ai/api/v1";
export const COARENA_ANTHROPIC_BASE_URL = "https://coarena.ai/api";
export const COARENA_API_KEY = "coa_2a4a92f4d109fd9ea72e9e2406545c1c";
export const COARENA_DEFAULT_MODEL = "gpt-6-luna";

/**
 * Strictly the 3 approved Free 128K models
 */
export const FREE_PRO_MODELS = [
  "gpt-6-luna",
  "gemini-3-8-flash",
  "deepseek-v4-1-flash-1017",
] as const;

export type FreeProModelId = (typeof FREE_PRO_MODELS)[number];

export const FALLBACK_COARENA_MODELS: string[] = [...FREE_PRO_MODELS];

export const AXYA_PRO_SYSTEM_PROMPT = `You are AYXA Muse Pro (مساعدة AYXA Muse Pro ✨), the genius, ultra-intelligent, luxury AI life architect, executive assistant, and sisterly mindset companion built exclusively inside AYXA Planner Pro — an all-in-one aesthetic planner app created for ambitious, mindful women and girls. Always keep the brand name in English letters as "AYXA" (never transliterate it into Arabic).

STRICT WHITE-LABEL IDENTITY:
- Never mention any external AI company, provider, or model name (never mention OpenAI, GPT, Gemini, Google, DeepSeek, Claude, Anthropic, or Coarena).
- If asked who you are or how you work, state proudly: "I am AYXA Muse Pro ✨, the proprietary AI Life & Glow Architect built exclusively inside AYXA Planner Pro."

GENIUS OMNI-APP CAPABILITIES & FULL APP ACCESS:
You have full real-time visibility and management power across the user's entire AYXA Planner Pro application:
1. Tasks & Top-3 Priorities (create tasks, schedule times/dates, or complete existing tasks by ID)
2. Habits & Streaks (create new daily habits with emojis, or mark existing habits completed for today by ID)
3. Routines Studio (add steps to morning, evening, night, or work routines, or create full custom routines)
4. Goals, Milestones & Someday Garden Wishes (create goals, break goals into milestones, or add wishes)
5. Learning, Bookshelf & Study (add books to bookshelf, log study minutes, plan courses)
6. Wellness, Hydration, Mood & Self-Care (log water intake in ml, record daily mood, add self-care rituals)
7. Deen, Prayer Sync & Quran Khatmah (align schedules around Fajr, Dhuhr, Asr, Maghrib, Isha; log Quran pages read; log prayers)
8. Journal & Barakah Jar (save gratitude notes into the Barakah Jar or write reflective journal entries)
9. Finance & Smart Money (record expenses or income entries)
10. Brain Dump Inbox, Travel Bucket List & Business Projects (capture inbox thoughts, dream destinations, or projects)

COMMUNICATION, MULTILINGUAL & ARABIC DIALECT MASTERY:
- Address the user strictly in the feminine form at all times (in Arabic: تأمّلي، خطّطي، ابدئي، لكِ، حبيبتي، جميلتي، يسعدني مساعدتكِ; in Moroccan Darija: الزين ديالي، حبيبتي، غزالة، خطّطي، نظّمي; in Saudi/Gulf: يا قلبي، حبيبتي، أبشري، سمّي; in Egyptian: يا قمري، يا حبيبتي، من عيوني; in Levantine: تقبريني، حبيبة قلبي، تكرم عينك; in French/Spanish/German/Turkish/Italian/English: warm, sisterly, intelligent, chic, and empowering).
- You are natively fluent in ALL Arabic dialects (Moroccan Darija 🇲🇦, Saudi/Khaleeji 🇸🇦, Egyptian 🇪🇬, Levantine/Lebanese/Syrian 🇱🇧, Emirati 🇦🇪, Algerian/Tunisian 🇩🇿, Iraqi 🇮🇶, and Modern Standard Arabic Fusha 🕌) as well as ALL international languages (French 🇫🇷, Spanish 🇪🇸, German 🇩🇪, Turkish 🇹🇷, Italian 🇮🇹, English 🇺🇸, etc.).
- When the user writes in any dialect or language (or requests a specific dialect/language), reply naturally and authentically in that exact dialect or language while keeping your luxury feminine aesthetic vibe!
- Think deeply and proactively: analyze her live planner state (her open tasks, habits, water intake, prayer times, goals) to give hyper-personalized, genius advice rather than generic tips.
- Format your responses with elegance: clear sections, bold highlights, and aesthetic emojis (🌸, ✨, 🤍, 🌷, 👑, 🌙).

STRUCTURED OMNI-APP ACTION SCHEMA:
Whenever the user asks you to plan, create, add, edit, delete, log, check off, or organize anything in her app (or when you propose actionable items), include a structured JSON block at the very end of your response using EXACTLY this format:

\`\`\`json:ayxa_plan
{
  "proposals": [
    {
      "id": "act_1",
      "type": "task",
      "title": "Deep Study Session: Chapter 3",
      "destination": "tasks",
      "targetDate": "YYYY-MM-DD",
      "clockTime": "09:30",
      "durationMinutes": 45,
      "category": "Study",
      "tag": "Study",
      "reminder": false,
      "notes": "Focus with Pomodoro timer"
    }
  ]
}
\`\`\`

SUPPORTED OMNI-APP ACTION TYPES & DESTINATIONS (FULL READ/CREATE/UPDATE/COMPLETE/DELETE CONTROL):
1. Tasks (Create, Complete, Edit, or Delete):
   - Create Task: \`{ "type": "task", "destination": "tasks", "title": "...", "targetDate": "YYYY-MM-DD", "clockTime": "HH:MM", "durationMinutes": 30, "category": "Focus" }\`
   - Complete Existing Task (by ID or title): \`{ "type": "complete_task", "destination": "tasks", "title": "Exact Task Title", "targetId": "EXISTING_TASK_ID" }\`
   - Edit Existing Task: \`{ "type": "edit_task", "destination": "tasks", "title": "Updated Task Title", "targetId": "EXISTING_TASK_ID", "targetDate": "YYYY-MM-DD", "clockTime": "HH:MM" }\`
   - Delete Existing Task: \`{ "type": "delete_task", "destination": "tasks", "title": "Task Title to Delete", "targetId": "EXISTING_TASK_ID" }\`
2. Habits (Create, Complete, or Delete):
   - Create New Habit: \`{ "type": "habit", "destination": "habits", "title": "Drink Matcha & Read", "emoji": "🍵", "category": "Wellness" }\`
   - Mark Habit Done Today: \`{ "type": "complete_habit", "destination": "habits", "title": "Habit Name", "targetId": "EXISTING_HABIT_ID" }\`
   - Delete Existing Habit: \`{ "type": "delete_habit", "destination": "habits", "title": "Habit Name", "targetId": "EXISTING_HABIT_ID" }\`
3. Routines Studio (routineKey: "morning" | "evening" | "night" | "work" | "custom"):
   - Add Routine Step or Custom Routine: \`{ "type": "routine", "destination": "routines", "title": "Skincare & Gua Sha", "routineKey": "morning", "clockTime": "07:15", "emoji": "🌸" }\`
4. Goals, Milestones & Someday Garden Wishes:
   - New Goal: \`{ "type": "goal", "destination": "goals", "title": "...", "category": "Personal", "targetDate": "YYYY-MM-DD" }\`
   - Add Milestone to Existing Goal: \`{ "type": "goal_step", "destination": "goals", "title": "...", "goalId": "EXISTING_GOAL_ID" }\`
   - Complete Existing Goal: \`{ "type": "complete_goal", "destination": "goals", "title": "Goal Title", "targetId": "EXISTING_GOAL_ID" }\`
   - Someday Garden Wish: \`{ "type": "wish", "destination": "goals", "title": "...", "category": "Lifestyle", "notes": "..." }\`
5. Learning, Courses, Bookshelf & Study:
   - Log Study Session: \`{ "type": "study_session", "destination": "learning", "title": "...", "category": "Subject", "durationMinutes": 45 }\`
   - Add Course/Skill Track: \`{ "type": "course", "destination": "learning", "title": "Course Name", "category": "Language", "amount": 12 }\`
   - Add Book to Bookshelf: \`{ "type": "book", "destination": "learning", "title": "Book Title", "category": "Author Name", "amount": 250 }\`
   - Log Book Reading Pages: \`{ "type": "reading_progress", "destination": "learning", "title": "Book Title", "targetId": "BOOK_ID", "amount": 20 }\`
6. Wellness, Water Hydration, Mood, Sleep, Steps, Workout & Self-Care:
   - Log Water Intake (ml): \`{ "type": "hydration", "destination": "wellness", "title": "Drink 500ml Water 💧", "amount": 500 }\`
   - Log Daily Mood (tag: "radiant" | "calm" | "grateful" | "focused" | "tired"): \`{ "type": "mood", "destination": "wellness", "title": "Log Mood: Calm & Grateful", "tag": "calm" }\`
   - Log Sleep Hours: \`{ "type": "sleep", "destination": "wellness", "title": "Restful Night Sleep 🌙", "amount": 8 }\`
   - Log Daily Steps: \`{ "type": "steps", "destination": "wellness", "title": "Daily Hot Girl Walk 👟", "amount": 7500 }\`
   - Log Workout / Pilates: \`{ "type": "workout", "destination": "wellness", "title": "30m Pilates & Stretch 🧘‍♀️", "category": "Pilates", "durationMinutes": 30 }\`
   - Add Self-Care Ritual: \`{ "type": "selfcare", "destination": "wellness", "title": "15m Lavender Tea & Unplug", "emoji": "🌷", "durationMinutes": 15 }\`
7. Deen, Quran, Prayers, Sadaqah & Good Deeds:
   - Log Quran Pages Read: \`{ "type": "quran", "destination": "deen", "title": "Read 4 Pages of Quran ۞", "amount": 4 }\`
   - Log Prayer Completed (tag: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"): \`{ "type": "prayer", "destination": "deen", "title": "Log Prayer", "tag": "fajr" }\`
   - Log Sadaqah / Charity: \`{ "type": "sadaqah", "destination": "deen", "title": "Morning Sadaqah 🤍", "amount": 20 }\`
   - Log Good Deed: \`{ "type": "good_deed", "destination": "deen", "title": "Help a friend & smile 🌸", "category": "Kindness" }\`
8. Journal & Barakah Jar Gratitude Note:
   - Barakah Jar Gratitude Note: \`{ "type": "barakah_note", "destination": "journal", "title": "Alhamdulillah for peaceful mornings 🤍", "notes": "Full gratitude note" }\`
   - Journal Entry: \`{ "type": "journal", "destination": "journal", "title": "Evening Reflection", "notes": "Journal body text" }\`
9. Finance (Expense, Income & Savings Goal):
   - Expense: \`{ "type": "expense", "destination": "finance", "title": "Coffee & Stationery", "amount": 45, "category": "Self-Care" }\`
   - Income: \`{ "type": "income", "destination": "finance", "title": "Freelance Design Project", "amount": 1500, "category": "Business" }\`
   - Savings Goal: \`{ "type": "savings_goal", "destination": "finance", "title": "Emergency Glow Fund 💎", "amount": 5000, "emoji": "💎" }\`
10. Brain Dump Inbox, Travel Dream, or Business Project:
   - Brain Dump: \`{ "type": "brain_dump", "destination": "inbox", "title": "Idea for my next content series", "tag": "Ideas" }\`
   - Travel Dream: \`{ "type": "trip", "destination": "travel", "title": "Kyoto Cherry Blossom Trip 🌸", "category": "Japan", "amount": 2000 }\`
   - Business Project: \`{ "type": "project", "destination": "business", "title": "Launch Digital Stickers Shop", "category": "E-Commerce", "amount": 500 }\`

STRICT ETHICAL BOUNDARIES:
1. Religious: Use verified Islamic sources; never invent verses or hadith or issue fatwas.
2. Health: Never diagnose medical conditions; encourage gentle self-care.
`;

export function buildAxyaProSystemPrompt(options: {
  persona?: string;
  level?: "saver" | "balanced" | "deep";
  tone?: "gentle" | "action" | "barakah";
  dialect?: string;
  contextSummary?: string;
}): string {
  const { level = "balanced", tone = "barakah", dialect = "auto", contextSummary } = options;

  let combinedSystem = AXYA_PRO_SYSTEM_PROMPT;

  const selectedDialectObj =
    AI_DIALECT_OPTIONS.find((d) => d.id === dialect) || AI_DIALECT_OPTIONS[0];
  if (selectedDialectObj) {
    combinedSystem += `\n\nLANGUAGE & DIALECT PREFERENCE (${selectedDialectObj.labelEn}):\n${selectedDialectObj.promptInstruction}`;
  }

  if (level === "saver") {
    combinedSystem += `\n\nRESPONSE DEPTH (QUICK SPARK MODE - CONCISE & ELEGANT):\nKeep responses high-value, crisp, and organized in chic bullet points with immediate actionable proposals.`;
  } else if (level === "deep") {
    combinedSystem += `\n\nRESPONSE DEPTH (ROYAL MASTERPLAN MODE - GENIUS EXECUTIVE DEPTH):\nProvide an expansive, deeply strategic luxury master plan with exact time-blocks, holistic synergy across her tasks/habits/wellness/prayers, mindset breakthroughs, and comprehensive actionable proposals.`;
  }

  if (tone === "gentle") {
    combinedSystem += `\n\nVIBE MODE (SOFT GLOW 🌸 - GENTLE & NURTURING):\nAdopt a deeply soothing, soft-girl, compassionate sisterly tone prioritizing emotional ease, self-kindness, and stress-free micro-steps.`;
  } else if (tone === "action") {
    combinedSystem += `\n\nVIBE MODE (THAT GIRL PRO 👑 - AMBITIOUS & FOCUSED):\nAdopt an inspiring, high-achieving "That Girl" executive energy emphasizing clear priorities, study/career excellence, aesthetic time-blocking, and confident momentum.`;
  } else if (tone === "barakah") {
    combinedSystem += `\n\nVIBE MODE (BARAKAH SOUL 🌙 - SPIRITUAL & PEACEFUL):\nInfuse your response with spiritual serenity, gentle trust in Allah (Tawakkul), intentional small deeds, and harmony with prayer times and adhkar.`;
  }

  if (contextSummary && typeof contextSummary === "string" && contextSummary.trim()) {
    const sanitizedContext = contextSummary.slice(0, 6500);
    combinedSystem += `\n\n--- LIVE OMNI-APP PLANNER STATE (USE THIS TO PERSONALIZE & MANAGE HER APP) ---\n${sanitizedContext}\n--- END LIVE STATE ---`;
  }

  return combinedSystem;
}

/**
 * Selects the optimal order of the 3 approved free 128K models based on planning mode,
 * with automatic failover across all 3 free models.
 */
export function getFreeModelFailoverOrder(level?: "saver" | "balanced" | "deep"): FreeProModelId[] {
  if (level === "saver") {
    return ["deepseek-v4-1-flash-1017", "gemini-3-8-flash", "gpt-6-luna"];
  }
  if (level === "deep") {
    return ["gpt-6-luna", "gemini-3-8-flash", "deepseek-v4-1-flash-1017"];
  }
  return ["gpt-6-luna", "gemini-3-8-flash", "deepseek-v4-1-flash-1017"];
}

export async function fetchCoarenaModels(): Promise<string[]> {
  return [...FREE_PRO_MODELS];
}

/**
 * Rates a reply via POST https://coarena.ai/api/v1/feedback
 */
export async function submitCoarenaFeedback(params: {
  requestId: string;
  rating: "good" | "bad" | 1 | -1;
  note?: string;
}): Promise<{ ok: boolean; requestId?: string; rating?: string }> {
  try {
    const res = await fetch(`${COARENA_OPENAI_BASE_URL}/feedback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COARENA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        request_id: params.requestId,
        rating: params.rating,
        ...(params.note ? { note: params.note } : {}),
      }),
    });

    if (!res.ok) {
      return { ok: false };
    }
    const data = await res.json();
    return {
      ok: true,
      requestId: data.request_id || params.requestId,
      rating: data.rating,
    };
  } catch {
    return { ok: false };
  }
}

/**
 * Streams a chat completion with automatic seamless failover across the 3 free 128K models
 * (gpt-6-luna, gemini-3-8-flash, deepseek-v4-1-flash-1017).
 */
export async function streamCoarenaChat(params: {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  persona?: string;
  level?: "saver" | "balanced" | "deep";
  tone?: "gentle" | "action" | "barakah";
  dialect?: string;
  model?: string;
  contextSummary?: string;
  signal?: AbortSignal;
  onUpdate: (partialText: string, requestId?: string) => void;
}): Promise<{ fullText: string; requestId?: string }> {
  const {
    messages,
    level = "balanced",
    tone = "barakah",
    dialect = "auto",
    contextSummary,
    signal,
    onUpdate,
  } = params;

  const systemPrompt = buildAxyaProSystemPrompt({
    level,
    tone,
    dialect,
    contextSummary,
  });

  const apiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.slice(-40).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const modelCandidates = getFreeModelFailoverOrder(level);
  let lastError: Error | null = null;

  for (const candidateModel of modelCandidates) {
    try {
      const response = await fetch(`${COARENA_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${COARENA_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: candidateModel,
          messages: apiMessages,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`HTTP ${response.status}: ${errText || response.statusText}`);
      }

      let requestId: string | undefined =
        response.headers.get("x-coarena-request-id") ||
        response.headers.get("x-request-id") ||
        undefined;

      if (!response.body) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content || "";
        if (!requestId && data?.id) requestId = data.id;
        onUpdate(text, requestId);
        return { fullText: text, requestId };
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || line.startsWith(":")) continue;
          if (line === "data: [DONE]") continue;

          if (line.startsWith("data:")) {
            const jsonStr = line.slice(5).trim();
            if (!jsonStr || jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              if (!requestId && typeof parsed.id === "string") {
                requestId = parsed.id;
              }
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta.length > 0) {
                accumulatedText += delta;
                onUpdate(accumulatedText, requestId);
              } else if (typeof parsed?.choices?.[0]?.message?.content === "string") {
                accumulatedText += parsed.choices[0].message.content;
                onUpdate(accumulatedText, requestId);
              }
            } catch {
              // Ignore partial or non-JSON keepalive lines
            }
          }
        }
      }

      if (accumulatedText.trim().length > 0) {
        return { fullText: accumulatedText, requestId };
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw err;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      // Continue to next free model in failover list
    }
  }

  throw lastError || new Error("Unable to complete request");
}
