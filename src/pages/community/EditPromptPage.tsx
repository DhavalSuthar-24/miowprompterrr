import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CommunityLayout } from "../../components/layout";
import { MarkdownEditor } from "../../components/common";
import { usePrompt, useUpdatePrompt, usePersonalities, useTags } from "../../hooks";
import { useAuth } from "../../contexts";
import { TagBadge } from "../../components/community";

export function EditPromptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const promptId = id || "";
  const { data: prompt, isLoading: promptLoading } = usePrompt(promptId);
  const updateMutation = useUpdatePrompt();
  const { data: personalities } = usePersonalities();
  const { data: allTags } = useTags();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [personalityId, setPersonalityId] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Initialize form state when prompt data loads
  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title);
      setContent(prompt.content);
      setPersonalityId(prompt.personality?.id || "");
      setSelectedTags(prompt.tags?.map(t => t.id) || []);
      setStatus((prompt.status || "PUBLISHED") as "DRAFT" | "PUBLISHED");
    }
  }, [prompt]);

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

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    await updateMutation.mutateAsync({
      id: promptId,
      title: title.trim(),
      content: content.trim(),
      personalityId: personalityId || undefined,
      tagIds: selectedTags,
      status,
    });
    
    navigate(`/prompts/${promptId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 mb-6 max-w-md">Please sign in to edit prompts.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (promptLoading) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </CommunityLayout>
    );
  }

  if (!prompt) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-slate-400">Prompt not found</p>
          <button
            onClick={() => navigate("/prompts")}
            className="text-blue-400 hover:text-blue-300 mt-4"
          >
            Back to Feed
          </button>
        </div>
      </CommunityLayout>
    );
  }

  if (user?.id !== prompt.author.id) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-slate-400">You do not have permission to edit this prompt.</p>
          <button
            onClick={() => navigate(`/prompts/${promptId}`)}
            className="text-blue-400 hover:text-blue-300 mt-4"
          >
            View Prompt
          </button>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
              disabled={updateMutation.isPending || !title || !content}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>

        {/* Editor Form */}
        <div className="space-y-6">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Prompt Title"
            className="w-full bg-transparent text-4xl font-bold text-slate-100 placeholder-slate-600 border-none focus:ring-0 px-0"
          />

          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-6">
              {/* Content Editor */}
              <div className="border border-slate-700 rounded-xl overflow-hidden min-h-[500px]">
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  minHeight="min-h-[500px]"
                />
              </div>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
              {/* Personality Selector */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Personality
                </label>
                <select
                  value={personalityId}
                  onChange={(e) => setPersonalityId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">None (Default)</option>
                  {personalities?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Selector */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags (max 5)
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTags.map((tagId) => {
                    const tag = allTags?.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <TagBadge
                        key={tag.id}
                        name={tag.name}
                        slug={tag.slug}
                        color={tag.color}
                        onRemove={() => handleRemoveTag(tag.id)}
                      />
                    );
                  })}
                </div>

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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  
                  {showTagDropdown && tagSearch && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto z-10">
                      {filteredTags?.length === 0 ? (
                        <div className="p-2 text-sm text-slate-400 text-center">
                          No tags found
                        </div>
                      ) : (
                        filteredTags?.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleAddTag(tag.id)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
                          >
                            {tag.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
}
