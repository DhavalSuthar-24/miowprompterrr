import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * GoogleAuthButton - Initiates Google OAuth flow
 */
export function GoogleAuthButton({
    onSuccess,
    onError,
    className = '',
    children
}) {
    const handleClick = () => {
        // Redirect to Google OAuth
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`flex items-center justify-center gap-3 w-full py-3 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors ${className}`}
        >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
            </svg>
            {children || 'Continue with Google'}
        </button>
    );
}

/**
 * OAuthCallback - Handles OAuth callback and stores tokens
 * Place this component on your /auth/callback route
 */
export function OAuthCallback({
    onSuccess,
    onError,
    redirectTo = '/'
}) {
    const { updateUser, fetchCurrentUser } = useAuth();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(window.location.search);

            const accessToken = params.get('accessToken');
            const refreshToken = params.get('refreshToken');
            const errorParam = params.get('error');
            const onboardingCompleted = params.get('onboardingCompleted') === 'true';

            if (errorParam) {
                setStatus('error');
                const errorMessages = {
                    oauth_denied: 'Authorization was denied',
                    no_code: 'No authorization code received',
                    token_exchange_failed: 'Failed to exchange token',
                    user_info_failed: 'Failed to get user information',
                    role_not_found: 'System configuration error',
                    server_error: 'Server error occurred',
                };
                setError(errorMessages[errorParam] || 'Authentication failed');
                onError?.(errorParam);
                return;
            }

            if (accessToken && refreshToken) {
                // Store tokens
                localStorage.setItem('miownation_access_token', accessToken);
                localStorage.setItem('miownation_refresh_token', refreshToken);

                // Fetch user data
                await fetchCurrentUser();

                setStatus('success');
                onSuccess?.({ onboardingCompleted });

                // Redirect
                setTimeout(() => {
                    window.location.href = onboardingCompleted ? redirectTo : '/onboarding';
                }, 1000);
            } else {
                setStatus('error');
                setError('No tokens received');
                onError?.('no_tokens');
            }
        };

        handleCallback();
    }, []);

    if (status === 'processing') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Completing sign in...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center p-8 bg-slate-800 rounded-xl border border-slate-700 max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <a
                        href="/auth"
                        className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="text-white text-lg">Success! Redirecting...</p>
            </div>
        </div>
    );
}

export default GoogleAuthButton;
