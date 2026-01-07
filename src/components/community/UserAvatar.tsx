
import { User } from "lucide-react";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

export function UserAvatar({
  name,
  image,
  size = "md",
  className = "",
  showOnlineIndicator = false,
  isOnline = false,
}: UserAvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  const indicatorSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  // Get initials from name
  const getInitials = () => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Generate background color from name
  const getBackgroundColor = () => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      "bg-blue-600",
      "bg-purple-600",
      "bg-green-600",
      "bg-amber-600",
      "bg-rose-600",
      "bg-cyan-600",
      "bg-indigo-600",
      "bg-pink-600",
      "bg-teal-600",
      "bg-orange-600",
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      {image ? (
        <img
          src={image}
          alt={name}
          className={`
            ${sizeClasses[size]}
            rounded-full object-cover ring-2 ring-slate-700
          `}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size]}
            ${getBackgroundColor()}
            rounded-full flex items-center justify-center
            font-semibold text-white ring-2 ring-slate-700
          `}
        >
          {name ? getInitials() : <User className="w-1/2 h-1/2" />}
        </div>
      )}

      {showOnlineIndicator && (
        <span
          className={`
            absolute bottom-0 right-0
            ${indicatorSizes[size]}
            rounded-full ring-2 ring-slate-800
            ${isOnline ? "bg-green-500" : "bg-slate-500"}
          `}
        />
      )}
    </div>
  );
}

interface AuthorLinkProps {
  username: string;
  name?: string;
  image?: string | null;
  showAvatar?: boolean;
  size?: "sm" | "md";
  onClick?: (username: string) => void;
}

export function AuthorLink({
  username,
  name,
  image,
  showAvatar = true,
  size = "sm",
  onClick,
}: AuthorLinkProps) {
  const handleClick = () => {
    onClick?.(username);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-1.5
        text-slate-400 hover:text-blue-400
        transition-colors duration-200
        ${size === "sm" ? "text-xs" : "text-sm"}
      `}
    >
      {showAvatar && (
        <UserAvatar
          name={name || username}
          image={image}
          size={size === "sm" ? "xs" : "sm"}
        />
      )}
      <span className="font-medium">u/{username}</span>
    </button>
  );
}
