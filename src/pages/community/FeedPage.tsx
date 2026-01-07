import { useNavigate, useSearchParams } from "react-router-dom";
import { CommunityLayout } from "../../components/layout";
import { PromptFeed, FeedFilters } from "../../components/community";

// removed props interface

export function FeedPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const sortBy = (searchParams.get("sort") as "hot" | "new" | "top" | "rising") || "hot";
  const activeTag = searchParams.get("tag");
  const searchQuery = searchParams.get("q") || "";

  const setSortBy = (sort: "hot" | "new" | "top" | "rising") => {
    setSearchParams(prev => {
      prev.set("sort", sort);
      return prev;
    });
  };

  const handleSearch = (query: string) => {
    setSearchParams(prev => {
      if (query) prev.set("q", query);
      else prev.delete("q");
      return prev;
    });
  };

  const handleTagClick = (slug: string) => {
    setSearchParams(prev => {
      if (slug) prev.set("tag", slug);
      else prev.delete("tag");
      return prev;
    });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
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
