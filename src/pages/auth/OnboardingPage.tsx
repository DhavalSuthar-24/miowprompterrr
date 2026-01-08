import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, AtSign, Calendar, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../../contexts";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

interface OnboardingStatus {
  completed: boolean;
  user: {
    name: string | null;
    username: string | null;
    dob: string | null;
  };
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { refreshToken } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    dob: "",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get<OnboardingStatus>("/onboarding/status");
        if (response.success && response.data) {
          const { user } = response.data;
          setFormData({
            name: user.name || "",
            username: user.username || "",
            dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] ?? "" : "",
          });

          // If already completed, redirect
          if (response.data.completed) {
            navigate("/");
          }
        }
      } catch (error) {
        toast.error("Failed to load onboarding status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Update Profile
      const updateResponse = await api.put("/onboarding/profile", {
        name: formData.name,
        username: formData.username,
        dob: formData.dob,
      });

      if (!updateResponse.success) {
        throw new Error(updateResponse.message || "Failed to update profile");
      }

      // 2. Mark as Complete
      const completeResponse = await api.post("/onboarding/complete");
      
      if (!completeResponse.success) {
        throw new Error(completeResponse.message || "Failed to complete onboarding");
      }

      toast.success("Welcome aboard! Profile setup complete.");
      
      // Refresh token/user state to update onboardingCompleted flag in context
      await refreshToken();
      
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
          <p className="text-slate-400">Let's set up your profile to get started.</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 sm:p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                  minLength={2}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                  minLength={3}
                  pattern="^[a-zA-Z0-9_]+$"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 ml-1">
                Letters, numbers, and underscores only.
              </p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5 ml-1">
                You must be at least 13 years old.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
