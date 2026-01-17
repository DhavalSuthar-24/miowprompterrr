import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Paperclip, Sparkles } from 'lucide-react';
import { AgentMessage } from './types';
import ReactMarkdown from 'react-markdown';

interface ArchitectChatProps {
  messages: AgentMessage[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  theme: any;
}

export const ArchitectChat: React.FC<ArchitectChatProps> = ({ messages, onSendMessage, isProcessing, theme: t }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950/20">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
            <Sparkles className="w-12 h-12 text-purple-500 mb-4" />
            <h3 className={`text-xl font-bold ${t.text} mb-2`}>Start a New Project</h3>
            <p className={`${t.textSecondary} max-w-md`}>
              Describe your idea, and I will research, plan, phase, and execute it for you.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isSystem = msg.role === 'system';
          
          if (isSystem) return null; // Hide raw system prompts usually

          return (
            <div 
              key={msg.id || idx} 
              className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1
                ${isUser ? 'bg-blue-600' : 'bg-purple-600'}
              `}>
                {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
              </div>

              <div className={`
                max-w-[80%] rounded-2xl p-4 shadow-sm
                ${isUser 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : `bg-gray-800/80 border ${t.border} text-gray-100 rounded-tl-none`
                }
              `}>
                <div className="prose prose-invert prose-sm max-w-none break-words">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.metadata && msg.metadata.phaseChange && (
                   <div className="mt-2 text-xs opacity-70 border-t border-white/20 pt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Phase changed to {msg.metadata.phaseChange}
                   </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex gap-4 animate-pulse">
             <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mt-1">
                <Bot className="w-5 h-5 text-white" />
             </div>
             <div className={`bg-gray-800/80 border ${t.border} rounded-2xl rounded-tl-none p-4 w-24 flex items-center justify-center`}>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
             </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${t.border} bg-gray-900/40`}>
        <div className={`
            relative flex items-end gap-2 p-2 rounded-xl border transition-all
            ${t.card} ${t.border} focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/20
        `}>
            <button className={`p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors`}>
                <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type your instruction..."
                className="flex-1 max-h-32 bg-transparent border-none focus:ring-0 resize-none py-2 text-sm leading-relaxed"
                rows={1}
                disabled={isProcessing}
            />

            <button 
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isProcessing}
                className={`
                    p-2 rounded-lg transition-all
                    ${input.trim() && !isProcessing
                        ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/30' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }
                `}
            >
                <Send className="w-5 h-5" />
            </button>
        </div>
        <p className="text-[10px] text-center text-gray-500 mt-2">
            AI can make mistakes. Please review critical code and plans.
        </p>
      </div>
    </div>
  );
};
