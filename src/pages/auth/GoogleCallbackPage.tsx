import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../contexts";

// Helper to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      // Check for success parameter from backend redirect
      const success = searchParams.get("success");
      const errorParam = searchParams.get("error");
      const onboardingCompleted = searchParams.get("onboardingCompleted");
      const redirectTo = searchParams.get("redirect") || "/";

      if (errorParam) {
        setStatus("error");
        const errorMessages: Record<string, string> = {
          invalid_state: "Invalid authentication state. Please try again.",
          state_expired: "Authentication session expired. Please try again.",
          oauth_denied: "Google login was cancelled.",
          token_exchange_failed: "Failed to authenticate with Google.",
          user_info_failed: "Failed to get user information.",
          no_email: "Email is required for registration.",
          server_error: "An unexpected error occurred.",
        };
        setError(errorMessages[errorParam] || "Google login failed");
        return;
      }

      if (success === "true") {
        // Backend has set cookies - get access token from cookie
        const accessToken = getCookie("access_token");
        
        if (!accessToken) {
          setStatus("error");
          setError("Authentication failed - no token received");
          return;
        }

        try {
          // Refresh token to get user data and update auth state
          await refreshToken();
          
          setStatus("success");
          
          // Redirect after a brief success message
          setTimeout(() => {
            // If onboarding not completed, redirect to onboarding
            if (onboardingCompleted === "false") {
              navigate("/onboarding");
            } else {
              navigate(redirectTo);
            }
          }, 1500);
        } catch (err: any) {
          setStatus("error");
          setError(err.message || "Failed to complete authentication");
        }
      } else {
        // No success param - this is an error or invalid access
        setStatus("error");
        setError("Invalid callback. Please try logging in again.");
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshToken]);

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

