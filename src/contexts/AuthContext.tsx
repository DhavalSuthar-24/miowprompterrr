import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useAuthStore } from "../stores";
import { api } from "../lib/api";
import type { AuthUser } from "../lib/schemas";
import { toast } from "../stores/uiStore";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  username: string;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, login: storeLogin, logout: storeLogout, setLoading } = useAuthStore();

  // Try to refresh token on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const response = await api.post<AuthResponse>("/auth/refresh");
        if (response.success && response.data) {
          storeLogin(response.data.user, response.data.accessToken);
        }
      } catch {
        // Ignore - user just isn't logged in
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", { email, password });
      
      if (!response.success || !response.data) {
        // toast.error(response.message || "Login failed"); // Let component handle error display
        return { success: false, error: response.message || "Login failed" };
      }

      storeLogin(response.data.user, response.data.accessToken);
      toast.success("Welcome back!");
      return { success: true };
    } catch (error) {
      // toast.error("Login failed. Please try again.");
      return { success: false, error: "Login failed. Please try again." };
    }
  }, [storeLogin]);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);
      
      if (!response.success || !response.data) {
        // toast.error(response.message || "Registration failed");
        return { success: false, error: response.message || "Registration failed" };
      }

      storeLogin(response.data.user, response.data.accessToken);
      toast.success("Account created successfully!");
      return { success: true };
    } catch (error) {
      // toast.error("Registration failed. Please try again.");
      return { success: false, error: "Registration failed. Please try again." };
    }
  }, [storeLogin]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors on logout
    }
    storeLogout();
    toast.info("Logged out successfully");
  }, [storeLogout]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await api.post<AuthResponse>("/auth/refresh");
      
      if (!response.success || !response.data) {
        return false;
      }

      storeLogin(response.data.user, response.data.accessToken);
      return true;
    } catch {
      return false;
    }
  }, [storeLogin]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// Simple hook to check auth status
export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}

// Hook for protected content
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  return {
    isAuthorized: isAuthenticated && !!user,
    isLoading,
    user,
  };
}
