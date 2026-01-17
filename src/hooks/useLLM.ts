import { useState, useCallback } from "react";
import { llmService, LLMProvider, ChatMessage } from "../services/llm";
import toast from "react-hot-toast";

const STORAGE_KEY_PREFIX = "miow_api_key_";

export const useLLM = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);
  const [cost, setCost] = useState(0);
  const [variables, setVariables] = useState<Record<string, string>>({});

  // Key Management
  const getApiKey = (provider: LLMProvider): string => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}${provider}`) || "";
  };

  const setApiKey = (provider: LLMProvider, key: string) => {
    if (!key) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${provider}`);
    } else {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${provider}`, key);
    }
  };

  const hasKey = (provider: LLMProvider): boolean => {
    return !!getApiKey(provider);
  };

    const detectVariables = useCallback((text: string) => {
    const regex = /{{([^}]+)}}/g;
    const found: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        const varName = match[1];
        if (varName && !found.includes(varName)) {
            found.push(varName);
        }
    }
    // Initialize empty values for new variables if missing
    setVariables(prev => {
        const next = { ...prev };
        let changed = false;
        found.forEach(v => {
            if (next[v] === undefined) {
                next[v] = "";
                changed = true;
            }
        });
        return changed ? next : prev;
    });
    return found;
  }, []);

  const updateVariable = useCallback((key: string, value: string) => {
      setVariables(prev => ({ ...prev, [key]: value }));
  }, []);


  // Execution
  const runPrompt = useCallback(async (
    provider: LLMProvider,
    model: string,
    prompt: string,
    systemPrompt?: string
  ) => {
    setIsLoading(true);
    setResponse(null);
    setError(null);
    setUsage(null);
    setCost(0);

    const apiKey = getApiKey(provider);
    if (!apiKey) {
      const msg = `Missing API Key for ${provider.toUpperCase()}`;
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    // Interpolate Variables
    let finalPrompt = prompt;
    Object.entries(variables).forEach(([key, val]) => {
        finalPrompt = finalPrompt.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });

    const messages: ChatMessage[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: finalPrompt });

    try {
      const result = await llmService.sendMessage({
        provider,
        model,
        messages,
        apiKey,
      }) as any;

      if (result.error) {
         throw new Error(result.error);
      }
      
      let content = "";
      let totalTokens = 0;
      let promptTokens = 0;
      let completionTokens = 0;
      
      // OpenAI / DeepSeek / Groq / Anthropic (messages)
      if (result.choices && result.choices.length > 0) {
        content = result.choices[0].message?.content || "";
        promptTokens = result.usage?.prompt_tokens || 0;
        completionTokens = result.usage?.completion_tokens || 0;
        totalTokens = result.usage?.total_tokens || 0;
      } 
      // Anthropic specific
      else if (result.content && Array.isArray(result.content)) {
          content = result.content[0]?.text || "";
          promptTokens = result.usage?.input_tokens || 0;
          completionTokens = result.usage?.output_tokens || 0;
          totalTokens = promptTokens + completionTokens;
      }
      // Gemini
      else if (result.candidates && result.candidates.length > 0) {
          content = result.candidates[0].content?.parts?.[0]?.text || "";
          promptTokens = result.usageMetadata?.promptTokenCount || 0;
          completionTokens = result.usageMetadata?.candidatesTokenCount || 0;
          totalTokens = result.usageMetadata?.totalTokenCount || 0;
      }
      // Fallback
      else {
          content = JSON.stringify(result, null, 2);
      }

      setResponse(content);
      
      if (promptTokens > 0) {
        setUsage({ total_tokens: totalTokens, prompt_tokens: promptTokens, completion_tokens: completionTokens });
        setCost(llmService.calculateCost(model, promptTokens, completionTokens));
      }

    } catch (err: any) {
      console.error("Run Prompt Error:", err);
      const errMsg = err.message || "Failed to generate response";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [variables]); // Depend on variables state

  return {
    isLoading,
    response,
    error,
    usage,
    cost,
    runPrompt,
    getApiKey,
    setApiKey,
    hasKey,
    variables,
    detectVariables,
    updateVariable,
    setResponse // Exposed for external updates (e.g. Auto-Agent)
  };
};
