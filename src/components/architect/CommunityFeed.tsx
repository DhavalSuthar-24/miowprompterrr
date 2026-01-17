import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { GitFork, Search, Globe, Code2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface CommunitySession {
    id: string;
    title: string;
    projectDescription: string;
    tags: string[];
    currentPhase: string;
    forkCount: number;
    updatedAt: string;
    artifacts: any;
    parentSessionId?: string;
}

export const CommunityFeed = ({ theme: t, onFork }: { theme: any, onFork: (session: CommunitySession) => void }) => {
    const [sessions, setSessions] = useState<CommunitySession[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchCommunity();
    }, []);

    const fetchCommunity = async () => {
        setLoading(true);
        try {
            const res = await api.get<any>('/api/architect/community');
            if (res.success) {
                // Cast to any to access 'sessions' which isn't on the standard ApiResponse type yet
                setSessions((res as any).sessions);
            }
        } catch (e) {
            toast.error("Failed to load community feed");
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter(s => 
        (s.title || "").toLowerCase().includes(search.toLowerCase()) || 
        (s.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Globe className="w-6 h-6 text-purple-400" />
                        Community Architectures
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Browse and fork high-quality prompt chains from the community.</p>
                </div>
                
                <div className={`relative w-64 ${t.border}`}>
                    <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search frameworks, tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {filteredSessions.map(session => (
                        <div 
                            key={session.id}
                            className={`
                                group bg-gray-900/40 border border-gray-800 rounded-xl p-5 hover:border-purple-500/50 hover:bg-gray-900/60 transition-all cursor-pointer flex flex-col
                            `}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                     <div className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center
                                        bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700
                                     `}>
                                        <Code2 className="w-4 h-4 text-purple-400" />
                                     </div>
                                     <div>
                                        <h3 className="font-semibold text-gray-200 text-sm line-clamp-1">{session.title}</h3>
                                        <span className="text-[10px] text-gray-500 block">
                                            {new Date(session.updatedAt).toLocaleDateString()}
                                        </span>
                                     </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-black/20 px-2 py-1 rounded-full">
                                    <GitFork className="w-3 h-3" />
                                    {session.forkCount}
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 line-clamp-3 mb-4 flex-1">
                                {session.projectDescription || "No description provided."}
                            </p>

                            {/* Artifact Preview Snippet */}
                            {session.artifacts?.EXECUTE_CODE?.systemPrompt && (
                                <div className="mb-4 bg-black/40 rounded p-2 border border-gray-800/50">
                                    <p className="text-[10px] text-gray-500 font-mono mb-1">System Prompt Preview:</p>
                                    <p className="text-[10px] text-gray-400 font-mono line-clamp-2 opacity-70">
                                        {session.artifacts.EXECUTE_CODE.systemPrompt.substring(0, 100)}...
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
                                <div className="flex items-center gap-1 overflow-hidden">
                                    {(session.tags || []).slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full border border-gray-700/50">
                                            {tag}
                                        </span>
                                    ))}
                                    {(session.tags || []).length > 2 && (
                                        <span className="text-[10px] text-gray-600">+{(session.tags || []).length - 2}</span>
                                    )}
                                </div>

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFork(session);
                                    }}
                                    className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white rounded-lg transition-colors font-medium border border-purple-900/30"
                                >
                                    <Copy className="w-3 h-3" />
                                    Fork
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
