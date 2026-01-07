import { useState } from "react";
import { FileText, Plus, Edit2, CheckCircle, XCircle } from "lucide-react";
import {
  useAdminReasoningTemplates,
  useAdminQuickTemplates,
  useCreateReasoningTemplate,
  useUpdateReasoningTemplate,
  useCreateQuickTemplate,
  useUpdateQuickTemplate,
} from "../../hooks/useAdmin";
import { AdminResourceModal } from "../../components/admin/AdminResourceModal";
import type { ReasoningTemplate, QuickTemplate } from "../../lib/schemas";

export function AdminTemplatesPage() {
  const [activeTab, setActiveTab] = useState<"reasoning" | "quick">("reasoning");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReasoningTemplate | QuickTemplate | null>(null);

  const { data: reasoningTemplates, isLoading: isReasoningLoading } = useAdminReasoningTemplates();
  const { data: quickTemplates, isLoading: isQuickLoading } = useAdminQuickTemplates();

  const createReasoning = useCreateReasoningTemplate();
  const updateReasoning = useUpdateReasoningTemplate();
  const createQuick = useCreateQuickTemplate();
  const updateQuick = useUpdateQuickTemplate();

  const isLoading = activeTab === "reasoning" ? isReasoningLoading : isQuickLoading;
  const templates = activeTab === "reasoning" ? reasoningTemplates : quickTemplates;

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template: ReasoningTemplate | QuickTemplate) => {
    if (activeTab === "reasoning" && 'steps' in template) {
      // Convert steps array to string for textarea
      setEditingTemplate({
        ...template,
        steps: Array.isArray(template.steps) ? template.steps.join("\n") : template.steps
      } as any);
    } else {
      setEditingTemplate(template);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (activeTab === "reasoning") {
      // Parse steps from textarea
      const payload: any = { 
        ...data,
        sortOrder: Number(data.sortOrder || 0)
      };
      if (typeof data.steps === "string") {
        payload.steps = data.steps.split("\n").filter((s: string) => s.trim().length > 0);
      }
      
      if (editingTemplate) {
        await updateReasoning.mutateAsync({ id: editingTemplate.id, data: payload });
      } else {
        await createReasoning.mutateAsync(payload);
      }
    } else {
      const payload = {
        ...data,
        sortOrder: Number(data.sortOrder || 0)
      };
      if (editingTemplate) {
        await updateQuick.mutateAsync({ id: editingTemplate.id, data: payload });
      } else {
        await createQuick.mutateAsync(payload);
      }
    }
    setIsModalOpen(false);
  };
  // Define fields based on active tab
  const fields = activeTab === "reasoning" ? [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "slug", label: "Slug", type: "text" as const, required: true },
    { name: "steps", label: "Steps (one per line)", type: "textarea" as const, required: true, placeholder: "Step 1\nStep 2" },
    { name: "isActive", label: "Active", type: "checkbox" as const },
    { name: "sortOrder", label: "Sort Order", type: "number" as const },
  ] : [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "category", label: "Category", type: "text" as const, required: true },
    { name: "template", label: "Template Content", type: "textarea" as const, required: true },
    { name: "isActive", label: "Active", type: "checkbox" as const },
    { name: "sortOrder", label: "Sort Order", type: "number" as const },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Templates</h1>
          <p className="text-slate-400">Manage reasoning and quick templates</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("reasoning")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "reasoning"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Reasoning Templates
        </button>
        <button
          onClick={() => setActiveTab("quick")}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === "quick"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Quick Templates
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates?.map((template: ReasoningTemplate | QuickTemplate) => (
            <div
              key={template.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between group hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-700 rounded-lg">
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{template.name}</h3>
                    {template.isActive ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-slate-500" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                     {activeTab === "reasoning" ? (template as ReasoningTemplate).slug : (template as QuickTemplate).category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(template)}
                  className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {templates?.length === 0 && (
            <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
              <p className="text-slate-400">No templates found</p>
            </div>
          )}
        </div>
      )}

      <AdminResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${editingTemplate ? "Edit" : "Create"} ${activeTab === "reasoning" ? "Reasoning" : "Quick"} Template`}
        fields={fields}
        initialData={editingTemplate}
        onSubmit={handleSubmit}
        isLoading={createReasoning.isPending || updateReasoning.isPending || createQuick.isPending || updateQuick.isPending}
      />
    </div>
  );
}
