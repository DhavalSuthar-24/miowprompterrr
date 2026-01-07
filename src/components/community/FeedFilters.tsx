
import { Flame, Clock, TrendingUp, Sparkles, Filter, Search } from "lucide-react";

type SortOption = "hot" | "new" | "top" | "rising";

interface FeedFiltersProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  showSearch?: boolean;
}

export function FeedFilters({
  currentSort,
  onSortChange,
  onSearch,
  searchQuery = "",
  showSearch = true,
}: FeedFiltersProps) {
  const sortOptions: { value: SortOption; label: string; icon: React.ElementType }[] = [
    { value: "hot", label: "Hot", icon: Flame },
    { value: "new", label: "New", icon: Clock },
    { value: "top", label: "Top", icon: TrendingUp },
    { value: "rising", label: "Rising", icon: Sparkles },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
      {/* Sort Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-700/50 rounded-lg">
        {sortOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                transition-all duration-200
                ${currentSort === option.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-600/50"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      {showSearch && onSearch && (
        <div className="relative flex-1 w-full sm:w-auto sm:max-w-xs ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-9 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      )}
    </div>
  );
}

interface FilterTagProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
  onRemove?: () => void;
}

export function FilterTag({ label, isActive = false, onClick, onRemove }: FilterTagProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        transition-all duration-200
        ${isActive
          ? "bg-blue-600 text-white"
          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
        }
      `}
    >
      <Filter className="w-3 h-3" />
      {label}
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-red-400"
        >
          ×
        </span>
      )}
    </button>
  );
}
