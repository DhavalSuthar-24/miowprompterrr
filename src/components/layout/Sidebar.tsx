import { Bookmark, Home, TrendingUp, Star, Settings, User } from "lucide-react";
import { TagCloud } from "../community/TagCloud";
import { useAuth } from "../../contexts";
import { UserAvatar } from "../community/UserAvatar";

interface SidebarProps {
  currentPath?: string;
  onTagClick?: (slug: string) => void;
  onNavigate?: (path: string) => void;
  activeTag?: string | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  currentPath = "/",
  onTagClick,
  onNavigate,
  activeTag,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/popular", label: "Popular", icon: TrendingUp },
    { path: "/new", label: "New", icon: Star },
  ];

  const userNavItems = isAuthenticated
    ? [
        { path: `/u/${user?.username}`, label: "My Profile", icon: User },
        { path: "/saved", label: "Saved", icon: Bookmark },
        { path: "/settings", label: "Settings", icon: Settings },
      ]
    : [];

  const handleNav = (path: string) => {
    onNavigate?.(path);
    onClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          w-64 h-screen lg:h-[calc(100vh-56px)]
          bg-slate-900 lg:bg-transparent
          border-r border-slate-700/50 lg:border-0
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
          p-4
        `}
      >
        {/* User Card (Mobile) */}
        {isAuthenticated && (
          <div className="lg:hidden mb-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={user?.username || "User"}
                image={user?.image}
                size="md"
              />
              <div>
                <p className="font-medium text-slate-100">{user?.name}</p>
                <p className="text-sm text-slate-400">u/{user?.username}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="space-y-1 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-colors
                  ${isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Navigation */}
        {userNavItems.length > 0 && (
          <>
            <div className="border-t border-slate-700/50 my-4" />
            <nav className="space-y-1 mb-6">
              {userNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-colors
                      ${isActive
                        ? "bg-blue-600/20 text-blue-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </>
        )}

        {/* Tags Cloud */}
        <div className="border-t border-slate-700/50 pt-4">
          <TagCloud onTagClick={onTagClick} activeTag={activeTag} />
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 space-y-1">
            <p>© 2026 MiowNation</p>
            <div className="flex flex-wrap gap-2">
              <a href="/about" className="hover:text-slate-400">About</a>
              <a href="/terms" className="hover:text-slate-400">Terms</a>
              <a href="/privacy" className="hover:text-slate-400">Privacy</a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
