import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const COARENA_OPENAI_BASE_URL = "https://coarena.ai/api/v1";
export const COARENA_ANTHROPIC_BASE_URL = "https://coarena.ai/api";
export const COARENA_MODELS_URL = "https://coarena.ai/api/v1/models";
export const COARENA_FEEDBACK_URL = "https://coarena.ai/api/v1/feedback";

export const COARENA_API_KEY =
  (typeof process !== "undefined" && process.env?.COARENA_API_KEY) ||
  "coa_2a4a92f4d109fd9ea72e9e2406545c1c";

export const COARENA_DEFAULT_MODEL = "gpt-6-luna";

// Backward-compatible exports used by existing server routes
export const APINEX_BASE_URL = COARENA_OPENAI_BASE_URL;
export const APINEX_API_KEY = COARENA_API_KEY;
export const APINEX_DEFAULT_MODEL = COARENA_DEFAULT_MODEL;

export function createCoarenaAiProvider(apiKey: string = COARENA_API_KEY) {
  return createOpenAICompatible({
    name: "coarena",
    baseURL: COARENA_OPENAI_BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

export function createApinexAiProvider(apiKey: string = COARENA_API_KEY) {
  return createCoarenaAiProvider(apiKey);
}

export function createLovableAiGatewayProvider(apiKey: string = COARENA_API_KEY) {
  return createCoarenaAiProvider(apiKey);
}
