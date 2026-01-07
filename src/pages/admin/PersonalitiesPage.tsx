import { useState } from "react";
import { Plus, Edit2, Power, Search, AlertCircle } from "lucide-react";
import { useAdminPersonalities, useUpdatePersonality, useDeletePersonality, useCreatePersonality } from "../../hooks";
import { AdminResourceModal } from "../../components/admin/AdminResourceModal";

export function AdminPersonalitiesPage() {
  const [includeInactive, setIncludeInactive] = useState(true);
  const { data: personalities, isLoading, error } = useAdminPersonalities(includeInactive);
  const createMutation = useCreatePersonality();
  const deleteMutation = useDeletePersonality();
  const updateMutation = useUpdatePersonality();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonality, setEditingPersonality] = useState<any>(null);

  const handleSubmit = async (data: any) => {
    // Transform data types if needed
    const payload = {
      ...data,
      sortOrder: Number(data.sortOrder),
    };

    if (editingPersonality) {
      await updateMutation.mutateAsync({ id: editingPersonality.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this personality?`)) {
      if (currentStatus) {
        deleteMutation.mutate(id);
      } else {
        updateMutation.mutate({ id, data: { isActive: true } });
      }
    }
  };

  const fields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "slug", label: "Slug", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const, required: true },
    { name: "icon", label: "Icon (Emoji)", type: "text" as const, required: true },
    { name: "sortOrder", label: "Sort Order", type: "number" as const, required: true },
    { name: "isActive", label: "Active", type: "checkbox" as const },
  ];

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
        Error loading personalities: {(error as Error).message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Personalities</h1>
          <p className="text-slate-400">Manage AI personalities available to users</p>
        </div>
        <button
          onClick={() => {
            setEditingPersonality(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search personalities..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <input 
              type="checkbox" 
              id="showInactive" 
              checked={includeInactive} 
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 focus:ring-blue-500"
            />
            <label htmlFor="showInactive">Show Inactive</label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/30 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Icon</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-center">Order</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {personalities?.map((personality) => (
                <tr key={personality.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-2xl">{personality.icon}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200">{personality.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{personality.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-400 max-w-xs truncate" title={personality.description}>
                      {personality.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      personality.isActive 
                        ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}>
                      {personality.isActive ? "Active" : "Inactive"}
                    </span>
                    {personality.isDefault && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        DEFAULT
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-400">
                    {personality.sortOrder}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleToggleActive(personality.id, personality.isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          personality.isActive 
                            ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400" 
                            : "hover:bg-green-500/10 text-slate-400 hover:text-green-400"
                        }`}
                        title={personality.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                        onClick={() => {
                          setEditingPersonality(personality);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {personalities?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                      <p>No personalities found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      

      <AdminResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPersonality ? "Edit Personality" : "Create Personality"}
        fields={fields}
        initialData={editingPersonality}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
