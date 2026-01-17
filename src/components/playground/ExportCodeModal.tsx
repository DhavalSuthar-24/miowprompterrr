import { useState } from "react";
import { Code, X, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import toast from "react-hot-toast";
import { generatePython, generateTypeScript, generateCurl } from "../../utils/codeGenerators";
import { LLMProvider } from "../../services/llm";

interface ExportCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: any;
  provider: LLMProvider;
  model: string;
  prompt: string;
  systemPrompt: string;
}

export const ExportCodeModal = ({
  isOpen,
  onClose,
  theme: t,
  provider,
  model,
  prompt,
  systemPrompt,
}: ExportCodeModalProps) => {
  const [exportLang, setExportLang] = useState<"python" | "ts" | "curl">("python");

  if (!isOpen) return null;

  const getExportCode = () => {
    const opts = {
      provider,
      model,
      prompt,
      systemPrompt,
      apiKey: "YOUR_API_KEY_HERE",
    };
    switch (exportLang) {
      case "python":
        return generatePython(opts);
      case "ts":
        return generateTypeScript(opts);
      case "curl":
        return generateCurl(opts);
      default:
        return "";
    }
  };

  const copyExportCode = () => {
    navigator.clipboard.writeText(getExportCode());
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl ${t.card} rounded-xl border ${t.border} shadow-2xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h3 className={`font-bold ${t.text} flex items-center gap-2`}>
            <Code className="w-5 h-5 text-purple-400" />
            Export Code
          </h3>
          <button onClick={onClose} className={`${t.textSecondary} hover:text-white transition-colors`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-700/50 bg-gray-900/20">
          {["python", "ts", "curl"].map((lang) => (
            <button
              key={lang}
              onClick={() => setExportLang(lang as any)}
              className={`
                 flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all relative
                 ${
                   exportLang === lang
                     ? "bg-purple-500/10 text-purple-400"
                     : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                 }
               `}
            >
              {lang === "ts" ? "TypeScript" : lang}
              {exportLang === lang && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-0 bg-[#1e1e1e]">
          <SyntaxHighlighter
            style={vscDarkPlus as any}
            language={
              exportLang === "ts"
                ? "typescript"
                : exportLang === "curl"
                ? "bash"
                : "python"
            }
            customStyle={{ margin: 0, borderRadius: 0, fontSize: "13px", minHeight: "100%" }}
            showLineNumbers
            wrapLines
          >
            {getExportCode()}
          </SyntaxHighlighter>
        </div>

        <div className="p-4 border-t border-gray-700/50 flex justify-end gap-2 bg-gray-900/50 rounded-b-xl">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-sm ${t.button}`}
          >
            Close
          </button>
          <button
            onClick={copyExportCode}
            className={`px-4 py-2 rounded-lg text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg flex items-center gap-2 transition-transform active:scale-95`}
          >
            <Copy className="w-4 h-4" />
            Copy Snippet
          </button>
        </div>
      </div>
    </div>
  );
};
