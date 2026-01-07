import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute - Wrapper for routes that require authentication
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourComponent />
 * </ProtectedRoute>
 * 
 * With permission check:
 * <ProtectedRoute requiredPermission="admin:users">
 *   <AdminComponent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
    children,
    requiredPermission,
    requiredPermissions,
    requireAll = false,
    fallback,
    loadingFallback,
    onUnauthorized,
}) {
    const { isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

    // Show loading state
    if (isLoading) {
        if (loadingFallback) return loadingFallback;

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Check authentication
    if (!isAuthenticated) {
        if (onUnauthorized) {
            onUnauthorized('unauthenticated');
            return null;
        }

        if (fallback) return fallback;

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700 max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v.01M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
                    <p className="text-slate-400 mb-4">Please log in to access this page.</p>
                </div>
            </div>
        );
    }

    // Check single permission
    if (requiredPermission && !hasPermission(requiredPermission)) {
        if (onUnauthorized) {
            onUnauthorized('forbidden', requiredPermission);
            return null;
        }

        if (fallback) return fallback;

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700 max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    // Check multiple permissions
    if (requiredPermissions?.length) {
        const hasAccess = requireAll
            ? hasAllPermissions(...requiredPermissions)
            : hasAnyPermission(...requiredPermissions);

        if (!hasAccess) {
            if (onUnauthorized) {
                onUnauthorized('forbidden', requiredPermissions);
                return null;
            }

            if (fallback) return fallback;

            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900">
                    <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700 max-w-md">
                        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
                        <p className="text-slate-400">You don't have the required permissions.</p>
                    </div>
                </div>
            );
        }
    }

    return children;
}

export default ProtectedRoute;
