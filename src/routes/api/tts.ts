import { createFileRoute } from "@tanstack/react-router";
import { synthesizeEdgeNeuralTts } from "@/lib/edgeNeuralTts.server";

async function fetchGoogleGtxFallbackMp3(text: string, baseLang: string): Promise<Buffer> {
  // Split into <=180 char chunks on sentence/word boundaries and concatenate MP3 buffers on the server
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const w of words) {
    const cand = current ? `${current} ${w}` : w;
    if (cand.length <= 180) {
      current = cand;
    } else {
      if (current) chunks.push(current);
      current = w.slice(0, 180);
    }
  }
  if (current) chunks.push(current);

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const ttsUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(
      baseLang
    )}&q=${encodeURIComponent(chunk)}`;
    const upstream = await fetch(ttsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
    });
    if (upstream.ok) {
      const arr = await upstream.arrayBuffer();
      buffers.push(Buffer.from(arr));
    }
  }
  if (buffers.length === 0) {
    throw new Error("Fallback TTS failed");
  }
  return Buffer.concat(buffers);
}

async function handleTtsSynthesis(params: {
  text: string;
  lang: string;
  dialect?: string;
}): Promise<Response> {
  const cleanText = (params.text || "").trim().slice(0, 2200);
  if (!cleanText) {
    return new Response("Missing text parameter", { status: 400 });
  }

  const lang = (params.lang || "ar").trim();
  const dialect = (params.dialect || "auto").trim();
  const baseLang = lang.split("-")[0].toLowerCase() || "ar";

  // Resolve exact dialect/language tag for voice selection:
  // If the text is in a specific detected language (e.g. 'fr') that differs from an Arabic dialect setting,
  // use the detected language; if both are Arabic, use the specific Arabic dialect voice (e.g. ar-MA-MounaNeural, ar-SA-ZariyahNeural).
  const targetVoiceLocale =
    dialect && dialect !== "auto" && dialect.toLowerCase().startsWith(baseLang)
      ? dialect
      : lang;

  try {
    // Primary: Studio-Grade Microsoft Edge Natural Feminine Neural Voice
    const neuralMp3 = await synthesizeEdgeNeuralTts({
      text: cleanText,
      langOrDialect: targetVoiceLocale,
      pitch: "+2Hz",
      rate: "+0%",
    });

    return new Response(new Uint8Array(neuralMp3), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(neuralMp3.length),
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
        "X-Voice-Engine": "AYXA-Neural-Feminine-Pro",
      },
    });
  } catch {
    // Fallback: Server-concatenated Google GTX stream
    try {
      const fallbackMp3 = await fetchGoogleGtxFallbackMp3(cleanText, baseLang);
      return new Response(new Uint8Array(fallbackMp3), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": String(fallbackMp3.length),
          "Cache-Control": "public, max-age=3600",
          "Access-Control-Allow-Origin": "*",
          "X-Voice-Engine": "AYXA-Cloud-Fallback",
        },
      });
    } catch (err: any) {
      return new Response(err?.message || "TTS synthesis error", { status: 500 });
    }
  }
}

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const text = url.searchParams.get("q") || "";
        const lang = url.searchParams.get("lang") || "ar";
        const dialect = url.searchParams.get("dialect") || "auto";
        return handleTtsSynthesis({ text, lang, dialect });
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          return handleTtsSynthesis({
            text: body?.text || body?.q || "",
            lang: body?.lang || "ar",
            dialect: body?.dialect || "auto",
          });
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }
      },
    },
  },
});
