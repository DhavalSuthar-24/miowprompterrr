
import { Hash, TrendingUp, Loader2 } from "lucide-react";
import { TagBadge } from "./TagBadge";
import { usePopularTags } from "../../hooks";

interface TagCloudProps {
  onTagClick?: (slug: string) => void;
  activeTag?: string | null;
  limit?: number;
}

export function TagCloud({ onTagClick, activeTag, limit = 12 }: TagCloudProps) {
  const { data: tags, isLoading } = usePopularTags();

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4 text-blue-500" />
          <h3 className="font-semibold text-sm text-slate-200">Popular Tags</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-blue-500" />
        <h3 className="font-semibold text-sm text-slate-200">Trending Tags</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, limit).map((tag) => (
          <TagBadge
            key={tag.id}
            name={tag.name}
            slug={tag.slug}
            color={tag.color}
            count={tag.useCount}
            showCount
            onClick={onTagClick}
          />
        ))}
      </div>

      {activeTag && (
        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-400">
            Filtering by: <span className="text-blue-400">#{activeTag}</span>
            <button
              onClick={() => onTagClick?.("")}
              className="ml-2 text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
