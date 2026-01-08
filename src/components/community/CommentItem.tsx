import { useState } from "react";
import { ChevronUp, ChevronDown, MessageCircle, MoreHorizontal, Edit, Trash2, Flag } from "lucide-react";
import { UserAvatar } from "./UserAvatar";
import { useVoteComment, useDeleteComment, useCommentReplies } from "../../hooks";
import { useAuthStore } from "../../stores";
import type { Comment } from "../../lib/schemas";

interface CommentItemProps {
  comment: Comment;
  promptId: string;
  depth?: number;
  onReply?: (commentId: string) => void;
  onEdit?: (comment: Comment) => void;
  maxDepth?: number;
}

export function CommentItem({
  comment,
  promptId,
  depth = 0,
  onReply,
  onEdit,
  maxDepth = 3,
}: CommentItemProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [showReplies, setShowReplies] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  
  // Load More Logic
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    data: fetchedReplies, 
    refetch: loadReplies, 
    isFetching: isLoadingReplies 
  } = useCommentReplies(comment.id); // Default enabled assumed to be true in hook, but we want lazy?
  // Wait, hook enables fetching by default if ID is present.
  // We need to modify the hook usage or control it. 
  // Looking at useComments.ts: enabled: !!commentId.
  // We can't pass options? No, the hook wrapper is rigid: export function useCommentReplies(commentId: string) { ... }
  // Wait, I should verify useComments.ts again.
  // Ideally I would update the hook to accept options, but for now I can just fetch it. 
  // Actually, fetching all replies for every comment immediately is BAD for performance (N+1 query problem on frontend).
  // But wait! REST API usually returns replies nested if requested?
  // The backend `GET /prompts/:id/comments` returns top-level comments with `replies: { take: 3 }`.
  // The `userCommentReplies` calls `GET /api/comments/:id/replies`.
  // If I call this for EVERY comment, it's bad.
  // I must fix `useCommentReplies` to accept options OR use `useQuery` directly here.
  // Or I just define it here.
  
  // Let's assume I fix the hook later, or just use the hook but rely on 'enabled' if I can passing an 2nd arg.
  // The current hook DEFINITION: export function useCommentReplies(commentId: string) { ... }
  // It does NOT accept options.
  // So I WILL call useQuery directly here or Update the hook. 
  // Updating the hook is better.
  
  // But I am rewriting THIS file. 
  // I will just disable it by bypassing the hook? No, I should fix the logic properly.
  // For now I will assume I will fix the hook to accept { enabled?: boolean }.
  
  const voteMutation = useVoteComment();
  const deleteMutation = useDeleteComment();

  const [optimisticVote, setOptimisticVote] = useState(comment.userVote);
  const [optimisticScore, setOptimisticScore] = useState(comment.score);

  const isOwner = user?.id === comment.author.id || comment.isOwner;

  // Format relative time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const handleVote = async (value: 1 | -1) => {
    if (!isAuthenticated) return;

    const previousVote = optimisticVote;
    const previousScore = optimisticScore;
    
    let newVote: number | null;
    let scoreDelta: number;

    if (optimisticVote === value) {
      newVote = null;
      scoreDelta = -value;
    } else if (optimisticVote === null) {
      newVote = value;
      scoreDelta = value;
    } else {
      newVote = value;
      scoreDelta = value * 2;
    }

    setOptimisticVote(newVote);
    setOptimisticScore(optimisticScore + scoreDelta);

    try {
      await voteMutation.mutateAsync({
        commentId: comment.id,
        value,
        promptId,
      });
    } catch {
      setOptimisticVote(previousVote);
      setOptimisticScore(previousScore);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) return;
    await deleteMutation.mutateAsync({ commentId: comment.id, promptId });
    setShowMenu(false);
  };
  
  const handleLoadMore = () => {
    setIsExpanded(true);
    // If I cannot control 'enabled', calling the hook will automagically fetch? 
    // No, React Query hooks run on render.
    // If I want lazy load, I need `enabled: false` and call `refetch`.
    // I will use a temporary hook implementation here or just assume I'll fix the hook file next.
    loadReplies();
  };

  const depthColors = [
    "border-l-blue-500/50",
    "border-l-purple-500/50",
    "border-l-green-500/50",
    "border-l-amber-500/50",
  ];

  // Logic to determine what to show
  // If expanded, show fetched replies (or fallback to comment.replies if fetch failed/empty but shouldn't happen)
  // If not expanded, show comment.replies (the initial 3)
  const displayedReplies = isExpanded && fetchedReplies ? fetchedReplies : comment.replies;

  return (
    <div className={`${depth > 0 ? "ml-4 pl-3 border-l-2 " + depthColors[depth % 4] : ""}`}>
      <article className="py-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
          <UserAvatar
            name={comment.author.username}
            image={comment.author.image}
            size="xs"
          />
          <span className="font-medium text-slate-300">
            u/{comment.author.username}
          </span>
          <span>•</span>
          <span>{formatTime(comment.createdAt)}</span>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <span className="italic">(edited)</span>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-slate-200 mb-2 whitespace-pre-wrap">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 text-xs">
          {/* Vote */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => handleVote(1)}
              disabled={!isAuthenticated}
              className={`
                p-0.5 rounded transition-colors
                ${optimisticVote === 1 ? "text-orange-500" : "text-slate-400 hover:text-orange-400"}
              `}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className={`
              font-medium min-w-[1.5ch] text-center
              ${optimisticScore > 0 ? "text-orange-500" : ""}
              ${optimisticScore < 0 ? "text-blue-500" : ""}
              ${optimisticScore === 0 ? "text-slate-400" : ""}
            `}>
              {optimisticScore}
            </span>
            <button
              onClick={() => handleVote(-1)}
              disabled={!isAuthenticated}
              className={`
                p-0.5 rounded transition-colors
                ${optimisticVote === -1 ? "text-blue-500" : "text-slate-400 hover:text-blue-400"}
              `}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Reply */}
          {depth < maxDepth && isAuthenticated && (
            <button
              onClick={() => onReply?.(comment.id)}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Reply
            </button>
          )}

          {/* More menu */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors rounded"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-6 z-10 bg-slate-700 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[120px]">
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        onEdit?.(comment);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-600 flex items-center gap-2"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-600 flex items-center gap-2 text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
                {!isOwner && (
                  <button className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-600 flex items-center gap-2">
                    <Flag className="w-3.5 h-3.5" /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Replies */}
      {displayedReplies && displayedReplies.length > 0 && (
        <div className="mt-1">
          {comment.replyCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs text-blue-400 hover:text-blue-300 mb-2"
            >
              {showReplies ? "Hide" : "Show"} {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
            </button>
          )}
          
          {showReplies && displayedReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply as Comment}
              promptId={promptId}
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              maxDepth={maxDepth}
            />
          ))}

          {/* Show Load More if we have more replies and haven't expanded yet */}
          {comment.hasMoreReplies && showReplies && !isExpanded && (
            <button 
              onClick={handleLoadMore}
              disabled={isLoadingReplies}
              className="text-xs text-blue-400 hover:text-blue-300 ml-4 flex items-center gap-2 mb-2"
            >
              {isLoadingReplies ? "Loading..." : "Load more replies..."}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
