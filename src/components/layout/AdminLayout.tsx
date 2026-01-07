import { Outlet, Link, useLocation } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Layers,
  FileText,
  Shield,
  BarChart3,
  ChevronLeft,
} from "lucide-react";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/personalities", label: "Personalities", icon: Sparkles },
  { to: "/admin/presets", label: "Presets", icon: Layers },
  { to: "/admin/tiers", label: "Tiers", icon: BarChart3 },
  { to: "/admin/templates", label: "Templates", icon: FileText },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/moderation", label: "Moderation", icon: Shield },
];

export function AdminLayout() {
  const location = useLocation();

  const isActive = (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back to Site</span>
          </Link>
          <h1 className="mt-4 text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            Admin Panel
          </h1>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          {adminLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(link.to, link.exact)
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
