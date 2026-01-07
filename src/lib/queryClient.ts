import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    user: ["auth", "user"] as const,
  },

  // Configuration
  config: {
    all: ["config"] as const,
    personalities: ["config", "personalities"] as const,
    personality: (id: string) => ["config", "personalities", id] as const,
    presets: ["config", "presets"] as const,
    tiers: ["config", "tiers"] as const,
    taskTypes: ["config", "task-types"] as const,
    templates: {
      reasoning: ["config", "templates", "reasoning"] as const,
      quick: ["config", "templates", "quick"] as const,
    },
    options: (type?: string) => ["config", "options", type] as const,
  },

  // Community
  prompts: {
    all: ["prompts"] as const,
    list: (filters: Record<string, unknown>) => ["prompts", "list", filters] as const,
    detail: (id: string) => ["prompts", "detail", id] as const,
    comments: (promptId: string) => ["prompts", promptId, "comments"] as const,
  },

  tags: {
    all: ["tags"] as const,
    popular: ["tags", "popular"] as const,
    detail: (slug: string) => ["tags", "detail", slug] as const,
  },

  feed: {
    all: ["feed"] as const,
    list: (filter: string) => ["feed", filter] as const,
  },

  // User
  users: {
    profile: (id: string) => ["users", id] as const,
    prompts: (userId: string) => ["users", userId, "prompts"] as const,
    saved: (userId: string) => ["users", userId, "saved"] as const,
  },

  // Admin
  admin: {
    stats: ["admin", "stats"] as const,
    users: ["admin", "users"] as const,
    content: (type: string) => ["admin", "content", type] as const,
  },
} as const;
