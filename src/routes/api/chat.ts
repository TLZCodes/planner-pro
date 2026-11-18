import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createCoarenaAiProvider,
  COARENA_API_KEY,
  COARENA_DEFAULT_MODEL,
} from "@/lib/ai-gateway.server";
import { buildAxyaProSystemPrompt } from "@/lib/coarenaClient";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            messages?: unknown;
            contextSummary?: string;
            persona?: "feminine" | "masculine";
            aiSettings?: {
              level?: "saver" | "balanced" | "deep";
              tone?: "gentle" | "action" | "barakah";
              model?: string;
            };
          };

          const { messages, contextSummary, persona = "feminine", aiSettings } = body;

          if (!Array.isArray(messages)) {
            return new Response(
              JSON.stringify({ error: "INVALID_REQUEST", message: "Messages array is required." }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          if (messages.length > 50) {
            return new Response(
              JSON.stringify({
                error: "PAYLOAD_TOO_LARGE",
                message: "Conversation history exceeds safety limit.",
              }),
              { status: 413, headers: { "Content-Type": "application/json" } }
            );
          }

          const coarenaKey =
            process.env.COARENA_API_KEY ||
            process.env.APINEX_API_KEY ||
            COARENA_API_KEY;

          const combinedSystem = buildAxyaProSystemPrompt({
            persona,
            level: aiSettings?.level || "balanced",
            tone: aiSettings?.tone || "barakah",
            contextSummary,
          });

          const selectedModel = aiSettings?.model || COARENA_DEFAULT_MODEL;
          const gateway = createCoarenaAiProvider(coarenaKey);

          const result = streamText({
            model: gateway(selectedModel),
            system: combinedSystem,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              error: "SERVER_ERROR",
              message:
                err?.message || "An error occurred while communicating with the AXYA Aura Pro gateway.",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
