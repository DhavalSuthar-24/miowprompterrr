import { useState, useEffect } from "react";
import { ArchitectSidebar } from "../components/architect/ArchitectSidebar";
import { ArchitectChat } from "../components/architect/ArchitectChat";
import { CommunityFeed } from "../components/architect/CommunityFeed";
import { Playground } from "../components/architect/Playground";
import { GamificationProfile } from "../components/profile/GamificationProfile";
import { AgentSession } from "../components/architect/types";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import { Share2, Globe, Lock, GitFork, Trophy } from "lucide-react";
import { useAuth } from "../contexts"; // Assuming AuthContext is exported from here

export const ArchitectPage = ({ theme: t }: { theme: any }) => {
    // Auth Hook
    const { user } = useAuth();

    const [session, setSession] = useState<AgentSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [view, setView] = useState<'workspace' | 'community' | 'playground'>('workspace');
    const [isForking, setIsForking] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [selectedPersonality, setSelectedPersonality] = useState('startup-cto');

    const PERSONAS = [
        { id: 'startup-cto', label: 'The Startup CTO', desc: 'Fast, pragmatic, MVP-focused.' },
        { id: 'enterprise-architect', label: 'The Enterprise Architect', desc: 'Secure, strict patterns, documented.' },
        { id: 'hacker', label: 'The Hacker', desc: 'Bleeding-edge, minimal, code-is-art.' },
        { id: 'product-visionary', label: 'The Product Visionary', desc: 'UX-obsessed, user-centric.' },
    ];

    // Initial Load
    useEffect(() => {
    }, []);

    const startNewSession = async () => {
        setIsLoading(true);
        try {
            const res = await api.post<AgentSession>('/api/architect/session', {
                title: "New Project",
                projectDescription: "Initial Session",
                userId: user?.id,
                personality: selectedPersonality
            });

            if (res.success && res.data) {
                setSession(res.data);
                toast.success(`Architect Session Initialized (${PERSONAS.find(p => p.id === selectedPersonality)?.label})`);
                setView('workspace');
            } else {
                toast.error("Failed to start session");
            }
        } catch (e) {
            toast.error("Network error starting session");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!session) return;
        setIsPublishing(true);
        try {
            const newStatus = !session.isPublic;
            const res = await api.post<any>('/api/architect/publish', {
                sessionId: session.id,
                isPublic: newStatus,
                tags: session.tags || []
            });

            if (res.success) {
                setSession(prev => prev ? ({ ...prev, isPublic: newStatus }) : null);
                if (newStatus) {
                    toast.success("Session published to Community!");
                } else {
                    toast.success("Session made private.");
                }
            } else {
                toast.error("Failed to update visibility");
            }
        } catch (e) {
            toast.error("Network error");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleFork = async (communitySession: any) => {
        setIsForking(true);
        try {
            const res = await api.post<AgentSession>('/api/architect/fork', {
                sessionId: communitySession.id,
                userId: user?.id
            });

            if (res.success && res.data) {
                setSession(res.data);
                setView('workspace'); // Switch to the new session
                toast.success(`Forked "${communitySession.title}" successfully!`);
            } else {
                toast.error("Failed to fork session: " + (res.error || "Unknown error"));
            }
        } catch (e) {
            toast.error("Network error during fork");
        } finally {
            setIsForking(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!session) return;
        setIsProcessing(true);

        // Optimistic Update
        const tempMsg: any = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            createdAt: new Date().toISOString()
        };
        
        setSession(prev => prev ? ({
            ...prev,
            messages: [...prev.messages, tempMsg]
        }) : null);

        try {
            // Send to backend
            const res = await api.post<any>('/api/architect/chat', {
                sessionId: session.id,
                message: message
            });

            if (res.success && res.data) {
                const aiMsg: any = {
                     id: (Date.now() + 1).toString(),
                     role: 'assistant',
                     content: res.data.message || JSON.stringify(res.data.data),
                     createdAt: new Date().toISOString(),
                     metadata: { phaseChange: res.data.nextPhase }
                };

                 setSession(prev => {
                    if (!prev) return null;
                    const nextPhase = res.data?.nextPhase || prev.currentPhase;
                    
                    // Update artifacts
                    const currentArtifactKey = prev.currentPhase.toLowerCase().split('_')[0] as string;
                    const updatedArtifacts = res.data?.data ? {
                        ...prev.artifacts,
                        [currentArtifactKey]: res.data.data
                    } : prev.artifacts;

                    return {
                        ...prev,
                        currentPhase: nextPhase as any, // Cast for safety
                        messages: [...prev.messages, aiMsg],
                        artifacts: updatedArtifacts,
                        updatedAt: new Date().toISOString()
                    };
                 });

            } else {
                toast.error("AI failed to respond");
            }

        } catch (e) {
            toast.error("Failed to send message");
        } finally {
            setIsProcessing(false);
        }
    };

    // Landing / Empty State
    if (!session && view !== 'community') {
        return (
            <div className="h-full flex items-center justify-center p-8">
                <div className={`max-w-md w-full p-8 rounded-2xl border ${t.border} bg-gray-900/40 text-center`}>
                     <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                        Architect Mode
                     </h1>
                     <p className={`${t.textSecondary} mb-8`}>
                        Initialize a new autonomous development session. The Architect will guide you from idea to code.
                     </p>
                     
                     {/* Personality Selector */}
                     <div className="mb-6 text-left">
                        <label className="text-xs text-gray-500 uppercase font-semibold mb-2 block">Select Architect Persona</label>
                        <div className="grid grid-cols-1 gap-2">
                            {PERSONAS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPersonality(p.id)}
                                    className={`
                                        p-3 rounded-lg border text-left transition-all
                                        ${selectedPersonality === p.id 
                                            ? 'bg-purple-900/30 border-purple-500 ring-1 ring-purple-500' 
                                            : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                                        }
                                    `}
                                >
                                    <div className={`text-sm font-medium ${selectedPersonality === p.id ? 'text-white' : 'text-gray-300'}`}>
                                        {p.label}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                        {p.desc}
                                    </div>
                                </button>
                            ))}
                        </div>
                     </div>

                     <div className="flex flex-col gap-3">
                        <button
                            onClick={startNewSession}
                            disabled={isLoading}
                            className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Initializing..." : "Start New Project"}
                        </button>
                        <button
                            onClick={() => setView('community')}
                            className="w-full py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-gray-700"
                        >
                            <Globe className="w-4 h-4" />
                            Browse Community
                        </button>
                     </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex overflow-hidden relative">
            {/* Sidebar - Hide in Community Mode */}
            {view === 'workspace' && session && (
                <ArchitectSidebar 
                    currentPhase={session.currentPhase} 
                    artifacts={session.artifacts}
                    theme={t} 
                    sessionId={session.id}
                    onOpenPlayground={() => setView('playground')}
                />
            )}

            {/* Main Area */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Header */}
                <div className={`h-14 border-b ${t.border} bg-gray-900/40 flex items-center justify-between px-6 shrink-0`}>
                     <div className="flex items-center gap-3">
                        {view === 'community' ? (
                             <h2 className={`font-semibold ${t.text} flex items-center gap-2`}>
                                <Globe className="w-4 h-4 text-purple-400"/> Community Feed
                             </h2>
                        ) : (
                             <>
                                <h2 className={`font-semibold ${t.text}`}>{session?.title || "New Project"}</h2>
                                {session?.isPublic ? (
                                    <span className="text-[10px] bg-green-900/30 text-green-400 border border-green-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Globe className="w-3 h-3"/> Public
                                    </span>
                                ) : (
                                    <span className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1 opacity-50">
                                        <Lock className="w-3 h-3"/> Private
                                    </span>
                                )}
                             </>
                        )}
                     </div>

                     <div className="flex items-center gap-3">
                        {/* Toggle View Button */}
                        <button
                            onClick={() => setView(v => v === 'workspace' ? 'community' : 'workspace')}
                            className="text-xs text-gray-400 hover:text-white transition-colors mr-2"
                        >
                            {view === 'workspace' ? "Browse Community" : (session ? "Back to Workspace" : "Back to Home")}
                        </button>

                        {/* Profile Button - Only if Logged In */}
                        {user && (
                            <button
                                onClick={() => setShowProfile(true)}
                                className="w-8 h-8 rounded-full bg-purple-900/30 border border-purple-800 flex items-center justify-center hover:bg-purple-800/50 transition-colors"
                                title="My Architect Profile"
                            >
                                <Trophy className="w-4 h-4 text-purple-400" />
                            </button>
                        )}

                        {view === 'workspace' && session && (
                            <button
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className={`
                                    text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all
                                    ${session.isPublic 
                                        ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50' 
                                        : 'bg-purple-600 text-white border-purple-500 hover:bg-purple-500'
                                    }
                                `}
                            >
                                <Share2 className="w-3 h-3" />
                                {isPublishing ? "Saving..." : session.isPublic ? "Unpublish" : "Share"}
                            </button>
                        )}
                     </div>
                </div>

                {/* Main Content Switch */}
                <div className="flex-1 min-w-0 overflow-hidden relative">
                    {view === 'community' ? (
                        <CommunityFeed theme={t} onFork={handleFork} />
                    ) : view === 'playground' ? (
                        <Playground 
                            initialSystemPrompt={session?.artifacts?.execution?.systemPrompt || session?.artifacts?.masterContext?.fileContext || "No System Prompt found."}
                            theme={t}
                            onClose={() => setView('workspace')}
                        />
                    ) : (
                         <ArchitectChat 
                            messages={session?.messages || []} 
                            onSendMessage={handleSendMessage}
                            isProcessing={isProcessing}
                            theme={t}
                        />
                    )}
                    
                    {isForking && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
                            <div className="text-center animate-pulse">
                                <GitFork className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <p className="text-white font-medium">Forking Session...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Modal */}
            {showProfile && user && (
                <GamificationProfile 
                    userId={user.id} 
                    theme={t} 
                    onClose={() => setShowProfile(false)} 
                />
            )}
        </div>
    );
};
