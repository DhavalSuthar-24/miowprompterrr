// ============================================================================
// API TYPES
// ============================================================================

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  username: string;
  image?: string;
  onboardingCompleted: boolean;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse extends ApiResponse {
  data?: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  image?: string;
  dob?: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
  bio?: string;
  image?: string;
  dob?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Onboarding Types
export interface OnboardingStatus {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
  profile: {
    hasName: boolean;
    hasUsername: boolean;
    hasDob: boolean;
  };
}
