import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Trophy, Star, Zap, Award, Target } from 'lucide-react';

interface UserStats {
    reputation: number;
    promptCount: number;
    streak: number;
    lastActiveAt: string;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    slug: string;
}

export const GamificationProfile = ({ userId, theme: t, onClose }: { userId: string, theme: any, onClose: () => void }) => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [badges, setBadges] = useState<{badge: Badge, earnedAt: string}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [userId]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get<any>(`/api/gamification/stats?userId=${userId}`);
            if (res.success && res.data) {
                setStats(res.data.stats);
                setBadges(res.data.badges);
            }
        } catch (e) {
            console.error("Failed to fetch stats", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
         return (
             <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                 <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"/>
             </div>
         );
    }

    // Calculate Level based on Reputation (Simple sqrt formula)
    const level = stats ? Math.floor(Math.sqrt(stats.reputation / 10)) + 1 : 1;
    // const progressToNext = stats ? (stats.reputation % 10) * 10 : 0; // Removed unused


    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-2xl bg-gray-900 border ${t.border} rounded-2xl overflow-hidden shadow-2xl relative`}>
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    ✕
                </button>

                {/* Header Banner */}
                <div className="h-32 bg-gradient-to-r from-purple-900 to-blue-900 relative">
                     <div className="absolute -bottom-10 left-8 flex items-end gap-4">
                        <div className="w-24 h-24 rounded-2xl bg-gray-800 border-4 border-gray-900 flex items-center justify-center shadow-lg">
                             <div className="text-4xl">🐱</div>
                        </div>
                        <div className="mb-2">
                             <h2 className="text-2xl font-bold text-white">Architect User</h2>
                             <div className="flex items-center gap-2 text-purple-300 text-sm font-medium">
                                 <Trophy className="w-4 h-4" /> Level {level} Architect
                             </div>
                        </div>
                     </div>
                </div>

                <div className="pt-14 px-8 pb-8">
                     {/* Stats Grid */}
                     <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                             <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                 <Star className="w-3 h-3 text-yellow-500" /> Reputation
                             </div>
                             <div className="text-2xl font-bold text-white">{stats?.reputation || 0} XP</div>
                        </div>
                        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                             <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                 <Target className="w-3 h-3 text-blue-500" /> Projects
                             </div>
                             <div className="text-2xl font-bold text-white">{stats?.promptCount || 0}</div>
                        </div>
                         <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                             <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                                 <Zap className="w-3 h-3 text-orange-500" /> Day Streak
                             </div>
                             <div className="text-2xl font-bold text-white">{stats?.streak || 0} 🔥</div>
                        </div>
                     </div>

                     {/* Badges Section */}
                     <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Earned Badges
                     </h3>
                     
                     {badges.length === 0 ? (
                         <div className="text-center py-8 text-gray-500 text-sm italic border border-dashed border-gray-700 rounded-xl">
                             No badges earned yet. Start building!
                         </div>
                     ) : (
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                             {badges.map(({ badge }) => (
                                 <div key={badge.id} className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 flex items-center gap-3">
                                     <div className="text-2xl">{badge.icon}</div>
                                     <div>
                                         <div className="text-sm font-medium text-gray-200">{badge.name}</div>
                                         <div className="text-[10px] text-gray-500">{badge.description}</div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};
