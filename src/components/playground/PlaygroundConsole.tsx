import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useLLM } from "../../hooks/useLLM";
import { LLMProvider } from "../../services/llm";
import { ModelSelector } from "./ModelSelector";
import { ComparativeArena } from "./ComparativeArena";
import { AutoAgentMode } from "./AutoAgentMode";
import { EvaluationSuite } from "./EvaluationSuite"; // Added this import based on the presence of <EvaluationSuite />
import { Play, Loader2, Terminal, Copy, Layout, Maximize2, Code, TestTube, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { ExportCodeModal } from "./ExportCodeModal";

// ... imports ...

interface PlaygroundConsoleProps {
  initialPrompt?: string;
  theme: any;
}


export const PlaygroundConsole = ({ initialPrompt, theme: t }: PlaygroundConsoleProps) => {
  // --- 1. State & Hooks ---
  const llm = useLLM();
  const [mode, setMode] = useState<"single" | "arena" | "test" | "auto">("single");
  
  const [provider, setProvider] = useState<LLMProvider>("openai");
  const [model, setModel] = useState("gpt-4o");
  
  const [prompt, setPrompt] = useState(initialPrompt || "");
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);


  // --- 2. Effects ---
  useEffect(() => {
    // Optional: Sync prompt if prop changes significantly
    if (initialPrompt && initialPrompt !== prompt && !llm.response) {
       // logic to auto-update if desired, currently skipped to preserve user edits
    }
  }, [initialPrompt]);

  // Detected Variables Detection
  useEffect(() => {
    llm.detectVariables(prompt || "");
  }, [prompt, llm.detectVariables]);

  // --- 3. Handlers ---
  const handleAutoAgentComplete = (result: any) => {
      setSystemPrompt(result.analysis.optimizedSystemPrompt);
      setPrompt(initialPrompt || " "); // Or keep user intent? Maybe reset to result.response?
      // Actually, let's set the response to the result
      llm.setResponse(result.response);
      setMode("single");
      toast.success("Agent optimization complete!", { icon: "✨" });
  };

  const handleRun = async () => {
    if (!prompt.trim()) return;
    await llm.runPrompt(provider, model, prompt, systemPrompt);
  };

  const handleCopy = () => {
    if (llm.response) {
      navigator.clipboard.writeText(llm.response);
      toast.success("Response copied!");
    }
  };

  // --- 4. Render Modes ---
  
  // D. Auto Agent Mode
  if (mode === "auto") {
      return (
          <div className="h-full flex flex-col animate-fade-in">
             <div className={`flex justify-between items-center p-3 border-b ${t.border}`}>
                  <h2 className={`font-semibold ${t.text} flex items-center gap-2`}>
                     <Sparkles className="w-4 h-4 text-purple-500" />
                     Auto-Agent Mode
                  </h2>
                  <button 
                    onClick={() => setMode("single")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${t.border} ${t.button}`}
                  >
                    <Maximize2 className="w-4 h-4" />
                    Switch to Single View
                  </button>
              </div>
              <AutoAgentMode 
                onComplete={handleAutoAgentComplete}
                theme={t}
                provider={provider}
              />
          </div>
      )
  }

  // A. Arena Mode
  if (mode === "arena") {
       return (
          <div className="h-full flex flex-col animate-fade-in">
              <div className={`flex justify-between items-center p-3 border-b ${t.border}`}>
                  <h2 className={`font-semibold ${t.text} flex items-center gap-2`}>
                     <Layout className="w-4 h-4 text-blue-500" />
                     Arena Mode
                  </h2>
                  <button 
                    onClick={() => setMode("single")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${t.border} ${t.button}`}
                  >
                    <Maximize2 className="w-4 h-4" />
                    Switch to Single View
                  </button>
              </div>
              <ComparativeArena initialPrompt={prompt || initialPrompt} theme={t} />
          </div>
      );
  }

  // B. Test Evaluation Mode
  if (mode === "test") {
      return (
          <div className="h-full flex flex-col animate-fade-in">
              <div className={`flex justify-between items-center p-3 border-b ${t.border}`}>
                  <h2 className={`font-semibold ${t.text} flex items-center gap-2`}>
                     <TestTube className="w-4 h-4 text-green-500" />
                     Automated Eval Suite
                  </h2>
                  <button 
                    onClick={() => setMode("single")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${t.border} ${t.button}`}
                  >
                    <Maximize2 className="w-4 h-4" />
                    Switch to Single View
                  </button>
              </div>
              <EvaluationSuite 
                  promptTemplate={prompt}
                  systemPrompt={systemPrompt}
                  provider={provider}
                  model={model}
                  theme={t}
              />
          </div>
      )
  }

  // C. Default Single Mode
  return (
    <div className="animate-fade-in relative">
      {/* Export Modal Overlay */}
      <ExportCodeModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        theme={t}
        provider={provider}
        model={model}
        prompt={prompt}
        systemPrompt={systemPrompt}
      />

        {/* Toolbar */}
        <div className="flex justify-between mb-2">
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowExportModal(true)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${t.border} ${t.button} hover:text-purple-400 hover:border-purple-400 transition-colors`}
                >
                    <Code className="w-3.5 h-3.5" />
                    Export Code
                </button>
                <button 
                    onClick={() => setMode("test")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${t.border} ${t.button} hover:text-green-400 hover:border-green-400 transition-colors`}
                >
                    <TestTube className="w-3.5 h-3.5" />
                    Automated Eval
                </button>
                <button 
                    onClick={() => setMode("auto")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${t.border} bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20 transition-colors`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    Auto-Agent
                </button>
            </div>

            <button 
                onClick={() => setMode("arena")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${t.accent}`}
            >
                <Layout className="w-3.5 h-3.5" />
                Open Arena (Compare Models)
            </button>
        </div>

        {/* Model Selector Header */}
        <ModelSelector 
            provider={provider}
            model={model}
            setProvider={setProvider}
            setModel={setModel}
            hasKey={llm.hasKey(provider)}
            onSaveKey={(key) => llm.setApiKey(provider, key)}
            theme={t}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
            {/* Input Column */}
            <div className="flex flex-col gap-4 h-full">
                {/* System Prompt */}
                <div className={`${t.card} rounded-xl border ${t.border} p-4 flex-shrink-0`}>
                     <label className={`block text-xs font-bold ${t.textSecondary} mb-2 uppercase flex items-center gap-2`}>
                        <Terminal className="w-3 h-3" /> System Prompt
                     </label>
                     <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className={`w-full h-24 bg-transparent resize-none focus:outline-none text-sm ${t.text} font-mono`}
                        placeholder="Define the AI's persona..."
                     />
                </div>

                {/* Main Prompt */}
                <div className={`${t.card} rounded-xl border ${t.border} p-4 flex-grow flex flex-col`}>
                     <div className="flex items-center justify-between mb-2">
                        <label className={`block text-xs font-bold ${t.textSecondary} uppercase`}>
                             Input Prompt
                        </label>
                        <button 
                            onClick={() => setPrompt(initialPrompt || "")}
                            className={`text-xs ${t.accent} hover:underline`}
                        >
                            Reset to Builder Output
                        </button>
                     </div>
                     <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className={`w-full flex-grow bg-transparent resize-none focus:outline-none text-sm ${t.text} font-mono`}
                        placeholder="Enter your prompt here (use {{variable}} for dynamic inputs)..."
                     />
                     
                     {/* Variables Overlay */}
                     {Object.keys(llm.variables).length > 0 && (
                        <div className="p-3 bg-gray-900/10 border-t border-gray-700/30">
                            <div className={`text-[10px] font-bold ${t.textSecondary} uppercase mb-2`}>Variables detected</div>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.keys(llm.variables).map(key => (
                                    <div key={key}>
                                        <input 
                                            value={llm.variables[key]}
                                            onChange={(e) => llm.updateVariable(key, e.target.value)}
                                            className={`w-full px-2 py-1.5 text-xs rounded border ${t.border} bg-transparent ${t.text} focus:border-blue-500 focus:outline-none`}
                                            placeholder={key}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}

                     <div className="mt-4 flex justify-end">
                         <button
                            onClick={handleRun}
                            disabled={llm.isLoading || !llm.hasKey(provider)}
                            className={`
                                flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-lg
                                transition-all duration-200 transform hover:scale-105 active:scale-95
                                ${llm.isLoading || !llm.hasKey(provider) 
                                    ? "bg-slate-600 cursor-not-allowed opacity-50" 
                                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                                }
                            `}
                         >
                            {llm.isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 fill-current" />
                                    Run Prompt
                                </>
                            )}
                         </button>
                     </div>
                </div>
            </div>

            {/* Output Column */}
            <div className={`${t.card} rounded-xl border ${t.border} p-6 flex flex-col h-full overflow-hidden relative group`}>
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <label className={`block text-xs font-bold ${t.textSecondary} uppercase flex items-center gap-2`}>
                        Output
                        {llm.usage && (
                            <span className="flex items-center gap-2">
                                <span className="text-[10px] bg-slate-700/50 px-2 py-0.5 rounded-full text-slate-300 normal-case font-normal">
                                    {llm.usage.total_tokens || '?'} tokens
                                </span>
                                {llm.cost > 0 && (
                                    <span className="text-[10px] bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-green-400 normal-case font-mono">
                                        ${llm.cost.toFixed(5)}
                                    </span>
                                )}
                            </span>
                        )}
                    </label>
                    {llm.response && (
                         <button 
                            onClick={handleCopy}
                            className={`p-2 rounded-lg hover:bg-slate-700/50 transition-colors ${t.textSecondary}`}
                            title="Copy Output"
                         >
                             <Copy className="w-4 h-4" />
                         </button>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                     {llm.error ? (
                         <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                             <strong>Error:</strong> {llm.error}
                         </div>
                     ) : llm.response ? (
                         <div className={`prose prose-sm max-w-none ${t.text === 'text-slate-900' ? 'prose-slate' : 'prose-invert'}`}>
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
                         <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                             <Terminal className="w-12 h-12 mb-4" />
                             <p className="text-sm">Run a prompt to see execution results</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    </div>
  );
};
