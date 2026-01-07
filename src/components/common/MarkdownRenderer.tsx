import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                style={atomDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  background: "#1e293b", // slate-800
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  margin: "1rem 0",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className={className ? className : "bg-slate-700/50 px-1.5 py-0.5 rounded text-sm font-mono text-slate-200"}>
                {children}
              </code>
            );
          },
          // Custom styling for other elements if needed, but 'prose-invert' handles most
          a: ({ node, ...props }) => (
            <a {...props} className="text-blue-400 hover:text-blue-300 no-underline hover:underline" target="_blank" rel="noopener noreferrer" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-5 space-y-1" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-5 space-y-1" />
          ),
          h1: ({ node, ...props }) => (
            <h1 {...props} className="text-2xl font-bold text-slate-100 mt-6 mb-4 pb-2 border-b border-slate-700" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-xl font-bold text-slate-100 mt-5 mb-3" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-lg font-bold text-slate-100 mt-4 mb-2" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
