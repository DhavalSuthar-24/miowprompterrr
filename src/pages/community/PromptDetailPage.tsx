import { Clock, Eye, Copy, Bookmark, Share2, MessageCircle, Sparkles, ArrowLeft, Edit, Trash2, GitBranch } from "lucide-react";
import { CommunityLayout } from "../../components/layout";
import { VoteButtons, TagBadge, CommentSection, AuthorLink } from "../../components/community";
import { Skeleton, MarkdownRenderer } from "../../components/common";
import { SEOHead } from "../../components/seo";
import { usePrompt, useCopyPrompt, useSavePrompt, useDeletePrompt } from "../../hooks";
import { useAuth } from "../../contexts";

import { useNavigate, useParams, Link } from "react-router-dom";

export function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const promptId = id || "";
  const { user, isAuthenticated } = useAuth();
  const { data: prompt, isLoading, error } = usePrompt(promptId);
  const copyMutation = useCopyPrompt();
  const saveMutation = useSavePrompt();
  const deleteMutation = useDeletePrompt();

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.content);
    copyMutation.mutate(promptId);
  };

  const handleSave = () => {
    if (!isAuthenticated || !prompt) return;
    saveMutation.mutate(promptId);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/prompts/${promptId}`;
    await navigator.clipboard.writeText(url);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    await deleteMutation.mutateAsync(promptId);
    navigate("/");
  };

  const handleTagClick = (slug: string) => {
    navigate(`/?tag=${slug}`);
  };

  const handleAuthorClick = (username: string) => {
    navigate(`/u/${username}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOwner = user?.id === prompt?.author?.id;

  if (isLoading) {
    return (
      <CommunityLayout showSidebar={false}>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </CommunityLayout>
    );
  }

  if (error || !prompt) {
    return (
      <CommunityLayout showSidebar={false}>
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="text-slate-400 mb-4">Prompt not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 hover:text-blue-300"
          >
            Go back
          </button>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout showSidebar={false}>
      <SEOHead
        title={prompt.title}
        description={prompt.content.slice(0, 160)}
        type="article"
      />
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Main Card */}
        <article className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex gap-4">
              {/* Votes */}
              <VoteButtons
                promptId={prompt.id}
                upvotes={prompt.upvotes}
                downvotes={prompt.downvotes}
                score={prompt.score}
                userVote={prompt.userVote}
                size="lg"
              />

              <div className="flex-1 min-w-0">
                {/* Meta */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-2 flex-wrap">
                  {prompt.personality && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      {prompt.personality.name}
                    </span>
                  )}
                  <span>•</span>
                  <AuthorLink
                    username={prompt.author.username}
                    image={prompt.author.image}
                    onClick={handleAuthorClick}
                  />
                  <span>•</span>
                  {prompt.parent && (
                    <>
                      <span className="flex items-center gap-1 text-purple-400">
                        <GitBranch className="w-3.5 h-3.5" />
                        Remix of <Link to={`/prompts/${prompt.parent.id}`} className="hover:underline">{prompt.parent.title}</Link>
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(prompt.createdAt)}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl font-bold text-slate-100 mb-3">
                  {prompt.isFeatured && (
                    <Sparkles className="inline w-5 h-5 text-amber-400 mr-2" />
                  )}
                  {prompt.title}
                </h1>

                {/* Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag) => (
                      <TagBadge
                        key={tag.id}
                        name={tag.name}
                        slug={tag.slug}
                        color={tag.color}
                        onClick={handleTagClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 mb-6 text-sm">
              <MarkdownRenderer content={prompt.content} />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-slate-400 mb-6">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {prompt.viewCount} views
              </span>
              <span className="flex items-center gap-1.5">
                <Copy className="w-4 h-4" />
                {prompt.copyCount || 0} copies
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                {prompt.commentCount} comments
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={handleCopy}
                disabled={copyMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Prompt
              </button>

              <button
                onClick={() => navigate(`/?source=${promptId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                title="Remix this prompt in the builder"
              >
                <GitBranch className="w-4 h-4" />
                Remix
              </button>

              {isAuthenticated && (
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${prompt.isSaved
                      ? "bg-amber-600 text-white"
                      : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                    }
                  `}
                >
                  <Bookmark className={`w-4 h-4 ${prompt.isSaved ? "fill-current" : ""}`} />
                  {prompt.isSaved ? "Saved" : "Save"}
                </button>
              )}

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {isOwner && (
                <>
                  <button
                    onClick={() => navigate(`/prompts/${promptId}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors ml-auto"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-6">
          <CommentSection promptId={promptId} commentCount={prompt.commentCount} />
        </div>
      </div>
    </CommunityLayout>
  );
}
