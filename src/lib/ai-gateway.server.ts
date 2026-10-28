import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const APINEX_BASE_URL = "https://api.apinex.bond/v1";
export const APINEX_API_KEY =
  process.env.APINEX_API_KEY ||
  "sk-apx5dcf105ea43ee71d97d6215d9fc1e1eddda7ba054d82f6f";
export const APINEX_DEFAULT_MODEL = "free/deepseek-v4.1-flash";

export function createApinexAiProvider(apiKey: string = APINEX_API_KEY) {
  return createOpenAICompatible({
    name: "apinex-deepseek",
    baseURL: APINEX_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

