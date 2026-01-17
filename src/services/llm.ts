import { api } from "../lib/api";

export const PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GEMINI: "gemini",
  DEEPSEEK: "deepseek",
  GROQ: "groq",
} as const;

export type LLMProvider = typeof PROVIDERS[keyof typeof PROVIDERS];

export const MODELS = {
  [PROVIDERS.OPENAI]: [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
  ],
  [PROVIDERS.ANTHROPIC]: [
    { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet" },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
  ],
  [PROVIDERS.GEMINI]: [
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
  ],
  [PROVIDERS.DEEPSEEK]: [
    { id: "deepseek-chat", name: "DeepSeek Chat (V3)" },
    { id: "deepseek-coder", name: "DeepSeek Coder" }
  ],
  [PROVIDERS.GROQ]: [
    { id: "llama3-70b-8192", name: "Llama 3 70B" },
    { id: "llama3-8b-8192", name: "Llama 3 8B" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  ]
};

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SendMessageOptions {
  provider: LLMProvider;
  model: string;
  messages: ChatMessage[];
  apiKey: string;
  config?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  };
}


export const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.50, output: 10.00 },
  "gpt-4o-mini": { input: 0.15, output: 0.60 },
  "claude-3-5-sonnet-20240620": { input: 3.00, output: 15.00 },
  "gemini-1.5-pro": { input: 3.50, output: 10.50 },
  "gemini-1.5-flash": { input: 0.075, output: 0.30 },
  "deepseek-chat": { input: 0.14, output: 0.28 },
  "llama3-70b-8192": { input: 0.59, output: 0.79 },
};

export const llmService = {
  async sendMessage(options: SendMessageOptions) {
    // Assuming 'api' from '../lib/api' handles base URL and generic fetching
    // Using '/api/proxy/chat/completions'
    try {
      const response = await api.post("/api/proxy/chat/completions", options);
      return response; 
    } catch (error) {
      console.error("LLM Service Error:", error);
      throw error;
    }
  },

  estimateTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  },

  calculateCost(modelId: string, inputTokens: number, outputTokens: number = 0): number {
    const rates = PRICING[modelId] || { input: 0, output: 0 };
    const inputCost = (inputTokens / 1_000_000) * rates.input;
    const outputCost = (outputTokens / 1_000_000) * rates.output;
    return inputCost + outputCost;
  }
};

