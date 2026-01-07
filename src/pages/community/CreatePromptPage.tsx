import { useState } from "react";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { CommunityLayout } from "../../components/layout";
import { TagBadge } from "../../components/community";
import { useCreatePrompt, usePersonalities, useTags } from "../../hooks";
import { useAuth } from "../../contexts";

interface CreatePromptPageProps {
  onBack?: () => void;
  onSuccess?: (promptId: string) => void;
}

export function CreatePromptPage({ onBack, onSuccess }: CreatePromptPageProps) {
  const { isAuthenticated } = useAuth();
  const createMutation = useCreatePrompt();
  const { data: personalities } = usePersonalities();
  const { data: allTags } = useTags();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [personalityId, setPersonalityId] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  const filteredTags = allTags?.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.includes(tag.id)
  );

  const handleAddTag = (tagId: string) => {
    if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, tagId]);
    }
    setTagSearch("");
    setShowTagDropdown(false);
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) return;

    const result = await createMutation.mutateAsync({
      title: title.trim(),
      content: content.trim(),
      personalityId: personalityId || undefined,
      tagIds: selectedTags.length > 0 ? selectedTags : undefined,
      status,
    });

    if (result?.id) {
      onSuccess?.(result.id);
    }
  };

  if (!isAuthenticated) {
    return (
      <CommunityLayout showSidebar={false}>
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-slate-400 mb-4">Please log in to create prompts</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
          >
            Log In
          </a>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout showSidebar={false}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-100">Create Prompt</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your prompt a descriptive title"
              maxLength={200}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">{title.length}/200</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Prompt Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your prompt here. You can use variables like {{variable}} for dynamic content."
              rows={12}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono text-sm resize-none transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">{content.length} characters</p>
          </div>

          {/* Personality */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Personality (optional)
            </label>
            <select
              value={personalityId}
              onChange={(e) => setPersonalityId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">No personality</option>
              {personalities?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags (up to 5)
            </label>
            
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTags.map((tagId) => {
                  const tag = allTags?.find((t) => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <div key={tagId} className="flex items-center gap-1">
                      <TagBadge name={tag.name} slug={tag.slug} />
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tagId)}
                        className="p-0.5 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tag Search */}
            {selectedTags.length < 5 && (
              <div className="relative">
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => {
                    setTagSearch(e.target.value);
                    setShowTagDropdown(true);
                  }}
                  onFocus={() => setShowTagDropdown(true)}
                  placeholder="Search tags..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm transition-colors"
                />

                {showTagDropdown && filteredTags && filteredTags.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleAddTag(tag.id)}
                        className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        #{tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Visibility
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus("PUBLISHED")}
                className={`
                  flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${status === "PUBLISHED"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }
                `}
              >
                Publish Now
              </button>
              <button
                type="button"
                onClick={() => setStatus("DRAFT")}
                className={`
                  flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                  ${status === "DRAFT"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }
                `}
              >
                Save as Draft
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim() || createMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {status === "PUBLISHED" ? "Publish Prompt" : "Save Draft"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </CommunityLayout>
  );
}
