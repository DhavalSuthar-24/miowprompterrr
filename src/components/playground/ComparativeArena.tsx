import { useState } from "react";
import { useLLM } from "../../hooks/useLLM";
import { LLMProvider } from "../../services/llm";
import { ModelSelector } from "./ModelSelector";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Play, Loader2, Clock, AlignLeft, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ComparativeArenaProps {
  initialPrompt?: string;
  theme: any;
}

const ArenaColumn = ({ 
  id, 
  llm, 
  provider, 
  setProvider, 
  model, 
  setModel, 
  theme: t 
}: any) => {
  return (
    <div className={`flex flex-col h-full border-r ${t.border} last:border-r-0`}>
      <div className="p-4 border-b border-gray-700/50 bg-gray-800/20">
        <div className="flex items-center gap-2 mb-2 font-semibold">
           <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs uppercase tracking-wider">
             Arena {id}
           </span>
        </div>
        <ModelSelector
          provider={provider}
          setProvider={setProvider}
          model={model}
          setModel={setModel}
          hasKey={llm.hasKey(provider)}
          onSaveKey={(k: string) => llm.saveKey(provider, k)}
          theme={t}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 min-h-[300px]">
        {llm.error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                <div className="flex items-center gap-2 font-semibold mb-1">
                    <AlertCircle className="w-4 h-4" />
                    Error
                </div>
                {llm.error}
            </div>
        )}
        
        {llm.response ? (
             <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code(props: any) {
                            const { className, children, ref, ...rest } = props;
                            const match = /language-(\w+)/.exec(className || "");
                            return match ? (
                                <SyntaxHighlighter
                                    style={vscDarkPlus as any}
                                    language={match[1]}
                                    PreTag="div"
                                    {...rest}
                                >
                                    {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={`${className} bg-slate-700/50 rounded px-1 py-0.5`} {...rest}>
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {llm.response}
                </ReactMarkdown>
             </div>
        ) : (
             <div className="flex items-center justify-center h-full text-gray-500 text-sm italic">
                {llm.isLoading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span>Generating...</span>
                    </div>
                ) : (
                    "Ready to run"
                )}
             </div>
        )}
      </div>

      {/* Metrics Footer */}
      {(llm.response || llm.isLoading) && (
        <div className={`p-3 border-t ${t.border} bg-gray-900/30 text-xs flex justify-between`}>
             <span className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                {llm.isLoading ? "..." : "Latency: < 1s"} {/* Placeholder until metrics hook updated */}
             </span>
             <span className="flex items-center gap-1.5 text-gray-400">
                <AlignLeft className="w-3.5 h-3.5" />
                {llm.response ? `${llm.response.length} chars` : "0 chars"}
             </span>
        </div>
      )}
    </div>
  );
};

export const ComparativeArena = ({ initialPrompt = "", theme: t }: ComparativeArenaProps) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [systemPrompt, setSystemPrompt] = useState("");
  
  // Arena A
  const llmA = useLLM();
  const [providerA, setProviderA] = useState<LLMProvider>("openai");
  const [modelA, setModelA] = useState("gpt-4o");

  // Arena B
  const llmB = useLLM();
  const [providerB, setProviderB] = useState<LLMProvider>("anthropic");
  const [modelB, setModelB] = useState("claude-3-5-sonnet-20240620");

  const handleRunAll = async () => {
    if (!prompt.trim()) {
        toast.error("Please enter a prompt");
        return;
    }

    // Run in parallel
    const pA = llmA.runPrompt(providerA, modelA, prompt, systemPrompt);
    const pB = llmB.runPrompt(providerB, modelB, prompt, systemPrompt);
    
    await Promise.allSettled([pA, pB]);
    toast.success("Comparison complete!");
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-140px)]`}>
       {/* Master Inputs */}
       <div className={`p-4 border-b ${t.border} flex flex-col gap-4 bg-gray-900/20`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className={`block text-xs font-bold ${t.textSecondary} mb-1 uppercase tracking-wider`}>System Prompt</label>
                <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    className={`w-full p-2 h-20 text-sm rounded-lg border resize-none ${t.input}`}
                />
             </div>
             <div className="flex flex-col">
                <label className={`block text-xs font-bold ${t.textSecondary} mb-1 uppercase tracking-wider`}>User Prompt</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter prompt to compare..."
                    className={`w-full p-2 h-20 text-sm rounded-lg border resize-none flex-1 font-mono ${t.input}`}
                />
             </div>
          </div>
          <button
            onClick={handleRunAll}
            disabled={llmA.isLoading || llmB.isLoading}
            className={`
                w-full py-3 rounded-xl font-bold text-sm tracking-wide shadow-lg
                flex items-center justify-center gap-2
                ${t.accent} ${t.accentHover} disabled:opacity-50 transition-all
            `}
          >
             {(llmA.isLoading || llmB.isLoading) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
             RUN BATTLE
          </button>
       </div>

       {/* Arena Grid */}
       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          <ArenaColumn 
             id="A" 
             llm={llmA} 
             provider={providerA} 
             setProvider={setProviderA} 
             model={modelA} 
             setModel={setModelA} 
             theme={t} 
          />
          <ArenaColumn 
             id="B" 
             llm={llmB} 
             provider={providerB} 
             setProvider={setProviderB} 
             model={modelB} 
             setModel={setModelB} 
             theme={t} 
          />
       </div>
    </div>
  );
};
