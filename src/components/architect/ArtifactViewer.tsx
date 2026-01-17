import { FileText, Database, Code2 } from "lucide-react";
import { MermaidDiagram } from './MermaidDiagram';

interface ArtifactViewerProps {
    phase: string;
    artifact: any;
    className?: string;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ phase, artifact, className }) => {
    if (!artifact) return null;

    return (
        <div className={`p-4 bg-gray-900/50 rounded-lg border border-gray-800 ${className}`}>
            <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                {getIcon(phase)}
                {getLabel(phase)} Artifact
            </h3>
            
            <div className="text-xs text-gray-400 overflow-x-auto">
                {renderContent(phase, artifact)}
            </div>
        </div>
    );
};

function getIcon(phase: string) {
    switch (phase) {
        case 'RESEARCH_VALIDATE': return <FileText className="w-4 h-4 text-blue-400"/>;
        case 'PLAN_SRS': return <Database className="w-4 h-4 text-purple-400"/>;
        case 'EXECUTE_CODE': return <Code2 className="w-4 h-4 text-orange-400"/>;
        case 'AUDIT_VERIFY': return <Code2 className="w-4 h-4 text-red-400"/>;
        default: return <Code2 className="w-4 h-4 text-gray-400"/>;
    }
}

function getLabel(phase: string) {
    return phase.replace('_', ' ');
}

function renderContent(phase: string, data: any) {
    if (phase === 'RESEARCH_VALIDATE') {
        return (
            <div className="space-y-2">
                <p><strong className="text-blue-300">Market Analysis:</strong> {data.marketAnalysis}</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                        <strong className="text-purple-300 block mb-1">Tech Stack</strong>
                        <ul className="list-disc pl-4 space-y-1">
                            {Object.entries(data.recommendedTechStack || {}).map(([k, v]) => (
                                <li key={k}><span className="capitalize text-gray-500">{k}:</span> {v as string}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
    
    if (phase === 'PLAN_SRS') {
         return (
            <div className="space-y-2">
                <div>
                    <strong className="text-green-300 block mb-1">API Endpoints</strong>
                    <div className="space-y-1">
                        {(data.apiEndpoints || []).map((ep: any, i: number) => (
                            <div key={i} className="flex gap-2">
                                <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] font-mono">{ep.method}</span>
                                <span className="font-mono text-gray-300">{ep.path}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {data.architectureDiagram && (
                    <div className="mt-4">
                        <strong className="text-purple-300 block mb-1">Architecture Diagram</strong>
                        <MermaidDiagram chart={data.architectureDiagram} />
                    </div>
                )}
            </div>
        );
    }

    if (phase === 'EXECUTE_CODE') {
        const hasPrompt = !!data.systemPrompt;
        // Fallback for legacy artifacts
        if (!hasPrompt && data.files) {
             return (
                <div className="space-y-2">
                    <p>Generated {data.files?.length} files (Legacy).</p>
                    <div className="flex flex-col gap-1">
                        {data.files?.map((f: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-gray-300">
                                 <FileText className="w-3 h-3"/> {f.path}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div>
                    <strong className="text-orange-300 block mb-1">System Prompt</strong>
                    <pre className="text-[10px] font-mono bg-black/40 p-2 rounded max-h-40 overflow-y-auto whitespace-pre-wrap text-gray-300 border border-gray-700">
                        {data.systemPrompt}
                    </pre>
                </div>
                {data.contextFiles && (
                    <div>
                         <strong className="text-blue-300 block mb-1">Context Files ({data.contextFiles.length})</strong>
                         <div className="flex flex-wrap gap-2">
                             {data.contextFiles.map((f: any, i: number) => (
                                 <span key={i} className="px-2 py-1 bg-gray-800 rounded text-[10px] text-gray-400 border border-gray-700">
                                     {f.name}
                                 </span>
                             ))}
                         </div>
                    </div>
                )}
            </div>
        )
    }

    if (phase === 'AUDIT_VERIFY') {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <strong className="text-gray-300">Audit Score</strong>
                    <span className={`font-bold ${data.score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {data.score}/100
                    </span>
                </div>
                {data.issues && data.issues.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {data.issues.map((issue: any, i: number) => (
                            <div key={i} className="p-2 bg-red-900/20 border border-red-900/50 rounded flex gap-2">
                                <span className="text-red-400 shrink-0 uppercase text-[10px] font-bold mt-0.5">{issue.severity}</span>
                                <span className="text-gray-400">{issue.message}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default JSON dump for others
    return (
        <pre className="font-mono bg-black/30 p-2 rounded max-h-60 overflow-y-auto">
            {JSON.stringify(data, null, 2)}
        </pre>
    );
}
