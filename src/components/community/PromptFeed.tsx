import { useCallback, useRef, useEffect } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { PromptCard } from "./PromptCard";
import { PromptCardSkeleton } from "../ui/skeletons";
import { FeedFilters } from "./FeedFilters";
import { useInfinitePrompts } from "../../hooks";
import type { Prompt } from "../../lib/schemas";

interface PromptFeedProps {
  sortBy?: "hot" | "new" | "top" | "rising";
  tag?: string;
  personality?: string;
  search?: string;
  onSortChange?: (sort: "hot" | "new" | "top" | "rising") => void;
  onTagClick?: (slug: string) => void;
  onPromptClick?: (id: string) => void;
  onAuthorClick?: (username: string) => void;
  showFilters?: boolean;
}

export function PromptFeed({
  sortBy = "hot",
  tag,
  personality,
  search,
  onSortChange,
  onTagClick,
  onPromptClick,
  onAuthorClick,
  showFilters = true,
}: PromptFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfinitePrompts({
    sortBy,
    tag,
    personality,
    search,
    limit: 20,
  });

  // Infinite scroll intersection observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target && target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  // Flatten pages into prompts array
  const prompts = data?.pages.flatMap((page) => page.data as Prompt[]) || [];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-slate-400 mb-4">
          {error instanceof Error ? error.message : "Failed to load prompts"}
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && onSortChange && (
        <FeedFilters
          currentSort={sortBy}
          onSortChange={onSortChange}
          showSearch={false}
        />
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No prompts found</p>
        </div>
      ) : (
        <>
          {/* Prompts List */}
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onTagClick={onTagClick}
                onPromptClick={onPromptClick}
                onAuthorClick={onAuthorClick}
              />
            ))}
          </div>

          {/* Load More Trigger */}
          <div ref={loadMoreRef} className="py-4">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            )}
            {!hasNextPage && prompts.length > 0 && (
              <p className="text-center text-sm text-slate-500">
                You've reached the end
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
