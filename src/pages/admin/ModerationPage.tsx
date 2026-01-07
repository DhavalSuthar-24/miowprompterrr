import { useState } from "react";
import { 
  Check, Eye, Flag, Search, Shield, Trash2, Star 
} from "lucide-react";
import { useModerationPrompts, useUpdatePromptStatus } from "../../hooks";
import { ModerationPrompt } from "../../types/admin";
import { Link } from "react-router-dom";

export function AdminModerationPage() {
  const [statusFilter, setStatusFilter] = useState("FLAGGED");
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useModerationPrompts({ status: statusFilter, search });
  
  const updateStatusMutation = useUpdatePromptStatus();
  
  const handleStatusChange = (id: string, newStatus: string) => {
    if (confirm(`Are you sure you want to mark this prompt as ${newStatus}?`)) {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "PUBLISHED": return <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-xs border border-green-500/20">Published</span>;
      case "FLAGGED": return <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs border border-red-500/20">Flagged</span>;
      case "HIDDEN": return <span className="bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded text-xs border border-slate-500/20">Hidden</span>;
      case "DELETED": return <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-xs border border-slate-700">Deleted</span>;
      default: return <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-500/20">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading moderation queue: {(error as Error).message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Moderation</h1>
          <p className="text-slate-400">Review flagged content and manage reports</p>
        </div>
        <div className="flex gap-2">
          {updateStatusMutation.isPending && (
             <div className="flex items-center text-amber-500 text-sm">
               <span className="animate-spin mr-2">⏳</span> Updating...
             </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/50">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search content..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {["FLAGGED", "PUBLISHED", "HIDDEN", "DELETED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  statusFilter === status 
                    ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" 
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-700">
          {data?.prompts.map((prompt: ModerationPrompt) => (
            <div key={prompt.id} className="p-6 hover:bg-slate-700/20 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <StatusBadge status={prompt.status} />
                    {prompt.isFeatured && (
                       <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded border border-yellow-400/20">
                         <Star className="w-3 h-3 fill-yellow-400" /> Featured
                       </span>
                    )}
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">
                      by <Link to={`/u/${prompt.author.username}`} className="hover:text-amber-400 transition-colors">@{prompt.author.username}</Link>
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-500">
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-200 mb-2 truncate">
                    <Link to={`/prompts/${prompt.id}`} target="_blank" className="hover:text-blue-400 transition-colors">
                      {prompt.title}
                    </Link>
                  </h3>
                  
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {prompt.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      Reports (0)
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {prompt.viewCount}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {prompt.status === "FLAGGED" && (
                    <button 
                      onClick={() => handleStatusChange(prompt.id, "PUBLISHED")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-colors w-32 justify-center"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  
                  {prompt.status !== "FLAGGED" && prompt.status !== "HIDDEN" && (
                    <button 
                      onClick={() => handleStatusChange(prompt.id, "FLAGGED")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm transition-colors w-32 justify-center"
                    >
                      <Flag className="w-4 h-4" />
                      Flag
                    </button>
                  )}
                  
                  {prompt.status !== "DELETED" && (
                    <button 
                      onClick={() => handleStatusChange(prompt.id, "DELETED")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-red-600/20 text-slate-300 hover:text-red-400 rounded-lg text-sm transition-colors w-32 justify-center border border-slate-600 hover:border-red-500/50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {data?.prompts.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <div className="flex flex-col items-center gap-3">
                <Shield className="w-12 h-12 opacity-30" />
                <p className="text-lg">No {statusFilter.toLowerCase()} content found.</p>
                <p className="text-sm opacity-70">Running a clean ship! 🚢</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
