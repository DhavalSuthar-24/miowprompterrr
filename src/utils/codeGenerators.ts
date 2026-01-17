
interface GeneratorOptions {
  provider: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  apiKey?: string;
}

export const generatePython = ({ provider, model, prompt, systemPrompt, apiKey = "YOUR_API_KEY" }: GeneratorOptions) => {
  const url = provider === "openai" ? "https://api.openai.com/v1/chat/completions" : 
              provider === "anthropic" ? "https://api.anthropic.com/v1/messages" : 
              "https://api.openai.com/v1/chat/completions"; // Default fallback

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    ...(provider === "anthropic" ? { "x-api-key": apiKey, "anthropic-version": "2023-06-01" } : {})
  };

  let body: any = {};
  
  if (provider === "anthropic") {
      body = {
          model: model,
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }]
      };
      if (systemPrompt) body.system = systemPrompt;
  } else {
      // OpenAI Standard
      body = {
          model: model,
          messages: []
      };
      if (systemPrompt) body.messages.push({ role: "system", content: systemPrompt });
      body.messages.push({ role: "user", content: prompt });
  }

  // Handle headers logic specially for Python string cleanliness
  const headerStr = Object.entries(headers).filter(([k]) => k !== "Authorization").map(([k, v]) => `"${k}": "${v}"`).join(",\n        ");
  
  // Basic Python Template using 'requests'
  return `import requests
import json

url = "${url}"

payload = ${JSON.stringify(body, null, 4)}

headers = {
    "Authorization": "Bearer ${apiKey}",
    ${headerStr}
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
`;
};


export const generateTypeScript = ({ provider, model, prompt, systemPrompt, apiKey = "YOUR_API_KEY" }: GeneratorOptions) => {
  const url = provider === "openai" ? "https://api.openai.com/v1/chat/completions" : 
              provider === "anthropic" ? "https://api.anthropic.com/v1/messages" : 
              "https://api.openai.com/v1/chat/completions";

  let body: any = {};
  const headers: any = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
  };

  if (provider === "anthropic") {
      headers["x-api-key"] = apiKey;
      headers["anthropic-version"] = "2023-06-01";
      delete headers["Authorization"]; // Anthropic uses x-api-key standardly in backend but let's stick to doc
      
      body = {
          model: model,
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }]
      };
      if (systemPrompt) body.system = systemPrompt;
  } else {
      body = {
          model: model,
          messages: []
      };
      if (systemPrompt) body.messages.push({ role: "system", content: systemPrompt });
      body.messages.push({ role: "user", content: prompt });
  }

  return `
async function runLLM() {
  const response = await fetch("${url}", {
    method: "POST",
    headers: ${JSON.stringify(headers, null, 4)},
    body: JSON.stringify(${JSON.stringify(body, null, 4)})
  });

  const data = await response.json();
  console.log(data);
}

runLLM();
`;
};

export const generateCurl = ({ provider, model, prompt, systemPrompt, apiKey = "YOUR_API_KEY" }: GeneratorOptions) => {
    const url = provider === "openai" ? "https://api.openai.com/v1/chat/completions" : 
                provider === "anthropic" ? "https://api.anthropic.com/v1/messages" : 
                "https://api.openai.com/v1/chat/completions";

    let body: any = {};
    let headerStr = `-H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${apiKey}"`;

    if (provider === "anthropic") {
        headerStr = `-H "x-api-key: ${apiKey}" \\\n  -H "anthropic-version: 2023-06-01" \\\n  -H "Content-Type: application/json"`;
        body = {
            model: model,
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }]
        };
        if (systemPrompt) body.system = systemPrompt;
    } else {
        body = {
            model: model,
            messages: []
        };
        if (systemPrompt) body.messages.push({ role: "system", content: systemPrompt });
        body.messages.push({ role: "user", content: prompt });
    }

    return `curl ${url} \\
  ${headerStr} \\
  -d '${JSON.stringify(body)}'`;
};
