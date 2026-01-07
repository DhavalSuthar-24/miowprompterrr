import { useState } from "react";
import { Plus, Edit2, Power, AlertCircle, Trash2 } from "lucide-react";
import { useAdminTiers, useCreateTier, useUpdateTier, useCreateTechnique, useUpdateTechnique, useDeleteTechnique } from "../../hooks/useAdmin";
import { AdminResourceModal } from "../../components/admin/AdminResourceModal";
import type { Tier, Technique } from "../../lib/schemas";

export function AdminTiersPage() {
  const { data: tiers, isLoading, error } = useAdminTiers();
  const createTierMutation = useCreateTier();
  const updateTierMutation = useUpdateTier();
  const createTechMutation = useCreateTechnique();
  const updateTechMutation = useUpdateTechnique();
  const deleteTechMutation = useDeleteTechnique();
  
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<any>(null);

  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<any>(null);
  const [targetTierId, setTargetTierId] = useState<string | null>(null);

  const handleTierSubmit = async (data: any) => {
    const payload = {
      ...data,
      sortOrder: Number(data.sortOrder), // Ensure sortOrder is number
    };
    if (editingTier) {
      await updateTierMutation.mutateAsync({ id: editingTier.id, data: payload });
    } else {
      await createTierMutation.mutateAsync(payload);
    }
    setIsTierModalOpen(false);
  };

  const handleTechSubmit = async (data: any) => {
    const payload = {
      ...data,
      sortOrder: Number(data.sortOrder),
      tierId: targetTierId, // Include tierId for creation
    };
    
    if (editingTech) {
      await updateTechMutation.mutateAsync({ id: editingTech.id, data: payload });
    } else {
      await createTechMutation.mutateAsync(payload);
    }
    setIsTechModalOpen(false);
  };

  const handleDeleteTech = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this technique?")) {
      await deleteTechMutation.mutateAsync(id);
    }
  };

  const handleToggleTierActive = (id: string, currentStatus: boolean) => {
    if (confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this tier?`)) {
      updateTierMutation.mutate({ id, data: { isActive: !currentStatus } });
    }
  };

  const tierFields = [
    { name: "label", label: "Label", type: "text" as const, required: true },
    { name: "slug", label: "Slug", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const, required: true },
    { name: "color", label: "Color (Hex)", type: "text" as const, required: true },
    { name: "sortOrder", label: "Level/Order", type: "number" as const, required: true },
    { name: "isActive", label: "Active", type: "checkbox" as const },
  ];

  const techFields = [
    { name: "label", label: "Label", type: "text" as const, required: true },
    { name: "slug", label: "Slug", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const, required: true },
    { name: "sortOrder", label: "Sort Order", type: "number" as const, required: true },
    { name: "isActive", label: "Active", type: "checkbox" as const },
  ];

  if (isLoading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div></div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {(error as Error).message}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tiers</h1>
          <p className="text-slate-400">Manage mastery levels and techniques</p>
        </div>
        <button
          onClick={() => {
            setEditingTier(null);
            setIsTierModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Tier
        </button>
      </div>

      <div className="space-y-6">
        {tiers?.map((tier: Tier) => (
          <div key={tier.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                <h3 className="text-lg font-bold text-white">{tier.label}</h3>
                <span className="text-sm text-slate-500">Level {tier.sortOrder}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleTierActive(tier.id, tier.isActive)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    tier.isActive 
                      ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400" 
                      : "hover:bg-green-500/10 text-slate-400 hover:text-green-400"
                  }`}
                  title={tier.isActive ? "Deactivate" : "Activate"}
                >
                  <Power className="w-4 h-4" />
                </button>
                 <button
                  onClick={() => {
                    setEditingTier(tier);
                    setIsTierModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Techniques</h4>
                <button 
                  onClick={() => {
                    setTargetTierId(tier.id);
                    setEditingTech(null);
                    setIsTechModalOpen(true);
                  }}
                  className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Technique
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tier.techniques?.map((tech: Technique) => (
                  <div key={tech.id} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors flex justify-between group">
                    <div className="overflow-hidden">
                      <div className="font-medium text-slate-300 text-sm mb-1 truncate">{tech.label}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{tech.description}</div>
                    </div>
                    <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setTargetTierId(tier.id);
                          setEditingTech(tech);
                          setIsTechModalOpen(true);
                        }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteTech(tech.id, e)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!tier.techniques || tier.techniques.length === 0) && (
                  <div className="col-span-full border border-dashed border-slate-700 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-500 italic">No techniques added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {tiers?.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center text-slate-500">
             <AlertCircle className="w-12 h-12 opacity-30 mx-auto mb-4" />
             <p>No tiers found. Create one to get started.</p>
          </div>
        )}
      </div>

      <AdminResourceModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        title={editingTier ? "Edit Tier" : "Create Tier"}
        fields={tierFields}
        initialData={editingTier}
        onSubmit={handleTierSubmit}
        isLoading={createTierMutation.isPending || updateTierMutation.isPending}
      />

      <AdminResourceModal
        isOpen={isTechModalOpen}
        onClose={() => setIsTechModalOpen(false)}
        title={editingTech ? "Edit Technique" : "Add Technique"}
        fields={techFields}
        initialData={editingTech}
        onSubmit={handleTechSubmit}
        isLoading={createTechMutation.isPending || updateTechMutation.isPending}
      />
    </div>
  );
}
