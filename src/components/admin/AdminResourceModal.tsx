import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Loader2 } from "lucide-react";

interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "checkbox";
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  required?: boolean;
}

interface AdminResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function AdminResourceModal({
  isOpen,
  onClose,
  title,
  fields,
  initialData,
  onSubmit,
  isLoading = false,
}: AdminResourceModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label className="text-sm font-medium text-slate-300">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            
            {field.type === "textarea" ? (
              <textarea
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={4}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                required={field.required}
              />
            ) : field.type === "select" ? (
              <select
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
               <label className="flex items-center gap-2 cursor-pointer mt-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData[field.name] || false}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-700 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                </div>
                <span className="text-sm text-slate-400">{field.placeholder || "Enabled"}</span>
              </label>
            ) : (
              <input
                type={field.type}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                required={field.required}
              />
            )}
          </div>
        ))}

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
