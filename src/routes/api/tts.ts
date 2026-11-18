import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/tts")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const text = (url.searchParams.get("q") || "").trim().slice(0, 200);
          const lang = (url.searchParams.get("lang") || "ar").trim();

          if (!text) {
            return new Response("Missing text parameter", { status: 400 });
          }

          // Clean base language code for Google Neural GTX TTS (e.g. ar-MA -> ar, fr-FR -> fr)
          const baseLang = lang.split("-")[0].toLowerCase() || "ar";
          const ttsUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(
            baseLang
          )}&q=${encodeURIComponent(text)}`;

          const upstream = await fetch(ttsUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            },
          });

          if (!upstream.ok) {
            return new Response("TTS upstream error", { status: upstream.status });
          }

          const audioBuffer = await upstream.arrayBuffer();
          return new Response(audioBuffer, {
            status: 200,
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=86400",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (err: any) {
          return new Response(err?.message || "TTS error", { status: 500 });
        }
      },
    },
  },
});
