import { useState } from "react";
import { Shield, Loader2, Key } from "lucide-react";
import toast from 'react-hot-toast';
import { useChangePassword } from "../../hooks";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";

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
          toast.success("Password updated successfully");
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Key className="w-4 h-4 text-slate-400" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Current Password
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                disabled={changePassword.isPending}
                className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600"
              >
                {changePassword.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-medium text-red-400 mb-2">Delete Account</h3>
          <p className="text-slate-400 text-sm mb-4">
            Permanently remove your account and all of your content. This action cannot be undone.
          </p>
          <Button
            type="button"
            variant="destructive"
            className="bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
            onClick={() => toast.error("Account deletion is currently disabled for safety.")}
          >
            Delete Account
          </Button>
        </div>
      </form>
    </div>
  );
}
