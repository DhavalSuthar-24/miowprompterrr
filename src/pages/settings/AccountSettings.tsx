import { useState } from "react";
import { Shield, Loader2, Key } from "lucide-react";
import { useChangePassword } from "../../hooks";

export function AccountSettings() {
  const changePassword = useChangePassword();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      }
    );
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-400" />
        Account Security
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-slate-400" />
            Change Password
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>

          <div className="pt-4 mt-2">
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-medium text-red-400 mb-2">Delete Account</h3>
          <p className="text-slate-400 text-sm mb-4">
            Permanently remove your account and all of your content. This action cannot be undone.
          </p>
          <button
            type="button"
            className="px-6 py-2.5 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium rounded-lg transition-colors text-sm"
            onClick={() => alert("Account deletion is currently disabled for safety.")}
          >
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
}
