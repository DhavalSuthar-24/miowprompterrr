
import { useNavigate } from "react-router-dom";
import { MessageCircle, Eye, Copy, Bookmark, Share2, Clock, Sparkles, GitBranch } from "lucide-react";
import { VoteButtons } from "./VoteButtons";
import { TagBadge } from "./TagBadge";
import { AuthorLink } from "./UserAvatar";
import { useCopyPrompt, useSavePrompt } from "../../hooks";
import { useAuthStore } from "../../stores";
import type { Prompt } from "../../lib/schemas";

interface PromptCardProps {
  prompt: Prompt;
  onTagClick?: (slug: string) => void;
  onPromptClick?: (id: string) => void;
  onAuthorClick?: (username: string) => void;
  showActions?: boolean;
  variant?: "default" | "compact";
}

export function PromptCard({
  prompt,
  onTagClick,
  onPromptClick,
  onAuthorClick,
  showActions = true,
  variant = "default",
}: PromptCardProps) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const copyMutation = useCopyPrompt();
  const saveMutation = useSavePrompt();

  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content);
    copyMutation.mutate(prompt.id);
  };

  const handleSave = () => {
    if (!isAuthenticated) return;
    saveMutation.mutate(prompt.id);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/prompts/${prompt.id}`;
    await navigator.clipboard.writeText(url);
  };

  const handleCardClick = () => {
    onPromptClick?.(prompt.id);
  };

  const handleRemix = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/?source=${prompt.id}`);
  };

  const isCompact = variant === "compact";

  return (
    <article
      className={`
        group relative
        bg-slate-800/50 hover:bg-slate-800/80
        border border-slate-700/50 hover:border-slate-600/50
        rounded-xl transition-all duration-200
        ${isCompact ? "p-3" : "p-4"}
      `}
    >
      <div className="flex gap-3">
        {/* Vote Column */}
        <div className="flex-shrink-0">
          <VoteButtons
            promptId={prompt.id}
            upvotes={prompt.upvotes}
            downvotes={prompt.downvotes}
            score={prompt.score}
            userVote={prompt.userVote}
            size={isCompact ? "sm" : "md"}
          />
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 flex-wrap">
            {prompt.personality && (
              <span className="flex items-center gap-1 text-blue-400">
                <Sparkles className="w-3 h-3" />
                {prompt.personality.name}
              </span>
            )}
            <span>•</span>
            <AuthorLink
              username={prompt.author.username}
              image={prompt.author.image}
              showAvatar={!isCompact}
              onClick={onAuthorClick}
            />
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(prompt.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={handleCardClick}
            className={`
              font-semibold text-slate-100 
              hover:text-blue-400 cursor-pointer
              line-clamp-2 mb-2
              ${isCompact ? "text-sm" : "text-base"}
            `}
          >
            {prompt.isFeatured && (
              <span className="inline-flex items-center gap-1 text-amber-400 mr-1.5">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            )}
            {prompt.title}
          </h3>

          {/* Content Preview */}
          {!isCompact && (
            <p
              onClick={handleCardClick}
              className="text-sm text-slate-400 line-clamp-3 mb-3 cursor-pointer"
            >
              {prompt.content}
            </p>
          )}

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {prompt.tags.slice(0, 4).map((tag) => (
                <TagBadge
                  key={tag.id}
                  name={tag.name}
                  slug={tag.slug}
                  color={tag.color}
                  onClick={onTagClick}
                />
              ))}
              {prompt.tags.length > 4 && (
                <span className="text-xs text-slate-500 self-center">
                  +{prompt.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer Actions */}
          {showActions && (
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <button
                onClick={handleCardClick}
                className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{prompt.commentCount} comments</span>
              </button>

              <button
                onClick={handleCopy}
                disabled={copyMutation.isPending}
                className="flex items-center gap-1.5 hover:text-green-400 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>{prompt.copyCount || 0}</span>
              </button>

              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{prompt.viewCount}</span>
              </span>

              {isAuthenticated && (
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className={`
                    flex items-center gap-1.5 transition-colors
                    ${prompt.isSaved ? "text-amber-400" : "hover:text-amber-400"}
                  `}
                >
                  <Bookmark className={`w-4 h-4 ${prompt.isSaved ? "fill-current" : ""}`} />
                </button>
              )}

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleRemix}
                className="flex items-center gap-1.5 hover:text-purple-400 transition-colors ml-auto"
                title="Remix"
              >
                <GitBranch className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
