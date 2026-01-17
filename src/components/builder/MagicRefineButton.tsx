import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, Wand2, X, Check } from "lucide-react";
import { useLLM } from "../../hooks/useLLM";
import { PROVIDERS, MODELS, LLMProvider } from "../../services/llm";
import toast from "react-hot-toast";

interface MagicRefineButtonProps {
  inputPrompt: string;
  onRefine: (refined: string) => void;
  theme: any;
}

export const MagicRefineButton = ({ inputPrompt, onRefine, theme: t }: MagicRefineButtonProps) => {
  const llm = useLLM();
  const [isOpen, setIsOpen] = useState(false);
  const [provider, setProvider] = useState<LLMProvider>("openai");
  const [model, setModel] = useState("gpt-4o");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-detect best available provider on mount
  useEffect(() => {
    if (llm.hasKey("openai")) { setProvider("openai"); setModel("gpt-4o"); }
    else if (llm.hasKey("anthropic")) { setProvider("anthropic"); setModel("claude-3-5-sonnet-20240620"); }
    else if (llm.hasKey("gemini")) { setProvider("gemini"); setModel("gemini-1.5-pro"); }
    else if (llm.hasKey("deepseek")) { setProvider("deepseek"); setModel("deepseek-chat"); }
  }, []); // Run once on mount

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRefine = async () => {
    if (!inputPrompt.trim()) {
      toast.error("Please enter a prompt first!");
      return;
    }
    
    if (!llm.hasKey(provider)) {
      toast.error(`Please add your ${provider} API key in the Playground tab or Model Settings.`);
      setIsOpen(true);
      return;
    }

    const systemPrompt = `
      You are an expert Prompt Engineer. 
      Your task is to take the user's raw, vague prompt and rewrite it to be:
      1. Clear and specific.
      2. Structured (but do not add XML tags yet, the tool adds those later).
      3. Focused on intent.
      4. Concise (under 200 words).
      
      Do not answer the prompt. ONLY rewrite the prompt itself. 
      Maintain the original intent but upgrade the quality.
    `;

    try {
      await llm.runPrompt(provider, model, inputPrompt, systemPrompt);
    } catch (e) {
      console.error(e);
    }
  };

  // When response arrives, apply it (could add intermediate confirmation step, but for speed applying directly with Undo is better. 
  // Here we just pass it to onRefine, the parent handles state).
  useEffect(() => {
    if (llm.response && !llm.isLoading && !llm.error) {
       onRefine(llm.response);
       toast.success("Prompt refined!");
       // Reset response to avoid loop if parent re-renders?
       // Actually usage pattern: click -> loading -> response -> update parent -> done.
       // We should verify we don't trigger this on old responses. 
       // llm.response persists. We might want to clear it?
       // Or compare?
    }
  }, [llm.response, llm.isLoading, llm.error]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <button
            onClick={handleRefine}
            disabled={llm.isLoading}
            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                bg-gradient-to-r from-purple-600 to-pink-600 text-white
                shadow-md hover:shadow-lg transition-all duration-200
                hover:scale-105 active:scale-95
                disabled:opacity-70 disabled:cursor-not-allowed
            `}
        >
            {llm.isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <Sparkles className="w-3.5 h-3.5 fill-white/20" />
            )}
            {llm.isLoading ? "Refining..." : "Magic Refine"}
        </button>
        
        <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
                p-1.5 rounded-lg border ${t.border} ${t.button}
                hover:border-purple-500/50 transition-colors
            `}
            title="Configure Magic Refine"
        >
            <Wand2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Settings Dropdown */}
      {isOpen && (
        <div className={`
            absolute top-full left-0 mt-2 w-72 p-4 rounded-xl border ${t.border} 
            ${t.card} shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200
        `}>
            <div className="flex justify-between items-center mb-4">
                <h4 className={`font-semibold text-sm ${t.text}`}>Refine Settings</h4>
                <button onClick={() => setIsOpen(false)}>
                    <X className={`w-4 h-4 ${t.textSecondary} hover:text-red-500`} />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                     <label className={`block text-xs font-medium ${t.textSecondary} mb-1.5`}>Model Provider</label>
                     <div className="grid grid-cols-2 gap-2">
                        {Object.entries(PROVIDERS).map(([key, val]) => (
                            <button
                                key={key}
                                onClick={() => setProvider(val as LLMProvider)}
                                className={`
                                    px-2 py-1.5 rounded-md text-xs font-medium border
                                    transition-colors flex items-center justify-center gap-1
                                    ${provider === val 
                                        ? 'bg-purple-500/10 border-purple-500 text-purple-500' 
                                        : `${t.border} ${t.textSecondary} hover:bg-slate-700/50`
                                    }
                                `}
                            >
                                {key}
                                {llm.hasKey(val as LLMProvider) && <Check className="w-3 h-3 text-green-500" />}
                            </button>
                        ))}
                     </div>
                </div>

                <div>
                    <label className={`block text-xs font-medium ${t.textSecondary} mb-1.5`}>Select Model</label>
                    <select
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className={`w-full p-2 rounded-lg border text-sm ${t.input}`}
                    >
                         {(MODELS[provider] || []).map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                         ))}
                    </select>
                </div>
                
                {!llm.hasKey(provider) && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-xs text-red-400">
                            Warning: No API Key found for {provider}. 
                            Go to <strong>Playground</strong> tab to add one.
                        </p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
