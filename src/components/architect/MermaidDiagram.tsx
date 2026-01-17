import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2 } from 'lucide-react';

interface MermaidDiagramProps {
    chart: string;
    className?: string;
}

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'monospace',
});

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const renderChart = async () => {
            if (!containerRef.current || !chart) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Generate a unique ID for each render to prevent conflicts
                const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                
                // Use mermaid to render the chart string into SVG
                const invalidGraph = await mermaid.parse(chart).then(() => false).catch((e: any) => {
                     console.error("Mermaid Parse Error:", e);
                     setError("Invalid syntax");
                     return true;
                });

                if (invalidGraph) return;

                const { svg } = await mermaid.render(uniqueId, chart);
                setSvg(svg);
            } catch (err: any) {
                console.error("Mermaid Render Error:", err);
                setError("Failed to render diagram");
            } finally {
                setLoading(false);
            }
        };

        renderChart();
    }, [chart]);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 rounded">
                    <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                </div>
            )}
            
            {error ? (
                <div className="p-4 border border-red-900/50 bg-red-900/20 rounded text-red-400 text-xs font-mono">
                    <p className="font-bold mb-1">Diagram Error:</p>
                    {error}
                    <pre className="mt-2 text-[10px] bg-black/50 p-2 overflow-auto text-gray-400">
                        {chart}
                    </pre>
                </div>
            ) : (
                <div 
                    className="mermaid-output bg-gray-900/50 p-4 rounded border border-gray-800 overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            )}
        </div>
    );
};
