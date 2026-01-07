import { useState } from "react";
import { Plus, Edit2, Power, Search, AlertCircle, Layers } from "lucide-react";
import { 
  useAdminPresets, 
  useUpdatePreset,
  useCreatePreset,
  useDeletePreset,
} from "../../hooks/useAdmin";
import { UpdatePresetData } from "../../types/admin";
import { AdminResourceModal } from "../../components/admin/AdminResourceModal";
import { toast } from "../../stores/uiStore";

export function AdminPresetsPage() {
  const { data: presets, isLoading, error } = useAdminPresets();
  const createMutation = useCreatePreset();
  const deleteMutation = useDeletePreset();
  const updateMutation = useUpdatePreset();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any>(null); // Ideally PresetMode but with stringified config

  const handleSubmit = async (data: any) => {
    try {
      // Validate and parse config JSON
      let config = {};
      if (typeof data.config === 'string') {
        try {
          config = JSON.parse(data.config);
        } catch (e) {
          toast.error("Invalid JSON in Config field");
          return;
        }
      } else {
        config = data.config;
      }

      const basePayload = {
        name: data.name,
        description: data.description,
        config: config as Record<string, unknown>,
        isDefault: data.isDefault,
      };

      if (editingPreset) {
        await updateMutation.mutateAsync({ 
          id: editingPreset.id, 
          data: { 
            ...basePayload, 
            sortOrder: Number(data.sortOrder), 
            isActive: data.isActive 
          } as UpdatePresetData 
        });
      } else {
        await createMutation.mutateAsync(basePayload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this preset?`)) {
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
    { name: "config", label: "Config (JSON)", type: "textarea" as const, required: true, placeholder: '{"temperature": 0.7}' },
    { name: "sortOrder", label: "Sort Order", type: "number" as const, required: true },
    { name: "isActive", label: "Active", type: "checkbox" as const },
    { name: "isDefault", label: "Default", type: "checkbox" as const },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Error loading presets: {(error as Error).message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Presets</h1>
          <p className="text-slate-400">Manage prompting presets and templates</p>
        </div>
        <button
          onClick={() => {
            setEditingPreset(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
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
              placeholder="Search presets..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/30 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-center">Config</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-center">Order</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {presets?.map((preset) => (
                <tr key={preset.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium text-slate-200">{preset.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{preset.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-400 max-w-xs truncate" title={preset.description}>
                      {preset.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">
                      {Object.keys(preset.config || {}).length} keys
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      preset.isActive 
                        ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                        : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}>
                      {preset.isActive ? "Active" : "Inactive"}
                    </span>
                    {preset.isDefault && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        DEFAULT
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-400">
                    {preset.sortOrder}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleToggleActive(preset.id, preset.isActive)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          preset.isActive 
                            ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400" 
                            : "hover:bg-green-500/10 text-slate-400 hover:text-green-400"
                        }`}
                        title={preset.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                        onClick={() => {
                          setEditingPreset({
                            ...preset,
                            config: JSON.stringify(preset.config, null, 2)
                          });
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {presets?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                      <p>No presets found.</p>
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
        title={editingPreset ? "Edit Preset" : "Create Preset"}
        fields={fields}
        initialData={editingPreset}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
