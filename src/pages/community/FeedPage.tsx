import { useState } from "react";
import { CommunityLayout } from "../../components/layout";
import { PromptFeed, FeedFilters } from "../../components/community";

interface FeedPageProps {
  initialSort?: "hot" | "new" | "top" | "rising";
  initialTag?: string;
}

export function FeedPage({ initialSort = "hot", initialTag }: FeedPageProps) {
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top" | "rising">(initialSort);
  const [activeTag, setActiveTag] = useState<string | null>(initialTag || null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagClick = (slug: string) => {
    setActiveTag(slug || null);
  };

  const handleNavigate = (path: string) => {
    // In a real app, use router navigation
    window.history.pushState({}, "", path);
  };

  const handlePromptClick = (id: string) => {
    handleNavigate(`/prompts/${id}`);
  };

  const handleAuthorClick = (username: string) => {
    handleNavigate(`/u/${username}`);
  };

  const handleCreateClick = () => {
    handleNavigate("/create");
  };

  return (
    <CommunityLayout
      currentPath="/"
      activeTag={activeTag}
      onSearch={handleSearch}
      onTagClick={handleTagClick}
      onNavigate={handleNavigate}
      onCreateClick={handleCreateClick}
    >
      <div className="space-y-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100">
            {activeTag ? `#${activeTag}` : "Your Feed"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {activeTag
              ? `Prompts tagged with ${activeTag}`
              : "Discover and share amazing prompts"
            }
          </p>
        </div>

        {/* Filters */}
        <FeedFilters
          currentSort={sortBy}
          onSortChange={setSortBy}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          showSearch={true}
        />

        {/* Feed */}
        <PromptFeed
          sortBy={sortBy}
          tag={activeTag || undefined}
          search={searchQuery || undefined}
          onSortChange={setSortBy}
          onTagClick={handleTagClick}
          onPromptClick={handlePromptClick}
          onAuthorClick={handleAuthorClick}
          showFilters={false}
        />
      </div>
    </CommunityLayout>
  );
}
