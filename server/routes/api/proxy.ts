import { Router, Request, Response } from "express";

const router = Router();

// Types
type LLMProvider = "openai" | "anthropic" | "gemini" | "deepseek" | "groq";

interface ProxyRequest {
  provider: LLMProvider;
  model: string;
  messages: any[]; // Generalized message format
  apiKey: string;
  config?: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
    [key: string]: any;
  };
}

router.post("/chat/completions", async (req: Request, res: Response) => {
  try {
    const { provider, model, messages, apiKey, config = {} } = req.body as ProxyRequest;

    if (!provider || !model || !messages || !apiKey) {
      res.status(400).json({ error: "Missing required fields: provider, model, messages, apiKey" });
      return;
    }

    let url = "";
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    let body: any = {};

    // ------------------------------------------------------------------------
    // ADAPTER LOGIC
    // ------------------------------------------------------------------------
    switch (provider) {
      case "openai":
        url = "https://api.openai.com/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        body = {
          model,
          messages,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens,
          stream: config.stream ?? false,
        };
        break;

      case "deepseek":
        url = "https://api.deepseek.com/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        body = {
          model,
          messages,
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens,
          stream: config.stream ?? false,
        };
        break;
      
      case "groq":
        url = "https://api.groq.com/openai/v1/chat/completions";
        headers["Authorization"] = `Bearer ${apiKey}`;
        body = {
            model,
            messages,
            temperature: config.temperature ?? 0.7,
            max_tokens: config.maxTokens,
            stream: config.stream ?? false,
        };
        break;

      case "anthropic":
        url = "https://api.anthropic.com/v1/messages";
        headers["x-api-key"] = apiKey;
        headers["anthropic-version"] = "2023-06-01";
        // Anthropic messages format is slightly different, but assuming frontend sends correct structure or we adapt
        // Simple adaptation if messages are OpenAI style:
        // System message needs to be extracted for Anthropic
        const systemMessage = messages.find((m: any) => m.role === "system");
        const userMessages = messages.filter((m: any) => m.role !== "system");

        body = {
          model,
          messages: userMessages, // Anthropic expects only user/assistant messages here
          system: systemMessage ? systemMessage.content : undefined,
          max_tokens: config.maxTokens ?? 1024,
          temperature: config.temperature ?? 0.7,
          stream: config.stream ?? false,
        };
        break;

      case "gemini":
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        // Gemini expects specific format.
        // For v1beta, system_instruction is supported.
        const systemMsg = messages.find((m: any) => m.role === "system");
        const chatMsgs = messages.filter((m: any) => m.role !== "system");
        
        const convertedMsgs = chatMsgs.map((m:any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        body = {
          contents: convertedMsgs,
          generationConfig: {
            temperature: config.temperature ?? 0.7,
            maxOutputTokens: config.maxTokens,
          },
        };
        if (systemMsg) {
             body.systemInstruction = { parts: [{ text: systemMsg.content }] };
        }
        break;

      default:
        res.status(400).json({ error: "Unsupported provider" });
        return;
    }

    // ------------------------------------------------------------------------
    // PROXY EXECUTION
    // ------------------------------------------------------------------------
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Proxy Error [${provider}]:`, errorText);
      res.status(response.status).json({
        error: `Provider error: ${response.statusText}`,
        details: errorText,
      });
      return;
    }

    // If streaming
    if (config.stream) {
      // Set headers for SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Pipe the body
      // @ts-ignore - ReadableStream/Node stream mismatch types sometimes
      if (response.body) {
          // Node 18+ fetch returns a web stream, might need to convert or iterate
          // Using simple iteration for generic node env
          for await (const chunk of response.body as any) {
              res.write(chunk);
          }
      }
      res.end();
    } else {
      // JSON Response
      const data = await response.json();
      res.json(data);
    }

  } catch (error) {
    console.error("Proxy Endpoint Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
