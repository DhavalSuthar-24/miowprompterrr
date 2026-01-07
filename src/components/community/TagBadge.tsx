

interface TagBadgeProps {
  name: string;
  slug: string;
  color?: string | null;
  count?: number;
  size?: "sm" | "md" | "lg";
  onClick?: (slug: string) => void;
  showCount?: boolean;
  onRemove?: () => void;
}

import { X } from "lucide-react";

export function TagBadge({
  name,
  slug,
  color,
  count,
  size = "sm",
  onClick,
  onRemove,
  showCount = false,
}: TagBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const handleClick = () => {
    // Only trigger onClick if not clicking remove
    if (onClick) {
      onClick(slug);
    }
  };

  // Generate color based on tag name if no color provided
  const getTagColor = () => {
    if (color) return color;
    
    // Hash tag name to get consistent color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      "bg-blue-500/10 text-blue-400 border-blue-500/30",
      "bg-purple-500/10 text-purple-400 border-purple-500/30",
      "bg-green-500/10 text-green-400 border-green-500/30",
      "bg-amber-500/10 text-amber-400 border-amber-500/30",
      "bg-rose-500/10 text-rose-400 border-rose-500/30",
      "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      "bg-pink-500/10 text-pink-400 border-pink-500/30",
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const colorClasses = getTagColor();

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        ${colorClasses}
        inline-flex items-center gap-1 rounded-full border
        font-medium transition-all duration-200
        hover:scale-105 hover:shadow-sm
        cursor-pointer
      `}
    >
      <span className="flex items-center gap-1">
        <span>#</span>
        <span>{name}</span>
        {showCount && count !== undefined && (
          <span className="ml-0.5 opacity-60">({count})</span>
        )}
      </span>
      {onRemove && (
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-red-400 p-0.5 rounded-full hover:bg-red-500/10 transition-colors"
        >
          <X size={12} />
        </span>
      )}
    </button>
  );
}
