import { useState } from "react";
import { Calendar, Edit, Settings } from "lucide-react";
import { CommunityLayout } from "../../components/layout";
import { UserAvatar, PromptCard } from "../../components/community";
import { useUserProfile, useUserPrompts, useSavedPrompts } from "../../hooks";
import { useAuth } from "../../contexts";
import type { Prompt } from "../../lib/schemas";

import { useNavigate, useParams } from "react-router-dom";

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  // Safe default for username to avoid TS errors
  const safeUsername = username || "";
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"prompts" | "saved" | "comments">("prompts");
  
  const { data: profileData, isLoading: profileLoading } = useUserProfile(safeUsername);
  const { data: userPromptsData, isLoading: promptsLoading } = useUserPrompts(safeUsername);
  const { data: savedData, isLoading: savedLoading } = useSavedPrompts();

  const profile = profileData?.user;
  const userPrompts = userPromptsData?.prompts;
  const savedPrompts = savedData?.data;

  const isOwnProfile = currentUser?.username === safeUsername;

  const handlePromptClick = (id: string) => {
    navigate(`/prompts/${id}`);
  };

  const handleTagClick = (slug: string) => {
    navigate(`/?tag=${slug}`);
  };

  const handleAuthorClick = (authorUsername: string) => {
    navigate(`/u/${authorUsername}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const tabs = [
    { id: "prompts", label: "Prompts", count: profile?.stats?.promptCount || 0 },
    ...(isOwnProfile ? [{ id: "saved", label: "Saved", count: savedData?.pagination?.total || 0 }] : []),
    { id: "comments", label: "Comments", count: 0 },
  ];

  if (profileLoading) {
    return (
      <CommunityLayout showSidebar={false}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-32 bg-slate-800 rounded-xl mb-4" />
            <div className="h-24 bg-slate-800 rounded-xl" />
          </div>
        </div>
      </CommunityLayout>
    );
  }

  if (!profile) {
    return (
      <CommunityLayout showSidebar={false}>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-slate-400">User not found</p>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout showSidebar={false}>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden mb-6">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <UserAvatar
                name={profile.username}
                image={profile.image}
                size="xl"
                className="ring-4 ring-slate-900"
              />

              <div className="flex-1 pt-4 sm:pt-0">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-slate-100">
                    {profile.name}
                  </h1>
                  {isOwnProfile && (
                    <button
                      onClick={() => navigate("/settings/profile")}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-slate-400">u/{profile.username}</p>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              )}
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(profile.createdAt)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-slate-700/50">
              <div>
                <span className="font-bold text-slate-100">{profile.stats?.promptCount || 0}</span>
                <span className="text-slate-400 ml-1">prompts</span>
              </div>
              <div>
                <span className="font-bold text-slate-100">{profile.stats?.reputation || 0}</span>
                <span className="text-slate-400 ml-1">karma</span>
              </div>
              <div>
                <span className="font-bold text-slate-100">{profile.stats?.totalUpvotes || 0}</span>
                <span className="text-slate-400 ml-1">upvotes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-800/50 border border-slate-700/50 rounded-xl mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                }
              `}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-3">
          {activeTab === "prompts" && (
            promptsLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-slate-800 rounded-xl" />
                ))}
              </div>
            ) : userPrompts && userPrompts.length > 0 ? (
              userPrompts.map((prompt: Prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onPromptClick={handlePromptClick}
                  onTagClick={handleTagClick}
                  onAuthorClick={handleAuthorClick}
                />
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                No prompts yet
              </div>
            )
          )}

          {activeTab === "saved" && isOwnProfile && (
            savedLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-slate-800 rounded-xl" />
                ))}
              </div>
            ) : savedPrompts && savedPrompts.length > 0 ? (
              savedPrompts.map((item) => (
                <PromptCard
                  key={item.prompt.id}
                  prompt={item.prompt}
                  onPromptClick={handlePromptClick}
                  onTagClick={handleTagClick}
                  onAuthorClick={handleAuthorClick}
                />
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                No saved prompts
              </div>
            )
          )}

          {activeTab === "comments" && (
            <div className="text-center py-12 text-slate-400">
              Comments coming soon
            </div>
          )}
        </div>
      </div>
    </CommunityLayout>
  );
}
