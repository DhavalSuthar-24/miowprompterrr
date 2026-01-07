import { useState } from "react";
import { Menu, Search, Bell, Plus, User, LogOut, Settings, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts";
import { UserAvatar } from "../community/UserAvatar";

interface CommunityNavProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
  onCreateClick?: () => void;
}

export function CommunityNav({ onMenuClick, onSearch, onCreateClick }: CommunityNavProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo & Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <a href="/" className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white hidden sm:block">
                MiowNation
              </span>
            </a>
          </div>

          {/* Center: Search (Desktop) */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </form>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <Search className="w-5 h-5" />
            </button>

            {isAuthenticated ? (
              <>
                {/* Create Button */}
                <button
                  onClick={onCreateClick}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                </button>

                {/* Notifications */}
                <button className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <UserAvatar
                      name={user?.username || "User"}
                      image={user?.image}
                      size="sm"
                    />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-12 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-700">
                        <p className="font-medium text-slate-100">{user?.name}</p>
                        <p className="text-sm text-slate-400">u/{user?.username}</p>
                      </div>
                      
                      <a
                        href={`/u/${user?.username}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                        <User className="w-4 h-4" /> Profile
                      </a>
                      <a
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </a>
                      
                      <div className="border-t border-slate-700 mt-2 pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                        >
                          <LogOut className="w-4 h-4" /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {showMobileSearch && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}
