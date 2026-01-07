import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useConfig } from "../hooks/useConfig";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Config loader component - fetches config on mount
 */
function ConfigLoader({ children }: { children: React.ReactNode }) {
  // Fetch config on mount - values are stored in Zustand
  useConfig();

  // You can add a loading state here if needed
  // For now, we silently load config in background

  return <>{children}</>;
}

/**
 * Main providers wrapper
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigLoader>{children}</ConfigLoader>
    </QueryClientProvider>
  );
}
