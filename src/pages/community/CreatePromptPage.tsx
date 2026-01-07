import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { CommunityLayout } from "../../components/layout";
import { TagBadge } from "../../components/community";
import { MarkdownEditor } from "../../components/common";
import { useCreatePrompt, usePersonalities, useTags } from "../../hooks";
import { useAuth } from "../../contexts";

export function CreatePromptPage() {
  const navigate = useNavigate();
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
      tagIds: selectedTags,
      status,
    });

    if (result?.id) {
      navigate(`/prompts/${result.id}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Sign in to Create</h2>
        <p className="text-slate-400 mb-6 max-w-md">
          Join the community to share your prompts, get feedback, and build your portfolio.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <CommunityLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setStatus("DRAFT")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  status === "DRAFT"
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Draft
              </button>
              <button
                onClick={() => setStatus("PUBLISHED")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  status === "PUBLISHED"
                    ? "bg-green-600/20 text-green-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Publish
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !title || !content}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Prompt"
              )}
            </button>
          </div>
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
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Write your prompt here. You can use variables like {{variable}} for dynamic content."
              minHeight="min-h-[300px]"
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
              onClick={() => navigate(-1)}
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
