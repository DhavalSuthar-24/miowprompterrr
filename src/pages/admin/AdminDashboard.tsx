import { useNavigate } from "react-router-dom";
import { BarChart3, Users, FileText, TrendingUp, Sparkles, AlertTriangle } from "lucide-react";
import { useAdminStats } from "../../hooks";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-xl">
        <h3 className="text-xl font-bold text-red-500 mb-2">Error Loading Dashboard</h3>
        <p className="text-slate-400">{(error as Error).message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statItems = [
    { label: "Total Users", value: stats?.overview.totalUsers.toLocaleString() || "0", bg: "bg-blue-600", icon: Users },
    { label: "Total Prompts", value: stats?.overview.totalPrompts.toLocaleString() || "0", bg: "bg-green-600", icon: FileText },
    { label: "Total Votes", value: stats?.overview.totalVotes.toLocaleString() || "0", bg: "bg-purple-600", icon: TrendingUp },
    { label: "New Users Today", value: stats?.today.newUsers.toLocaleString() || "0", bg: "bg-amber-600", icon: Users },
    { label: "New Prompts Today", value: stats?.today.newPrompts.toLocaleString() || "0", bg: "bg-cyan-600", icon: FileText },
    { label: "Active Personalities", value: stats?.content.activePersonalities.toLocaleString() || "0", bg: "bg-pink-600", icon: Sparkles },
    { label: "Flagged Prompts", value: stats?.moderation.flaggedPrompts.toLocaleString() || "0", bg: "bg-red-600", icon: AlertTriangle },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
      <p className="text-slate-400 mb-8">Welcome back! Here's an overview of your platform.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statItems.map((stat, idx) => (
          <div
            key={idx}
            className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4 hover:border-slate-600 transition-colors"
          >
            <div className={`${stat.bg} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate("/admin/personalities")}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors group"
          >
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-200">Manage Personalities</span>
          </button>
          <button
            onClick={() => navigate("/admin/users")}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors group"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-200">Manage Users</span>
          </button>
          <button
            onClick={() => navigate("/admin/moderation")}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors group"
          >
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-200">Moderation Queue</span>
          </button>
          <button
            onClick={() => navigate("/admin/reports")}
            className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-center transition-colors group"
          >
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-slate-200">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
