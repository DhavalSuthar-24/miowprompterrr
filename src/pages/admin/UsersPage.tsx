import { useState } from "react";
import { 
  Search, User, Mail, Calendar, MessageSquare, 
  Terminal, Ban, Power
} from "lucide-react";
import { useAdminUsers, useUpdateUser } from "../../hooks";
import { AdminUser } from "../../types/admin";
import { Link } from "react-router-dom";

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useAdminUsers({ search });
  const updateUserMutation = useUpdateUser();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading users: {(error as Error).message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">View and manage registered users</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/30 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-center">Activity</th>
                <th className="px-6 py-4 font-medium text-center">Roles</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data?.users.map((user: AdminUser) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-200">
                          <Link to={`/u/${user.username}`} className="hover:text-blue-400 transition-colors">
                            {user.name || user.username}
                          </Link>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5" title="Prompts created">
                        <Terminal className="w-4 h-4 text-amber-500/70" />
                        {user.promptCount}
                      </div>
                      <div className="flex items-center gap-1.5" title="Comments posted">
                        <MessageSquare className="w-4 h-4 text-blue-500/70" />
                        {user.commentCount}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      {user.roles?.map(role => (
                        <span key={role.id} className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          role.name === "ADMIN" 
                            ? "bg-red-500/10 text-red-400 border-red-500/20" 
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}>
                          {role.name}
                        </span>
                      ))}
                      {(!user.roles || user.roles.length === 0) && (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-700 text-slate-400 border border-slate-600">
                          USER
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className={`p-1.5 rounded-lg transition-colors ${
                          user.isActive !== false
                            ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400" 
                            : "hover:bg-green-500/10 text-slate-400 hover:text-green-400"
                        }`}
                        title={user.isActive !== false ? "Ban User" : "Unban User"}
                        onClick={() => {
                          if (confirm(`Are you sure you want to ${user.isActive !== false ? "ban" : "unban"} this user?`)) {
                            updateUserMutation.mutate({ 
                              id: user.id, 
                              data: { isActive: user.isActive === false } // Toggle: if false -> true, if true/undefined -> false (wait, undefined -> false? yes data expects new value)
                              // actually better: isActive: !(user.isActive ?? true)
                            });
                          }
                        }}
                      >
                       {user.isActive !== false ? <Ban className="w-4 h-4" /> : <div className="w-4 h-4 font-bold text-green-500">Unban</div>} 
                       {/* Or utilize icon for unban, maybe Power or Check */}
                       {user.isActive !== false ? <Ban className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {data?.users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                       <User className="w-8 h-8 opacity-50" />
                       <p>No users found matching "{search}".</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
