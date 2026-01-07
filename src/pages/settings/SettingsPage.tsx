import { useState } from "react";
import { User, Shield, Bell } from "lucide-react";
import { CommunityLayout } from "../../components/layout";
import { ProfileSettings } from "./ProfileSettings";
import { AccountSettings } from "./AccountSettings";
import { NotificationSettings } from "./NotificationSettings";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "notifications">("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ] as const;

  return (
    <CommunityLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar Tabs */}
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 min-h-[400px]">
            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "account" && <AccountSettings />}
            {activeTab === "notifications" && <NotificationSettings />}
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
}
