import React, { useState, useEffect } from 'react';
import { Send, Bot, RotateCcw, Save } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface PlaygroundProps {
    // sessionId: string; // Not strictly needed for stateless simulation
    initialSystemPrompt: string;
    theme: any;
    onClose: () => void;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const Playground: React.FC<PlaygroundProps> = ({ initialSystemPrompt, theme: t, onClose }) => {
    const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Initial message to start the conversation
    useEffect(() => {
        setMessages([{ role: 'system', content: 'Agent Simulation Started.' }]);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Include history (excluding the first 'system' status msg)
            // And append the new user message
            // Wait.. the userMsg is already in state? No, setState is async.
            // Better to pass explicitly.
            
            const history = messages.filter(m => m.role !== 'system');
            
            const res = await api.post<any>('/api/architect/playground', {
                systemPrompt,
                messages: [...history, userMsg]
            });

            if (res.success) {
                const aiMsg: Message = { role: 'assistant', content: res.data.message };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                toast.error("Simulation failed");
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="h-full flex flex-col bg-gray-900 text-gray-200">
            {/* Header */}
            <div className={`h-14 border-b ${t.border} flex items-center justify-between px-4 bg-gray-900/50`}>
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-white">Agent Simulator</span>
                    <span className="text-xs text-gray-500 px-2 py-0.5 border border-gray-700 rounded-full">Test Mode</span>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setMessages([{ role: 'system', content: 'Simulation Reset.' }])}
                        className="p-2 hover:bg-gray-800 rounded text-gray-400"
                        title="Reset Chat"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={onClose}
                        className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded transition-colors"
                    >
                        Close Playground
                    </button>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: System Prompt Editor */}
                <div className="w-1/2 border-r border-gray-800 flex flex-col">
                    <div className="p-3 bg-gray-800/30 border-b border-gray-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase">System Prompt Configuration</span>
                        <Save className="w-3 h-3 text-gray-600" /> 
                    </div>
                    <textarea 
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="flex-1 bg-gray-900 p-4 font-mono text-xs text-green-300 resize-none focus:outline-none"
                        placeholder="Enter system instructions here..."
                        spellCheck={false}
                    />
                </div>

                {/* Right: Chat Interface */}
                <div className="w-1/2 flex flex-col bg-black/20">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role === 'system' ? (
                                    <div className="w-full text-center my-4">
                                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">{m.content}</span>
                                    </div>
                                ) : (
                                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                        m.role === 'user' 
                                            ? 'bg-purple-600 text-white rounded-br-none' 
                                            : 'bg-gray-800 text-gray-200 rounded-bl-none'
                                    }`}>
                                        <div className="whitespace-pre-wrap">{m.content}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-lg p-3 rounded-bl-none flex items-center gap-2">
                                    <Bot className="w-4 h-4 text-green-400 animate-bounce" />
                                    <span className="text-xs text-gray-500">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Test your agent..."
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-purple-500 resize-none h-12 max-h-32"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-2 p-1.5 bg-purple-600 hover:bg-purple-500 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-[10px] text-gray-600 mt-2 text-center">
                            Runs simulation with current System Prompt + Chat History
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
