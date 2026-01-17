import { useState } from "react";
import { Sparkles, Bot, Loader2, BrainCircuit } from "lucide-react";
import { api } from "../../lib/api";
import { useLLM } from "../../hooks/useLLM";
import toast from "react-hot-toast";

interface AutoAgentModeProps {
  onComplete: (result: any) => void;
  theme: any;
  provider: string; // To get the API key
}

export const AutoAgentMode = ({ onComplete, theme: t, provider }: AutoAgentModeProps) => {
  const llm = useLLM();
  const [intent, setIntent] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  
  const handleRunAgent = async () => {
      if (!intent.trim()) return;
      
      const apiKey = llm.getApiKey(provider as any);
      if (!apiKey) {
          toast.error(`Please add an API key for ${provider} first`);
          return;
      }

      setIsThinking(true);
      setSteps(["Analyzing intent...", "Selecting expert persona...", "Determining prompt techniques..."]);
      
      try {
          // Verify agent endpoint exists using direct fetch or api lib
          // Actually, we should just assume it works or handle error
          const response = await api.post("/api/agent/run", {
              prompt: intent,
              apiKey: apiKey, 
              model: "gpt-4o" // Defaulting to high reasoned model
          }) as any;

          // Mock initial thinking
          setSteps(prev => [...prev, "Constructing system prompt...", "Executing final prompt..."]);
          
          if (response && response.analysis && response.analysis.agentSteps) {
              const realSteps = response.analysis.agentSteps.map((s: any) => `Tool: ${s.action} -> ${s.observation.slice(0, 50)}...`);
              setSteps(realSteps);
              // Allow user to see the real steps for a moment
              await new Promise(r => setTimeout(r, 1500));
          } else {
             // Fallback delay
             await new Promise(r => setTimeout(r, 800));
          }
          
          onComplete(response); 
          
      } catch (error: any) {
          toast.error(error.message || "Agent failed to run");
          setSteps(prev => [...prev, "Error encountered during execution."]);
      } finally {
          setIsThinking(false);
      }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className={`max-w-xl w-full ${t.card} border ${t.border} rounded-2xl p-8 shadow-2xl relative overflow-hidden`}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
            
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg shadow-purple-900/20">
                    {isThinking ? (
                        <BrainCircuit className="w-8 h-8 text-white animate-pulse" />
                    ) : (
                        <Bot className="w-8 h-8 text-white" />
                    )}
                </div>
                <h2 className={`text-2xl font-bold ${t.text} mb-2`}>
                    Autonomous Prompt Agent
                </h2>
                <p className={`${t.textSecondary}`}>
                    Describe your goal in plain English. I'll pick the perfect persona, applying advanced prompt engineering techniques to solve it.
                </p>
            </div>

            <div className="space-y-4 relative z-10">
                <textarea
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    disabled={isThinking}
                    placeholder="e.g., 'Write a high-converting landing page for a SaaS product for cat owners'"
                    className={`w-full h-32 p-4 rounded-xl bg-gray-900/50 border ${t.border} ${t.text} focus:border-blue-500 focus:outline-none resize-none transition-all placeholder:text-gray-600`}
                />
                
                <button
                    onClick={handleRunAgent}
                    disabled={isThinking || !intent.trim()}
                    className={`
                        w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
                        ${isThinking 
                            ? "bg-slate-700 cursor-wait text-slate-400" 
                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transform hover:scale-[1.02] active:scale-[0.98]"
                        }
                    `}
                >
                    {isThinking ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Reasoning...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 fill-current" />
                            Auto-Generate
                        </>
                    )}
                </button>
            </div>

            {/* Thinking Steps */}
            {isThinking && (
                <div className="mt-8 space-y-2">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm text-blue-300 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {step}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
