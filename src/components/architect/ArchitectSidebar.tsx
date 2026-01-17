import React, { useState, useEffect } from 'react';
import { 
  Search, FileText, ListTodo, BrainCircuit, 
  Code2, ShieldCheck, CheckCircle2, Loader2,
  FolderTree, Download, Play
} from 'lucide-react';
import { AgentPhase } from './types';
import { ArtifactViewer } from './ArtifactViewer';
import { AnalyticsDashboard } from './AnalyticsDashboard'; 
import { FileTree, FileNode } from './FileTree';
import { api } from '../../lib/api';

interface ArchitectSidebarProps {
  currentPhase: AgentPhase;
  artifacts?: any;
  theme: any;
  sessionId: string;
  onOpenPlayground?: () => void;
}

const PHASES: { id: AgentPhase; label: string; icon: any; description: string }[] = [
  { id: 'RESEARCH_VALIDATE', label: 'Research & Validate', icon: Search, description: 'Idea Validation & Stack' },
  { id: 'PLAN_SRS', label: 'Plan & SRS', icon: FileText, description: 'Schema & API Design' },
  { id: 'PHASING_TODO', label: 'Phasing & Roadmap', icon: ListTodo, description: 'Project Breakdown' },
  { id: 'MASTER_CONTEXT', label: 'Master Context', icon: BrainCircuit, description: 'Context Synthesis' },
  { id: 'EXECUTE_CODE', label: 'Prompt Generation', icon: Code2, description: 'Prompt Architecture' },
  { id: 'AUDIT_VERIFY', label: 'Prompt Audit', icon: ShieldCheck, description: 'Safety & Clarity' },
  { id: 'REVIEW_FINALIZE', label: 'Final Review', icon: CheckCircle2, description: 'Sign-off' },
];

export const ArchitectSidebar: React.FC<ArchitectSidebarProps> = ({ currentPhase, artifacts, theme: t, sessionId, onOpenPlayground }) => {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);
  const [activeTab, setActiveTab] = useState<'progress' | 'analytics' | 'files'>('progress');
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Fetch file tree when changing to files tab
  useEffect(() => {
      if (activeTab === 'files' && sessionId) {
          setIsLoadingFiles(true);
          api.get<{ tree: FileNode[] }>(`/api/architect/files/${sessionId}`)
              .then(res => {
                  if (res.success && res.data) {
                       // @ts-ignore - API response typing is tricky here, but we know it returns tree
                       setFileTree(res.data.tree || []); 
                  }
              })
              .catch(err => console.error(err))
              .finally(() => setIsLoadingFiles(false));
      }
  }, [activeTab, sessionId]);

  const handleDownload = () => {
      window.open(`/api/architect/export/${sessionId}`, '_blank');
  };

  return (
    <div className={`w-80 border-r ${t.border} bg-gray-900/40 flex flex-col h-full`}>
      <div className="p-6 border-b border-gray-800 space-y-4">
        <div>
            <h2 className={`text-xl font-bold ${t.text} flex items-center gap-2`}>
            <BrainCircuit className="w-6 h-6 text-purple-500" />
            Architect Mode
            </h2>
            <p className={`text-xs ${t.textSecondary} mt-1`}>
                Autonomous Development Agent
            </p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-gray-800/50 p-1 rounded-lg gap-1">
            <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'progress' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Progress
            </button>
            <button
                onClick={() => setActiveTab('files')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'files' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Files
            </button>
            <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'analytics' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
            >
                Stats
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeTab === 'progress' ? (
            PHASES.map((phase, idx) => {
            const Icon = phase.icon;
            const isActive = phase.id === currentPhase;
            const isCompleted = idx < currentIndex;

            return (
                <div 
                key={phase.id}
                className={`
                    relative p-3 rounded-xl border transition-all duration-300
                    ${isActive 
                    ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-900/20' 
                    : isCompleted 
                        ? 'bg-gray-800/30 border-green-500/30 opacity-70' 
                        : 'bg-transparent border-transparent opacity-40'
                    }
                `}
                >
                {/* Connector Line */}
                {idx !== PHASES.length - 1 && (
                    <div className={`
                        absolute left-[27px] bottom-[-20px] w-0.5 h-6 z-0
                        ${isCompleted ? 'bg-green-500/30' : 'bg-gray-800'}
                    `} />
                )}

                <div className="flex items-start gap-3 relative z-10">
                    <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center border shrink-0
                    ${isActive 
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md animate-pulse' 
                        : isCompleted
                        ? 'bg-green-600/20 text-green-400 border-green-500/50'
                        : 'bg-gray-800 text-gray-500 border-gray-700'
                    }
                    `}>
                    {isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                    isCompleted ? <CheckCircle2 className="w-4 h-4" /> : 
                    <Icon className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-white' : t.text}`}>
                        {phase.label}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                        {phase.description}
                    </p>
                    
                    {/* Render Artifact Viewer for Completed Phases */}
                    {isCompleted && artifacts && (
                        <div className="mt-2 text-xs">
                            <ArtifactViewer 
                                phase={phase.id}
                                artifact={artifacts[phase.id.toLowerCase().split('_')[0] as string]} 
                            />
                        </div>
                    )}
                    </div>
                    
                    {isActive && (
                        <div className="absolute right-2 top-3">
                            <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                        </div>
                    )}
                </div>
                </div>
            );
            })
        ) : activeTab === 'files' ? (
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-purple-400" />
                        Project Explorer
                    </h3>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={handleDownload}
                        className="flex-1 text-[10px] bg-gray-800 hover:bg-gray-700 text-white px-2 py-2.5 rounded flex items-center justify-center gap-1 transition-colors border border-gray-700"
                    >
                        <Download className="w-3 h-3" /> Export ZIP
                    </button>
                    <button
                        onClick={onOpenPlayground}
                        className="flex-1 text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-2.5 rounded flex items-center justify-center gap-1 transition-colors shadow-lg shadow-purple-900/20"
                    >
                        <Play className="w-3 h-3 fill-current" /> Test Simulator
                    </button>
                </div>
                
                {isLoadingFiles ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    </div>
                ) : fileTree.length > 0 ? (
                    <div className="bg-black/20 rounded-lg p-2 border border-gray-800">
                        <FileTree data={fileTree} onSelect={(_node) => {}} />
                    </div>
                ) : (
                    <div className="text-center p-8 text-gray-500 text-xs italic">
                        No files generated yet.<br/>Run "Prompt Generation" to see files.
                    </div>
                )}
            </div>
        ) : (
           <AnalyticsDashboard sessionId={sessionId} theme={t} />
        )}
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <div className="text-[10px] text-gray-600 text-center font-mono">
           v2.1.0-Architect • Phase {currentIndex + 1}/7
        </div>
      </div>
    </div>
  );
};
