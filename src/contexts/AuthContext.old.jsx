import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AuthContext = createContext(null);

// Token storage keys
const ACCESS_TOKEN_KEY = 'miownation_access_token';
const REFRESH_TOKEN_KEY = 'miownation_refresh_token';

// Helper to get stored tokens
const getStoredTokens = () => ({
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
});

// Helper to store tokens
const storeTokens = (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

// Helper to clear tokens
const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// API helper with auth
const authFetch = async (endpoint, options = {}) => {
    const { accessToken } = getStoredTokens();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return response;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is authenticated
    const isAuthenticated = !!user;

    // Refresh access token
    const refreshAccessToken = useCallback(async () => {
        const { refreshToken } = getStoredTokens();

        if (!refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                clearTokens();
                return false;
            }

            const data = await response.json();

            if (data.success) {
                storeTokens(data.data.accessToken, data.data.refreshToken);
                return true;
            }

            return false;
        } catch {
            return false;
        }
    }, []);

    // Fetch current user
    const fetchCurrentUser = useCallback(async () => {
        const { accessToken } = getStoredTokens();

        if (!accessToken) {
            setIsLoading(false);
            return;
        }

        try {
            let response = await authFetch('/auth/me');

            // If 401, try to refresh token
            if (response.status === 401) {
                const refreshed = await refreshAccessToken();

                if (refreshed) {
                    response = await authFetch('/auth/me');
                } else {
                    clearTokens();
                    setUser(null);
                    setIsLoading(false);
                    return;
                }
            }

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUser(data.data);
                }
            } else {
                clearTokens();
                setUser(null);
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
            setError('Failed to fetch user data');
        } finally {
            setIsLoading(false);
        }
    }, [refreshAccessToken]);

    // Initialize auth state
    useEffect(() => {
        fetchCurrentUser();
    }, [fetchCurrentUser]);

    // Login function
    const login = async (email, password) => {
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            if (data.success) {
                storeTokens(data.data.accessToken, data.data.refreshToken);
                setUser(data.data.user);
                return { success: true, user: data.data.user };
            }

            throw new Error(data.message || 'Login failed');
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            if (data.success) {
                storeTokens(data.data.accessToken, data.data.refreshToken);
                setUser(data.data.user);
                return { success: true, user: data.data.user };
            }

            throw new Error(data.message || 'Registration failed');
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        const { refreshToken } = getStoredTokens();

        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
        } catch {
            // Ignore logout errors
        }

        clearTokens();
        setUser(null);
    };

    // Logout from all devices
    const logoutAll = async () => {
        try {
            await authFetch('/auth/logout-all', { method: 'POST' });
        } catch {
            // Ignore errors
        }

        clearTokens();
        setUser(null);
    };

    // Check if user has a permission
    const hasPermission = (permission) => {
        if (!user?.permissions) return false;
        if (user.permissions.includes('admin:all')) return true;
        return user.permissions.includes(permission);
    };

    // Check if user has any of the permissions
    const hasAnyPermission = (...permissions) => {
        if (!user?.permissions) return false;
        if (user.permissions.includes('admin:all')) return true;
        return permissions.some((p) => user.permissions.includes(p));
    };

    // Check if user has all permissions
    const hasAllPermissions = (...permissions) => {
        if (!user?.permissions) return false;
        if (user.permissions.includes('admin:all')) return true;
        return permissions.every((p) => user.permissions.includes(p));
    };

    // Update user data (for onboarding)
    const updateUser = (updates) => {
        setUser((prev) => (prev ? { ...prev, ...updates } : null));
    };

    // Get auth header for API calls
    const getAuthHeader = () => {
        const { accessToken } = getStoredTokens();
        return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    };

    const value = {
        // State
        user,
        isAuthenticated,
        isLoading,
        error,

        // Actions
        login,
        register,
        logout,
        logoutAll,
        refreshAccessToken,
        fetchCurrentUser,
        updateUser,

        // Permissions
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Helpers
        getAuthHeader,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export default AuthContext;
