import { useState } from "react";
import { Play, CheckCircle, XCircle, Plus, Trash2 } from "lucide-react";
import toast from 'react-hot-toast';
import { llmService, LLMProvider } from "../../services/llm";
import { useLLM } from "../../hooks/useLLM"; // For API key access

interface TestCase {
  id: string;
  input: string;
  assertion: "contains" | "not_contains" | "length_lt" | "regex";
  expectedValue: string;
  status: "idle" | "running" | "pass" | "fail";
  actualOutput?: string;
  error?: string;
}

interface EvaluationSuiteProps {
  promptTemplate: string;
  systemPrompt: string;
  provider: LLMProvider;
  model: string;
  theme: any;
}

export const EvaluationSuite = ({ promptTemplate, systemPrompt, provider, model, theme: t }: EvaluationSuiteProps) => {
  const llm = useLLM();
  const [cases, setCases] = useState<TestCase[]>([
    { id: "1", input: "Hello", assertion: "length_lt", expectedValue: "100", status: "idle" },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const addCase = () => {
    setCases([
      ...cases,
      { id: Date.now().toString(), input: "", assertion: "contains", expectedValue: "", status: "idle" }
    ]);
  };

  const removeCase = (id: string) => {
    setCases(cases.filter(c => c.id !== id));
  };

  const updateCase = (id: string, updates: Partial<TestCase>) => {
    setCases(cases.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const interpolate = (template: string, input: string) => {
      // Basic substitution: if {{input}} exists, replace it. 
      // Else, just append input to template??
      // Actually, standard practice for prompt testing is usually replacing a variable.
      // But if the prompt already has {{variable}}, we probably want to map 'input' to one of those variables?
      // For simplicity MVP: If prompt has {{input}}, replace it. Else append input.
      if (template.includes("{{input}}")) {
          return template.replace("{{input}}", input);
      }
      return `${template}\n\n${input}`;
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // Check key
    const apiKey = llm.getApiKey(provider);
    if (!apiKey) {
        toast.error(`Please add an API key for ${provider} in the main console first.`);
        setIsRunning(false);
        return;
    }

    const newCases = [...cases];

    for (let i = 0; i < newCases.length; i++) {
        const testCase = newCases[i];
        if (!testCase) continue; // Guard against undefined
        
        // Skip test cases with empty input
        if (!testCase.input || testCase.input.trim() === "") {
            updateCase(testCase.id, { status: "fail", error: "Input is required", actualOutput: "" });
            continue;
        }
        
        updateCase(testCase.id, { status: "running" }); // UI update trigger
        
        try {
            const finalPrompt = interpolate(promptTemplate, testCase.input);
            
            const response = await llmService.sendMessage({
                provider,
                model,
                apiKey,
                messages: [
                    { role: "system", content: systemPrompt || "You are a helpful assistant." },
                    { role: "user", content: finalPrompt }
                ],
                config: { temperature: 0.7, maxTokens: 1000, stream: false }
            });

            // Handle response structure depending on provider proxy return
            let outputText = "";
            if (typeof response === "string") {
                outputText = response;
            } else if ((response as any).choices && (response as any).choices[0]?.message?.content) {
                outputText = (response as any).choices[0].message.content;
            } else if ((response as any).content) {
                // Anthropic format
                const content = (response as any).content;
                if (Array.isArray(content)) {
                    outputText = content.map((c: any) => c.text || "").join("");
                } else {
                    outputText = content;
                }
            } else if ((response as any).candidates) {
                // Gemini format
                outputText = (response as any).candidates[0]?.content?.parts?.[0]?.text || "";
            } else {
                outputText = JSON.stringify(response); // Fallback
            }

            let passed = false;
            const expectedLower = testCase.expectedValue?.toLowerCase() || "";
            const outputLower = outputText.toLowerCase();
            
            if (testCase.assertion === "contains") {
                passed = expectedLower !== "" && outputLower.includes(expectedLower);
            } else if (testCase.assertion === "not_contains") {
                passed = expectedLower === "" || !outputLower.includes(expectedLower);
            } else if (testCase.assertion === "length_lt") {
                const maxLength = parseInt(testCase.expectedValue);
                passed = !isNaN(maxLength) && outputText.length < maxLength;
            } else if (testCase.assertion === "regex") {
                try {
                    const regex = new RegExp(testCase.expectedValue, "i");
                    passed = regex.test(outputText);
                } catch {
                    passed = false;
                }
            }

            updateCase(testCase.id, { status: passed ? "pass" : "fail", actualOutput: outputText });

        } catch (err: any) {
            const errorMessage = err.message || "Unknown error";
            updateCase(testCase.id, { status: "fail", error: errorMessage, actualOutput: "Error executing request" });
        }
    }

    setIsRunning(false);
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden animate-fade-in`}>
        <div className={`p-4 border-b ${t.border} flex justify-between items-center bg-gray-900/10`}>
            <div>
                 <h2 className={`font-bold ${t.text} flex items-center gap-2`}>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Automated Evaluation
                 </h2>
                 <p className={`text-xs ${t.textSecondary}`}>
                    Run assertions against {model}
                 </p>
            </div>
            <button
                onClick={runTests}
                disabled={isRunning}
                className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all
                    ${isRunning ? 'bg-slate-700 cursor-wait' : 'bg-green-600 hover:bg-green-500 text-white'}
                `}
            >
                {isRunning ? (
                    'Running...'
                ) : (
                    <>
                        <Play className="w-4 h-4 fill-current" />
                        Run All Tests
                    </>
                )}
            </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
             {/* Header Row */}
             <div className="grid grid-cols-12 gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 px-2">
                 <div className="col-span-3">Input Variable</div>
                 <div className="col-span-2">Assertion</div>
                 <div className="col-span-3">Expected Value</div>
                 <div className="col-span-3">Result / Output</div>
                 <div className="col-span-1"></div>
             </div>

             {cases.map((c) => (
                 <div key={c.id} className={`grid grid-cols-12 gap-2 items-start p-3 rounded-lg border ${t.border} bg-gray-900/20`}>
                     {/* Input */}
                     <div className="col-span-3">
                        <textarea
                            value={c.input}
                            onChange={(e) => updateCase(c.id, { input: e.target.value })}
                            placeholder="Input text..."
                            className={`w-full bg-transparent border-b ${t.border} focus:border-blue-500 focus:outline-none text-sm ${t.text} resize-none h-auto min-h-[40px]`}
                        />
                     </div>

                     {/* Assertion Type */}
                     <div className="col-span-2">
                        <select
                            value={c.assertion}
                            onChange={(e) => updateCase(c.id, { assertion: e.target.value as any })}
                            className={`w-full bg-slate-800 rounded px-2 py-1 text-xs text-slate-300 border border-slate-700 focus:outline-none`}
                        >
                            <option value="contains">Contains</option>
                            <option value="not_contains">Not Contains</option>
                            <option value="length_lt">Length &lt;</option>
                        </select>
                     </div>

                     {/* Expected */}
                     <div className="col-span-3">
                        <input
                            value={c.expectedValue}
                            onChange={(e) => updateCase(c.id, { expectedValue: e.target.value })}
                            placeholder="Value..."
                            className={`w-full bg-transparent border-b ${t.border} focus:border-blue-500 focus:outline-none text-sm ${t.text}`}
                        />
                     </div>

                     {/* Result */}
                     <div className="col-span-3 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            {c.status === "idle" && <span className="text-xs text-slate-500">Ready</span>}
                            {c.status === "running" && <span className="text-xs text-yellow-500 animate-pulse">Running...</span>}
                            {c.status === "pass" && <span className="text-xs text-green-400 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> PASS</span>}
                            {c.status === "fail" && <span className="text-xs text-red-400 font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> FAIL</span>}
                        </div>
                        {c.actualOutput && (
                            <div className="text-[10px] text-slate-400 font-mono bg-black/20 p-1 rounded max-h-[60px] overflow-y-auto">
                                {c.actualOutput.slice(0, 100)}{c.actualOutput.length > 100 ? '...' : ''}
                            </div>
                        )}
                        {c.error && (
                             <div className="text-[10px] text-red-400">{c.error}</div>
                        )}
                     </div>

                     {/* Actions */}
                     <div className="col-span-1 flex justify-end">
                        <button onClick={() => removeCase(c.id)} className="text-red-500 hover:text-red-400 p-1">
                            <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                 </div>
             ))}

             <button
                onClick={addCase}
                className="w-full py-3 rounded-lg border border-dashed border-gray-700 text-gray-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
             >
                <Plus className="w-4 h-4" /> Add Test Case
             </button>
        </div>
    </div>
  );
};
