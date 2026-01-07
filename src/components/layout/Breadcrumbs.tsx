import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show on home page
  if (pathnames.length === 0) return null;

  // Map of path segments to readable names
  const nameMap: Record<string, string> = {
    prompts: "Community",
    admin: "Admin",
    users: "Users",
    moderation: "Moderation",
    tiers: "Tiers",
    personalities: "Personalities",
    presets: "Presets",
    settings: "Settings",
    create: "Create",
  };

  return (
    <nav className="flex items-center text-sm text-slate-500 mb-6">
      <Link to="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const name = nameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <div key={to} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-1 text-slate-700" />
            {isLast ? (
              <span className="font-medium text-slate-300">{name}</span>
            ) : (
              <Link to={to} className="hover:text-amber-500 transition-colors">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
