import { useState, type ReactNode } from "react";
import { CommunityNav } from "./CommunityNav";
import { Sidebar } from "./Sidebar";

interface CommunityLayoutProps {
  children: ReactNode;
  currentPath?: string;
  activeTag?: string | null;
  onSearch?: (query: string) => void;
  onTagClick?: (slug: string) => void;
  onNavigate?: (path: string) => void;
  onCreateClick?: () => void;
  showSidebar?: boolean;
}

export function CommunityLayout({
  children,
  currentPath = "/",
  activeTag,
  onSearch,
  onTagClick,
  onNavigate,
  onCreateClick,
  showSidebar = true,
}: CommunityLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <CommunityNav
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSearch={onSearch}
        onCreateClick={onCreateClick}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            currentPath={currentPath}
            onTagClick={onTagClick}
            onNavigate={onNavigate}
            activeTag={activeTag}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={`
            flex-1 min-w-0 p-4
            ${showSidebar ? "lg:ml-0" : ""}
          `}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
