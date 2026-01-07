import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Users, LogOut, Settings, Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: "/", label: "Prompt Builder", icon: Home },
    { to: "/prompts", label: "Community", icon: Users },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header 
      className={`
        sticky top-0 z-50 w-full transition-all duration-300 border-b
        ${scrolled 
          ? "bg-slate-900/95 backdrop-blur-md border-slate-800 shadow-lg" 
          : "bg-slate-900/50 backdrop-blur-sm border-transparent"
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              MiowNation
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${isActive(link.to)
                    ? "bg-blue-600/10 text-blue-400 hover:bg-blue-600/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }
                `}
              >
                <link.icon className={`w-4 h-4 ${isActive(link.to) ? "fill-blue-400/20" : ""}`} />
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={`/u/${user?.username}`}
                  className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-inner">
                    {user?.image ? (
                      <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user?.username?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                    {user?.username}
                  </span>
                </Link>

                <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
                  <Link
                    to="/settings"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                  {user?.roles?.some(r => r.name === "ADMIN") && (
                    <Link
                      to="/admin"
                      className="px-3 py-1.5 bg-amber-600/20 text-amber-500 border border-amber-600/20 text-xs font-bold rounded-lg hover:bg-amber-600 hover:text-white transition-all"
                    >
                      ADMIN
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 transition-all transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-slate-800
          ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          bg-slate-900
        `}
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                ${isActive(link.to)
                  ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}

          <div className="h-px bg-slate-800 my-4" />

          {isAuthenticated ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                   {user?.image ? (
                      <img src={user.image} alt={user.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user?.username?.substring(0, 2).toUpperCase()
                    )}
                </div>
                <div>
                  <div className="font-bold text-white">{user?.name}</div>
                  <div className="text-xs text-slate-400">@{user?.username}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/settings"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>

              {user?.roles?.some(r => r.name === "ADMIN") && (
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-600/20 rounded-xl transition-colors font-bold"
                >
                   Admin Dashboard
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                className="flex items-center justify-center px-4 py-3 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
