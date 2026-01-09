/**
 * Robust API Client with:
 * - Automatic token refresh on 401
 * - Request queue during token refresh
 * - Typed responses with pagination
 * - Error handling with toast integration
 */

export const API_BASE_URL = 
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env: Record<string, string> }).env?.VITE_API_URL) 
  || "http://localhost:3001";

// ============================================================================
// TYPES
// ============================================================================

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: Pagination;
}

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeToRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function notifyRefreshSubscribers(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function getAccessToken(): string | null {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.accessToken || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function setAccessToken(token: string | null) {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.state = { ...parsed.state, accessToken: token };
      localStorage.setItem("auth", JSON.stringify(parsed));
    }
  } catch {
    // Ignore errors
  }
}

function clearAuth() {
  try {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.state = { user: null, accessToken: null, isAuthenticated: false };
      localStorage.setItem("auth", JSON.stringify(parsed));
    }
  } catch {
    // Ignore errors
  }
}

// ============================================================================
// REFRESH TOKEN LOGIC
// ============================================================================

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Refresh failed");
    }

    const data = await response.json();
    
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
      return data.data.accessToken;
    }
    
    throw new Error("No token in response");
  } catch (error) {
    clearAuth();
    return null;
  }
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const { method = "GET", body, headers = {}, skipAuth = false, skipRefresh = false } = options;

    // Add auth header if available and not skipped
    if (!skipAuth) {
      const accessToken = getAccessToken();
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include",
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    try {
      let response = await fetch(`${this.baseUrl}${endpoint}`, config);

      // Handle 401 - try to refresh token
      if (response.status === 401 && !skipRefresh && !skipAuth) {
        const newToken = await this.handleTokenRefresh();
        
        if (newToken) {
          // Retry request with new token
          headers.Authorization = `Bearer ${newToken}`;
          config.headers = {
            "Content-Type": "application/json",
            ...headers,
          };
          response = await fetch(`${this.baseUrl}${endpoint}`, config);
        } else {
          // Token refresh failed, return unauthorized
          return {
            success: false,
            error: "Unauthorized",
            message: "Session expired. Please login again.",
          };
        }
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Request failed",
          message: data.message || `HTTP ${response.status}`,
        };
      }

      // Enhance pagination with hasNext/hasPrev
      if (data.pagination) {
        data.pagination = {
          ...data.pagination,
          hasNext: data.pagination.page < data.pagination.totalPages,
          hasPrev: data.pagination.page > 1,
        };
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: "Network error",
        message: "Failed to connect to server",
      };
    }
  }

  private async handleTokenRefresh(): Promise<string | null> {
    // If already refreshing, wait for it
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeToRefresh((token) => resolve(token));
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        notifyRefreshSubscribers(newToken);
        return newToken;
      }

      // Refresh failed
      notifyRefreshSubscribers("");
      return null;
    } finally {
      isRefreshing = false;
    }
  }

  // Convenience methods
  get<T>(endpoint: string, options?: Omit<ApiOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: unknown, options?: Omit<ApiOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  delete<T>(endpoint: string, options?: Omit<ApiOptions, "method" | "body">) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

export function buildPaginationParams(params: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  [key: string]: unknown;
}): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function getNextPage(pagination: Pagination | undefined): number | null {
  if (!pagination || !pagination.hasNext) return null;
  return pagination.page + 1;
}

export function getPrevPage(pagination: Pagination | undefined): number | null {
  if (!pagination || !pagination.hasPrev) return null;
  return pagination.page - 1;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const api = new ApiClient(API_BASE_URL);
