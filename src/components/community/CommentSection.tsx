import { useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { CommentItem } from "./CommentItem";
import { useComments, useCreateComment } from "../../hooks";
import { useAuthStore } from "../../stores";
import type { Comment } from "../../lib/schemas";

interface CommentSectionProps {
  promptId: string;
  commentCount?: number;
}

export function CommentSection({ promptId, commentCount = 0 }: CommentSectionProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [sortBy, setSortBy] = useState<"top" | "new" | "old">("top");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [_editingComment, setEditingComment] = useState<Comment | null>(null);

  const { data: comments, isLoading, error } = useComments(promptId, sortBy);
  const createMutation = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createMutation.mutateAsync({
      promptId,
      content: newComment.trim(),
    });

    setNewComment("");
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyingTo) return;

    await createMutation.mutateAsync({
      promptId,
      content: replyContent.trim(),
      parentId: replyingTo,
    });

    setReplyContent("");
    setReplyingTo(null);
  };

  const sortOptions = [
    { value: "top", label: "Top" },
    { value: "new", label: "New" },
    { value: "old", label: "Old" },
  ];

  return (
    <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-100">
          <MessageCircle className="w-5 h-5" />
          <span>{commentCount} Comments</span>
        </h3>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1">Sort by:</span>
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value as typeof sortBy)}
              className={`
                px-2 py-1 rounded transition-colors
                ${sortBy === option.value
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* New Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                {user?.username?.charAt(0).toUpperCase() || "?"}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                rows={3}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || createMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg text-center">
          <p className="text-sm text-slate-400">
            <button className="text-blue-400 hover:text-blue-300">Log in</button>
            {" "}to join the conversation
          </p>
        </div>
      )}

      {/* Reply Form */}
      {replyingTo && (
        <div className="mb-4 ml-8 p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg">
          <form onSubmit={handleReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              autoFocus
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
                className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyContent.trim() || createMutation.isPending}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Reply
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-slate-400">
          Failed to load comments
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-1">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              promptId={promptId}
              onReply={setReplyingTo}
              onEdit={setEditingComment}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </section>
  );
}
