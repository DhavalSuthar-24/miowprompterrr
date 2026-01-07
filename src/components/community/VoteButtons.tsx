import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useVotePrompt } from "../../hooks";
import { useAuthStore } from "../../stores";

interface VoteButtonsProps {
  promptId: string;
  upvotes: number;
  downvotes: number;
  score: number;
  userVote: number | null;
  size?: "sm" | "md" | "lg";
  layout?: "vertical" | "horizontal";
  showScore?: boolean;
  onVoteSuccess?: (newScore: number) => void;
}

export function VoteButtons({
  promptId,
  score,
  userVote,
  size = "md",
  layout = "vertical",
  showScore = true,
  onVoteSuccess,
}: VoteButtonsProps) {
  const { isAuthenticated } = useAuthStore();
  const voteMutation = useVotePrompt();
  const [optimisticVote, setOptimisticVote] = useState<number | null>(userVote);
  const [optimisticScore, setOptimisticScore] = useState(score);

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const handleVote = async (value: 1 | -1) => {
    if (!isAuthenticated) {
      // Could open login modal here
      return;
    }

    // Optimistic update
    const previousVote = optimisticVote;
    const previousScore = optimisticScore;
    
    let newVote: number | null;
    let scoreDelta: number;

    if (optimisticVote === value) {
      // Removing vote
      newVote = null;
      scoreDelta = -value;
    } else if (optimisticVote === null) {
      // New vote
      newVote = value;
      scoreDelta = value;
    } else {
      // Changing vote
      newVote = value;
      scoreDelta = value * 2;
    }

    setOptimisticVote(newVote);
    setOptimisticScore(optimisticScore + scoreDelta);

    try {
      const result = await voteMutation.mutateAsync({ promptId, value });
      if (result && result.score !== undefined) {
        setOptimisticScore(result.score);
        setOptimisticVote(result.userVote ?? null);
        onVoteSuccess?.(result.score);
      }
    } catch {
      // Revert on error
      setOptimisticVote(previousVote);
      setOptimisticScore(previousScore);
    }
  };

  const isUpvoted = optimisticVote === 1;
  const isDownvoted = optimisticVote === -1;
  const isLoading = voteMutation.isPending;

  const containerClass = layout === "vertical" 
    ? "flex flex-col items-center gap-0.5"
    : "flex items-center gap-1";

  return (
    <div className={containerClass}>
      <button
        onClick={() => handleVote(1)}
        disabled={isLoading || !isAuthenticated}
        className={`
          p-1 rounded-md transition-all duration-200
          ${isUpvoted 
            ? "text-orange-500 bg-orange-500/10" 
            : "text-slate-400 hover:text-orange-400 hover:bg-orange-500/5"
          }
          ${!isAuthenticated ? "cursor-not-allowed opacity-50" : ""}
          ${isLoading ? "animate-pulse" : ""}
        `}
        title={isAuthenticated ? "Upvote" : "Login to vote"}
      >
        <ChevronUp className={`${sizeClasses[size]} ${isUpvoted ? "fill-current" : ""}`} />
      </button>

      {showScore && (
        <span className={`
          font-semibold ${textSizes[size]} min-w-[2ch] text-center
          ${optimisticScore > 0 ? "text-orange-500" : ""}
          ${optimisticScore < 0 ? "text-blue-500" : ""}
          ${optimisticScore === 0 ? "text-slate-400" : ""}
        `}>
          {optimisticScore}
        </span>
      )}

      <button
        onClick={() => handleVote(-1)}
        disabled={isLoading || !isAuthenticated}
        className={`
          p-1 rounded-md transition-all duration-200
          ${isDownvoted 
            ? "text-blue-500 bg-blue-500/10" 
            : "text-slate-400 hover:text-blue-400 hover:bg-blue-500/5"
          }
          ${!isAuthenticated ? "cursor-not-allowed opacity-50" : ""}
          ${isLoading ? "animate-pulse" : ""}
        `}
        title={isAuthenticated ? "Downvote" : "Login to vote"}
      >
        <ChevronDown className={`${sizeClasses[size]} ${isDownvoted ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}
