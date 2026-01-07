import { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts";
import { useUpdateProfile } from "../../hooks";

export function ProfileSettings() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [image, setImage] = useState(user?.image || ""); // We don't have file upload UI yet, just URL input for now or disabled

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setImage(user.image || "");
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      name,
      // username: username // Backend doesn't support username change yet in the PATCH /me implementation I made, so I will comment this out or disable input
      image: image || undefined,
    });
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <User className="w-5 h-5 text-blue-400" />
        Profile Information
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section (Placeholder for now) */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-600">
            {image ? (
              <img src={image} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Profile Image URL
            </label>
             <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              For now, paste a direct image URL. Upload support coming soon.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              disabled
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 mt-1">
              Username cannot be changed at this time.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
