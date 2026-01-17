import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { BarChart3, TrendingUp, Clock, DollarSign, Activity } from 'lucide-react';

interface AnalyticsData {
    summary: {
        totalTokens: number;
        totalCost: number;
        avgLatencyMs: number;
        messageCount: number;
    };
    timeline: {
        id: string;
        role: string;
        tokens: number;
        cost: number;
        latency: number;
        createdAt: string;
    }[];
}

export const AnalyticsDashboard = ({ sessionId }: { sessionId: string, theme: any }) => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) fetchAnalytics();
    }, [sessionId]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.get<any>(`/api/analytics/session/${sessionId}`);
            if (res.success && res.data) {
                setData(res.data);
            }
        } catch (e) {
            console.error("Failed to load analytics", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-500 animate-pulse">Loading analytics...</div>;
    if (!data) return <div className="p-4 text-center text-gray-500">No data available</div>;

    const maxTokens = Math.max(...data.timeline.map(t => t.tokens), 100);

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    Session Analytics
                </h3>
                <button 
                    onClick={fetchAnalytics}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                    <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-400" /> Est. Cost
                    </div>
                    <div className="text-xl font-bold text-gray-200">
                        ${data.summary.totalCost}
                    </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                    <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 text-blue-400" /> Total Tokens
                    </div>
                    <div className="text-xl font-bold text-gray-200">
                        {data.summary.totalTokens}
                    </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                    <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-400" /> Avg Latency
                    </div>
                    <div className="text-xl font-bold text-gray-200">
                        {data.summary.avgLatencyMs}ms
                    </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                    <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-pink-400" /> Steps
                    </div>
                    <div className="text-xl font-bold text-gray-200">
                        {data.summary.messageCount}
                    </div>
                </div>
            </div>

            {/* Timeline Chart (CSS) */}
            <div>
                <h4 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Token Usage Timeline</h4>
                <div className="space-y-2">
                    {data.timeline.filter(t => t.role !== 'system').map((item) => (
                        <div key={item.id} className="flex items-center gap-2 group">
                             <div className="w-8 text-[10px] text-gray-500 font-mono text-right">
                                {item.role === 'user' ? 'USR' : 'AI'}
                             </div>
                             <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${item.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'}`}
                                    style={{ width: `${(item.tokens / maxTokens) * 100}%` }}
                                />
                             </div>
                             <div className="w-12 text-[10px] text-gray-400 font-mono text-right">
                                {item.tokens}t
                             </div>
                             
                             {/* Tooltip */}
                             <div className="hidden group-hover:block absolute right-4 bg-black/90 text-white text-[10px] p-2 rounded border border-gray-800 z-10 pointer-events-none">
                                <p>Latency: {item.latency}ms</p>
                                <p>Cost: ${item.cost.toFixed(5)}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
