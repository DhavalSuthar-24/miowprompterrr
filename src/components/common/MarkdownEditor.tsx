import { useState } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Eye, Edit } from "lucide-react"; // Icons for tabs

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = "min-h-[300px]",
  className = "",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  return (
    <div className={`border border-slate-700 bg-slate-800 rounded-xl overflow-hidden ${className}`}>
      {/* Tabs */}
      <div className="flex bg-slate-900/50 border-b border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "write"
              ? "bg-slate-800 text-slate-100 border-t-2 border-t-blue-500"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Edit className="w-4 h-4" />
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "preview"
              ? "bg-slate-800 text-slate-100 border-t-2 border-t-blue-500"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Content */}
      <div className={`p-4 ${minHeight} bg-slate-800`}>
        {activeTab === "write" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[inherit] bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 font-mono text-sm resize-y outline-none"
            spellCheck={false}
          />
        ) : (
          <div className="prose prose-invert max-w-none h-full overflow-y-auto">
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-slate-500 italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>
      
      {/* Footer / Helper Text */}
      {activeTab === "write" && (
        <div className="px-4 py-2 bg-slate-900/30 border-t border-slate-700 text-xs text-slate-500 flex justify-between">
          <span>Markdown supported</span>
          <span>{value.length} chars</span>
        </div>
      )}
    </div>
  );
}

export default MarkdownEditor;
