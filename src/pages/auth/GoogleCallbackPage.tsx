import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../contexts";
import { api } from "../../lib/api";

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: storeLogin } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setStatus("error");
        setError("Google login was cancelled or failed");
        return;
      }

      if (!code) {
        setStatus("error");
        setError("No authorization code received");
        return;
      }

      try {
        const response = await api.get<{
          user: any;
          accessToken: string;
        }>(`/auth/google/callback?code=${code}&state=${state || ""}`);

        if (response.success && response.data) {
          // Store auth data and redirect
          storeLogin(response.data.user, response.data.accessToken);
          setStatus("success");
          setTimeout(() => navigate("/"), 1500);
        } else {
          throw new Error(response.message || "OAuth failed");
        }
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Failed to complete Google login");
      }
    };

    handleCallback();
  }, [searchParams, navigate, storeLogin]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Completing Sign In...
            </h2>
            <p className="text-slate-400">Please wait while we verify your account</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Welcome!</h2>
            <p className="text-slate-400">Redirecting you to the app...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Login Failed</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <a
              href="/login"
              className="text-blue-400 hover:text-blue-300"
            >
              Try again
            </a>
          </>
        )}
      </div>
    </div>
  );
}
